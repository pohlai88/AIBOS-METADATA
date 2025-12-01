# MCP Enforcer

> **Version:** 1.0.0  
> **Purpose:** Automated validation tool for MCP servers against the enforcement configuration

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
cd .mcp/mcp-enforcer
pnpm install
```

---

## Usage

### Validate All Servers

```bash
node index.mjs
```

### Validate Specific Server

```bash
node index.mjs accounting-knowledge
```

### Strict Mode (Fail on Warnings)

```bash
node index.mjs --strict
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

### MCP Configuration
- Server entry in `.cursor/mcp.json`
- Name pattern matching
- Command and args format

---

## Exit Codes

- `0` - All checks passed
- `1` - Errors found (or warnings in strict mode)

---

## Integration with CI

Add to your CI pipeline:

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
      - run: cd .mcp/mcp-enforcer && pnpm install
      - run: cd .mcp/mcp-enforcer && node index.mjs --strict
```

---

## License

MIT

