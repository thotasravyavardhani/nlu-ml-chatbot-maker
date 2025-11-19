@echo off
REM Start Python Backend Only - Windows Batch Script
echo ========================================
echo  Starting Python ML Backend
echo ========================================
echo.

cd python-backend
call docker-compose up -d
cd ..

echo.
echo ========================================
echo  Backend Services Started!
echo ========================================
echo.
echo  Python ML Service:   http://localhost:8000
echo  Rasa NLU Service:    http://localhost:8001
echo.
echo Run 'npm run logs:backend' to view logs
echo.
pause
