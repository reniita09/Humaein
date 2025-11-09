from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class Metrics(SQLModel, table=True):
    __tablename__ = "metrics"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: str = Field(index=True)
    job_id: str = Field(index=True)
    claims_by_error_type: str  # json string
    paid_amount_by_error_type: str  # json string
    created_at: datetime = Field(default_factory=datetime.utcnow)


