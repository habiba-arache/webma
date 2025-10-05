# Webma EarthGuard - Quick Start Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Webma EarthGuard - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check if Node.js is installed
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>$null
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Close VS Code completely" -ForegroundColor White
    Write-Host "2. Reopen VS Code" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Or download Node.js from: https://nodejs.org" -ForegroundColor Cyan
    pause
    exit 1
}

Write-Host ""

# Install frontend dependencies
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[OK] Frontend dependencies already installed" -ForegroundColor Green
}

# Install backend dependencies
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[OK] Backend dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Servers..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://localhost:8080" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Opening in 5 seconds..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C in each terminal to stop" -ForegroundColor Yellow
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Cyan; npm run dev"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Frontend Server Starting...' -ForegroundColor Cyan; npm run dev"

# Wait then open browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Servers Running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two PowerShell windows opened:" -ForegroundColor White
Write-Host "- Backend (port 8080)" -ForegroundColor Cyan
Write-Host "- Frontend (port 5173)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Browser should open automatically." -ForegroundColor White
Write-Host "If not, visit: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
pause
