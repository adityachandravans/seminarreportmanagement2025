# PowerShell Script to Test Backend Fixes Locally

Write-Host "🧪 Testing Backend Fixes..." -ForegroundColor Cyan
Write-Host ""

# Check if backend is built
if (-not (Test-Path backend/dist/server.js)) {
    Write-Host "⚠️  Backend not built. Building now..." -ForegroundColor Yellow
    cd backend
    npm run build
    cd ..
}

Write-Host "✅ Backend is built" -ForegroundColor Green
Write-Host ""

# Check if backend is running
Write-Host "🔍 Checking if backend is running on port 5000..." -ForegroundColor Yellow
$response = $null
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
} catch {
    Write-Host "❌ Backend is not running on port 5000" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 To start the backend:" -ForegroundColor Yellow
    Write-Host "   cd backend"
    Write-Host "   npm start"
    Write-Host ""
    exit 1
}

Write-Host "✅ Backend is running!" -ForegroundColor Green
Write-Host ""

# Test health endpoint
Write-Host "🧪 Testing /health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    if ($healthResponse.status -eq "OK") {
        Write-Host "✅ /health returns: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  /health returned unexpected response: $($healthResponse | ConvertTo-Json)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ /health test failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test root endpoint
Write-Host "🧪 Testing / (root) endpoint..." -ForegroundColor Yellow
try {
    $rootResponse = Invoke-RestMethod -Uri "http://localhost:5000/" -Method GET
    if ($rootResponse.message -like "*API*") {
        Write-Host "✅ Root endpoint returns JSON (not blank page)" -ForegroundColor Green
        Write-Host "   Response: $($rootResponse.message)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Root endpoint returned unexpected response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Root endpoint test failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test API test endpoint
Write-Host "🧪 Testing /api/test endpoint..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/test" -Method GET
    if ($testResponse.message -eq "API is working") {
        Write-Host "✅ /api/test is working" -ForegroundColor Green
    } else {
        Write-Host "⚠️  /api/test returned unexpected response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ /api/test failed: $_" -ForegroundColor Red
}

Write-Host ""

# Check for frontend serving code
Write-Host "🔍 Checking for frontend serving code..." -ForegroundColor Yellow
$frontendCode = Select-String -Path "backend/dist/server.js" -Pattern "express\.static" -Quiet
if ($frontendCode) {
    Write-Host "❌ Found express.static in compiled code!" -ForegroundColor Red
} else {
    Write-Host "✅ No frontend serving code found" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 All tests completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 If all tests passed, you can now:" -ForegroundColor Yellow
Write-Host "   1. Run ./DEPLOY_FIXES.ps1 to push to GitHub"
Write-Host "   2. Wait for Render to redeploy"
Write-Host "   3. Update CORS_ORIGIN in Render"
Write-Host "   4. Deploy frontend to Vercel"
