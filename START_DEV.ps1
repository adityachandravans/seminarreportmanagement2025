# Development Startup Script
Write-Host "Starting Seminar Management System (Development Mode)" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB* -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "✗ MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if ports are available
Write-Host "Checking ports..." -ForegroundColor Yellow
$port5000 = netstat -ano | findstr ":5000"
$port3000 = netstat -ano | findstr ":3000"

if ($port5000) {
    Write-Host "⚠ Port 5000 is in use. Backend may fail to start." -ForegroundColor Yellow
}
if ($port3000) {
    Write-Host "⚠ Port 3000 is in use. Frontend may fail to start." -ForegroundColor Yellow
}

Write-Host ""

# Start backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "✓ Servers starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop the servers" -ForegroundColor Yellow
