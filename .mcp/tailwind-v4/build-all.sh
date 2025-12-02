#!/bin/bash
# Build complete Tailwind v4.1 reference
# Usage: ./build-all.sh

echo "🚀 Building Tailwind v4.1 Permanent Reference..."
echo ""

echo "Step 1: Extracting all documentation pages..."
node extract-docs.mjs

if [ $? -eq 0 ]; then
  echo ""
  echo "Step 2: Building organized reference..."
  node build-reference.mjs
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Reference build complete!"
    echo ""
    echo "📁 Files created:"
    echo "   - tailwind-docs-cache.json (raw cache)"
    echo "   - tailwind-v4-reference.json (organized reference)"
    echo ""
    echo "🎯 The MCP server will automatically use the reference!"
  else
    echo "❌ Error building reference"
    exit 1
  fi
else
  echo "❌ Error extracting docs"
  exit 1
fi

