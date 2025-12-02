# Tailwind v4.1 Permanent Reference Guide

## Overview

This directory contains a **permanent, organized reference** of all Tailwind CSS v4.1 documentation. The reference is extracted, categorized, and indexed for easy access without needing to visit the website repeatedly.

## Files

### 1. `extract-docs.mjs`
**Purpose:** Extracts all documentation pages from tailwindcss.com/docs

**Usage:**
```bash
node extract-docs.mjs
```

**What it does:**
- Fetches main docs page to get navigation
- Extracts all documentation pages
- Saves raw cache to `tailwind-docs-cache.json`
- Includes: HTML content, navigation, code blocks

**Output:** `tailwind-docs-cache.json`

---

### 2. `build-reference.mjs`
**Purpose:** Organizes extracted docs into a logical, reusable structure

**Usage:**
```bash
node build-reference.mjs
```

**What it does:**
- Reads `tailwind-docs-cache.json`
- Categorizes pages by topic (installation, layout, typography, etc.)
- Extracts key information (summary, utilities, variants, configuration)
- Builds indexes (by category, keyword, utility, variant)
- Creates quick reference sections

**Output:** `tailwind-v4-reference.json`

---

### 3. `tailwind-v4-reference.json` ⭐ **PERMANENT REFERENCE**
**Purpose:** The organized, permanent reference file

**Structure:**
```json
{
  "metadata": {
    "version": "4.1",
    "builtAt": "2025-12-02T...",
    "totalPages": 150,
    "categories": ["installation", "coreConcepts", "layout", ...]
  },
  "navigation": {
    "sections": ["CORE CONCEPTS", "LAYOUT", ...],
    "links": [...]
  },
  "categories": {
    "installation": {
      "name": "installation",
      "description": "installation, setup, install, ...",
      "pages": [...],
      "totalPages": 5
    },
    ...
  },
  "pages": {
    "installation/using-vite": {
      "path": "installation/using-vite",
      "title": "Installing Tailwind CSS with Vite",
      "category": "installation",
      "summary": "...",
      "keyPoints": [...],
      "utilities": ["@import", "tailwindcss"],
      "variants": [],
      "configuration": ["@import"],
      "codeBlocks": [...],
      "content": "...",
      "fullContent": "..."
    },
    ...
  },
  "index": {
    "byCategory": {
      "installation": ["installation/using-vite", ...]
    },
    "byKeyword": {
      "vite": ["installation/using-vite", ...],
      "container": ["container-queries", ...]
    },
    "byUtility": {
      "bg-primary": ["colors", "theme"],
      ...
    },
    "byVariant": {
      "hover": ["hover-focus-and-other-states", ...],
      ...
    }
  },
  "quickReference": {
    "installation": [...],
    "coreConcepts": [...],
    "utilities": [...],
    "variants": [...],
    "configuration": {
      "directives": ["@import", "@theme", "@custom-variant", ...],
      "examples": [...]
    }
  }
}
```

---

## Categories

The reference organizes pages into logical categories:

1. **installation** - Setup, installation guides
2. **coreConcepts** - Styling, utilities, states, theme, colors
3. **layout** - Display, positioning, overflow
4. **flexboxGrid** - Flexbox and Grid utilities
5. **spacing** - Padding and margin
6. **sizing** - Width and height
7. **typography** - Font, text, line-height
8. **backgrounds** - Background colors and images
9. **borders** - Border styles and radius
10. **effects** - Shadows, opacity, blend modes
11. **filters** - Filter and backdrop-filter
12. **animations** - Transitions and animations
13. **transforms** - Transform utilities
14. **interactivity** - Cursor, scroll, user-select
15. **svg** - SVG fill and stroke
16. **accessibility** - Accessibility features
17. **baseStyles** - Preflight and base styles
18. **tables** - Table utilities

---

## Usage in MCP Server

The MCP server automatically uses the permanent reference:

1. **First Priority:** `tailwind-v4-reference.json` (organized, indexed)
2. **Second Priority:** `tailwind-docs-cache.json` (raw cache)
3. **Fallback:** Live fetch from website

**Benefits:**
- ✅ Fast - No network requests
- ✅ Organized - Categorized and indexed
- ✅ Complete - All documentation included
- ✅ Searchable - Multiple indexes
- ✅ Reusable - Easy to query and reference

---

## Building the Reference

### Step 1: Extract All Docs
```bash
cd .mcp/tailwind-v4
node extract-docs.mjs
```

**Time:** ~5-10 minutes (depends on number of pages)
**Output:** `tailwind-docs-cache.json` (~5-10 MB)

### Step 2: Build Organized Reference
```bash
node build-reference.mjs
```

**Time:** ~30 seconds
**Output:** `tailwind-v4-reference.json` (~3-5 MB)

### Step 3: Use in MCP Server
The server automatically loads the reference on startup.

---

## Updating the Reference

When Tailwind v4.1 docs are updated:

1. Run `extract-docs.mjs` to get latest pages
2. Run `build-reference.mjs` to rebuild organized reference
3. Restart MCP server to load new reference

**Note:** The reference is versioned (4.1) and can be kept alongside future versions.

---

## Reference Structure Benefits

### 1. **Categorized Access**
```javascript
reference.categories.installation.pages
reference.categories.layout.pages
```

### 2. **Keyword Search**
```javascript
reference.index.byKeyword["vite"] // All pages mentioning "vite"
reference.index.byKeyword["container"] // All container-related pages
```

### 3. **Utility Lookup**
```javascript
reference.index.byUtility["bg-primary"] // Pages about bg-primary
reference.index.byUtility["hover:scale"] // Pages about hover:scale
```

### 4. **Variant Lookup**
```javascript
reference.index.byVariant["dark"] // Pages about dark mode
reference.index.byVariant["hover"] // Pages about hover states
```

### 5. **Quick Reference**
```javascript
reference.quickReference.utilities // All utilities list
reference.quickReference.configuration.directives // All directives
reference.quickReference.configuration.examples // Code examples
```

---

## Example Queries

### Get all installation pages:
```javascript
const installation = reference.categories.installation.pages;
```

### Find pages about "container queries":
```javascript
const pages = reference.index.byKeyword["container"];
```

### Get all utilities:
```javascript
const utilities = reference.quickReference.utilities;
```

### Find configuration examples:
```javascript
const examples = reference.quickReference.configuration.examples;
```

---

## File Sizes

- `tailwind-docs-cache.json`: ~5-10 MB (raw HTML content)
- `tailwind-v4-reference.json`: ~3-5 MB (organized, indexed)

Both files are JSON and can be:
- ✅ Version controlled
- ✅ Shared across team
- ✅ Used offline
- ✅ Parsed by any JSON parser

---

**Status:** ✅ **PERMANENT REFERENCE READY**

The reference is a complete, organized, and reusable knowledge base of Tailwind v4.1 documentation!

