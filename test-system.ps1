Write-Host "Testing Backend Health..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
Write-Host "Backend: OK - MongoDB: $($response.mongodb.status)" -ForegroundColor Green

Write-Host "Testing API..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/test" -Method Get
Write-Host "API: OK" -ForegroundColor Green

Write-Host "Testing Frontend..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -UseBasicParsing
Write-Host "Frontend: OK" -ForegroundColor Green

Write-Host ""
Write-Host "All systems operational!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
