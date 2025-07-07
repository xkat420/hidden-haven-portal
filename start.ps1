# Automated startup script for Hidden Haven Portal
# This script installs dependencies and starts both frontend and backend servers

$basePath = $PSScriptRoot
$frontendPath = $basePath  
$backendPath = Join-Path $basePath "server"

Write-Host "🚀 Starting Hidden Haven Portal Setup..." -ForegroundColor Cyan

# Backend setup
Write-Host "`n📦 Setting up backend server..." -ForegroundColor Yellow
Push-Location $backendPath

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor White
    npm install
}

Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm start"
Pop-Location

# Frontend setup  
Write-Host "`n🎨 Setting up frontend application..." -ForegroundColor Yellow
Push-Location $frontendPath

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor White
    npm install
}

Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev"
Pop-Location

Write-Host "`n✅ All services launched successfully!" -ForegroundColor Magenta
Write-Host "   Backend: http://localhost:3001" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "`n🔧 Features implemented:" -ForegroundColor Cyan
Write-Host "   • User settings & profile management" -ForegroundColor White
Write-Host "   • Image upload system" -ForegroundColor White  
Write-Host "   • Shop access code protection" -ForegroundColor White
Write-Host "   • Enhanced animations & styling" -ForegroundColor White
Write-Host "   • Email notifications system" -ForegroundColor White
Write-Host "   • Browser notification permissions" -ForegroundColor White