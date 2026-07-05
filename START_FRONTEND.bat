@echo off
REM CommunityPulse AI - Start Frontend
REM Run this AFTER starting the backend

echo.
echo ================================================
echo   CommunityPulse AI - Starting Frontend
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Backend should be running at: http://localhost:8000
echo Frontend will start at: http://localhost:8080
echo.
echo Press Ctrl+C to stop
echo.

python -m http.server 8080
