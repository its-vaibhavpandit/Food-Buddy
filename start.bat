@echo off

:: -------------------------------------------------
:: Fast Food Buddy – Fresh Development Startup
:: -------------------------------------------------

:: Ensure we are in the project root
cd /d "%~dp0"

:: Clean previous build artifacts
if exist "platform\client\.next" (
    echo Removing old .next folder...
    rmdir /s /q "platform\client\.next"
)

:: Delete any root package-lock.json (since package.json is in platform/client)
if exist "package-lock.json" (
    echo Deleting root package-lock.json...
    del "package-lock.json"
)

:: OPTIONAL: Remove node_modules to force a full reinstall
:: if exist "platform\client\node_modules" (
::     echo Removing node_modules...
::     rmdir /s /q "platform\client\node_modules"
:: )

:: Install fresh dependencies
cd /d "platform\client"
echo Installing npm dependencies...
npm install

:: Start the Next.js development server
echo Starting Next.js dev server...
npm run dev

:: Keep the console open after the server exits
pause
