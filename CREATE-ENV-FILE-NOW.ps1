# PowerShell script to create .env file
# Run this in PowerShell

# Get Supabase password from user
$password = Read-Host "Enter your Supabase database password"

# Create .env file
$envContent = @"
# Supabase Database Connection (Connection Pooling)
DATABASE_URL=postgresql://postgres.cnlutbuzjqtuicngldak:$password@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Server Configuration
PORT=8787
NODE_ENV=development

# Event Bus Configuration
EVENT_BUS_TYPE=local
"@

# Write to file
$envContent | Out-File -FilePath ".\metadata-studio\.env" -Encoding UTF8

Write-Host "✅ .env file created successfully at metadata-studio\.env" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd metadata-studio" -ForegroundColor Cyan
Write-Host "2. pnpm dev" -ForegroundColor Cyan

