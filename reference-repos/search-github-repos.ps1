# Search GitHub Repositories for Tailwind v4
# Requires: GITHUB_PERSONAL_ACCESS_TOKEN in .env

$ErrorActionPreference = "Stop"

# Load token from .env
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] .env file not found" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile -Raw
if ($envContent -match "GITHUB_PERSONAL_ACCESS_TOKEN\s*=\s*(.+)") {
    $token = $matches[1].Trim()
} else {
    Write-Host "[ERROR] GITHUB_PERSONAL_ACCESS_TOKEN not found in .env" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "AIBOS-Metadata-Platform"
}

Write-Host "[INFO] Searching GitHub for Tailwind v4 repositories..." -ForegroundColor Cyan

# Search queries
$queries = @(
    "tailwind+v4+tailwindcss+4.0",
    "tailwind+v4+next.js+react",
    "tailwind+v4+monorepo+turbo",
    "tailwind+v4+examples+use+cases",
    "tailwind+v4+theming+oklch"
)

$results = @()

foreach ($query in $queries) {
    Write-Host "`n[SEARCH] Query: $query" -ForegroundColor Yellow
    
    $url = "https://api.github.com/search/repositories?q=$query&sort=stars&order=desc&per_page=10"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        
        foreach ($repo in $response.items) {
            $results += [PSCustomObject]@{
                Name = $repo.name
                FullName = $repo.full_name
                Description = $repo.description
                Stars = $repo.stargazers_count
                URL = $repo.html_url
                Language = $repo.language
                Updated = $repo.updated_at
                Topics = $repo.topics -join ", "
            }
        }
        
        Write-Host "[SUCCESS] Found $($response.items.Count) repositories" -ForegroundColor Green
        Start-Sleep -Milliseconds 500
    }
    catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Remove duplicates and sort by stars
$uniqueResults = $results | Sort-Object -Property FullName -Unique | Sort-Object -Property Stars -Descending

Write-Host "`n[SUCCESS] Found $($uniqueResults.Count) unique repositories" -ForegroundColor Green
Write-Host "`n[RESULTS] Top 20 Repositories:" -ForegroundColor Cyan
Write-Host ""

$uniqueResults | Select-Object -First 20 | Format-Table -Property Name, FullName, Stars, Language, Updated -AutoSize

# Export to JSON
$outputFile = "reference-repos/github-search-results.json"
$uniqueResults | ConvertTo-Json -Depth 3 | Out-File $outputFile -Encoding UTF8
Write-Host "`n[INFO] Results saved to: $outputFile" -ForegroundColor Green

# Export to Markdown
$mdFile = "reference-repos/github-search-results.md"
$dateStr = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$mdContent = "# GitHub Search Results - Tailwind v4 Repositories`n`n"
$mdContent += "**Date:** $dateStr`n"
$mdContent += "**Total Repositories Found:** $($uniqueResults.Count)`n`n"
$mdContent += "## Top Repositories`n`n"

foreach ($repo in ($uniqueResults | Select-Object -First 20)) {
    $mdContent += "### $($repo.Name)`n"
    $mdContent += "- **Repository:** [$($repo.FullName)]($($repo.URL))`n"
    $mdContent += "- **Stars:** $($repo.Stars)`n"
    $mdContent += "- **Language:** $($repo.Language)`n"
    $mdContent += "- **Description:** $($repo.Description)`n"
    $mdContent += "- **Topics:** $($repo.Topics)`n"
    $mdContent += "- **Last Updated:** $($repo.Updated)`n`n"
    $mdContent += "**Clone Command:**`n"
    $mdContent += "``````bash`n"
    $mdContent += "git clone $($repo.URL).git`n"
    $mdContent += "```````n`n"
    $mdContent += "---`n`n"
}

$mdContent | Out-File $mdFile -Encoding UTF8
Write-Host "[INFO] Markdown report saved to: $mdFile" -ForegroundColor Green
