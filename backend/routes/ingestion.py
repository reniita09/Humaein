from fastapi import APIRouter, BackgroundTasks, Depends, File, Header, HTTPException, UploadFile

from ..core.db import get_session
from ..services.ingestion import ingest_claims_file
from ..routes.jobs import _run_job_task
from .auth import get_current_user


router = APIRouter(prefix="/api/upload", tags=["ingestion"])


@router.post("/claims")
def upload_claims(
    file: UploadFile = File(...),
    x_tenant_id: str = Header(..., alias="X-Tenant-ID"),
    user=Depends(get_current_user),
    background_tasks: BackgroundTasks = None,
):
    content = file.file.read()
    with get_session() as session:
        job_id, count = ingest_claims_file(session, x_tenant_id, content, file.filename)
        if background_tasks is not None:
            background_tasks.add_task(_run_job_task, x_tenant_id, job_id)
        return {"status": "ok", "job_id": job_id, "rows": count}


