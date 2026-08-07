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

# Run as a non-root user (security: least privilege).
RUN useradd --create-home --uid 10001 appuser
RUN chown -R appuser:appuser /app/backend /app/backend/trained_model /app/backend/uploads /app/backend/reports /app/backend/generated_reports
USER appuser

EXPOSE 8000

# Migrations run before the server starts. Seed data is NEVER created in
# production; run it manually only in a local dev database.
CMD ["sh", "-c", "alembic upgrade head && uvicorn backend.main:app --host 0.0.0.0 --port $PORT"]
