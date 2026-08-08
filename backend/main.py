from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from sqlalchemy import text
from backend.database.database import engine, Base, SessionLocal, _is_sqlite, database_url
from backend.models import user, medical
from backend.models.user import User, UserRole
from backend.auth.auth_handler import hash_password
from backend.api import (
    auth_routes,
    oauth_routes,
    admin_routes,
    prediction_routes,
    appointment_routes,
    medicine_routes,
    disease_routes,
    report_routes,
    symptom_routes,
    doctor_routes,
    nearby_routes,
)
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


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=(), payment=()"
    )
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    )
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.middleware("http")
async def body_size_limit(request: Request, call_next):
    if request.method in ("POST", "PUT", "PATCH"):
        content_length = request.headers.get("content-length")
        if content_length and content_length.isdigit() and int(content_length) > 1_000_000:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request body too large"},
            )
    return await call_next(request)


def _create_bootstrap_admin() -> None:
    """Create the configured admin account on first startup if no admin exists."""
    email = settings.BOOTSTRAP_ADMIN_EMAIL
    username = settings.BOOTSTRAP_ADMIN_USERNAME
    password = settings.BOOTSTRAP_ADMIN_PASSWORD
    if not (email and username and password):
        logging.warning(
            "BOOTSTRAP_ADMIN_* env vars not set - no admin account will be created. "
            "Set them to create the first administrator."
        )
        return
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == UserRole.admin).first()
        if existing_admin:
            return
        admin = User(
            email=email.lower(),
            username=username,
            hashed_password=hash_password(password),
            full_name="Administrator",
            role=UserRole.admin,
            token_version=0,
        )
        db.add(admin)
        db.commit()
        logging.info("Bootstrap admin account created: %s", email)
    finally:
        db.close()


# Local development fallback: auto-create tables + seed when using SQLite.
# In production (PostgreSQL), run `alembic upgrade head` explicitly before startup.
if _is_sqlite(database_url):
    Base.metadata.create_all(bind=engine)

_create_bootstrap_admin()

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(oauth_routes.router, prefix="/api/auth", tags=["OAuth"])
app.include_router(admin_routes.router, prefix="/api", tags=["Admin"])
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
    except Exception:  # noqa: BLE001 - never leak internal error details
        db_status = "error"
    finally:
        db.close()
    if db_status != "ok":
        return {"status": "unhealthy", "database": db_status}
    return {"status": "healthy", "database": "ok", "version": settings.VERSION}
