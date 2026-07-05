@echo off
REM CommunityPulse AI - Quick Start Script for Windows
REM This script helps you get started quickly

echo.
echo ================================================
echo   CommunityPulse AI - Quick Start
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python 3.12+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/5] Python found!
echo.

REM Check if we're in the right directory
if not exist "backend\main.py" (
    echo ERROR: Cannot find backend\main.py
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo [2/5] Project structure verified!
echo.

REM Setup backend
echo [3/5] Setting up backend...
cd backend

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate venv and install dependencies
echo Installing dependencies...
call venv\Scripts\activate.bat
pip install -q --upgrade pip
pip install -q -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [4/5] Dependencies installed!
echo.

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    echo APP_ENV=development > .env
    echo DEBUG=true >> .env
    
    REM Generate secret key
    for /f "delims=" %%i in ('python -c "import secrets; print(secrets.token_urlsafe(32))"') do set SECRET_KEY=%%i
    echo SECRET_KEY=%SECRET_KEY% >> .env
    echo LOG_LEVEL=INFO >> .env
    echo.
    echo .env file created with secure secret key!
)

echo [5/5] Configuration ready!
echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Backend API will start at: http://localhost:8000
echo API Docs will be at: http://localhost:8000/docs
echo.
echo After backend starts, open a NEW terminal and run:
echo   python -m http.server 8080
echo.
echo Then open: http://localhost:8080
echo.
echo ================================================
echo.
echo Starting backend server...
echo Press Ctrl+C to stop
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000
