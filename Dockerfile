FROM python:3.11-slim

WORKDIR /app

# Install system deps needed by some ML/native wheels.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (better layer caching).
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the whole repo so the `backend` package is importable.
COPY . .

WORKDIR /app/backend

RUN mkdir -p trained_model uploads reports generated_reports

ENV PYTHONPATH=/app

EXPOSE 8000

# Migrations + seed run before the server starts.
CMD ["sh", "-c", "alembic upgrade head && python -m backend.services.seed_service && uvicorn backend.main:app --host 0.0.0.0 --port $PORT"]
