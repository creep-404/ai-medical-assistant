# MediAssist AI - Intelligent Symptom Checker & Prescription Recommendation System

**Early Guidance. Smarter Healthcare.**

MediAssist AI is a production-ready healthcare web application that uses Machine Learning to predict common low-risk diseases based on user-reported symptoms. It provides medicine recommendations, home remedies, diet suggestions, and facilitates doctor appointments. The system includes emergency detection to redirect users with severe symptoms to professional medical care.

> **IMPORTANT DISCLAIMER:** This application is intended for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical conditions.

---

## Features

### Core Features
- **User Authentication** - Register/Login with JWT-based authentication (Patient, Doctor, Admin roles)
- **Symptom Checker** - Searchable symptom selection with multi-select capability
- **ML-Powered Prediction** - Predicts common diseases using trained classification models
- **Emergency Detection** - Identifies high-risk symptoms and redirects to emergency care
- **Medicine Recommendations** - OTC medicine suggestions with dosage information
- **Home Remedies** - Natural remedy suggestions for common ailments
- **Diet & Hydration Advice** - Personalized dietary recommendations
- **Medi AI Assistant** - Local Ollama-powered AI chat assistant (Qwen3.8-2B) for health questions, prediction explanations, and MediAssist feature guidance
- **Medical Topic Guard** - Validates chat queries stay on health/MediAssist topics

### Patient Dashboard
- Recent diagnosis history
- Health summary (BMI, water intake)
- Upcoming appointments
- Medicine reminders
- Downloadable PDF reports
- BMI & water intake calculators

### Doctor Dashboard
- Appointment management
- Patient list and history
- Medical notes & prescriptions
- Analytics and insights

### Admin Dashboard
- User & doctor management
- Disease & medicine database management
- Appointment oversight
- System analytics

### Bonus Features
- Dark mode / Light mode
- Responsive design
- PDF report generation
- Nearby hospital information
- Emergency contacts
- Health timeline

### Nearby Doctor & Appointment Booking
- **Location-based search** - Browser geolocation or manual city search via Nominatim
- **OpenStreetMap/Overpass integration** - Free nearby search for hospitals, clinics, doctors
- **Interactive Leaflet map** - User location + nearby providers with distance
- **Specialist filtering** - Filter by specialty (Cardiologist, Neurologist, etc.)
- **Distance/radius filters** - 2km, 5km, 10km, 20km
- **Registered doctor integration** - MediAssist doctors appear on map with distance
- **Appointment booking flow** - Select provider → pick date/time/reason → book
- **Appointment status workflow** - Pending → Confirmed/Rejected → Completed/Cancelled
- **Patient dashboard** - View upcoming/past appointments, cancel/reschedule
- **Doctor dashboard** - Accept/Reject/Complete appointments
- **Admin dashboard** - View all appointments, stats, cancel/reschedule
- **Emergency hospital flow** - Nearest hospitals with directions & emergency contacts

### UI / Design System
The frontend was redesigned with a modern, healthcare-focused UI inspired by Maven Clinic — a teal/cream/ink/amber palette with Fraunces display typography, soft shadows, and rounded cards. A reusable component kit lives in `frontend/components/ui/`, and shared app shells (patient/doctor/admin/auth layouts) live in `frontend/components/layout/`. Backend, business logic, services, and data flows are unchanged.

---

## Medi AI Assistant

MediAssist AI includes **Medi AI**, a local AI chat assistant powered by a local Ollama model (`hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M`). It runs entirely locally — no external API calls, no data leaves your machine.

### Features
- **Chat interface** - Clean, accessible chat UI with markdown support
- **Prediction context awareness** - When opened from a prediction result, Medi AI receives the prediction context (disease, confidence, specialist, medicines, home remedies, diet, precautions) for relevant answers
- **MediAssist feature guidance** - Explains how to use Symptom Checker, Nearby Doctors, Appointments, Reports, Reminders
- **General health education** - Answers general health questions (symptoms, conditions, medicines, diet, lifestyle)
- **Medical topic guard** - Python-side validator blocks off-topic queries (coding, math, entertainment, politics) before they reach the LLM
- **Emergency safety** - Emergency symptoms trigger the app's existing emergency flow (hospitals, contacts) instead of AI diagnosis

