@echo off
REM ============================================
REM AI DOCUMENTATION GENERATOR - QUICK START
REM ============================================
REM This script helps you start all services

echo.
echo ========================================
echo  AI DOCUMENTATION GENERATOR QUICK START
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if UV is installed (for Python)
uv --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: UV is not installed or not in PATH
    echo Please install UV from https://docs.astral.sh/uv/
    pause
    exit /b 1
)

echo ✓ Node.js found: 
node --version
echo.

echo ✓ UV found:
uv --version
echo.

echo ========================================
echo STEP 1: Install Backend-API Dependencies
echo ========================================
cd Backend-API
if not exist node_modules (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install Backend-API dependencies
        pause
        exit /b 1
    )
) else (
    echo npm packages already installed
)
cd ..
echo ✓ Backend-API ready
echo.

echo ========================================
echo STEP 2: Install Frontend Dependencies
echo ========================================
cd Frontend
if not exist node_modules (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install Frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo npm packages already installed
)
cd ..
echo ✓ Frontend ready
echo.

echo ========================================
echo IMPORTANT SETUP STEPS
echo ========================================
echo.
echo 1. Have you run SUPABASE_SETUP.sql?
echo    - Go to Supabase Dashboard
echo    - SQL Editor -> New Query
echo    - Copy content from SUPABASE_SETUP.sql
echo    - Run the SQL
echo    Answer with: Y = Yes, Continue | N = Do Setup First
set /p supabase_ready="Ready to continue? (Y/N): "
if /i not "%supabase_ready%"=="Y" (
    echo Please run SUPABASE_SETUP.sql first, then run this script again.
    pause
    exit /b 1
)

echo.
echo 2. Have you verified your .env files?
echo    - Backend-API/.env: Check paths and credentials
echo    - Frontend/.env: Check VITE_API_URL
echo    Answer with: Y = Yes, Continue | N = Check Files First
set /p env_ready="Ready to continue? (Y/N): "
if /i not "%env_ready%"=="Y" (
    echo Please verify .env files and run this script again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo STARTING SERVICES
echo ========================================
echo.
echo NOTE: You will need 3 terminal windows:
echo   - Terminal 1: Backend-API (port 5000)
echo   - Terminal 2: Frontend (port 5173)
echo   - Terminal 3: Optional (for monitoring)
echo.

set /p start_ready="Press Enter to continue to start services..."

REM Start Backend-API
echo.
echo Starting Backend-API on port 5000...
echo (This will open in a new window. Keep it running.)
echo.
start "Backend-API" cmd /k "cd Backend-API && node server.js"

timeout /t 3 >nul

REM Start Frontend
echo.
echo Starting Frontend on port 5173...
echo (This will open in a new window. Keep it running.)
echo.
start "Frontend" cmd /k "cd Frontend && npm run dev"

echo.
echo ========================================
echo ✓ SERVICES STARTED
echo ========================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:5000/api
echo.
echo Next steps:
echo 1. Wait for both services to fully start
echo 2. Open http://localhost:5173 in your browser
echo 3. Sign up with a test account
echo 4. Upload a test ZIP file to test the system
echo.
echo For detailed instructions, see: INTEGRATION_COMPLETE.md
echo.
pause
