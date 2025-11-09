import os
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        default="postgresql://rcm_tt6m_user:AmFzhuDI0ZxZO1PtdY3hA7J0qjsS13nq@dpg-d489g549c44c73b16qr0-a/rcm_tt6m",
        description="SQLAlchemy/SQLModel database URL",
    )
    JWT_SECRET_KEY: str = Field(default="change-me", description="HS256 secret key")
    JWT_ALGORITHM: str = Field(default="HS256")
    JWT_EXPIRE_MINUTES: int = Field(default=60 * 24)

    FRONTEND_ORIGIN: str = Field(default="http://localhost:3000,http://localhost:3001,https://humaein.onrender.com")


    OPENAI_API_KEY: str | None = Field(default=None)
    GEMINI_API_KEY: str | None = Field(default=None)
    LLM_PROVIDER: str = Field(default="mock")  # mock | openai

    DEFAULT_TENANT_ID: str = Field(default="HUMAEIN")

    class Config:
        env_file = os.getenv("ENV_FILE", ".env")


settings = Settings()


