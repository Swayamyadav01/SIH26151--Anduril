@echo off
echo ===================================================
echo   DeProxy Threat Intelligence Dashboard Launcher
echo ===================================================
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting backend server on port 3000...
echo (Keep this window open to keep the server running)
echo.
start http://localhost:3000
node server.js
pause
