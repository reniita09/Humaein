from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.db import init_db, get_session
from .core.security import hash_password
from .models.users import User
from .routes.auth import router as auth_router
from .routes.rules import router as rules_router
from .routes.ingestion import router as ingestion_router
from .routes.jobs import router as jobs_router
from .routes.claims import router as claims_router
from .routes.metrics import router as metrics_router


def create_app() -> FastAPI:
    app = FastAPI(title="Humaein Mini RCM Validation Engine", version="0.1.0")

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    app.include_router(auth_router)
    app.include_router(rules_router)
    app.include_router(ingestion_router)
    app.include_router(jobs_router)
    app.include_router(claims_router)
    app.include_router(metrics_router)

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()
        # Seed default admin if missing
        with get_session() as session:
            existing = session.query(User).filter(User.email == "admin@humaein.com").first()
            if not existing:
                user = User(
                    email="admin@humaein.com",
                    password_hash=hash_password("Admin@123"),
                    tenant_id=settings.DEFAULT_TENANT_ID,
                    is_active=True,
                )
                session.add(user)

    return app


app = create_app()


