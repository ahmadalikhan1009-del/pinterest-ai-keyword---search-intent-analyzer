@echo off
title "Pinterest AI Keyword & Search Intent Analyzer"
echo ==============================================================
echo Pinterest AI Keyword ^& Search Intent Analyzer
echo ==============================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b
)

:: Check if node_modules exists, if not, run npm install
if not exist "node_modules\" (
    echo [INFO] First time setup: Installing dependencies...
    echo This may take a few minutes. Please wait.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b
    )
    echo [INFO] Dependencies installed successfully.
    echo.
)

:: Ensure .env exists
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env file from .env.example...
        copy .env.example .env >nul
    )
)

echo [INFO] Starting the development server...
echo.
echo ==============================================================
echo The server is now running! DO NOT CLOSE THIS WINDOW.
echo Your browser will automatically open in a few seconds.
echo If it doesn't open, manually go to:
echo http://localhost:3000
echo.
echo NOTE: You can add your Gemini API Key in the App Settings.
echo ==============================================================
echo.

:: Automatically open the browser after a 3 second delay
start /b cmd /c "timeout /t 3 >nul && start http://localhost:3000"

:: Start the app directly using node to bypass path issues with special characters like '&'
call node "node_modules\tsx\dist\cli.mjs" server.ts

pause
