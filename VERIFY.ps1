# PowerShell Verification Script for Seminar Report Management System
# Run this script to verify your setup

Write-Host "🔍 Seminar Report Management System - Verification Script" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    $allGood = $false
}

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version
    Write-Host "✅ MongoDB is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MongoDB might not be installed or not in PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Checking project structure..." -ForegroundColor Yellow

# Check backend folder
if (Test-Path "backend") {
    Write-Host "✅ backend/ folder exists" -ForegroundColor Green
} else {
    Write-Host "❌ backend/ folder not found" -ForegroundColor Red
    $allGood = $false
}

# Check frontend folder
if (Test-Path "frontend") {
    Write-Host "✅ frontend/ folder exists" -ForegroundColor Green
} else {
    Write-Host "❌ frontend/ folder not found" -ForegroundColor Red
    $allGood = $false
}

# Check backend .env
if (Test-Path "backend/.env") {
    Write-Host "✅ backend/.env exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend/.env not found (will use .env.example)" -ForegroundColor Yellow
}

# Check frontend .env
if (Test-Path "frontend/.env") {
    Write-Host "✅ frontend/.env exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  frontend/.env not found (will use default)" -ForegroundColor Yellow
}

# Check backend node_modules
if (Test-Path "backend/node_modules") {
    Write-Host "✅ backend/node_modules exists" -ForegroundColor Green
} else {
    Write-Host "❌ backend/node_modules not found - run: cd backend && npm install" -ForegroundColor Red
    $allGood = $false
}

# Check frontend node_modules
if (Test-Path "frontend/node_modules") {
    Write-Host "✅ frontend/node_modules exists" -ForegroundColor Green
} else {
    Write-Host "❌ frontend/node_modules not found - run: cd frontend && npm install" -ForegroundColor Red
    $allGood = $false
}

# Check Tailwind config
if (Test-Path "frontend/tailwind.config.js") {
    Write-Host "✅ frontend/tailwind.config.js exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  frontend/tailwind.config.js not found" -ForegroundColor Yellow
}

# Check PostCSS config
if (Test-Path "frontend/postcss.config.js") {
    Write-Host "✅ frontend/postcss.config.js exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  frontend/postcss.config.js not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Checking key files..." -ForegroundColor Yellow

# Check backend server
if (Test-Path "backend/src/server.ts") {
    Write-Host "✅ backend/src/server.ts exists" -ForegroundColor Green
} else {
    Write-Host "❌ backend/src/server.ts not found" -ForegroundColor Red
    $allGood = $false
}

# Check frontend App
if (Test-Path "frontend/src/App.tsx") {
    Write-Host "✅ frontend/src/App.tsx exists" -ForegroundColor Green
} else {
    Write-Host "❌ frontend/src/App.tsx not found" -ForegroundColor Red
    $allGood = $false
}

# Check API service
if (Test-Path "frontend/src/services/api.ts") {
    Write-Host "✅ frontend/src/services/api.ts exists" -ForegroundColor Green
} else {
    Write-Host "❌ frontend/src/services/api.ts not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ All checks passed! Your setup looks good." -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Start MongoDB: net start MongoDB" -ForegroundColor White
    Write-Host "2. Start the app: npm run dev" -ForegroundColor White
    Write-Host "3. Open browser: http://localhost:5173" -ForegroundColor White
} else {
    Write-Host "❌ Some checks failed. Please fix the issues above." -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 To fix:" -ForegroundColor Cyan
    Write-Host "1. Run: .\INSTALL.ps1" -ForegroundColor White
    Write-Host "2. Or manually: npm install && cd backend && npm install && cd ../frontend && npm install" -ForegroundColor White
}

Write-Host ""
Write-Host "📖 For detailed help, see:" -ForegroundColor Cyan
Write-Host "   - QUICK_FIX.md (quick start)" -ForegroundColor White
Write-Host "   - SETUP_AND_FIX.md (detailed guide)" -ForegroundColor White
Write-Host "   - README.md (full documentation)" -ForegroundColor White
Write-Host ""
