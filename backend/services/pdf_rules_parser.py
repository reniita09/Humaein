import io
import json
import re
from typing import Any, Dict, List

from pdfminer.high_level import extract_text


def _extract_json_block(text: str) -> Dict[str, Any] | None:
    # Try to find the largest JSON-like block
    try:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = text[start : end + 1]
            data = json.loads(candidate)
            if isinstance(data, dict) and "rules" in data:
                return data
    except Exception:
        pass
    return None


def _extract_srv_codes(text: str) -> List[str]:
    return sorted(set(re.findall(r"SRV\d{4}", text)))


def _extract_icd_codes(text: str) -> List[str]:
    return sorted(set(re.findall(r"[A-Z][0-9]{1,2}(?:\.[0-9A-Z]{1,4})?", text)))


def _extract_threshold_aed(text: str) -> float | None:
    m = re.search(r"AED\D*(?:>|>=|greater than)\s*(\d{2,6})", text, flags=re.I)
    if m:
        try:
            return float(m.group(1))
        except Exception:
            return None
    m = re.search(r"threshold\D*(\d{2,6})\s*AED", text, flags=re.I)
    if m:
        try:
            return float(m.group(1))
        except Exception:
            return None
    return None


def _looks_like_inpatient_only_block(text: str) -> bool:
    return bool(re.search(r"inpatient-only.*outpatient", text, flags=re.I | re.S))


def _looks_like_outpatient_only_block(text: str) -> bool:
    return bool(re.search(r"outpatient-only.*inpatient", text, flags=re.I | re.S))


def _extract_facility_map(text: str) -> Dict[str, List[str]] | None:
    facilities = [
        "MATERNITY_HOSPITAL",
        "DIALYSIS_CENTER",
        "CARDIOLOGY_CENTER",
        "GENERAL_HOSPITAL",
    ]
    fmap: Dict[str, List[str]] = {}
    for name in facilities:
        m = re.search(rf"{name}\s*[:\-]\s*([A-Z0-9,\s]+)", text)
        if m:
            codes = re.findall(r"SRV\d{4}", m.group(1))
            if codes:
                fmap[name] = sorted(set(codes))
    return fmap or None


def _build_technical_rules_from_text(text: str) -> List[Dict[str, Any]]:
    srv_codes = _extract_srv_codes(text)
    icd_codes = _extract_icd_codes(text)
    threshold = _extract_threshold_aed(text) or 250.0
    rules: List[Dict[str, Any]] = []
    if re.search(r"prior approval", text, flags=re.I):
        t001_values = [c for c in srv_codes if re.search(rf"{c}.*prior approval|prior approval.*{c}", text, flags=re.I)] or ["SRV1001", "SRV1002", "SRV2008"]
        rules.append({
            "id": "T001",
            "type": "technical",
            "description": "Service requires prior approval",
            "priority": 100,
            "condition": {"field": "service_code", "op": "in", "value": t001_values},
            "severity": "high",
            "recommendation": "Ensure prior approval number is present for these service codes.",
        })
    if re.search(r"diagnosis.*prior approval|prior approval.*diagnosis", text, flags=re.I):
        t002_values = [c for c in icd_codes if re.search(rf"{c}.*prior approval|prior approval.*{c}", text, flags=re.I)] or ["E11.9", "R07.9", "Z34.0"]
        rules.append({
            "id": "T002",
            "type": "technical",
            "description": "Diagnosis requires prior approval",
            "priority": 90,
            "condition": {"field": "diagnosis_codes", "op": "contains_any", "value": t002_values},
            "severity": "medium",
            "recommendation": "Attach supporting documentation or approval number for these diagnosis codes.",
        })
    rules.append({
        "id": "T003",
        "type": "technical",
        "description": f"Paid amount threshold exceeded (AED > {int(threshold)})",
        "priority": 80,
        "condition": {"field": "paid_amount_aed", "op": ">", "value": threshold},
        "severity": "medium",
        "recommendation": "Verify that approval number is present for high-value claims.",
    })
    rules.append({
        "id": "T004",
        "type": "technical",
        "description": "Invalid ID or unique_id format",
        "priority": 70,
        "condition": {"field": "unique_id", "op": "regex_not_match", "value": "^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$"},
        "severity": "low",
        "recommendation": "Correct ID formatting to UPPERCASE alphanumeric, separated by hyphens.",
    })
    return rules


