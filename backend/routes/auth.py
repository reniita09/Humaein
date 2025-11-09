from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import select

from ..core.db import get_session
from ..core.security import verify_password, create_access_token, decode_token
from ..models.users import User


router = APIRouter(prefix="/api/auth", tags=["auth"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


def get_current_user(
    authorization: str = Header(..., alias="Authorization"),
    x_tenant_id: str = Header(..., alias="X-Tenant-ID"),
):
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Token decode failed")
    user_email: Optional[str] = payload.get("sub")
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    with get_session() as session:
        statement = select(User).where(User.email == user_email, User.tenant_id == x_tenant_id)
        user = session.exec(statement).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="Inactive or missing user")
        return user


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Note: OAuth2PasswordRequestForm uses 'username' field for the identity
    with get_session() as session:
        statement = select(User).where(User.email == form_data.username)
        user = session.exec(statement).first()
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        token = create_access_token(user.email, {"tenant_id": user.tenant_id})
        return TokenResponse(access_token=token)


