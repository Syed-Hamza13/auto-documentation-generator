#!/usr/bin/env powershell
# ============================================
# AI DOCUMENTATION GENERATOR - QUICK START
# ============================================
# Run with: powershell -ExecutionPolicy Bypass -File START.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " AI DOCUMENTATION GENERATOR QUICK START" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if UV is installed
try {
    $uvVersion = uv --version 2>$null
    if ($uvVersion) {
        Write-Host "✓ UV found: $uvVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR: UV is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install from https://docs.astral.sh/uv/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 1: Install Backend-API Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$backendPath = ".\Backend-API"
if (Test-Path "$backendPath\node_modules") {
    Write-Host "npm packages already installed" -ForegroundColor Gray
} else {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    Push-Location $backendPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Backend-API dependencies" -ForegroundColor Red
        Pop-Location
        Read-Host "Press Enter to exit"
        exit 1
    }
    Pop-Location
}
Write-Host "✓ Backend-API ready" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 2: Install Frontend Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$frontendPath = ".\Frontend"
if (Test-Path "$frontendPath\node_modules") {
    Write-Host "npm packages already installed" -ForegroundColor Gray
} else {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    Push-Location $frontendPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Frontend dependencies" -ForegroundColor Red
        Pop-Location
        Read-Host "Press Enter to exit"
        exit 1
    }
    Pop-Location
}
Write-Host "✓ Frontend ready" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMPORTANT SETUP STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Have you run SUPABASE_SETUP.sql?" -ForegroundColor Yellow
Write-Host "   - Go to Supabase Dashboard" -ForegroundColor Gray
Write-Host "   - SQL Editor -> New Query" -ForegroundColor Gray
Write-Host "   - Copy content from SUPABASE_SETUP.sql" -ForegroundColor Gray
Write-Host "   - Run the SQL" -ForegroundColor Gray

$supbaseReady = Read-Host "Ready to continue? (Y/N)"
if ($supbaseReady -ne "Y" -and $supbaseReady -ne "y") {
    Write-Host "Please run SUPABASE_SETUP.sql first, then run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "2. Have you verified your .env files?" -ForegroundColor Yellow
Write-Host "   - Backend-API/.env: Check paths and credentials" -ForegroundColor Gray
Write-Host "   - Frontend/.env: Check VITE_API_URL" -ForegroundColor Gray

$envReady = Read-Host "Ready to continue? (Y/N)"
if ($envReady -ne "Y" -and $envReady -ne "y") {
    Write-Host "Please verify .env files and run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STARTING SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: You will need to keep 2 PowerShell windows open:" -ForegroundColor Cyan
Write-Host "  - Window 1: Backend-API (port 5000)" -ForegroundColor Gray
Write-Host "  - Window 2: Frontend (port 5173)" -ForegroundColor Gray
Write-Host ""

$startReady = Read-Host "Press Enter to start services..."

# Start Backend-API in new window
Write-Host ""
Write-Host "Starting Backend-API on port 5000..." -ForegroundColor Yellow
$backendScript = @"
Set-Location '$PSScriptRoot\Backend-API'
node server.js
Read-Host "Press Enter to close..."
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "Starting Frontend on port 5173..." -ForegroundColor Yellow
$frontendScript = @"
Set-Location '$PSScriptRoot\Frontend'
npm run dev
Read-Host "Press Enter to close..."
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ SERVICES STARTED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:5000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Wait for both services to fully start" -ForegroundColor Gray
Write-Host "2. Open http://localhost:5173 in your browser" -ForegroundColor Gray
Write-Host "3. Sign up with a test account" -ForegroundColor Gray
Write-Host "4. Upload a test ZIP file to test the system" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed instructions, see: INTEGRATION_COMPLETE.md" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to finish"
