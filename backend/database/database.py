from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from backend.config import settings


def _normalize_database_url(url: str) -> str:
    """Normalize common Postgres URL variants for SQLAlchemy + psycopg2."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def _is_sqlite(url: str) -> bool:
    return url.startswith("sqlite")


database_url = _normalize_database_url(settings.DATABASE_URL)

connect_args = {}
engine_kwargs = {"pool_pre_ping": True}

if _is_sqlite(database_url):
    connect_args = {"check_same_thread": False}
else:
    # Postgres (Railway) - good default pool settings.
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(database_url, connect_args=connect_args, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
