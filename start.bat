@echo off
title CommunityPulse AI Platform Launcher

echo ====================================================================
echo   CommunityPulse AI - Decision Intelligence Local Platform Launcher
echo ====================================================================
echo.

:: 1. Launch Python HTTP Server for Static SPA (Port 8000)
echo [*] Starting Local Static SPA Web Host (Port 8000)...
start "CommunityPulse Static Server" cmd /k "python -m http.server 8000"

:: 2. Launch FastAPI Backend
echo [*] Starting FastAPI Microservices Backend (Port 8080)...
start "CommunityPulse Backend Server" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8080 --reload"

:: 3. Pause for servers to warm up and open browser tabs
echo.
echo [*] Waiting 5 seconds for services to initialize...
timeout /t 5 >nul

echo [*] Launching Web Browsers...
:: Open Static SPA Prototype App
start http://localhost:8000

echo.
echo ====================================================================
echo   Platform successfully launched!
echo   - Static SPA Prototype: http://localhost:8000
echo   - Backend Swagger API Docs: http://localhost:8080/docs
echo.
echo   To shutdown, close the respective server command windows.
echo ====================================================================
echo.
pause
