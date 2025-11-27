Write-Host "Seminar Management System - Setup Verification" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   OK - Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ERROR - Node.js not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host "2. Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB* -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "   OK - MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "   ERROR - MongoDB not running" -ForegroundColor Red
    $allGood = $false
}

Write-Host "3. Checking Backend Dependencies..." -ForegroundColor Yellow
if (Test-Path "backend/node_modules") {
    Write-Host "   OK - Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ERROR - Run: cd backend; npm install" -ForegroundColor Red
    $allGood = $false
}

Write-Host "4. Checking Frontend Dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Write-Host "   OK - Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ERROR - Run: cd frontend; npm install" -ForegroundColor Red
    $allGood = $false
}

Write-Host "5. Checking Backend .env..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    Write-Host "   OK - Backend .env exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR - Backend .env missing" -ForegroundColor Red
    $allGood = $false
}

Write-Host "6. Checking Frontend .env..." -ForegroundColor Yellow
if (Test-Path "frontend/.env") {
    Write-Host "   OK - Frontend .env exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR - Frontend .env missing" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
if ($allGood) {
    Write-Host "All checks passed! Ready to start." -ForegroundColor Green
    Write-Host "Run: .\START_DEV.ps1" -ForegroundColor Cyan
} else {
    Write-Host "Some checks failed. Fix issues above." -ForegroundColor Red
}
