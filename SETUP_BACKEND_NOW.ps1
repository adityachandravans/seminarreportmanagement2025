# Quick Backend Setup Script

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          🔧 BACKEND SETUP - ACTION REQUIRED                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  Your backend/.env file needs your MongoDB password!" -ForegroundColor Yellow
Write-Host ""

# Check if .env exists
if (-not (Test-Path "backend/.env")) {
    Write-Host "❌ backend/.env file not found!" -ForegroundColor Red
    exit 1
}

# Check if password is still placeholder
$envContent = Get-Content "backend/.env" -Raw
if ($envContent -match "YOUR_PASSWORD") {
    Write-Host "❌ MongoDB password not configured yet!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 STEPS TO FIX:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Get your MongoDB password:" -ForegroundColor White
    Write-Host "   • Go to: https://cloud.mongodb.com" -ForegroundColor Gray
    Write-Host "   • Click: Database Access" -ForegroundColor Gray
    Write-Host "   • Find user: seminar_admin" -ForegroundColor Gray
    Write-Host "   • Reset password if needed" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Enter your MongoDB password below:" -ForegroundColor White
    Write-Host ""
    
    $password = Read-Host "Enter your MongoDB Atlas password"
    
    if ([string]::IsNullOrWhiteSpace($password)) {
        Write-Host ""
        Write-Host "❌ No password entered. Exiting." -ForegroundColor Red
        exit 1
    }
    
    # URL encode special characters
    $encodedPassword = [System.Web.HttpUtility]::UrlEncode($password)
    
    Write-Host ""
    Write-Host "🔄 Updating backend/.env file..." -ForegroundColor Yellow
    
    # Replace YOUR_PASSWORD with actual password
    $envContent = $envContent -replace "YOUR_PASSWORD", $encodedPassword
    Set-Content "backend/.env" -Value $envContent -NoNewline
    
    Write-Host "✅ Password updated!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ MongoDB password is configured!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Write-Host ""

# Start backend
cd backend
npm start
