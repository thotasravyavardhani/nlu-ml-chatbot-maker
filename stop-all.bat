@echo off
REM Stop All Services - Windows Batch Script
echo ========================================
echo  Stopping NLU ML Platform
echo ========================================
echo.

echo [1/2] Stopping Python ML Backend...
cd python-backend
call docker-compose down
cd ..

echo.
echo [2/2] Stopping Next.js Frontend...
REM Kill any process on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo ========================================
echo  All Services Stopped
echo ========================================
echo.
pause
