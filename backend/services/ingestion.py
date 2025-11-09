import io
import re
import uuid
from datetime import datetime
from typing import Dict, List, Tuple

import pandas as pd
from fastapi import HTTPException

from ..models.claims import MasterClaim
from ..models.ingestions import Ingestion


REQUIRED_FIELDS = {
    "claim_id": {"claimid", "claim_id", "claimno", "claimnumber", "claimref"},
    "encounter_type": {"encountertype", "encounter_type", "encounter"},
    "service_date": {"servicedate", "dateofservice", "svcdate"},
    "national_id": {"nationalid", "uid", "eid"},
    "member_id": {"memberid", "member_id", "subscriberid"},
    "facility_id": {"facilityid", "facility", "providerid"},
    "unique_id": {"uniqueid", "transactionid", "claimuniqueid"},
    "diagnosis_codes": {"diagnosiscodes", "diagnosis", "icdcodes", "diagnosiscode"},
    "service_code": {"servicecode", "svc", "servicereference"},
    "paid_amount_aed": {"paidamountaed", "paidamount", "netpaid", "payaed"},
    "approval_number": {"approvalnumber", "authorization", "authno", "approvalno"},
}


def _normalize_header(name: str | None) -> str:
    if not name:
        return ""
    return re.sub(r"[^a-z0-9]", "", str(name).lower())


def _detect_header_row(df: pd.DataFrame) -> int | None:
    target_variants = {variant for variants in REQUIRED_FIELDS.values() for variant in variants}
    max_rows = min(15, len(df))
    for idx in range(max_rows):
        row = df.iloc[idx].tolist()
        normalized = [_normalize_header(cell) for cell in row if pd.notnull(cell)]
        matches = sum(1 for item in normalized if item in target_variants)
        if matches >= 4:  # heuristically enough to qualify as header row
            return idx
    return None


def _load_claims_dataframe(file_bytes: bytes, filename: str) -> pd.DataFrame:
    buffer = io.BytesIO(file_bytes)
    if filename.lower().endswith((".xlsx", ".xls")):
        df_raw = pd.read_excel(buffer, header=None, dtype=str)
    else:
        df_raw = pd.read_csv(buffer, header=None, dtype=str)

    header_idx = _detect_header_row(df_raw)
    if header_idx is None:
        raise HTTPException(status_code=400, detail="Could not locate header row in claims file. Ensure the file contains standard column headings.")

    header_values = df_raw.iloc[header_idx].fillna("").tolist()
    df = df_raw.iloc[header_idx + 1 :].reset_index(drop=True)
    df.columns = header_values
    # Drop rows with no content
    df = df.dropna(how="all")
    return df


def _normalize_row(row: dict) -> dict:
    # Uppercase relevant ids
    for key in ("national_id", "member_id", "facility_id", "unique_id"):
        if row.get(key):
            row[key] = str(row[key]).upper()
    # Service code uppercase string
    if row.get("service_code"):
        row["service_code"] = str(row["service_code"]).strip().upper()
    # Service date to yyyy-mm-dd
    value = row.get("service_date")
    if value:
        try:
            dt = pd.to_datetime(value, dayfirst=False, errors="coerce")
            if pd.notnull(dt):
                row["service_date"] = dt.strftime("%Y-%m-%d")
            else:
                row["service_date"] = str(value)
        except Exception:
            row["service_date"] = str(value)
    # Diagnosis codes: unify separators to backtick
    if row.get("diagnosis_codes"):
        raw = str(row["diagnosis_codes"])
        if "`" in raw:
            parts = [p.strip() for p in raw.split("`") if p.strip()]
        else:
            parts = [p.strip() for p in re.split(r"[\n,;|]+", raw) if p.strip()]
        row["diagnosis_codes"] = "`".join(parts)
    # service_date: leave as string yyyy-mm-dd (expect file to conform)
    # paid_amount_aed: coerce to float
    if row.get("paid_amount_aed") is not None:
        try:
            row["paid_amount_aed"] = float(row["paid_amount_aed"])  # type: ignore[assignment]
        except Exception:
            row["paid_amount_aed"] = 0.0
    return row


def ingest_claims_file(session, tenant_id: str, file_bytes: bytes, filename: str) -> Tuple[str, int]:
    job_id = str(uuid.uuid4())

    try:
        df = _load_claims_dataframe(file_bytes, filename)
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - safety net
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {exc}")

    normalized_lookup: Dict[str, str] = {}
    for column in df.columns:
        norm = _normalize_header(column)
        if norm:
            normalized_lookup.setdefault(norm, column)

    field_to_column: Dict[str, str] = {}
    missing_fields: List[str] = []
    for field, variants in REQUIRED_FIELDS.items():
        matched_column = None
        for variant in variants:
            if variant in normalized_lookup:
                matched_column = normalized_lookup[variant]
                break
        if matched_column:
            field_to_column[field] = matched_column
        else:
            missing_fields.append(field)

    if missing_fields:
        # allow auto-generated claim_id if missing
        missing_fields = [f for f in missing_fields if not (f == "claim_id")]

    if missing_fields:
        friendly = {
            "claim_id": "Claim ID",
            "encounter_type": "Encounter Type",
            "service_date": "Service Date",
            "national_id": "National ID",
            "member_id": "Member ID",
            "facility_id": "Facility ID",
            "unique_id": "Unique ID",
            "diagnosis_codes": "Diagnosis Codes",
            "service_code": "Service Code",
            "paid_amount_aed": "Paid Amount (AED)",
            "approval_number": "Approval Number",
        }
        missing_cols = [friendly.get(field, field) for field in missing_fields]
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing_cols)}")

    # Ensure claim_id column exists in mapping by generating if absent
    if "claim_id" not in field_to_column:
        field_to_column["claim_id"] = None

    df_subset = df[[col for col in field_to_column.values() if col]].copy()
    if field_to_column.get("claim_id") is None:
        df_subset["__generated_claim_id"] = [str(index + 1) for index in range(len(df_subset))]
        field_to_column["claim_id"] = "__generated_claim_id"

    df_subset.rename(columns={col: field for field, col in field_to_column.items() if col}, inplace=True)
    df_subset = df_subset.replace({pd.NA: None})
    df_subset = df_subset.fillna("")

    insert_count = 0
    for record in df_subset.to_dict(orient="records"):
        mapped = _normalize_row(record)
        mc = MasterClaim(tenant_id=tenant_id, job_id=job_id, **mapped)
        session.add(mc)
        insert_count += 1

    ingestion = Ingestion(
        tenant_id=tenant_id,
        job_id=job_id,
        status="pending",
        counts_json=None,
    )
    session.add(ingestion)

    return job_id, insert_count


