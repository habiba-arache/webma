# Webma EarthGuard - Simple Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Webma EarthGuard" -ForegroundColor Cyan
Write-Host "   Environmental Risk & Resilience Map" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Refresh PATH to include Node.js
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>$null
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Yellow
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server (port 8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "`$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); cd '$PWD\backend'; Write-Host '🌍 Backend Server' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server (port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "`$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); cd '$PWD\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 5

# Open browser
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Servers Running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two PowerShell windows are now open." -ForegroundColor White
Write-Host "Keep them running while using the app." -ForegroundColor White
Write-Host "Press Ctrl+C in each window to stop." -ForegroundColor White
Write-Host ""
pause
