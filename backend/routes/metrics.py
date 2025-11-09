import json
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import select

from ..core.db import get_session
from ..models.metrics import Metrics
from .auth import get_current_user


router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("/ingestion/{job_id}")
def metrics_for_job(job_id: str, x_tenant_id: str = Header(..., alias="X-Tenant-ID"), user=Depends(get_current_user)):
    with get_session() as session:
        m = session.exec(
            select(Metrics).where(Metrics.tenant_id == x_tenant_id, Metrics.job_id == job_id)
        ).first()
        if not m:
            raise HTTPException(status_code=404, detail="Metrics not found")
        return {
            "claims_by_error_type": json.loads(m.claims_by_error_type),
            "paid_amount_by_error_type": json.loads(m.paid_amount_by_error_type),
        }