### Technical Details
- **Model**: `hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M` (quantized 2B parameter model)
- **Runtime**: Local Ollama server (`http://localhost:11434`)
- **Backend endpoint**: `POST /api/chat` (authenticated, with optional prediction context)
- **Medical topic guard** (`backend/services/medical_guard.py`) - Python-side keyword/pattern filter that blocks off-topic requests before they reach Ollama
- **Ollama service** (`backend/services/ollama_service.py`) - Async client with health checks, timeouts, markdown stripping
- **Frontend** - `frontend/pages/chat.tsx` with suggested questions, copy-to-clipboard, Ollama health indicator, loading states, full dark/light mode support

### Requirements
- Ollama installed and running locally: `ollama pull hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M`
- Backend `.env`:
  ```
  OLLAMA_BASE_URL=http://localhost:11434
  OLLAMA_MODEL=hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M
  ```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| React Query | Data fetching |
| React Hook Form | Form validation |
| Recharts | Charts & analytics |
| Axios | HTTP client |
| lucide-react | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | Python web framework |
| SQLAlchemy | ORM |
| Alembic | Database migrations |
| JWT | Authentication |
| Pydantic | Data validation |
| ReportLab | PDF generation |
| Ollama | Local LLM inference (Medi AI) |
| Python keyword/pattern matching | Medical topic guard |

### Machine Learning
| Technology | Purpose |
|------------|---------|
| Scikit-Learn | ML algorithms |
| Pandas | Data processing |
| NumPy | Numerical computing |
| Joblib | Model persistence |

### Algorithms Evaluated
- Decision Tree
- Random Forest
- Naive Bayes
- Logistic Regression

### Database
PostgreSQL in production (Railway); SQLite for local development fallback.

---

## Project Structure

```
mediassist-ai/
├── frontend/                    # Next.js application
│   ├── components/
│   │   ├── ui/                 # Design system kit (Button, Card, Form, Badge,
│   │   │                       #  Avatar, Modal, Table, StatCard, Logo, Disclaimer, Feedback)
│   │   ├── layout/             # AppShell + Patient/Doctor/Admin/Auth layouts
│   │   ├── patient/            # Patient dashboard components
│   │   ├── doctor/             # Doctor dashboard components
│   │   └── admin/              # Admin dashboard components
│   ├── pages/
│   │   ├── index.tsx           # Landing page
│   │   ├── login.tsx           # Login page
│   │   ├── register.tsx        # Registration page
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   ├── patient/            # Patient pages
│   │   ├── doctor/             # Doctor pages
│   │   └── admin/              # Admin pages
│   ├── hooks/                  # Custom React hooks (useAuth, useTheme, useMounted, useApi)
│   ├── lib/                    # Utilities (cn, navigation)
│   ├── services/               # API service layer
│   ├── styles/                 # Global styles
│   └── public/                 # Static assets
│
├── backend/                    # FastAPI application
│   ├── api/                    # API route handlers
│   ├── auth/                   # Authentication logic
│   ├── database/               # Database setup & seeding
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── services/               # Business logic
│   ├── ml/                     # ML model code
│   ├── utils/                  # Utility functions
│   ├── tests/                  # Test files
│   └── trained_model/          # Saved ML models
│
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                  # Backend Dockerfile
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+ (optional — SQLite works locally out of the box)
- npm or yarn
- **Ollama** (for Medi AI) — `ollama pull hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M`

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/mediassist-ai.git
cd mediassist-ai
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../.env.example .env
# Edit .env with your database credentials and Ollama settings

# (Optional) For a fresh database, run Alembic migrations:
alembic upgrade head

# Seed the database with demo doctors/symptoms (SQLite only). Optional.
python -m backend.services.seed_service

# Run the backend
python -m uvicorn backend.main:app --reload
```

