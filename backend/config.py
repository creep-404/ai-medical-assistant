from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = os.path.join(BASE_DIR, ".env")

# Known insecure defaults that must never be accepted in any environment.
_FORBIDDEN_SECRETS = {
    "your-secret-key-change-in-production",
    "mediassist-dev-secret-key-change-in-production",
    "change-this-to-a-secure-key-in-production",
    "change-me-to-a-long-random-string",
    "change-me-to-a-long-random-string-of-at-least-32-chars!",
    "secret",
    "changeme",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, env_file_encoding="utf-8")

    PROJECT_NAME: str = "MediAssist AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # PostgreSQL in production (set DATABASE_URL env var on Railway).
    # SQLite is used only as a local fallback when DATABASE_URL is missing.
    DATABASE_URL: str = "sqlite:///./mediassist.db"
    # Required. The app refuses to start without a strong secret.
    SECRET_KEY: str = Field(..., min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Comma-separated list of allowed CORS origins.
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001"

    # Password policy.
    MIN_PASSWORD_LENGTH: int = 12
    MAX_PASSWORD_LENGTH: int = 128

    # Cookie configuration (HttpOnly auth cookies).
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: str = ""

    # Frontend origin used in password-reset emails.
    FRONTEND_URL: str = "http://localhost:3000"

    # Optional SMTP for password reset emails.
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    SMTP_TLS: bool = True

    # Optional bootstrap admin (created once on startup if no admin exists).
    BOOTSTRAP_ADMIN_EMAIL: str = ""
    BOOTSTRAP_ADMIN_USERNAME: str = ""
    BOOTSTRAP_ADMIN_PASSWORD: str = ""

    # Rate limiting.
    RATE_LIMIT_LOGIN: int = 5
    RATE_LIMIT_LOGIN_WINDOW: int = 300
    RATE_LIMIT_REGISTER: int = 3
    RATE_LIMIT_REGISTER_WINDOW: int = 3600
    RATE_LIMIT_REFRESH: int = 30
    RATE_LIMIT_REFRESH_WINDOW: int = 300
    RATE_LIMIT_FORGOT: int = 3
    RATE_LIMIT_FORGOT_WINDOW: int = 3600
    RATE_LIMIT_PREDICT: int = 20
    RATE_LIMIT_PREDICT_WINDOW: int = 60
    RATE_LIMIT_NEARBY: int = 10
    RATE_LIMIT_NEARBY_WINDOW: int = 60
    ACCOUNT_LOCKOUT_THRESHOLD: int = 5
    ACCOUNT_LOCKOUT_MINUTES: int = 15

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or len(v) < 32:
            raise ValueError(
                "SECRET_KEY must be set and at least 32 characters long. "
                "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
            )
        if v in _FORBIDDEN_SECRETS:
            raise ValueError(
                "SECRET_KEY is set to a known insecure default. "
                "Generate a new one: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
            )
        return v

    @field_validator("COOKIE_SAMESITE")
    @classmethod
    def validate_cookie_samesite(cls, v: str) -> str:
        if v.lower() not in {"lax", "strict", "none"}:
            raise ValueError("COOKIE_SAMESITE must be one of: lax, strict, none")
        return v.lower()

    @property
    def cors_origins_list(self) -> list:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
