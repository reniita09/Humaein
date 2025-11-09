import json
import re
from typing import Any, Dict, List, Tuple


def _op_equals(value: Any, expected: Any) -> bool:
    if value is None or expected is None:
        return False
    # Case-insensitive string equality to tolerate variations like INPATIENT vs Inpatient
    return str(value).upper() == str(expected).upper()


def _op_in(value: Any, options: List[Any]) -> bool:
    return str(value) in {str(v) for v in options}


def _op_contains_any(values: str, options: List[str]) -> bool:
    parts = [p.strip() for p in str(values).split("`") if p.strip()]
    option_set = {str(v) for v in options}
    return any(p in option_set for p in parts)


def _op_regex_not_match(value: str, pattern: str) -> bool:
    return re.match(pattern, str(value)) is None


def _op_numeric_gt(value: Any, threshold: float) -> bool:
    try:
        return float(value) > float(threshold)
    except Exception:
        return False


def _op_requires_diagnosis(service_code: str, mapping: Dict[str, str], diagnosis_codes: str) -> bool:
    needed = mapping.get(str(service_code))
    if not needed:
        return False
    parts = [p.strip() for p in str(diagnosis_codes).split("`") if p.strip()]
    return needed not in parts


def _op_contains_conflicting_pairs(diagnosis_codes: str, pairs: List[List[str]]) -> bool:
    parts = [p.strip() for p in str(diagnosis_codes).split("`") if p.strip()]
    s = set(parts)
    for a, b in pairs:
        if a in s and b in s:
            return True
    return False


def evaluate_rules(
    claim: Dict[str, Any],
    technical_rules: List[Dict[str, Any]],
    medical_rules: List[Dict[str, Any]],
    context: Dict[str, Any] | None = None,
) -> Tuple[str, str, List[Dict[str, Any]]]:
    matched: List[Dict[str, Any]] = []
    tech_hit = False
    med_hit = False

    context = context or {}
    facility_type_map: Dict[str, str | None] = context.get("facility_type_map", {})
    facility_rule_map: Dict[str, List[str]] = context.get("facility_rule_map", {})

    def _facility_allows_service(facility_id: str | None, fmap: Dict[str, List[str]], service_code: str | None) -> bool:
        if not service_code:
            return True
        fid = str(facility_id or "")
        facility_type = facility_type_map.get(fid)
        if facility_type and facility_type in fmap:
            allowed = {str(v) for v in fmap.get(facility_type, [])}
            return str(service_code) in allowed
        if fid in fmap:
            allowed = {str(v) for v in fmap.get(fid, [])}
            return str(service_code) in allowed
        # fallback: use GENERAL_HOSPITAL if available
        if "GENERAL_HOSPITAL" in fmap:
            allowed = {str(v) for v in fmap.get("GENERAL_HOSPITAL", [])}
            return str(service_code) in allowed
        return True

    def _check(rule: Dict[str, Any]) -> bool:
        cond = rule.get("condition", {})
        field = cond.get("field")
        op = cond.get("op")
        value = cond.get("value")
        and_cond = cond.get("and")

        claim_value = claim.get(field)
        rule_id = rule.get("id")

        result = False
        if op == "equals":
            result = _op_equals(claim_value, value)
        elif op == "in":
            result = _op_in(claim_value, value)
        elif op == "contains_any":
            result = _op_contains_any(claim_value, value)
        elif op == ">":
            result = _op_numeric_gt(claim_value, value)
        elif op == "regex_not_match":
            result = _op_regex_not_match(claim_value, value)
        elif op == "requires_diagnosis":
            result = _op_requires_diagnosis(claim.get("service_code"), value, claim.get("diagnosis_codes", ""))
        elif op == "not_in_facility_map":
            allows = _facility_allows_service(claim.get("facility_id"), value, claim.get("service_code"))
            result = not allows
        elif op == "contains_conflicting_pairs":
            result = _op_contains_conflicting_pairs(claim.get("diagnosis_codes", ""), value)

        if and_cond:
            and_field = and_cond.get("field")
            and_op = and_cond.get("op")
            and_value = and_cond.get("value")
            and_claim_value = claim.get(and_field)
            if and_op == "equals":
                result = result and _op_equals(and_claim_value, and_value)
            elif and_op == "in":
                result = result and _op_in(and_claim_value, and_value)

        return result

    for r in technical_rules:
        if _check(r):
            tech_hit = True
            matched.append({"id": r.get("id"), "type": "technical", "description": r.get("description"), "recommendation": r.get("recommendation")})
    for r in medical_rules:
        if _check(r):
            med_hit = True
            matched.append({"id": r.get("id"), "type": "medical", "description": r.get("description"), "recommendation": r.get("recommendation")})

    if tech_hit and med_hit:
        error_type = "both"
    elif tech_hit:
        error_type = "technical_error"
    elif med_hit:
        error_type = "medical_error"
    else:
        error_type = "no_error"

    status = "Validated" if error_type == "no_error" else "Not Validated"
    return status, error_type, matched


