# Push to GitHub Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pushing to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Repository: https://github.com/adityachandravans/seminarreportmanagement2025.git" -ForegroundColor Yellow
Write-Host ""

Write-Host "Make sure you've allowed the secret on GitHub first!" -ForegroundColor Yellow
Write-Host "Press Enter to continue or Ctrl+C to cancel..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan

git push -f origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "View your repository at:" -ForegroundColor Cyan
    Write-Host "https://github.com/adityachandravans/seminarreportmanagement2025" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Add a repository description" -ForegroundColor White
    Write-Host "2. Add topics/tags" -ForegroundColor White
    Write-Host "3. Add screenshots to README" -ForegroundColor White
    Write-Host "4. Star your own repository ⭐" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you clicked 'Allow secret' on GitHub" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
}
