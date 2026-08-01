web: alembic upgrade head && python -m backend.services.seed_service && uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
