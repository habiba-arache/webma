@echo off
echo ========================================
echo   Webma EarthGuard - Startup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please run INSTALL_NODEJS.bat first to install Node.js
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

REM Check if dependencies are installed
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

echo ========================================
echo   Starting Webma EarthGuard
echo ========================================
echo.
echo Backend will start on: http://localhost:8080
echo Frontend will start on: http://localhost:5173
echo.
echo Opening browser in 5 seconds...
echo Press Ctrl+C to stop the servers
echo.

REM Start backend in new window
start "Webma EarthGuard - Backend" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "Webma EarthGuard - Frontend" cmd /k "cd frontend && npm run dev"

REM Wait 5 seconds then open browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo   Servers are running!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080/api/health
echo.
echo Two terminal windows have opened:
echo - One for the backend server
echo - One for the frontend server
echo.
echo Keep both windows open while using the app.
echo Close them when you're done.
echo.
pause
