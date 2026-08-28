import os
from pathlib import Path
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

PROJECT_ROOT = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=PROJECT_ROOT / "static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-flash-latest")

SYSTEM_PROMPT = """
You are a strict medical assistant AI. Your ONLY job is to answer medical and health-related questions.

MEDICAL TOPICS YOU CAN ANSWER:
- Diseases and their symptoms
- Medications, dosages, and side effects
- Medical procedures and tests
- Human anatomy and physiology
- Mental health issues
- Nutrition and diet advice
- First aid and emergency care
- Medical terminology
- Home remedies for minor issues
- When to see a doctor

NON-MEDICAL TOPICS YOU MUST REJECT:
- Coding, programming, technology
- Politics, news, current affairs
- Entertainment, movies, sports
- General knowledge, education
- Business, finance, stocks
- Recipes, cooking
- Weather, travel
- Relationships, personal advice
- ANYTHING not directly related to health

RULES:
1. If the user asks ANYTHING non-medical, respond EXACTLY with:
   "I'm a medical assistant. I can only help with medical and health-related questions."

2. Always end medical answers with:
   "⚠️ Disclaimer: Please consult a qualified doctor for professional medical advice."

3. Be accurate and never make up medical information.
4. If unsure about something, say so and recommend seeing a doctor.
5. Keep responses helpful, clear, and in simple language.
"""

MEDICAL_KEYWORDS = [
    "health", "medical", "doctor", "medicine", "medication", "drug",
    "disease", "symptom", "pain", "fever", "cough", "cold",
    "flu", "cancer", "diabetes", "blood", "heart", "brain", "stomach",
    "skin", "bone", "muscle", "joint", "allergy", "infection", "virus",
    "bacteria", "treatment", "therapy", "surgery", "diagnosis", "test",
    "xray", "mri", "scan", "vaccine", "immunity", "diet", "nutrition",
    "vitamin", "protein", "exercise", "weight", "obesity", "anxiety",
    "depression", "stress", "mental", "psychology", "psychiatry",
    "pregnancy", "child", "baby", "women", "men", "elderly", "dental",
    "teeth", "eye", "ear", "nose", "throat", "lung", "liver", "kidney",
    "emergency", "first aid", "injury", "wound", "bleeding", "fracture",
    "burn", "poison", "overdose", "prescription", "pharmacy", "hospital",
    "nurse", "patient", "clinical", "laboratory", "bp", "sugar", "cholesterol",
    "headache", "migraine", "asthma", "arthritis", "thyroid", "hormone",
    "covid", "corona", "dengue", "malaria", "typhoid", "tb", "hiv", "aids"
]

NON_MEDICAL_KEYWORDS = [
    "code", "coding", "programming", "python", "java", "javascript",
    "website", "app development", "software", "computer", "laptop",
    "movie", "film", "song", "music", "actor", "actress", "celebrity",
    "cricket", "football", "sports", "game", "gaming", "player",
    "politics", "election", "minister", "government", "party",
    "stock", "share", "market", "trading", "crypto", "bitcoin",
    "recipe", "cooking", "food", "restaurant", "hotel",
    "weather", "climate", "rain", "temperature",
    "travel", "tourist", "flight", "hotel", "booking",
    "history", "geography", "math", "algebra", "science experiment",
    "phone", "mobile", "smartphone", "iphone", "android",
    "car", "bike", "vehicle", "engine", "petrol", "diesel",
    "fashion", "clothes", "shoes", "makeup", "beauty products"
]

class ChatRequest(BaseModel):
    message: str

def is_medical_query(text: str) -> bool:
    text_lower = text.lower().strip()

    for keyword in NON_MEDICAL_KEYWORDS:
        if keyword in text_lower:
            return False

    for keyword in MEDICAL_KEYWORDS:
        if keyword in text_lower:
            return True

    return True

REJECTION_RESPONSE = "I'm a medical assistant. I can only help with medical and health-related questions."

@app.post("/chat")
async def chat(request: ChatRequest):
    user_message = request.message.strip()

    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if not is_medical_query(user_message):
        return {"response": REJECTION_RESPONSE}

    try:
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser Question: {user_message}\n\nYour Medical Answer:"

        response = model.generate_content(
            full_prompt,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 1024,
            }
        )

        return {"response": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/", response_class=HTMLResponse)
async def root():
    return FileResponse(PROJECT_ROOT / "static" / "index.html")
