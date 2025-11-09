import csv
import io
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response
from sqlmodel import select

from ..core.db import get_session
from ..models.claims import RefinedClaim
from .auth import get_current_user


router = APIRouter(prefix="/api", tags=["claims"])


@router.get("/claims")
def list_claims(
    job_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    status: Optional[str] = None,
    error_type: Optional[str] = None,
    x_tenant_id: str = Header(..., alias="X-Tenant-ID"),
    user=Depends(get_current_user),
):
    with get_session() as session:
        stmt = select(RefinedClaim).where(RefinedClaim.tenant_id == x_tenant_id, RefinedClaim.job_id == job_id).order_by(RefinedClaim.id.asc())
        if status:
            stmt = stmt.where(RefinedClaim.status == status)
        if error_type:
            stmt = stmt.where(RefinedClaim.error_type == error_type)
        total = len(session.exec(stmt).all())
        items = session.exec(
            stmt.offset((page - 1) * page_size).limit(page_size)
        ).all()
        return {
            "page": page,
            "page_size": page_size,
            "total": total,
            "items": [
                {
                    "claim_id": i.claim_id,
                    "status": i.status,
                    "error_type": i.error_type,
                    "explanation": i.error_explanation or "",
                    "recommended_action": i.recommended_action or "-",
                    "encounter_type": i.encounter_type,
                    "service_code": i.service_code,
                    "facility_id": i.facility_id,
                    "paid_amount_aed": i.paid_amount_aed,
                    "diagnosis_codes": i.diagnosis_codes,
                    "approval_number": i.approval_number,
                }
                for i in items
            ],
        }


@router.get("/claims/{claim_id}")
def claim_detail(
    claim_id: str,
    job_id: str = Query(...),
    x_tenant_id: str = Header(..., alias="X-Tenant-ID"),
    user=Depends(get_current_user),
):
    with get_session() as session:
        rc = session.exec(
            select(RefinedClaim).where(
                RefinedClaim.tenant_id == x_tenant_id, RefinedClaim.job_id == job_id, RefinedClaim.claim_id == claim_id
            )
        ).first()
        if not rc:
            raise HTTPException(status_code=404, detail="Claim not found")
        return rc.dict()


@router.get("/export/{job_id}.csv")
def export_csv(job_id: str, x_tenant_id: str = Header(..., alias="X-Tenant-ID"), user=Depends(get_current_user)):
    with get_session() as session:
        rows: List[RefinedClaim] = session.exec(
            select(RefinedClaim).where(RefinedClaim.tenant_id == x_tenant_id, RefinedClaim.job_id == job_id)
        ).all()
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "claim_id",
            "encounter_type",
            "service_code",
            "facility_id",
            "paid_amount_aed",
            "diagnosis_codes",
            "error_type",
            "status",
            "explanation",
            "recommended_action",
        ])
        for r in rows:
            writer.writerow([
                r.claim_id,
                r.encounter_type,
                r.service_code,
                r.facility_id,
                r.paid_amount_aed,
                r.diagnosis_codes,
                r.error_type,
                r.status,
                r.error_explanation,
                r.recommended_action,
            ])
        data = buf.getvalue()
        return Response(content=data, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=export_{job_id}.csv"})


