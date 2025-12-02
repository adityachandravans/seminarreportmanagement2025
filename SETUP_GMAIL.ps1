# Gmail SMTP Setup Script

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          📧 GMAIL SMTP SETUP FOR EMAIL SENDING                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you configure Gmail SMTP for sending emails." -ForegroundColor White
Write-Host ""

# Check if .env exists
if (-not (Test-Path "backend/.env")) {
    Write-Host "❌ backend/.env file not found!" -ForegroundColor Red
    Write-Host "   Creating from template..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
    Write-Host ""
}

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    STEP 1: ENABLE 2-STEP VERIFICATION          " -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open: https://myaccount.google.com/security" -ForegroundColor White
Write-Host "2. Find: 2-Step Verification" -ForegroundColor White
Write-Host "3. Turn it ON if not already enabled" -ForegroundColor White
Write-Host ""
$continue = Read-Host "Have you enabled 2-Step Verification? (y/n)"

if ($continue -ne 'y') {
    Write-Host ""
    Write-Host "Please enable 2-Step Verification first, then run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    STEP 2: GENERATE APP PASSWORD               " -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open: https://myaccount.google.com/apppasswords" -ForegroundColor White
Write-Host "2. Select app: Mail" -ForegroundColor White
Write-Host "3. Select device: Other (Custom name)" -ForegroundColor White
Write-Host "4. Enter name: Seminar Report System" -ForegroundColor White
Write-Host "5. Click Generate" -ForegroundColor White
Write-Host "6. Copy the 16-character password (remove spaces)" -ForegroundColor White
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Process "https://myaccount.google.com/apppasswords"
Write-Host ""

$continue = Read-Host "Have you generated the app password? (y/n)"

if ($continue -ne 'y') {
    Write-Host ""
    Write-Host "Please generate app password first, then run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    STEP 3: ENTER YOUR CREDENTIALS              " -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$email = Read-Host "Enter your Gmail address (e.g., john@gmail.com)"
$appPassword = Read-Host "Enter your 16-character app password (no spaces)"

if ([string]::IsNullOrWhiteSpace($email) -or [string]::IsNullOrWhiteSpace($appPassword)) {
    Write-Host ""
    Write-Host "❌ Email or password cannot be empty!" -ForegroundColor Red
    exit 1
}

# Remove spaces from app password
$appPassword = $appPassword -replace '\s', ''

Write-Host ""
Write-Host "🔄 Updating backend/.env file..." -ForegroundColor Yellow

# Read current .env
$envContent = Get-Content "backend/.env" -Raw

# Update email configuration
$envContent = $envContent -replace 'EMAIL_SERVICE=.*', "EMAIL_SERVICE=gmail"
$envContent = $envContent -replace 'EMAIL_USER=.*', "EMAIL_USER=$email"
$envContent = $envContent -replace 'EMAIL_PASSWORD=.*', "EMAIL_PASSWORD=$appPassword"
$envContent = $envContent -replace 'EMAIL_FROM_ADDRESS=.*', "EMAIL_FROM_ADDRESS=$email"
$envContent = $envContent -replace 'EMAIL_REPLY_TO=.*', "EMAIL_REPLY_TO=$email"

# Save updated .env
Set-Content "backend/.env" -Value $envContent -NoNewline

Write-Host "✅ Configuration updated!" -ForegroundColor Green
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    STEP 4: TEST EMAIL SENDING                  " -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$test = Read-Host "Do you want to start the backend now to test? (y/n)"

if ($test -eq 'y') {
    Write-Host ""
    Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Look for this message:" -ForegroundColor Yellow
    Write-Host "  ✅ Email service is ready" -ForegroundColor Green
    Write-Host ""
    Write-Host "If you see an error, check your credentials." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server when done testing." -ForegroundColor Gray
    Write-Host ""
    
    cd backend
    npm start
} else {
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "                    ✅ SETUP COMPLETE!                          " -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Start backend: cd backend && npm start" -ForegroundColor White
    Write-Host "2. Start frontend: cd frontend && npm run dev" -ForegroundColor White
    Write-Host "3. Register a user and check email!" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Full Guide: GMAIL_SETUP_GUIDE.md" -ForegroundColor Cyan
    Write-Host ""
}
