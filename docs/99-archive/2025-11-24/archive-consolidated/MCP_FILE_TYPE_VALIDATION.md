# MCP File Type Validation Report

> **Analysis of file types across MCP servers**

---

## Current State

### File Types by MCP Server

| MCP Server | File Type | Location | Status |
|------------|-----------|----------|--------|
| **UI Generator** | `.ts` (TypeScript) | `.mcp/ui-generator/server.ts` | ⚠️ **Inconsistent** |
| **React MCP** | `.mjs` (JavaScript) | `.mcp/react/server.mjs` | ✅ Consistent |
| **Theme MCP** | `.mjs` (JavaScript) | `.mcp/theme/server.mjs` | ✅ Consistent |

---

## Analysis

### UI Generator MCP (`.ts`)

**Current:** `.mcp/ui-generator/server.ts`

**Why TypeScript:**
- Imports `systemPrompt.generated.ts` (TypeScript file)
- Marked as template/example
- Uses TypeScript types for better IDE support

**Issues:**
- ⚠️ Inconsistent with other MCPs (`.mjs`)
- ⚠️ Requires TypeScript compilation or `tsx`/`ts-node`
- ⚠️ Not configured as MCP server in `.cursor/mcp.json`
- ⚠️ Used as library, not MCP server

**Usage:**
- Imported by `apps/web/app/api/generate-ui/route.ts`
- Imported by `scripts/generate-ui-component.ts`
- **NOT** used as standalone MCP server

---

### React MCP (`.mjs`)

**Current:** `.mcp/react/server.mjs`

**Status:** ✅ **Correct**
- Uses `.mjs` (ES modules)
- Can run directly with Node.js
- Configured in `.cursor/mcp.json`
- Follows MCP best practices

---

### Theme MCP (`.mjs`)

**Current:** `.mcp/theme/server.mjs`

**Status:** ✅ **Correct**
- Uses `.mjs` (ES modules)
- Can run directly with Node.js
- Configured in `.cursor/mcp.json`
- Follows MCP best practices

---

## MCP Best Practices

### Recommended File Type: `.mjs` ✅

**Reasons:**
1. **Direct Execution:** Node.js can run `.mjs` directly without compilation
2. **ES Modules:** Native ES module support
3. **Consistency:** All MCP servers should use the same file type
4. **No Build Step:** No need for TypeScript compilation
5. **MCP Standard:** Most MCP servers use JavaScript/ES modules

---

## Recommendation

### Option 1: Convert UI Generator to `.mjs` ✅ **RECOMMENDED**

**Pros:**
- ✅ Consistent with other MCPs
- ✅ Follows MCP best practices
- ✅ No TypeScript compilation needed
- ✅ Can run directly with Node.js

**Cons:**
- ⚠️ Need to handle TypeScript import (`systemPrompt.generated.ts`)
- ⚠️ Lose TypeScript type checking

**Solution:**
- Convert `systemPrompt.generated.ts` → `systemPrompt.generated.mjs`
- Update sync script to generate `.mjs` instead of `.ts`
- Or use dynamic import/read file instead of static import

---

### Option 2: Keep as `.ts` (Current)

**Pros:**
- ✅ TypeScript type checking
- ✅ Better IDE support
- ✅ Can import TypeScript files directly

**Cons:**
- ❌ Inconsistent with other MCPs
- ❌ Requires TypeScript compilation
- ❌ Not following MCP best practices
- ❌ Not configured as MCP server anyway

**Note:** This is acceptable if it's only used as a library, not as an MCP server.

---

## Decision Matrix

| Factor | `.mjs` | `.ts` |
|--------|--------|-------|
| **MCP Best Practices** | ✅ Yes | ❌ No |
| **Consistency** | ✅ Yes | ❌ No |
| **Direct Execution** | ✅ Yes | ❌ No |
| **Type Safety** | ⚠️ Partial | ✅ Yes |
| **IDE Support** | ✅ Good | ✅ Excellent |

---

## Final Recommendation

### ✅ **Convert UI Generator to `.mjs`**

**Reasoning:**
1. **Consistency:** All MCP servers should use `.mjs`
2. **MCP Best Practices:** `.mjs` is the standard for MCP servers
3. **No Build Step:** Can run directly with Node.js
4. **Current Usage:** Not configured as MCP server anyway (used as library)

**Action Items:**
1. Convert `server.ts` → `server.mjs`
2. Update `systemPrompt.generated.ts` → `systemPrompt.generated.mjs`
3. Update sync script to generate `.mjs`
4. Update imports in `apps/web/app/api/generate-ui/route.ts`
5. Update imports in `scripts/generate-ui-component.ts`

---

## Alternative: Keep as Library

If UI Generator is **only used as a library** (not as MCP server):
- ✅ Keep as `.ts` is acceptable
- ⚠️ But should be moved to `packages/` or `lib/` instead of `.mcp/`
- ⚠️ `.mcp/` should only contain actual MCP servers

---

**Status:** ⚠️ **INCONSISTENCY FOUND**  
**Recommendation:** Convert UI Generator to `.mjs` for consistency

