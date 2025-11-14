$body = @{
  email = "newtestuser@example.com"
  password = "TestPassword123"
  name = "New Test User"
  role = "student"
  rollNumber = "CS2025"
  department = "Computer Science"
  year = 2
} | ConvertTo-Json

Write-Host "Sending registration request..."
Write-Host "Body: $body"

try {
  $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body `
    -UseBasicParsing
  
  Write-Host "Status Code: $($response.StatusCode)"
  Write-Host "Response:"
  $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
  Write-Host "Error: $($_.Exception.Message)"
  Write-Host "Response: $($_.Exception.Response.Content)"
}
