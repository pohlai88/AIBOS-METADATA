# AI-BOS Documentation MCP Server

> **Documentation Automation Server**  
> **Version:** 1.0.0  
> **Status:** ✅ Active

---

## 🎯 Purpose

The Documentation MCP Server automates documentation generation, validation, and maintenance for the AI-BOS platform, following the documentation manifest (`docs/ui-docs.manifest.json`).

---

## 🛠️ Available Tools

### 1. `validate_docs`
Validates documentation structure, templates, links, and manifest compliance.

**Usage:**
```json
{
  "checkLinks": true,
  "checkTemplates": true,
  "checkStructure": true,
  "checkManifest": true
}
```

---

### 2. `update_token_reference`
Auto-generates token reference documentation from `globals.css`.

**Usage:**
```json
{
  "sourcePath": "packages/ui/src/design/globals.css",
  "outputPath": "docs/09-reference/tokens/auto/tokens-reference.md"
}
```

**Output:** Complete token reference in `docs/09-reference/tokens/auto/`

---

### 3. `sync_nextra`
Triggers Nextra documentation sync (runs `apps/docs/scripts/sync-docs.ts`).

**Usage:**
```json
{
  "force": false
}
```

**Note:** This syncs `docs/` to `apps/docs/pages/` for Nextra to build the site.

---

### 4. `generate_from_template`
Generates documentation from a template defined in `ui-docs.manifest.json`.

**Usage:**
```json
{
  "template": "erp-module",
  "outputPath": "docs/03-modules/new-module/overview.md",
  "data": {
    "moduleName": "New Module",
    "description": "..."
  }
}
```

---

## 📋 Rules

### 09-reference/ Rules
- ✅ **MCP-only writes:** Humans do NOT edit files in `09-reference/auto/`
- ✅ **Overwrite policy:** MCP tools can overwrite existing files
- ✅ **Validation required:** All generated content must validate

### Manifest Compliance
- ✅ All tools respect `mcpAutoGenerate` flags
- ✅ All tools follow section rules
- ✅ All tools validate against manifest structure

---

## 🔗 Integration

### Nextra
- Syncs via `apps/docs/scripts/sync-docs.ts`
- Triggered by `sync_nextra` tool
- Updates `apps/docs/pages/` for Nextra build

### Existing MCP Servers
- **Theme MCP:** Used for token validation
- **React MCP:** Used for component validation
- **Filesystem MCP:** Used for file operations

---

## 🚀 Setup

### Installation

**Note:** This monorepo uses `pnpm` as the package manager. Dependencies are installed at the workspace root.

```bash
# Install all workspace dependencies (including MCP servers)
pnpm install

# Or install from root (dependencies will be hoisted to workspace root)
cd .mcp/documentation
pnpm install
```

**Package Manager:** `pnpm@8.15.0` (as specified in root `package.json`)

### Configuration
Add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "aibos-documentation": {
      "command": "node",
      "args": [".mcp/documentation/server.mjs"],
      "cwd": "."
    }
  }
}
```

---

## 📊 Status

**Current Version:** 2.0.0  
**Status:** ✅ Active  
**Tools Implemented:** 4/8 (Core tools)

**Planned Tools:**
- `generate_component_docs` (Phase 2)
- `sync_figma_docs` (Phase 3)
- `db_introspect` (Phase 3)
- `api_introspect` (Phase 3)

---

## 📚 Related Documentation

- [Documentation Manifest](../../docs/ui-docs.manifest.json)
- [Documentation Structure](../../docs/07-mcp/servers/structure-explanation.md)
- [MCP Architecture](../../docs/07-mcp/overview/mcp-architecture.md)

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS MCP Team

