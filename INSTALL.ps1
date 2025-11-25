# PowerShell Installation Script for Seminar Report Management System
# Run this script to install all dependencies

Write-Host "🚀 Seminar Report Management System - Installation Script" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Write-Host ""

# Install root dependencies
Write-Host "1️⃣ Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Install backend dependencies
Write-Host "2️⃣ Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Install frontend dependencies
Write-Host "3️⃣ Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Install Tailwind CSS and dependencies
Write-Host "4️⃣ Installing Tailwind CSS and dependencies..." -ForegroundColor Yellow
npm install -D tailwindcss postcss autoprefixer tailwindcss-animate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Warning: Failed to install Tailwind CSS dependencies" -ForegroundColor Yellow
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..
Write-Host ""

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Ensure MongoDB is running (net start MongoDB)" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start both frontend and backend" -ForegroundColor White
Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "4. Register your first user and start using the system!" -ForegroundColor White
Write-Host ""
Write-Host "📖 For more information, see SETUP_AND_FIX.md" -ForegroundColor Cyan
Write-Host ""
