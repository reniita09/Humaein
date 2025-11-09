from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class MasterClaim(SQLModel, table=True):
    __tablename__ = "master_claims"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: str = Field(index=True)
    job_id: str | None = Field(default=None, index=True)
    claim_id: str = Field(index=True)
    encounter_type: str
    service_date: str
    national_id: str
    member_id: str
    facility_id: str
    unique_id: str
    diagnosis_codes: str
    service_code: str
    paid_amount_aed: float
    approval_number: str | None = None

    status: str | None = None
    error_type: str | None = None
    error_explanation: str | None = None  # json
    recommended_action: str | None = None  # json

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RefinedClaim(SQLModel, table=True):
    __tablename__ = "refined_claims"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: str = Field(index=True)
    job_id: str = Field(index=True)
    claim_id: str = Field(index=True)
    status: str
    error_type: str
    error_explanation: str | None = None
    recommended_action: str | None = None

    # denormalized subset for quick query
    encounter_type: str | None = None
    service_date: str | None = None
    service_code: str | None = None
    paid_amount_aed: float | None = None
    facility_id: str | None = None
    diagnosis_codes: str | None = None
    approval_number: str | None = None

    created_at: datetime = Field(default_factory=datetime.utcnow)


