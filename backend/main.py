from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from sqlalchemy import text
from backend.database.database import engine, Base, SessionLocal, _is_sqlite, database_url
from backend.models import user, medical
from backend.models.user import User
from backend.services.seed_service import run_seed
from backend.api import auth_routes, prediction_routes, appointment_routes, medicine_routes, disease_routes, report_routes, symptom_routes, doctor_routes, nearby_routes
from backend.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Local development fallback: auto-create tables + seed when using SQLite.
# In production (PostgreSQL), run `alembic upgrade head` explicitly before startup.
if _is_sqlite(database_url):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).first() is None:
            run_seed()
    finally:
        db.close()

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(prediction_routes.router, prefix="/api", tags=["Prediction"])
app.include_router(appointment_routes.router, prefix="/api", tags=["Appointments"])
app.include_router(medicine_routes.router, prefix="/api", tags=["Medicines"])
app.include_router(disease_routes.router, prefix="/api", tags=["Diseases"])
app.include_router(report_routes.router, prefix="/api", tags=["Reports"])
app.include_router(symptom_routes.router, prefix="/api", tags=["Symptoms"])
app.include_router(doctor_routes.router, prefix="/api", tags=["Doctors"])
app.include_router(nearby_routes.router, prefix="/api", tags=["Nearby"])


@app.get("/")
def root():
    return {"message": "MediAssist AI API", "version": settings.VERSION}


@app.get("/health")
def health_check():
    """Liveness probe used by Railway. Verifies DB connectivity too."""
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as exc:  # noqa: BLE001
        db_status = f"error: {exc}"
    finally:
        db.close()
    if db_status != "ok":
        return {"status": "unhealthy", "database": db_status}
    return {"status": "healthy", "database": "ok", "version": settings.VERSION}
