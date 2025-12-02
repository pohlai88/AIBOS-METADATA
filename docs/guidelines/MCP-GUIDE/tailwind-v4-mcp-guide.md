# Tailwind v4 MCP Server Guide

## Overview

The Tailwind v4 MCP server provides AI assistants with tools to validate, document, and enforce Tailwind CSS v4 best practices in your codebase.

## Purpose

This MCP server helps:
- ✅ Validate Tailwind v4 syntax and patterns
- ✅ Access Tailwind v4 documentation from local guides
- ✅ Check CSS-first approach compliance
- ✅ Validate design token usage
- ✅ Enforce `.cursorrules` best practices

## Installation

The server is automatically registered when you run:

```bash
cd .mcp/tailwind-v4
node update-mcp-config.mjs
```

This adds `aibos-tailwind-v4` to your `.cursor/mcp.json` configuration.

## Available Tools

### 1. `get_official_docs` ⭐ NEW

Fetches Tailwind CSS v4.1 official documentation from tailwindcss.com/docs. **Now parses navigation sidebar!**

**Usage:**
```
Get Tailwind v4.1 documentation for Vite installation
Search Tailwind v4.1 docs for container queries
Get official Tailwind docs for gradients
Get Tailwind v4.1 navigation structure
```

**What it does:**
- ✅ Fetches documentation from https://tailwindcss.com/docs
- ✅ **Parses navigation sidebar** - Extracts all links and sections
- ✅ **Builds navigation index** - Uses sidebar links for better search
- ✅ Extracts main content from HTML
- ✅ Preserves code blocks
- ✅ Caches results for performance

**Navigation Parsing:**
- Extracts sidebar navigation links
- Identifies documentation sections (CORE CONCEPTS, LAYOUT, etc.)
- Builds complete documentation index
- Uses navigation for intelligent search

**Example Responses:**

**With Navigation:**
```json
{
  "url": "https://tailwindcss.com/docs/installation/using-vite",
  "title": "Installation - Using Vite",
  "navigation": {
    "sections": ["CORE CONCEPTS", "BASE STYLES", "LAYOUT"],
    "links": [
      { "path": "installation/using-vite", "text": "Using Vite" },
      { "path": "detecting-classes-in-source-files", "text": "Detecting classes" }
    ],
    "linkCount": 150
  },
  "content": "Installing Tailwind CSS as a Vite plugin...",
  "codeBlocks": ["@import \"tailwindcss\";", "npm run dev"]
}
```

**Navigation Only:**
```json
{
  "navigation": {
    "sections": ["CORE CONCEPTS", "BASE STYLES", "LAYOUT", "FLEXBOX & GRID"],
    "links": [
      { "path": "installation/using-vite", "text": "Using Vite", "url": "..." },
      { "path": "detecting-classes-in-source-files", "text": "Detecting classes", "url": "..." }
    ],
    "totalLinks": 150
  }
}
```

**Common Documentation Paths:**
- `installation/using-vite` - Vite plugin setup
- `installation/using-postcss` - PostCSS setup  
- `detecting-classes-in-source-files` - Content detection
- `theme-variables` - Design tokens
- `container-queries` - Container queries
- `gradients` - Gradient utilities
- `transforms` - 3D transforms

**Reference:** https://tailwindcss.com/docs/installation/using-vite

---

### 2. `validate_syntax`

Validates Tailwind v4 syntax in code files.

**Usage:**
```
Validate Tailwind v4 syntax in packages/ui/design/globals.css
```

**What it checks:**
- ✅ Proper `@import "tailwindcss"` (not v3 directives)
- ✅ OKLCH color format usage
- ✅ No JS config patterns
- ✅ CSS-first approach
- ⚠️ Warns about JS animation libraries (Framer Motion, GSAP)

