# MCP Server Structure Explanation

## Overview

This document defines mcp server structure explanation.

---


> **Understanding Server vs Tools in MCP Architecture**

## Current Structure: Server + Tools Together ✅

**Yes, you're correct!** The `server.mjs` file contains **both the server setup AND the tools together**.

### Example: `.mcp/a11y/server.mjs`

The file contains:

1. **Server Setup** (Lines 1-37)
   ```javascript
   const server = new Server({...});
   const transport = new StdioServerTransport();
   await server.connect(transport);
   ```

2. **Utility Functions** (Lines 39-615)
   - Governance metadata helpers
   - AST caching
   - Color parsing functions
   - Contrast calculation
   - Validation logic

3. **Tool Implementation Functions** (Lines 200-615)
   - `validateComponent()` - The actual validation logic
   - `checkContrast()` - The actual contrast checking logic

4. **MCP Tool Handlers** (Lines 660-773)
   - `ListToolsRequestSchema` - Lists available tools
   - `CallToolRequestSchema` - Routes tool calls to implementation functions

## Structure Breakdown

```
.mcp/a11y/server.mjs
├── Server Setup (MCP SDK initialization)
├── Governance Metadata (registryContext)
├── Utility Functions (helpers, caching)
├── Tool Implementation Functions (the actual work)
└── MCP Tool Handlers (the interface)
```

## When to Separate Tools?

### ✅ Current Approach: Everything in `server.mjs` (Recommended for Most Cases)

**Good for:**
- Small to medium servers (< 1000 lines)
- Tools that are tightly coupled to the server
- Simple utility functions
- Single-purpose servers

**Example:** `.mcp/a11y/server.mjs` (773 lines) - Perfect as-is

### ⚠️ Optional: Separate Tools into `tools/` Subdirectory

**Consider separating when:**
- Server file exceeds 1500+ lines
- Tools are complex enough to be their own modules
- Multiple tools that could be reused
- Tools need separate testing

**Example Structure:**
```
.mcp/a11y/
├── server.mjs              # Server setup + tool handlers
├── tools/
│   ├── validator.mjs       # validateComponent implementation
│   ├── contrast.mjs        # checkContrast implementation
│   └── utils.mjs           # Shared utilities
└── README.md
```

## Current Architecture Decision

**All servers currently use the "everything in server.mjs" approach:**

| Server | Lines | Structure | Status |
|--------|-------|-----------|--------|
| a11y | 773 | server.mjs only | ✅ Good |
| react | 1146 | server.mjs only | ✅ Good |
| theme | 503 | server.mjs only | ✅ Good |
| ui-generator | 234 | server.mjs only | ✅ Good |
| component-generator | 1574 | server.mjs only | ⚠️ Could separate |

## Recommendation

### For Most Servers: Keep Everything in `server.mjs` ✅

**Reasons:**
1. **Simplicity** - One file to maintain
2. **Clarity** - All related code in one place
3. **Performance** - No import overhead
4. **Easier to understand** - Server + tools = complete picture

### When to Separate:

Only separate if:
- File exceeds 2000+ lines
- Tools are complex enough to warrant modules
- Tools need to be shared across servers
- Tools need separate unit testing

## Example: If We Separated a11y Tools

**Current (Everything in server.mjs):**
```javascript
// .mcp/a11y/server.mjs
const server = new Server({...});
// ... utilities ...
async function validateComponent(...) { /* 400 lines */ }
async function checkContrast(...) { /* 50 lines */ }
// ... handlers ...
```

**If Separated:**
```javascript
// .mcp/a11y/server.mjs
import { validateComponent } from './tools/validator.mjs';
import { checkContrast } from './tools/contrast.mjs';

const server = new Server({...});
// ... handlers that call imported tools ...
```

**But this adds complexity without much benefit for a 773-line file.**

## Summary

✅ **Current structure is correct:**
- `server.mjs` = Server setup + Tools together
- This is the **recommended approach** for most MCP servers
- Only separate if file becomes very large (>2000 lines) or tools need to be shared

✅ **Your understanding is correct:**
- Yes, `server.mjs` contains both server AND tools
- This is intentional and follows MCP best practices
- The architecture document shows `tools/` as **optional**, not required

## Related Files

- [MCP Architecture](./ARCHITECTURE.md) - Complete architecture guide
- [a11y Server](../a11y/server.mjs) - Example of current structure
- [React Server](../react/server.mjs) - Another example

