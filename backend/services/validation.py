import json
from typing import Dict, List, Any

from sqlmodel import select

from ..models.claims import MasterClaim, RefinedClaim
from ..models.rules import RuleSet
from ..models.ingestions import Ingestion
from ..models.metrics import Metrics
from .rule_engine import evaluate_rules
from .llm_client import get_llm_client


def _format_from_llm(llm_payload: Dict[str, Any], matched: List[Dict[str, Any]]) -> tuple[str, str]:
    explanation_text = ""
    recommendation_text = ""
    explanations = llm_payload.get("explanations") if isinstance(llm_payload, dict) else None
    recommendations = llm_payload.get("recommendations") if isinstance(llm_payload, dict) else None
    if explanations:
        explanation_text = "\n".join(item.get("text", "").strip() for item in explanations if item.get("text"))
    if recommendations:
        recommendation_text = "\n".join(item.get("action", "").strip() for item in recommendations if item.get("action"))
    if not explanation_text:
        explanation_text = "\n".join(f"{rule.get('id')}: {rule.get('description')}" for rule in matched)
    if not recommendation_text:
        recommendation_text = "\n".join(rule.get("recommendation", "") for rule in matched if rule.get("recommendation"))
    if not recommendation_text:
        recommendation_text = "-"
    if not explanation_text:
        explanation_text = "All rules satisfied"
    return explanation_text, recommendation_text


def _format_plain_text(matched: List[Dict[str, Any]]) -> tuple[str, str]:
    if not matched:
        return "All rules satisfied", "-"
    explanation_lines = [f"{rule.get('id')}: {rule.get('description')}" for rule in matched]
    recommendation_lines = [rule.get("recommendation", "").strip() for rule in matched if rule.get("recommendation")]
    recommendation_text = "\n".join(recommendation_lines) if recommendation_lines else "-"
    explanation_text = "\n".join(explanation_lines)
    return explanation_text, recommendation_text


def run_validation_job(session, tenant_id: str, job_id: str) -> None:
    ingestion = session.exec(
        select(Ingestion).where(Ingestion.tenant_id == tenant_id, Ingestion.job_id == job_id)
    ).first()
    if not ingestion:
        return
    ingestion.status = "running"

    # Load rules
    tech = session.exec(
        select(RuleSet).where(RuleSet.tenant_id == tenant_id, RuleSet.kind == "technical")
    ).all()
    med = session.exec(
        select(RuleSet).where(RuleSet.tenant_id == tenant_id, RuleSet.kind == "medical")
    ).all()
    technical_rules: List[Dict] = []
    medical_rules: List[Dict] = []
    for rs in tech:
        try:
            payload = json.loads(rs.rules_json)
            technical_rules.extend(payload.get("rules", []))
        except Exception:
            pass
    for rs in med:
        try:
            payload = json.loads(rs.rules_json)
            medical_rules.extend(payload.get("rules", []))
        except Exception:
            pass

    facility_rule_map: Dict[str, List[str]] = {}
    for rule in medical_rules:
        cond = rule.get("condition", {})
        if cond.get("op") == "not_in_facility_map":
            facility_rule_map = cond.get("value", {}) or {}
            break

    llm = get_llm_client()

    # Evaluate all master claims for tenant (prototype scope)
    claims = session.exec(select(MasterClaim).where(MasterClaim.tenant_id == tenant_id, MasterClaim.job_id == job_id)).all()

    facility_usage: Dict[str, set[str]] = {}
    for mc in claims:
        fid = str(mc.facility_id or "")
        svc = str(mc.service_code or "")
        facility_usage.setdefault(fid, set()).add(svc)

    def _infer_facility_type(fid: str) -> str | None:
        services = facility_usage.get(fid, set())
        candidate = None
        candidate_size = None
        for name, values in facility_rule_map.items():
            allowed_set = {str(v) for v in values}
            if services and all(s in allowed_set for s in services):
                size = len(allowed_set)
                if candidate is None or size < candidate_size:
                    candidate = name
                    candidate_size = size
        if candidate:
            return candidate
        if fid in facility_rule_map:
            return fid
        if "GENERAL_HOSPITAL" in facility_rule_map:
            return "GENERAL_HOSPITAL"
        return None

    facility_type_map = {fid: _infer_facility_type(fid) for fid in facility_usage.keys()}

    counts = {"no_error": 0, "medical_error": 0, "technical_error": 0, "both": 0}
    paid_by_type = {"no_error": 0.0, "medical_error": 0.0, "technical_error": 0.0, "both": 0.0}
    rule_context = {"facility_type_map": facility_type_map, "facility_rule_map": facility_rule_map}

    for idx, mc in enumerate(claims, start=1):
        claim_dict = mc.dict()
        status, error_type, matched = evaluate_rules(claim_dict, technical_rules, medical_rules, rule_context)
        explanation_text, recommendation_text = _format_plain_text(matched)
        try:
            llm_out = llm.explain(claim_dict, matched)
        except Exception:  # pragma: no cover
            llm_out = {}
        if llm_out:
            explanation_text, recommendation_text = _format_from_llm(llm_out, matched)

        rc = RefinedClaim(
            tenant_id=tenant_id,
            job_id=job_id,
            claim_id=mc.claim_id,
            status=status,
            error_type=error_type,
            error_explanation=explanation_text,
            recommended_action=recommendation_text,
            encounter_type=mc.encounter_type,
            service_date=mc.service_date,
            service_code=mc.service_code,
            paid_amount_aed=mc.paid_amount_aed,
            facility_id=mc.facility_id,
            diagnosis_codes=mc.diagnosis_codes,
            approval_number=mc.approval_number,
        )
        session.add(rc)

        counts[error_type] = counts.get(error_type, 0) + 1
        paid_by_type[error_type] = paid_by_type.get(error_type, 0.0) + float(mc.paid_amount_aed or 0.0)

    # Save metrics
    m = Metrics(
        tenant_id=tenant_id,
        job_id=job_id,
        claims_by_error_type=json.dumps(counts),
        paid_amount_by_error_type=json.dumps(paid_by_type),
    )
    session.add(m)

    ingestion.status = "completed"
    ingestion.counts_json = json.dumps({"rows": len(claims)})


