@echo off
title MediAssist AI

set "PROJECT=C:\Users\Donky\OneDrive\Desktop\github purpose\doctor\mediassist-ai"

echo ==========================================
echo        MediAssist AI - Local Startup
echo ==========================================
echo.

echo [1/3] Starting Ollama...
start "MediAssist - Ollama" cmd /k "ollama serve"

timeout /t 3 /nobreak >nul

echo [2/3] Starting FastAPI backend...
start "MediAssist - Backend" cmd /k "cd /d "%PROJECT%" && python -m uvicorn backend.main:app --reload"

timeout /t 5 /nobreak >nul

echo [3/3] Starting Next.js frontend...
start "MediAssist - Frontend" cmd /k "cd /d "%PROJECT%\frontend" && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo        MediAssist AI is starting
echo ==========================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo Ollama:    http://localhost:11434
echo.
echo Medi AI:
echo hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M
echo.
echo ==========================================

start http://localhost:3000

exit