**Example Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "type": "rgb_in_theme",
      "message": "Consider using OKLCH format in @theme"
    }
  ],
  "suggestions": []
}
```

---

### 3. `get_documentation`

Retrieves Tailwind v4 documentation from local guides.

**Usage:**
```
Get Tailwind v4 documentation about content detection
Get Tailwind v4 documentation about gradients
```

**Searches through:**
- `TAILWIND-V4-CLEAN-SETUP-GUIDE.md`
- `TAILWIND-V4-DESIGN-SYSTEM.md`
- `TAILWIND-V4-POWER-USECASE.md`
- `TAILWIND-V4-REAL-WORLD-ANALYSIS.md`
- `TAILWIND-V4-REFERENCE-REPOS.md`

**Example Response:**
```json
{
  "results": [
    {
      "file": "TAILWIND-V4-CONTENT-DETECTION.md",
      "content": "## Content Detection Rules...\n\nUse @source directive..."
    }
  ]
}
```

---

### 4. `validate_design_tokens`

Validates `@theme` directive usage and extracts design tokens.

**Usage:**
```
Validate design tokens in packages/ui/design/globals.css
```

**What it extracts:**
- Color tokens (`--color-*`)
- Spacing tokens (`--spacing-*`)
- Duration tokens (`--duration-*`)
- Easing tokens (`--ease-*`)
- Shadow tokens (`--shadow-*`)

**Example Response:**
```json
{
  "hasTheme": true,
  "hasOKLCH": true,
  "tokens": {
    "colors": [
      { "name": "primary-500", "value": "oklch(0.62 0.25 250)" }
    ],
    "durations": [
      { "name": "fast", "value": "120ms" }
    ]
  },
  "recommendations": []
}
```

---

### 5. `check_css_first`

Validates CSS-first approach compliance.

**Usage:**
```
Check CSS-first compliance in apps/web/tailwind.config.js
```

**What it checks:**
- ✅ Has `@import "tailwindcss"`
- ❌ No v3 `@tailwind` directives
- ✅ Uses `@theme` directive
- ❌ No JS config with `extend:`
- ✅ Uses OKLCH colors
- ✅ Uses `@custom-variant`

**Example Response:**
```json
{
  "compliant": true,
  "score": 6,
  "checks": {
    "hasV4Import": true,
    "hasV3Directives": false,
    "hasTheme": true,
    "hasJSConfig": false,
    "usesOKLCH": true,
    "usesCustomVariants": true
  },
  "recommendations": []
}
```

---

### 6. `get_best_practices`

Retrieves best practices from `.cursorrules` and guides.

**Usage:**
```
Get Tailwind v4 best practices for animations
Get Tailwind v4 best practices for gradients
Get Tailwind v4 best practices
```

**Example Response:**
```json
{
  "category": "animation",
  "rules": "## Animation & Interaction Rules\n\n8. **ZERO JavaScript Animations**...",
  "summary": "Found 50 major rule sections"
}
```

---

## Common Use Cases

### Use Case 1: Validate New CSS File

```
Validate Tailwind v4 syntax in my new globals.css file
```

The server will check:
- Proper v4 import syntax
- OKLCH color usage
- CSS-first patterns
- Design token structure

### Use Case 2: Check Migration from v3

```
Check CSS-first compliance in apps/web/tailwind.config.js
```

The server will identify:
- Remaining v3 patterns
- JS config that should move to CSS
- Missing `@theme` usage

### Use Case 3: Get Documentation

```
How do I use container queries in Tailwind v4?
Get Tailwind v4 documentation about @starting-style
```

The server searches your local guides and returns relevant sections.

### Use Case 4: Get Official Documentation

```
Get Tailwind v4.1 documentation for Vite installation
Search Tailwind v4.1 docs for container queries
Get official Tailwind docs for gradients
```

The server fetches the latest documentation from tailwindcss.com/docs and returns relevant content.

### Use Case 5: Validate Design Tokens

```
Validate design tokens in packages/ui/design/globals.css
```

The server extracts and validates all design tokens from your `@theme` directive.

---

## Integration with Other MCP Servers

The Tailwind v4 MCP works alongside:

- **next-devtools** - Next.js runtime diagnostics
- **documentation** - General documentation access
- **convention-validation** - Code convention checks
- **component-generator** - Component generation (uses Tailwind)

All servers work together to provide comprehensive development support.

---

## Troubleshooting

### Server Not Available

**Check:**
1. Server is registered in `.cursor/mcp.json`
2. Run `node .mcp/tailwind-v4/update-mcp-config.mjs`
3. Restart Cursor

### Validation Errors

**Common Issues:**
- File path is relative to workspace root
- CSS file must exist and be readable
- Check file permissions

### Documentation Not Found

**Solutions:**
- Ensure `docs/guidelines/TAILWIND-V4-GUIDE/` exists
- Check topic spelling
- Try broader topic terms

---

## Best Practices

1. **Validate before committing** - Use `validate_syntax` on changed files
2. **Check CSS-first** - Use `check_css_first` when migrating from v3
3. **Reference documentation** - Use `get_documentation` for specific topics
4. **Validate tokens** - Use `validate_design_tokens` to ensure proper structure
5. **Follow best practices** - Use `get_best_practices` to stay compliant

---

## Related Documentation

- [Tailwind v4 Rules](../.cursor/.cursorrules)
- [Tailwind v4 Guides](../TAILWIND-V4-GUIDE/)
- [MCP Server Standards](../../.mcp/README.md)
- [Official Tailwind v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4)

---

**Status:** ✅ **PRODUCTION-READY**

