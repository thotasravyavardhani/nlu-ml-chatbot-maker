@echo off
REM Start All Services - Windows Batch Script
echo ========================================
echo  Starting NLU ML Platform
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo [1/2] Starting Python ML Backend...
echo.
cd python-backend
call docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Python backend
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Waiting for backend services to be ready...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo  All Services Started Successfully!
echo ========================================
echo.
echo  Python ML Service:   http://localhost:8000
echo  Rasa NLU Service:    http://localhost:8001
echo  Next.js Frontend:    http://localhost:3000
echo.
echo ========================================
echo.
echo [INFO] Starting Next.js frontend...
echo [INFO] Press Ctrl+C to stop all services
echo.

REM Start Next.js in foreground
npm run dev
