@echo off
REM Build complete Tailwind v4.1 reference
REM Usage: build-all.bat

echo 🚀 Building Tailwind v4.1 Permanent Reference...
echo.

echo Step 1: Extracting all documentation pages...
node extract-docs.mjs

if %errorlevel% equ 0 (
  echo.
  echo Step 2: Building organized reference...
  node build-reference.mjs
  
  if %errorlevel% equ 0 (
    echo.
    echo ✅ Reference build complete!
    echo.
    echo 📁 Files created:
    echo    - tailwind-docs-cache.json (raw cache)
    echo    - tailwind-v4-reference.json (organized reference)
    echo.
    echo 🎯 The MCP server will automatically use the reference!
  ) else (
    echo ❌ Error building reference
    exit /b 1
  )
) else (
  echo ❌ Error extracting docs
  exit /b 1
)