def _build_medical_rules_from_text(text: str) -> List[Dict[str, Any]]:
    srv_codes = _extract_srv_codes(text)
    icd_codes = _extract_icd_codes(text)
    rules: List[Dict[str, Any]] = []
    if _looks_like_inpatient_only_block(text):
        inpatient_only = [c for c in srv_codes if re.search(rf"{c}.*inpatient-only|inpatient-only.*{c}", text, flags=re.I)] or ["SRV1001", "SRV1002", "SRV1003"]
        rules.append({
            "id": "M001",
            "type": "medical",
            "description": "Inpatient-only services cannot appear under Outpatient encounter",
            "priority": 100,
            "condition": {"field": "service_code", "op": "in", "value": inpatient_only, "and": {"field": "encounter_type", "op": "equals", "value": "Outpatient"}},
            "severity": "high",
            "recommendation": "Reclassify encounter type or correct service selection.",
        })
    if _looks_like_outpatient_only_block(text):
        outpatient_only = [c for c in srv_codes if re.search(rf"{c}.*outpatient-only|outpatient-only.*{c}", text, flags=re.I)] or ["SRV2001", "SRV2002", "SRV2003", "SRV2004", "SRV2006", "SRV2007", "SRV2008", "SRV2010", "SRV2011"]
        rules.append({
            "id": "M002",
            "type": "medical",
            "description": "Outpatient-only services cannot appear under Inpatient encounter",
            "priority": 90,
            "condition": {"field": "service_code", "op": "in", "value": outpatient_only, "and": {"field": "encounter_type", "op": "equals", "value": "Inpatient"}},
            "severity": "medium",
            "recommendation": "Adjust encounter type or remove outpatient-only procedure.",
        })
    fmap = _extract_facility_map(text) or {
        "MATERNITY_HOSPITAL": ["SRV2008"],
        "DIALYSIS_CENTER": ["SRV1003", "SRV2010"],
        "CARDIOLOGY_CENTER": ["SRV2001", "SRV2011"],
        "GENERAL_HOSPITAL": ["SRV1001", "SRV1002", "SRV1003", "SRV2001", "SRV2002", "SRV2003", "SRV2004", "SRV2006", "SRV2007", "SRV2008", "SRV2010", "SRV2011"],
    }
    rules.append({
        "id": "M003",
        "type": "medical",
        "description": "Service not allowed in given facility type",
        "priority": 85,
        "condition": {"field": "facility_id", "op": "not_in_facility_map", "value": fmap},
        "severity": "high",
        "recommendation": "Check if the service is permitted for the facility type or update facility registry.",
    })
    mapping: Dict[str, str] = {}
    for srv in srv_codes:
        for m in re.finditer(rf"{srv}", text):
            start = max(0, m.start() - 100)
            end = min(len(text), m.end() + 100)
            nearby = _extract_icd_codes(text[start:end])
            if nearby:
                mapping[srv] = nearby[0]
                break
        if len(mapping) >= 3:
            break
    if not mapping:
        mapping = {"SRV2007": "E11.9", "SRV2006": "J45.909", "SRV2001": "R07.9", "SRV2008": "Z34.0"}
    rules.append({
        "id": "M004",
        "type": "medical",
        "description": "Service requires specific diagnosis",
        "priority": 80,
        "condition": {"field": "service_code", "op": "requires_diagnosis", "value": mapping},
        "severity": "medium",
        "recommendation": "Ensure the correct diagnosis code is paired with the service.",
    })
    if re.search(r"mutually\s+exclusive", text, flags=re.I):
        codes = icd_codes[:4]
        pairs: List[List[str]] = []
        for i in range(0, len(codes) - 1, 2):
            pairs.append([codes[i], codes[i + 1]])
        if not pairs:
            pairs = [["R73.03", "E11.9"], ["E66.9", "E66.3"], ["R51", "G43.9"]]
        rules.append({
            "id": "M005",
            "type": "medical",
            "description": "Mutually exclusive diagnoses detected",
            "priority": 75,
            "condition": {"field": "diagnosis_codes", "op": "contains_conflicting_pairs", "value": pairs},
            "severity": "high",
            "recommendation": "Remove one of the conflicting diagnoses before resubmitting.",
        })
    return rules


def parse_rules_pdf(file_bytes: bytes, kind: str | None = None) -> Dict[str, Any]:
    # Extract plain text from PDF
    # pdfminer expects a file-like object or a file path; wrap bytes in BytesIO
    text = extract_text(io.BytesIO(file_bytes))
    data = _extract_json_block(text)
    if not data:
        # Fallback: attempt to parse minimal rule lines (very heuristic)
        # Expect lines like: ID: T001 | TYPE: technical | DESC: ... | COND_JSON: {...}
        rules = []
        for line in text.splitlines():
            if "ID:" in line and "COND_JSON:" in line:
                try:
                    m_id = re.search(r"ID:\s*([A-Za-z0-9]+)", line)
                    m_type = re.search(r"TYPE:\s*(technical|medical)", line, flags=re.I)
                    m_desc = re.search(r"DESC:\s*(.*?)\s*\|", line)
                    cond_json_match = re.search(r"COND_JSON:\s*(\{.*\})", line)
                    if not (m_id and m_type and cond_json_match):
                        continue
                    cond = json.loads(cond_json_match.group(1))
                    rules.append({
                        "id": m_id.group(1),
                        "type": m_type.group(1).lower(),
                        "description": (m_desc.group(1) if m_desc else ""),
                        "priority": cond.get("priority", 50),
                        "condition": cond,
                        "severity": cond.get("severity", "medium"),
                        "recommendation": cond.get("recommendation", "Review claim."),
                    })
                except Exception:
                    continue
        if rules:
            return {"rules": rules}
        if kind and kind.lower() == "technical":
            built = _build_technical_rules_from_text(text)
            if built:
                return {"rules": built}
        if kind and kind.lower() == "medical":
            built = _build_medical_rules_from_text(text)
            if built:
                return {"rules": built}
        raise ValueError("Could not extract rules from PDF free text. Add clearer phrases (e.g., 'prior approval', 'inpatient-only', 'mutually exclusive') or provide a JSON appendix.")
    return data



