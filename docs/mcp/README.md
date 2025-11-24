# MCP Documentation

> **Model Context Protocol (MCP) documentation and guides**

---

## Overview

This directory contains documentation for all MCP (Model Context Protocol) servers used in the AIBOS platform.

---

## Documentation Structure

### Active Guides

- **`MCP_INTEGRATION_GUIDE.md`** - Complete guide for using React, Next.js, Figma, and Tailwind MCPs together

### Archived Documentation

Historical and validation reports are archived in `docs/archive/`:

- MCP configuration updates
- Validation reports
- Setup completion reports
- Upgrade summaries

---

## MCP Servers

### Custom AIBOS MCP Servers

All custom MCP servers are located in `.mcp/` directory:

1. **`aibos-filesystem`** - `.mcp/filesystem/server.mjs`
   - Optimized filesystem access
   - Controlled allowedPaths
   - See `.mcp/filesystem/README.md`

2. **`react-validation`** - `.mcp/react/server.mjs`
   - React component validation
   - RSC boundary checking
   - See `.mcp/react/README.md`

3. **`aibos-theme`** - `.mcp/theme/server.mjs`
   - Theme token management
   - Tailwind class validation
   - See `.mcp/theme/README.md`

4. **`ui-generator`** - `.mcp/ui-generator/server.mjs`
   - AI-driven component generation
   - Design system governance
   - See `.mcp/ui-generator/README.md`

### External MCP Servers

Configured in `.cursor/mcp.json`:

- `next-devtools` - Next.js MCP (built-in)
- `supabase` - Supabase MCP
- `github` - GitHub MCP
- `git` - Git MCP
- `shell` - Shell MCP
- `playwright` - Playwright MCP

---

## Configuration

MCP servers are configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aibos-filesystem": {
      "command": "node",
      "args": [".mcp/filesystem/server.mjs"]
    },
    "react-validation": {
      "command": "node",
      "args": [".mcp/react/server.mjs"]
    },
    "aibos-theme": {
      "command": "node",
      "args": [".mcp/theme/server.mjs"]
    }
  }
}
```

---

## Unified Format

All AIBOS MCP servers follow a unified format:

- ✅ All use `node` command
- ✅ All use `.mcp/*/server.mjs` pattern
- ✅ All have `package.json` and `README.md`
- ✅ Consistent structure and configuration

---

**Last Updated:** 2024

