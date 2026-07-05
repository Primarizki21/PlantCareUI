@echo off
echo ===================================================
echo Starting PlantCare Leaf Health Assessment API
echo Port: 8000
echo ===================================================
cd /d "%~dp0\.."
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
pause
