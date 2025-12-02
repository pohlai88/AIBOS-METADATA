# Fix Supabase Connection - Use Direct Connection or Session Pooler
# Run this in PowerShell

$envContent = @"
# Supabase Database - DIRECT CONNECTION (Recommended for Dev)
# Use this for long-running connections, migrations, and dev servers
DATABASE_URL=postgresql://postgres.cnlutbuzjqtuicngldak:Weepohlai88!@aws-0-us-west-1.pooler.supabase.com:5432/postgres

# Alternative: SESSION POOLER (if direct connection fails)
# DATABASE_URL=postgresql://postgres.cnlutbuzjqtuicngldak:Weepohlai88!@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

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

Write-Host "✅ SUCCESS: Updated to DIRECT CONNECTION (port 5432)" -ForegroundColor Green
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Cyan
Write-Host "  • Mode: Direct Connection (long-running)" -ForegroundColor White
Write-Host "  • Port: 5432 (PostgreSQL default)" -ForegroundColor White
Write-Host "  • Best for: Dev servers, migrations, Drizzle ORM" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Now restart the server:" -ForegroundColor Yellow
Write-Host "   cd metadata-studio" -ForegroundColor Cyan
Write-Host "   pnpm exec tsx index.ts" -ForegroundColor Cyan

