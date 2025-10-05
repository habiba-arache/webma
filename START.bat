@echo off
echo ========================================
echo    Webma EarthGuard
echo    Environmental Risk ^& Resilience Map
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not installed!
    echo.
    echo Please run INSTALL_NODEJS.bat first
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version
echo.

echo Starting servers...
echo.

REM Start Backend
echo Starting Backend Server (port 8080)...
start "Webma EarthGuard - Backend" cmd /k "cd /d %~dp0backend && npm run dev"

REM Wait for backend
timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend Server (port 5173)...
start "Webma EarthGuard - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM Wait then open browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo    Servers Running!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080
echo.
echo Two terminal windows are now open.
echo Keep them running while using the app.
echo Press Ctrl+C in each window to stop.
echo.
pause
