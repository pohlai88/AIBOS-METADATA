# Tailwind v4 Repository Clone Script
# Run from: D:/AIBOS-METADATA

$baseDir = "D:/AIBOS-METADATA/reference-repos"
New-Item -ItemType Directory -Force -Path $baseDir | Out-Null
Set-Location $baseDir

Write-Host "🚀 Cloning Tailwind v4 repositories..." -ForegroundColor Cyan

# Priority 1: Next.js 15 + Tailwind v4
Write-Host "📦 Cloning Next.js 15 + Tailwind v4 Starter..." -ForegroundColor Yellow
git clone https://github.com/cbmongithub/nextv15-tailwindv4-starter.git

# Priority 2: Turbo Monorepo
Write-Host "📦 Cloning Turbo Monorepo with Tailwind v4..." -ForegroundColor Yellow
git clone https://github.com/philipptpunkt/turbo-with-tailwind-v4.git

# Priority 3: Theming Examples
Write-Host "📦 Cloning Tailwind v4 Theming Examples..." -ForegroundColor Yellow
git clone https://github.com/Eveelin/tailwind-v4-theming-examples.git

# Priority 4: HyperUI Components
Write-Host "📦 Cloning HyperUI Component Library..." -ForegroundColor Yellow
git clone https://github.com/markmead/hyperui.git

# Priority 5: React + shadcn/ui
Write-Host "📦 Cloning React + shadcn/ui + Tailwind v4..." -ForegroundColor Yellow
git clone https://github.com/sumitnce1/React-Shadcn-Tailwind-CSS-V4.git

# Additional: Dioxus Example
Write-Host "📦 Cloning Dioxus + Tailwind v4 Example..." -ForegroundColor Yellow
git clone https://github.com/agirardeau/dioxus-tailwind-v4.git

# Official: Tailwind CSS Core
Write-Host "📦 Cloning Tailwind CSS Official Repository..." -ForegroundColor Yellow
git clone https://github.com/tailwindlabs/tailwindcss.git

Write-Host ""
Write-Host "✅ All repositories cloned successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. cd into each directory" -ForegroundColor White
Write-Host "2. Run 'pnpm install' in each" -ForegroundColor White
Write-Host "3. Explore globals.css and tailwind.config.js" -ForegroundColor White
Write-Host "4. Compare with our AIBOS setup" -ForegroundColor White
Write-Host "5. Create study notes using the template in TAILWIND-V4-GITHUB-DISCOVERY.md" -ForegroundColor White