**Note**: For Medi AI to work, ensure Ollama is running locally:
```bash
# Install Ollama (if not already installed)
# Windows: Download from https://ollama.com/download
# Mac: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# Pull the Medi AI model
ollama pull hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M

# Start Ollama server (runs on http://localhost:11434)
ollama serve
```

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local

# Run the frontend
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

---

## Docker Setup

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d
```

---

## Machine Learning Model

### Training
The ML model is trained on synthetic data for 18 common low-risk diseases:

1. Common Cold
2. Flu
3. Seasonal Allergy
4. Migraine
5. Sinusitis
6. Mild Fever
7. Acidity
8. Gastritis
9. Constipation
10. Mild Diarrhea
11. Food Poisoning
12. Mild Dehydration
13. Vitamin Deficiency
14. Sore Throat
15. Cough
16. Minor Skin Allergy
17. Muscle Pain
18. Tension Headache

### Model Selection
Four algorithms are evaluated:
- **Decision Tree**
- **Random Forest**
- **Naive Bayes**
- **Logistic Regression**

The best performing model is saved using Joblib.

### Emergency Detection
The system detects 12 emergency symptoms:
- Chest Pain
- Difficulty Breathing
- Severe Bleeding
- Stroke Symptoms
- Loss of Consciousness
- Seizures
- High Fever (above 103°F)
- Blood Vomiting
- Pregnancy Emergency
- Heart Attack Symptoms
- Severe Abdominal Pain
- Persistent Unconsciousness

If any emergency symptom is detected, the system displays an emergency alert and does NOT provide any prediction or prescription.

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Prediction
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict` | Predict disease from symptoms |
| GET | `/api/history` | Get prediction history |
| DELETE | `/api/history/{id}` | Delete a prediction |
| GET | `/api/history/stats` | Get prediction statistics |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments` | List appointments |
| GET | `/api/appointments/{id}` | Get appointment details |
| PUT | `/api/appointments/{id}` | Update/reschedule appointment |
| DELETE | `/api/appointments/{id}` | Cancel appointment |

### Medicines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | List all medicines |
| GET | `/api/medicines/{id}` | Get medicine details |
| GET | `/api/medicines/disease/{disease_id}` | Get medicines for disease |

### Diseases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diseases` | List all diseases |
| GET | `/api/diseases/{id}` | Get disease details |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/generate` | Generate PDF report |
| GET | `/api/reports/{id}` | Download report |
| GET | `/api/reports` | List user's reports |

### Symptoms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/symptoms` | List all symptoms |
| GET | `/api/symptoms/emergency` | List emergency symptoms |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List all doctors |
| GET | `/api/doctors/{id}` | Get doctor details |
| GET | `/api/doctors/search` | Search doctors |

### Chat (Medi AI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to Medi AI (with optional context) |
| GET | `/api/chat/health` | Health check (includes Ollama connectivity) |

---

## Security

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password hashing
- **Role-Based Access** - Patient, Doctor, Admin roles
- **Protected Routes** - Authentication required for all protected endpoints
- **Input Validation** - Pydantic schemas validate all inputs
- **CORS** - Configured for production deployment

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full, step-by-step production guide:

- **Frontend** → Vercel (`https://mediassist.dpdns.org`)
- **Backend** → Railway (`https://api.mediassist.dpdns.org`)
- **Database** → PostgreSQL (Railway plugin), with SQLite as a local-only fallback
- Alembic migrations, environment variables, custom domains, and the exact DNS records
  are all covered there.

---

## License

This project is for educational purposes only.

## Contributors

- Your Name - Initial work

---

## Acknowledgments

- Scikit-Learn for ML algorithms
- FastAPI for the backend framework
- Next.js for the frontend framework
- All open-source libraries used in this project
