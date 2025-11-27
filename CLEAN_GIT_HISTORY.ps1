# Clean Git History - Remove Sensitive Data
Write-Host "Cleaning Git History..." -ForegroundColor Yellow
Write-Host ""

# Remove backend/.env from all commits
Write-Host "Removing backend/.env from history..." -ForegroundColor Cyan
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch backend/.env" --prune-empty --tag-name-filter cat -- --all

# Remove frontend/.env from all commits  
Write-Host "Removing frontend/.env from history..." -ForegroundColor Cyan
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch frontend/.env" --prune-empty --tag-name-filter cat -- --all

Write-Host ""
Write-Host "Cleaning complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add and commit the sanitized documentation files"
Write-Host "2. Force push to GitHub: git push -f origin main"
Write-Host ""
Write-Host "WARNING: Force push will rewrite history!" -ForegroundColor Red
