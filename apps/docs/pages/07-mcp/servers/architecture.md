# MCP Server Architecture

> **Directory Structure & Organization Guidelines**

## ✅ Correct Architecture Principles

### 1. Tools Location

**✅ CORRECT:** All tools used by MCP servers should stay within the `.mcp` directory.

```
.mcp/
├── [server-name]/
│   ├── server.mjs          # MCP server implementation
│   ├── README.md           # Server documentation
│   ├── package.json        # Server dependencies
│   ├── tools/              # Server-specific tools (if any)
│   │   └── [tool-name].mjs
│   └── [server-specific-files]
└── [shared-tools]/         # General/shared tools (if any)
    └── [shared-tool].mjs
```

### 2. Server-Specific Tools

**✅ CORRECT:** Each MCP server should have its own tools in its subdirectory.

**Example Structure:**
```
.mcp/
├── react/
│   ├── server.mjs
│   ├── tools/              # React-specific tools
│   │   ├── ast-utils.mjs
│   │   └── rsc-detector.mjs
│   └── README.md
├── theme/
│   ├── server.mjs
│   ├── tools/              # Theme-specific tools
│   │   ├── css-parser.mjs
│   │   └── token-validator.mjs
│   └── README.md
└── ui-generator/
    ├── server.mjs
    ├── prompt.md           # System prompt (source)
    ├── prompt.generated.mjs # Generated prompt (auto)
    ├── tools/              # UI generator-specific tools
    │   └── code-formatter.mjs
    └── README.md
```

### 3. General/Shared Tools

**✅ CORRECT:** General tools (if any) stay in the root of `.mcp` directory.

**Example:**
```
.mcp/
├── shared/
│   ├── logger.mjs          # Shared logging utility
│   ├── cache.mjs           # Shared caching utility
│   └── governance.mjs      # Shared governance helpers
└── [server-directories]/
```

**Note:** Currently, there are **no general tools** needed. Each server is self-contained.

### 4. System Prompt Format

**✅ RECOMMENDED:** Markdown (`.md`) for source, generated JavaScript (`.mjs`) for runtime.

**Current Issue:**
- ❌ Source is in `tools/MCP_SYSTEM_PROMPT.md` (wrong location)
- ✅ Generated file is in `.mcp/ui-generator/systemPrompt.generated.mjs` (correct location)

**Recommended Structure:**
```
.mcp/
└── ui-generator/
    ├── prompt.md                    # Source (Markdown) - EDIT THIS
    ├── prompt.generated.mjs         # Generated (JavaScript) - AUTO-GENERATED
    └── server.mjs                   # Uses prompt.generated.mjs
```

**Format Rationale:**
- **Source (`.md`)**: Markdown is perfect for:
  - Human-readable documentation
  - Easy editing with formatting
  - Version control friendly
  - Supports code blocks, lists, tables
  
- **Generated (`.mjs`)**: JavaScript module for:
  - Direct import in server.mjs
  - No parsing needed at runtime
  - Fast execution
  - Type-safe exports

---

## Current State vs Recommended State

### Current Structure (✅ Partially Migrated)

```
tools/
├── mcp-react-validation.mjs      # ❌ Legacy, use .mcp/react/server.mjs
├── mcp-component-generator.mjs   # ❌ Legacy, needs upgrade
└── mcp-a11y-validation.mjs       # ❌ Should migrate to .mcp/a11y/

.mcp/
├── ARCHITECTURE.md               # ✅ Architecture guidelines
├── react/
│   └── server.mjs                # ✅ Production
├── theme/
│   └── server.mjs                # ✅ Production
└── ui-generator/
    ├── server.mjs                # ✅ Production
    ├── prompt.md                 # ✅ Source prompt (migrated from tools/)
    └── prompt.generated.mjs      # ✅ Generated (after sync)
```

### Target Structure (✅ Goal)

```
.mcp/
├── react/
│   ├── server.mjs
│   ├── README.md
│   ├── package.json
│   └── tools/                     # React-specific utilities (if needed)
│       └── [utilities].mjs
│
├── theme/
│   ├── server.mjs
│   ├── README.md
│   ├── package.json
│   └── tools/                     # Theme-specific utilities (if needed)
│       └── [utilities].mjs
│
├── ui-generator/
│   ├── server.mjs
│   ├── README.md
│   ├── package.json
│   ├── prompt.md                  # ✅ Source prompt (moved from tools/)
│   ├── prompt.generated.mjs        # ✅ Generated (auto)
│   └── tools/                     # UI generator utilities (if needed)
│       └── [utilities].mjs
│
├── a11y/                           # ✅ New (migrated from tools/)
│   ├── server.mjs
│   ├── README.md
│   ├── package.json
│   └── tools/                      # A11y-specific utilities
│       └── [utilities].mjs
│
└── component-generator/            # ✅ New (upgraded from tools/)
    ├── server.mjs
    ├── README.md
    ├── package.json
    ├── constitution/               # Constitution files (if needed)
    └── tools/                      # Generator utilities
        └── [utilities].mjs

tools/                              # ✅ Cleaned up
└── [legacy-archive]/               # Deprecated tools (archived)
```

