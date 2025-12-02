# ==========================================
# Environment Setup Script (PowerShell)
# ==========================================
# Run this script to copy env.example files to .env
# Usage: .\scripts\setup-env.ps1
# ==========================================

Write-Host "Setting up environment files..." -ForegroundColor Cyan

# Root .env
if (-not (Test-Path ".env")) {
    Copy-Item "env.example" ".env"
    Write-Host "  [OK] Created .env" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] .env already exists" -ForegroundColor Yellow
}

# BFF Admin Config
if (-not (Test-Path "apps/bff-admin-config/.env")) {
    Copy-Item "apps/bff-admin-config/env.example" "apps/bff-admin-config/.env"
    Write-Host "  [OK] Created apps/bff-admin-config/.env" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] apps/bff-admin-config/.env already exists" -ForegroundColor Yellow
}

# Web Frontend
if (-not (Test-Path "apps/web/.env.local")) {
    Copy-Item "apps/web/env.example" "apps/web/.env.local"
    Write-Host "  [OK] Created apps/web/.env.local" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] apps/web/.env.local already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done! Now edit the .env files with your actual values:" -ForegroundColor Cyan
Write-Host "  1. Get DATABASE_URL from Neon Console: https://console.neon.tech" -ForegroundColor White
Write-Host "  2. Generate JWT_SECRET: openssl rand -base64 32" -ForegroundColor White
Write-Host ""

