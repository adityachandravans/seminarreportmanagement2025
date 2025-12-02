# Check if development environment is ready

Write-Host ""
Write-Host "🔍 Checking Development Environment..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: backend/.env exists
Write-Host "Checking backend/.env file..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    Write-Host "  ✅ backend/.env exists" -ForegroundColor Green
    
    # Check if password is configured
    $envContent = Get-Content "backend/.env" -Raw
    if ($envContent -match "YOUR_PASSWORD") {
        Write-Host "  ❌ MongoDB password NOT configured (still has YOUR_PASSWORD)" -ForegroundColor Red
        Write-Host "     Action: Edit backend/.env and add your MongoDB password" -ForegroundColor Yellow
        $allGood = $false
    } else {
        Write-Host "  ✅ MongoDB password is configured" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ backend/.env NOT found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check 2: frontend/.env exists
Write-Host "Checking frontend/.env file..." -ForegroundColor Yellow
if (Test-Path "frontend/.env") {
    Write-Host "  ✅ frontend/.env exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ frontend/.env NOT found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check 3: Backend running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✅ Backend is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "     Action: Run 'cd backend && npm start'" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check 4: Frontend running
Write-Host "Checking if frontend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✅ Frontend is running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Frontend is NOT running" -ForegroundColor Yellow
    Write-Host "     Action: Run 'cd frontend && npm run dev'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($allGood) {
    Write-Host ""
    Write-Host "  🎉 Everything is ready! Your development environment is set up!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Open: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  ⚠️  Some issues need to be fixed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  📖 See: START_DEVELOPMENT.md for detailed instructions" -ForegroundColor White
    Write-Host "  🤖 Or run: ./SETUP_BACKEND_NOW.ps1 for automated setup" -ForegroundColor White
    Write-Host ""
}

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
