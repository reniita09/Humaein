import json
from typing import Literal

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from sqlmodel import select

from ..core.db import get_session
from ..models.rules import RuleSet
from ..services.pdf_rules_parser import parse_rules_pdf
from .auth import get_current_user


router = APIRouter(prefix="/api/upload", tags=["rules"])


@router.post("/rules")
def upload_rules(
    kind: Literal["technical", "medical"] = Form(...),
    file: UploadFile = File(...),
    x_tenant_id: str = Header(..., alias="X-Tenant-ID"),
    user=Depends(get_current_user),
):
    content = file.file.read()
    # Accept JSON or PDF
    if file.content_type in ("application/json", "text/json") or (file.filename and file.filename.lower().endswith('.json')):
        try:
            rules_payload = json.loads(content)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON")
    elif file.content_type == "application/pdf" or (file.filename and file.filename.lower().endswith('.pdf')):
        try:
            rules_payload = parse_rules_pdf(content, kind)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {exc}")
    else:
        raise HTTPException(status_code=400, detail="Expecting JSON or PDF file")

    rules_json = json.dumps(rules_payload)
    with get_session() as session:
        # Upsert by tenant + kind + name
        name = f"{kind}_rules"
        existing = session.exec(
            select(RuleSet).where(RuleSet.tenant_id == x_tenant_id, RuleSet.kind == kind, RuleSet.name == name)
        ).first()
        if existing:
            existing.rules_json = rules_json
        else:
            rs = RuleSet(tenant_id=x_tenant_id, name=name, kind=kind, rules_json=rules_json)
            session.add(rs)
        return {"status": "ok", "kind": kind}


