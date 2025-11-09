from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class RuleSet(SQLModel, table=True):
    __tablename__ = "rule_sets"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: str = Field(index=True)
    name: str
    kind: str = Field(index=True)  # technical | medical
    rules_json: str  # stored as JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)


