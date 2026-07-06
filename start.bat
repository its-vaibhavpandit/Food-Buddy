@echo off
title Fast Food Buddy Control Panel

:: Ensure we are in the project root
cd /d "%~dp0"

echo ==========================================================
echo    🍔 WELCOME TO FAST FOOD BUDDY STARTUP CONTROL PANEL 🍔
echo ==========================================================
echo.

:: Check for client and server environment files
if not exist "platform\server\.env" (
    echo [WARNING] platform\server\.env file is missing!
    echo Please configure your MongoDB Atlas credentials and JWT keys first.
    echo.
)

:: 1. Launch Backend Server in a separate window
echo [SERVER] Launching Express server on port 5000...
start "Fast Food Buddy Backend" cmd /c "cd /d platform\server && echo [SERVER] Installing dependencies... && npm install && echo [SERVER] Starting server in dev mode... && npm run dev"

:: 2. Launch Frontend Next.js Client in the current window
echo [CLIENT] Preparing Next.js client...
cd /d "platform\client"

if not exist "node_modules" (
    echo [CLIENT] Installing frontend dependencies...
    call npm install
)

echo [CLIENT] Starting Next.js developer server...
npm run dev

pause
