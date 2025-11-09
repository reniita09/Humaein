from backend.services.rule_engine import evaluate_rules


def test_evaluate_rules_basic():
    claim = {
        "claim_id": "C1",
        "service_code": "SRV1001",
        "diagnosis_codes": "E11.9`R07.9",
        "paid_amount_aed": 300,
        "unique_id": "ABCD-1234-EFGH",
        "encounter_type": "Outpatient",
        "facility_id": "GENERAL_HOSPITAL",
    }
    technical = [
        {
            "id": "T003",
            "type": "technical",
            "description": "Paid amount threshold exceeded (AED > 250)",
            "priority": 80,
            "condition": {"field": "paid_amount_aed", "op": ">", "value": 250},
            "severity": "medium",
            "recommendation": "Verify approval present.",
        }
    ]
    medical = []

    status, error_type, matched = evaluate_rules(claim, technical, medical)
    assert error_type == "technical_error"
    assert status == "Not validated"
    assert matched and matched[0]["id"] == "T003"


