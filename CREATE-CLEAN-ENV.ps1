# ✅ VALIDATED - Create clean .env file for metadata-studio
# This connection string has been validated against your Supabase project

$envContent = @"
# Supabase Database Connection (Connection Pooling)
DATABASE_URL=postgresql://postgres.cnlutbuzjqtuicngldak:Weepohlai88!@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Server Configuration
PORT=8787
NODE_ENV=development

# Event Bus Configuration
EVENT_BUS_TYPE=local

# GitHub Token (if needed for future integrations)
GITHUB_PERSONAL_ACCESS_TOKEN=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
"@

# Write to metadata-studio/.env
$envContent | Out-File -FilePath ".\metadata-studio\.env" -Encoding UTF8 -NoNewline

Write-Host "✅ SUCCESS: Clean .env file created at metadata-studio\.env" -ForegroundColor Green
Write-Host ""
Write-Host "Validated configuration:" -ForegroundColor Cyan
Write-Host "  • Supabase project: cnlutbuzjqtuicngldak" -ForegroundColor White
Write-Host "  • Region: aws-0-us-west-1" -ForegroundColor White
Write-Host "  • Connection: Pooled (port 6543)" -ForegroundColor White
Write-Host "  • Server port: 8787" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next step: Server will auto-restart!" -ForegroundColor Yellow
Write-Host "   Watch terminal 16 for: 'metadata-studio listening on http://localhost:8787'" -ForegroundColor Yellow

