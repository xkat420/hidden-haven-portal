# This script automates the process of starting both the backend server
# and the frontend development server for the Hidden Haven Portal.

# Set the base path to the script's location for portability
$basePath = $PSScriptRoot

# Define paths for frontend and backend
$frontendPath = $basePath
$backendPath = Join-Path $basePath "server"

Write-Host "--- Starting Hidden Haven Development Environment ---" -ForegroundColor Yellow

# --- Backend Server Setup ---
Write-Host "`n[1/2] Setting up backend server..." -ForegroundColor Cyan
Push-Location $backendPath

if (-not (Test-Path (Join-Path $backendPath "node_modules"))) {
    Write-Host "Node modules not found for backend. Running 'npm install'..." -ForegroundColor White
    npm install
}

Write-Host "Starting main server (Node.js)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm start"

Write-Host "Starting message server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; node messageServer.js"

Write-Host "Starting notification server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; node notificationServer.js"
Pop-Location

# --- Frontend App Setup ---
Write-Host "`n[2/2] Setting up frontend application..." -ForegroundColor Cyan
Push-Location $frontendPath

if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    Write-Host "Node modules not found for frontend. Running 'npm install'..." -ForegroundColor White
    npm install
}

Write-Host "Starting frontend server (Vite)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev"
Pop-Location

Write-Host "`n✅ All services have been launched in separate windows." -ForegroundColor Magenta
Write-Host "   - Backend should be available at http://localhost:3001" -ForegroundColor Magenta
Write-Host "   - Frontend should be available at http://localhost:5173 (or similar)" -ForegroundColor Magenta

