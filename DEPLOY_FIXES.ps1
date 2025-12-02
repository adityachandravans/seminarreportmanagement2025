# PowerShell Script to Deploy Backend Fixes to Render

Write-Host "🚀 Deploying Backend Fixes to Render..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Error: Not a git repository" -ForegroundColor Red
    exit 1
}

# Show what changed
Write-Host "📝 Files changed:" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "📦 Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "fix: Remove frontend serving, fix CORS, simplify health check

- Removed express.static and frontend serving code from backend
- Backend now serves API endpoints only
- Fixed CORS to remove trailing slashes
- Simplified /health endpoint to return { status: 'OK' }
- Added .env.production for Vercel deployment
- Updated API configuration for production"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌐 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Render will automatically redeploy in 1-2 minutes..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Wait for Render to finish deploying"
Write-Host "2. Update CORS_ORIGIN in Render dashboard (see RENDER_ENV_UPDATE.md)"
Write-Host "3. Deploy frontend to Vercel"
Write-Host "4. Test the deployment"
Write-Host ""
Write-Host "📖 See DEPLOYMENT_COMPLETE_GUIDE.md for detailed instructions" -ForegroundColor Cyan
