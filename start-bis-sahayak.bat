@echo off
TITLE BIS Sahayak - Bureau of Indian Standards AI Assistant
COLOR 0B

echo ================================================================
echo          BIS Sahayak - AI Assistant for Indian Standards
echo               Smart India Hackathon (SIH PS26107)
echo ================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    COLOR 0C
    echo [ERROR] Node.js is not found on your system!
    echo Please install Node.js (v18 or higher) from: https://nodejs.org/
    echo Once installed, double-click this .bat file again.
    echo.
    pause
    exit /b 1
)

:: 2. Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    COLOR 0C
    echo [ERROR] npm is not found on your system!
    echo Please ensure Node.js and npm are added to your PATH environment variable.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js and npm detected successfully.
echo.

:: 3. Setup .env file if missing
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env file from .env.example...
        copy .env.example .env >nul
    ) else (
        echo [INFO] Creating initial .env configuration...
        echo GEMINI_API_KEY=> .env
    )
)

:: 4. Check and install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [INFO] Installing required dependencies (first-time setup)...
    echo This may take a minute or two...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        COLOR 0C
        echo.
        echo [ERROR] npm install encountered an error.
        echo Please check your internet connection and try running 'npm install' manually.
        echo.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
    echo.
)

:: 5. Open browser automatically after 3 seconds in background
echo [INFO] Starting BIS Sahayak local server on http://localhost:3000...
echo [INFO] Opening default browser...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: 6. Run the fullstack development server
echo.
echo ================================================================
echo  Server is running! Press Ctrl+C in this window to stop.
echo ================================================================
echo.
call npm run dev

pause
