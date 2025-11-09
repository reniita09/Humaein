from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException
from sqlmodel import select

from ..core.db import get_session
from ..models.ingestions import Ingestion
from .auth import get_current_user
from ..services.validation import run_validation_job


router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/{job_id}")
def job_status(job_id: str, x_tenant_id: str = Header(..., alias="X-Tenant-ID"), user=Depends(get_current_user)):
    with get_session() as session:
        job = session.exec(
            select(Ingestion).where(Ingestion.tenant_id == x_tenant_id, Ingestion.job_id == job_id)
        ).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"job_id": job_id, "status": job.status, "counts": job.counts_json}


@router.post("/{job_id}/run")
def run_job(
    job_id: str,
    background_tasks: BackgroundTasks,
    x_tenant_id: str = Header(..., alias="X-Tenant-ID"),
    user=Depends(get_current_user),
):
    # Schedule validation job
    background_tasks.add_task(_run_job_task, x_tenant_id, job_id)
    return {"status": "scheduled", "job_id": job_id}


def _run_job_task(tenant_id: str, job_id: str) -> None:
    # New session context per background task
    from ..core.db import get_session as _get_session

    with _get_session() as session:
        run_validation_job(session, tenant_id, job_id)


