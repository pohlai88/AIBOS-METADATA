# Tailwind v4 MCP Server - Update v1.1.0

## ✅ Update Complete

Added official Tailwind CSS v4.1 documentation access to the MCP server.

## 🆕 What's New

### New Tool: `get_official_docs`

Fetches and searches the entire Tailwind CSS v4.1 documentation from https://tailwindcss.com/docs.

**Features:**
- ✅ Fetch specific documentation pages by path
- ✅ Search across common documentation topics
- ✅ Fetch by full URL
- ✅ Content caching for performance
- ✅ HTML parsing and content extraction

**Usage Examples:**

1. **Fetch Specific Page:**
   ```
   Get Tailwind v4.1 documentation for Vite installation
   ```
   Uses: `{ "path": "installation/using-vite" }`

2. **Search Documentation:**
   ```
   Search Tailwind v4.1 docs for container queries
   ```
   Uses: `{ "query": "container queries" }`

3. **Fetch by URL:**
   ```
   Get official Tailwind docs from https://tailwindcss.com/docs/gradients
   ```
   Uses: `{ "url": "https://tailwindcss.com/docs/gradients" }`

## 📚 Available Documentation

The tool can access all Tailwind v4.1 documentation pages, including:

### Installation
- `installation/using-vite` - Vite plugin setup
- `installation/using-postcss` - PostCSS setup

### Core Concepts
- `detecting-classes-in-source-files` - Content detection
- `theme-variables` - Design tokens
- `colors` - Color system
- `functions-and-directives` - CSS functions

### Features
- `container-queries` - Container queries
- `transforms` - 3D transforms
- `gradients` - Gradient utilities
- `transitions-and-animation` - Animations

### And many more...

## 🔧 Technical Details

**Implementation:**
- Uses native `fetch()` API
- HTML parsing to extract main content
- Content caching (Map-based)
- Error handling for network issues
- Content size limits (5000 chars per page)

**Caching:**
- Results cached in memory
- Cache key based on path/URL
- No expiration (cleared on server restart)

## 📝 Updated Files

1. **`.mcp/tailwind-v4/server.mjs`**
   - Added `fetchOfficialDocs()` function
   - Added `searchOfficialDocs()` function
   - Added `get_official_docs` tool handler
   - Updated version to 1.1.0

2. **`.mcp/tailwind-v4/README.md`**
   - Added documentation for new tool
   - Updated tool numbering
   - Added usage examples

3. **`docs/guidelines/MCP-GUIDE/tailwind-v4-mcp-guide.md`**
   - Added new tool documentation
   - Added use case examples
   - Updated tool list

4. **`.mcp/tailwind-v4/package.json`**
   - Updated version to 1.1.0

## 🚀 Next Steps

1. **Restart Cursor** to load the updated MCP server
2. **Test the new tool:**
   - "Get Tailwind v4.1 documentation for Vite installation"
   - "Search Tailwind v4.1 docs for container queries"
   - "Get official Tailwind docs for gradients"

## 📖 Reference

- [Official Tailwind v4.1 Docs](https://tailwindcss.com/docs)
- [Vite Installation Guide](https://tailwindcss.com/docs/installation/using-vite)

---

**Status:** ✅ **READY TO USE**

**Version:** 1.1.0