---

## Migration Plan

### Phase 1: System Prompt Migration ✅ COMPLETED

**Action:** Move `tools/MCP_SYSTEM_PROMPT.md` → `.mcp/ui-generator/prompt.md`

**Steps Completed:**
1. ✅ Moved file: `tools/MCP_SYSTEM_PROMPT.md` → `.mcp/ui-generator/prompt.md`
2. ✅ Updated sync script: `scripts/sync-mcp-prompt.ts`
   - Source path: `.mcp/ui-generator/prompt.md`
   - Output: `.mcp/ui-generator/prompt.generated.mjs`
3. ✅ Updated server import: `.mcp/ui-generator/server.mjs`
   - Import path: `./prompt.generated.mjs`
4. ✅ Updated documentation: README references updated
5. ⏳ Run sync: `pnpm sync-mcp-prompt` (to generate new file)

**Benefits Achieved:**
- ✅ Prompt lives with the server that uses it
- ✅ Clear ownership and location
- ✅ Follows architecture principle #2

### Phase 2: Legacy Tools Cleanup

**Actions:**
1. **Deprecate `tools/mcp-react-validation.mjs`**
   - Add deprecation notice
   - Archive to `tools/archive/`
   - Update all references to `.mcp/react/server.mjs`

2. **Migrate `tools/mcp-a11y-validation.mjs`**
   - Create `.mcp/a11y/` directory
   - Migrate with new MCP pattern
   - Add governance metadata
   - Create README.md

3. **Upgrade `tools/mcp-component-generator.mjs`**
   - Create `.mcp/component-generator/` directory
   - Upgrade to new MCP pattern
   - Add governance metadata
   - Keep constitution validation logic

### Phase 3: Tools Organization

**If server-specific utilities are needed:**

```
.mcp/
└── [server-name]/
    ├── server.mjs
    ├── tools/              # Server-specific utilities
    │   ├── helper1.mjs
    │   └── helper2.mjs
    └── README.md
```

**If shared utilities are needed:**

```
.mcp/
├── shared/                 # General/shared utilities
│   ├── logger.mjs
│   └── cache.mjs
└── [server-directories]/
```

**Current Status:** No shared utilities needed yet. Each server is self-contained.

---

## File Naming Conventions

### MCP Servers
- **Server file**: `server.mjs` (consistent across all servers)
- **Documentation**: `README.md`
- **Dependencies**: `package.json`

### System Prompts
- **Source**: `prompt.md` (Markdown, human-editable)
- **Generated**: `prompt.generated.mjs` (JavaScript, auto-generated)
- **Sync script**: `scripts/sync-mcp-prompt.ts`

### Tools/Utilities
- **Naming**: `[purpose].mjs` (e.g., `ast-utils.mjs`, `css-parser.mjs`)
- **Location**: `.mcp/[server-name]/tools/` (server-specific)
- **Location**: `.mcp/shared/` (general/shared)

---

## Verification Checklist

### Architecture Compliance
- [ ] All MCP servers in `.mcp/` directory
- [ ] Each server has its own subdirectory
- [ ] Server-specific tools in `[server]/tools/` (if any)
- [ ] General tools in `.mcp/shared/` (if any)
- [ ] System prompts in server directories (not in `tools/`)
- [ ] No legacy tools in `tools/` directory

### File Organization
- [ ] Each server has `server.mjs`
- [ ] Each server has `README.md`
- [ ] Each server has `package.json`
- [ ] Generated files marked with `.generated.` prefix
- [ ] Source files are human-editable formats (`.md`, `.mjs`)

### Documentation
- [ ] Each server has comprehensive README
- [ ] Architecture documented in `.mcp/ARCHITECTURE.md`
- [ ] Migration guides available
- [ ] No references to old `tools/` locations

---

## Summary

### ✅ Your Understanding is 100% Correct

1. ✅ **Tools in `.mcp` directory** - Correct
2. ✅ **Each server has own tools in subdirectory** - Correct
3. ✅ **General tools in `.mcp` root** - Correct (currently none needed)
4. ✅ **System prompt format** - Markdown (`.md`) for source is correct

### 🎯 Recommended Actions

1. **Move system prompt**: `tools/MCP_SYSTEM_PROMPT.md` → `.mcp/ui-generator/prompt.md`
2. **Update sync script**: Point to new location
3. **Clean up legacy tools**: Archive or migrate to `.mcp/`
4. **Document structure**: This file serves as the architecture guide

---

## Related Documentation

- [Synchronization Recommendations](../tools/SYNCHRONIZATION_RECOMMENDATIONS.md)
- [React MCP README](./react/README.md)
- [Theme MCP README](./theme/README.md)
- [UI Generator MCP README](./ui-generator/README.md)

