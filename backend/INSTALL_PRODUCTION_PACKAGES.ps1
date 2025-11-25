# Production Enhancement Package Installation Script (PowerShell)
# Run this script to install all required packages for production features

Write-Host "🚀 Installing Production Enhancement Packages..." -ForegroundColor Cyan
Write-Host ""

# Core production packages
Write-Host "📦 Installing core packages..." -ForegroundColor Yellow
npm install nodemailer cloudinary multer-storage-cloudinary

# Security packages
Write-Host "🔐 Installing security packages..." -ForegroundColor Yellow
npm install express-rate-limit helmet express-mongo-sanitize xss-clean hpp cors

# Token management
Write-Host "🔑 Installing JWT packages..." -ForegroundColor Yellow
npm install jsonwebtoken

# Logging
Write-Host "📝 Installing logging packages..." -ForegroundColor Yellow
npm install winston morgan

# Validation
Write-Host "✅ Installing validation packages..." -ForegroundColor Yellow
npm install joi

# Development dependencies
Write-Host "🛠️  Installing dev dependencies..." -ForegroundColor Yellow
npm install --save-dev @types/nodemailer @types/cors @types/jsonwebtoken @types/morgan @types/joi

Write-Host ""
Write-Host "✅ All packages installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your .env file with the new variables (see .env.production.example)" -ForegroundColor White
Write-Host "2. Follow the PRODUCTION_ENHANCEMENT_GUIDE.md for integration steps" -ForegroundColor White
Write-Host "3. Test all features before deploying to production" -ForegroundColor White
Write-Host ""
