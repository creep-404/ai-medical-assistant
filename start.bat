@echo off
setlocal
title MediAssist AI - Local Development
echo ============================================================
echo  MediAssist AI - Local Development
echo ============================================================
echo.
echo Architecture:
echo   Browser -^> Next.js :3000 -^> FastAPI :8000 -^> Ollama :11434
echo   Model: hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M
echo.
echo [1/3] Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
  echo   Ollama not detected at http://localhost:11434
  echo   Please run in a separate terminal:
  echo     ollama serve
  echo   And ensure model is pulled:
  echo     ollama pull hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M
) else (
  echo   Ollama is running.
)
echo.
echo [2/3] Starting Backend (FastAPI :8000)...
if exist "%~dp0.venv\Scripts\python.exe" (
  start "MediAssist Backend" cmd /k "cd /d ""%~dp0"" && call .venv\Scripts\activate.bat && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"
) else if exist "%~dp0backend\.venv\Scripts\python.exe" (
  start "MediAssist Backend" cmd /k "cd /d ""%~dp0backend"" && call .venv\Scripts\activate.bat && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"
) else (
  start "MediAssist Backend" cmd /k "cd /d ""%~dp0"" && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"
)
echo   Backend starting in new window...
echo.
echo [3/3] Starting Frontend (Next.js :3000)...
start "MediAssist Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"
echo   Frontend starting in new window...
echo.
echo ============================================================
echo  Done. Open http://localhost:3000
echo  Backend: http://localhost:8000  Docs: http://localhost:8000/docs
echo  Health:  http://localhost:8000/health  Chat: http://localhost:8000/api/chat/health
echo ============================================================
pause
