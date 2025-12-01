# MCP Enforcer

> **Version:** 1.0.0  
> **Purpose:** CLI tool to enforce AIBOS MCP server standards from `.cursor/mcp-enforcement.yaml`

---

## Overview

The MCP Enforcer validates all MCP servers in `.mcp/` against the rules defined in `.cursor/mcp-enforcement.yaml`. It ensures:

- ✅ Package.json structure matches requirements
- ✅ Server implementation follows standards
- ✅ Tools have proper validation
- ✅ SQL queries are parameterized
- ✅ Error handling is implemented
- ✅ Documentation is complete
- ✅ MCP config entries are correct

---

## Installation

```bash
cd tools/mcp-enforcer
pnpm install
```

---

## Usage

### Build

```bash
pnpm build
```

### Validate All Servers

```bash
pnpm start
# or
pnpm dev
```

### Validate Specific Server

```bash
pnpm dev -- --server accounting-knowledge
pnpm start -- --server accounting-knowledge
```

### Check (Build + Run)

```bash
pnpm check
```

---

## What It Checks

### Package.json
- Required fields (name, version, description, etc.)
- Name pattern: `^@aibos/mcp-[a-z0-9-]+$`
- Version pattern: `^\d+\.\d+\.\d+$`
- Required dependencies (`@modelcontextprotocol/sdk`, `zod`)
- Engines and package manager

### Server Implementation
- Required imports from MCP SDK
- Server class and transport usage
- Server name pattern: `^aibos-[a-z0-9-]+$`
- Required handlers (`ListToolsRequestSchema`, `CallToolRequestSchema`)
- Try/catch blocks
- `isError` flag usage

### Security
- SQL parameterization (no string concatenation)
- Input validation with Zod

### Documentation
- README.md presence
- Required sections (Overview, Prerequisites, Installation, etc.)

---

## Exit Codes

- `0` - All checks passed
- `1` - Errors found (or warnings in strict mode)

---

## Integration with CI

Add to your root `package.json`:

```json
{
  "scripts": {
    "check:mcp": "pnpm -C tools/mcp-enforcer check"
  }
}
```

Then in CI:

```yaml
# .github/workflows/mcp-validation.yml
name: MCP Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8.15.0
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm check:mcp
```

---

## Configuration

The enforcer reads from:
- `.cursor/mcp-enforcement.yaml` - Enforcement rules
- `.mcp/*/` - MCP server directories

All paths are relative to the workspace root.

---

## License

MIT

