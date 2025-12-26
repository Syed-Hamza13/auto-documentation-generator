@echo off
REM Quick Start Script for Frontend-Backend Development

echo.
echo ======================================
echo AI Documentation Generator
echo Frontend-Backend Integration
echo ======================================
echo.

REM Check if Node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo ✓ npm found
echo.

REM Install Backend Dependencies
echo Installing Backend Dependencies...
cd Backend-API
if not exist "node_modules" (
    call npm install
) else (
    echo ✓ Backend node_modules already exists
)
cd ..

echo.

REM Install Frontend Dependencies
echo Installing Frontend Dependencies...
cd Frontend
if not exist "node_modules" (
    call npm install
) else (
    echo ✓ Frontend node_modules already exists
)
cd ..

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo To start development:
echo.
echo Terminal 1 (Backend):
echo   cd Backend-API
echo   npm start
echo.
echo Terminal 2 (Frontend):
echo   cd Frontend
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
pause
