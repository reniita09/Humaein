from contextlib import contextmanager
from urllib.parse import urlparse, urlunparse
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text
from .config import settings


def _normalize_db_url(db_url: str) -> str:
    parsed = urlparse(db_url)
    # If no database path provided, default to /rcm
    if not parsed.path or parsed.path == "/":
        parsed = parsed._replace(path="/rcm")
    return urlunparse(parsed)


DB_URL = _normalize_db_url(settings.DATABASE_URL)
engine = create_engine(DB_URL, echo=False, pool_pre_ping=True)


def _build_admin_url(db_url: str) -> str:
    parsed = urlparse(db_url)
    # If path is empty or '/', use 'postgres' as admin DB
    admin_path = "/postgres"
    new_parsed = parsed._replace(path=admin_path)
    return urlunparse(new_parsed)


def _ensure_database_exists() -> None:
    # Attempt to connect; if database missing, create it via admin connection
    try:
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
            return
    except Exception as exc:
        msg = str(exc)
        if "does not exist" not in msg and "Unknown database" not in msg:
            # Not a missing DB error; re-raise
            raise
    # Create target database using admin connection
    target = urlparse(DB_URL)
    target_db = target.path.lstrip("/") or "rcm"
    admin_url = _build_admin_url(DB_URL)
    admin_engine = create_engine(admin_url, echo=False, pool_pre_ping=True)
    with admin_engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT")
        conn.execute(text(f"CREATE DATABASE \"{target_db}\""))


def init_db() -> None:
    _ensure_database_exists()
    # Import models here to ensure they are registered with SQLModel metadata
    try:
        from ..models import users, rules, ingestions, claims, metrics  # noqa: F401
    except Exception:  # pragma: no cover
        # Models may not exist yet during initial scaffold
        pass
    SQLModel.metadata.create_all(engine)


@contextmanager
def get_session() -> Session:
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


