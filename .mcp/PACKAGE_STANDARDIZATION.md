# 📦 MCP Package.json Standardization

> **Purpose:** Standardize all MCP server package.json files  
> **Date:** 2025-11-24  
> **Status:** In Progress

---

## 🎯 Standardization Requirements

### **Required Fields (All MCP Servers)**

1. **SDK Version:** `@modelcontextprotocol/sdk@^1.22.0`
2. **Engines:**
   ```json
   "engines": {
     "node": ">=18.0.0",
     "pnpm": ">=8.0.0"
   }
   ```
3. **Package Manager:** `"packageManager": "pnpm@8.15.0"`
4. **Author:** `"AIBOS Platform"` or `"AI-BOS Team"`
5. **License:** `"MIT"`
6. **Type:** `"module"` (for ES modules)

### **Standard Structure**

```json
{
  "name": "@aibos/mcp-{name}",
  "version": "X.Y.Z",
  "type": "module",
  "description": "...",
  "main": "server.mjs",
  "scripts": {
    "start": "node server.mjs"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.22.0"
  },
  "keywords": ["mcp", "...", "aibos"],
  "author": "AIBOS Platform",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

---

## 📊 Current Status

| MCP Server | SDK Version | Engines | PackageManager | Author | License | Status |
|------------|-------------|---------|----------------|--------|---------|--------|
| documentation | ✅ ^1.22.0 | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| component-generator | ✅ ^1.22.0 | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| a11y | ✅ ^1.22.0 | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| theme | ✅ ^1.22.0 | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| filesystem | ✅ ^1.22.0 | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| ui-generator | ✅ ^1.22.0 | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| react | ✅ ^1.22.0 | ✅ | ✅ | ✅ | ✅ | ✅ Complete |

---

## 🔧 Required Changes

### **1. Root Dependencies (package.json)**

**For sync script:**
- ✅ `tsx` - Already present (v4.19.2)
- ✅ `@modelcontextprotocol/sdk` - Already present (v1.22.0)

**No additional dependencies needed** - sync script uses only:
- Node.js built-in modules (`fs/promises`, `path`)
- `tsx` (already in devDependencies)

### **2. MCP Server Standardization**

All MCP servers need:
- SDK version updated to `^1.22.0`
- `engines.pnpm` added
- `packageManager` field added
- `author` and `license` added (if missing)

---

## 📝 Files Updated

1. ✅ `.mcp/documentation/package.json` - Standardized
2. ✅ `.mcp/component-generator/package.json` - Standardized
3. ✅ `.mcp/a11y/package.json` - Standardized
4. ✅ `.mcp/theme/package.json` - Standardized
5. ✅ `.mcp/filesystem/package.json` - Standardized
6. ✅ `.mcp/ui-generator/package.json` - Standardized
7. ✅ `.mcp/react/package.json` - Standardized
8. ✅ `package.json` (root) - Added `docs:sync` script

---

## ✅ Root Dependencies Summary

### **For Sync Script (`apps/docs/scripts/sync-docs.ts`)**
- ✅ `tsx@^4.19.2` - Already in root `devDependencies`
- ✅ Uses only Node.js built-in modules (`fs/promises`, `path`)
- ✅ **No additional dependencies needed**

### **For MCP Servers**
- ✅ `@modelcontextprotocol/sdk@^1.22.0` - Already in root `devDependencies`
- ✅ `@babel/parser@^7.28.5` - Already in root `devDependencies`
- ✅ `@babel/traverse@^7.28.5` - Already in root `devDependencies`

### **Root Scripts Added**
- ✅ `docs:sync` - Runs `tsx apps/docs/scripts/sync-docs.ts`

---

## 🚀 Implementation Complete

1. ✅ Updated all MCP server package.json files
2. ⚠️ **Next:** Run `pnpm install` to update lockfile
3. ⚠️ **Next:** Verify all servers load successfully

---

**Last Updated:** 2025-11-24  
**Status:** ✅ All package.json files standardized

