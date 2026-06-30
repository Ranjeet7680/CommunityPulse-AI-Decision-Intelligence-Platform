@echo off
title CommunityPulse AI Platform Launcher

echo ====================================================================
echo   CommunityPulse AI - Decision Intelligence Local Platform Launcher
echo ====================================================================
echo.

:: 1. Launch Python HTTP Server for Static SPA prototype (index.html)
echo [*] Starting Local Static SPA Web Host (Port 8000)...
start "CommunityPulse Static Server" cmd /k "python -m http.server 8000"

:: 2. Launch FastAPI Backend
echo [*] Starting FastAPI Microservices Backend (Port 8080)...
start "CommunityPulse Backend Server" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8080 --reload"

:: 3. Launch Next.js Development Server
echo [*] Starting Next.js 15 Frontend Development Server (Port 3000)...
start "CommunityPulse Frontend Console" cmd /k "cd frontend && npm run dev"

:: 4. Pause for servers to warm up and open browser tabs
echo.
echo [*] Waiting 5 seconds for services to initialize...
timeout /t 5 >nul

echo [*] Launching Web Browsers...
:: Open Next.js Console App
start http://localhost:3000
:: Open Static SPA Prototype App
start http://localhost:8000

echo.
echo ====================================================================
echo   Platform successfully launched!
echo   - Next.js Console: http://localhost:3000
echo   - Static SPA Prototype: http://localhost:8000
echo   - Backend Swagger API Docs: http://localhost:8080/docs
echo.
echo   To shutdown, close the respective server command windows.
echo ====================================================================
echo.
pause
