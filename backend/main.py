from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.database import engine, Base, SessionLocal
from backend.models import user, medical
from backend.models.user import User
from backend.services.seed_service import run_seed
from backend.api import auth_routes, prediction_routes, appointment_routes, medicine_routes, disease_routes, report_routes, symptom_routes, doctor_routes
from backend.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://mediassist-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/")
def root():
    return {"message": "MediAssist AI API", "version": settings.VERSION}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
