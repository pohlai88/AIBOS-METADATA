# .cursor Directory Validation Report

## 📋 Files Found

1. **`.cursor/mcp.json`** ✅ **VALID** - Main MCP configuration
2. **`.cursor/.cursor-prompt-guardrail.md`** ✅ **VALID** - Cursor guardrail rules

## ⚠️ Issues Identified

### 1. **DUPLICATE MCP SERVER** ❌

**Problem:** Two MCP servers point to the same server file:
- `tailwind-tokens` → `.mcp/theme/server.mjs`
- `aibos-theme` → `.mcp/theme/server.mjs`

**Impact:** 
- Redundant configuration
- Confusion about which server name to use
- Both servers provide the same functionality

**Recommendation:** Remove `tailwind-tokens` and keep only `aibos-theme` for consistency.

### 2. **Next.js MCP Configuration** ⚠️

**Current:** `next-devtools` uses `npx next-devtools-mcp@latest`

**Status:** ✅ Correctly configured for Next.js 16

**Note:** Next.js MCP requires:
- Next.js 16+ (you have this ✅)
- Dev server running on port 3000 (default)
- MCP endpoint at `/_next/mcp` (automatic in Next.js 16+)

## ✅ Valid Files

### `.cursor/mcp.json`
- **Status:** ✅ Valid
- **Purpose:** MCP server configuration for Cursor
- **Location:** ✅ Correct (`.cursor/` is the standard location)
- **Content:** Contains all MCP servers (with one duplicate)

### `.cursor/.cursor-prompt-guardrail.md`
- **Status:** ✅ Valid
- **Purpose:** Cursor guardrail rules for AI-BOS design system
- **Location:** ✅ Correct (Cursor reads this automatically)
- **Content:** Design system rules and token usage guidelines

## 🔧 Recommended Actions

1. **Remove duplicate `tailwind-tokens`** from `.cursor/mcp.json`
2. **Update `packages/mcp-client/index.ts`** to remove `tailwind` reference
3. **Document Next.js MCP usage** in README

## 📝 Next.js MCP Help

### How Next.js MCP Works

Next.js 16+ automatically exposes an MCP endpoint at `/_next/mcp` when the dev server is running.

**Available Tools:**
- `nextjs_runtime` - Query runtime information
- `nextjs_docs` - Search Next.js documentation
- `nextjs_runtime_discover_servers` - Find running Next.js servers

**Usage in Cursor:**
The `next-devtools` MCP server is already configured. It will automatically:
- Connect to your Next.js dev server
- Provide runtime diagnostics
- Enable documentation search
- Provide build diagnostics

**To use:**
1. Start your dev server: `pnpm dev`
2. The MCP server will automatically connect
3. Use tools like `nextjs_runtime` in Cursor chat

