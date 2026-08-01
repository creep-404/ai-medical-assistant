from pydantic_settings import BaseSettings
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = os.path.join(BASE_DIR, ".env")


class Settings(BaseSettings):
    PROJECT_NAME: str = "MediAssist AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # PostgreSQL in production (set DATABASE_URL env var on Railway).
    # SQLite is used only as a local fallback when DATABASE_URL is missing.
    DATABASE_URL: str = "sqlite:///./mediassist.db"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Comma-separated list of allowed CORS origins.
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001"

    @property
    def cors_origins_list(self) -> list:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ENV_FILE


settings = Settings()
