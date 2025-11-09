from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class Ingestion(SQLModel, table=True):
    __tablename__ = "ingestions"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: str = Field(index=True)
    job_id: str = Field(index=True)  # uuid string
    status: str = Field(index=True)  # pending|running|completed|failed
    counts_json: str | None = None  # serialized json of counts
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: datetime | None = None
    error: str | None = None


