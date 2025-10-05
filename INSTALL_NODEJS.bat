@echo off
echo ========================================
echo   Node.js Installation Helper
echo ========================================
echo.
echo This will open the Node.js download page in your browser.
echo.
echo Steps:
echo 1. Download the LTS version (recommended)
echo 2. Run the installer
echo 3. Click Next/Install (keep defaults)
echo 4. Restart this terminal after installation
echo.
echo Opening download page in 3 seconds...
timeout /t 3 /nobreak >nul
start https://nodejs.org/en/download/
echo.
echo After installing Node.js:
echo 1. Close this terminal
echo 2. Open a NEW terminal
echo 3. Run: node --version
echo 4. If you see a version number, you're ready!
echo.
pause
