# MCP Enforcer - Sharing Guide

> **Status:** ✅ Ready to Share

---

## 📦 What's Included

This MCP Enforcer tool is ready to be shared and can be used by anyone to validate MCP servers against the enforcement configuration.

### Files Included

- ✅ `index.mjs` - Main validation script
- ✅ `package.json` - Dependencies and metadata
- ✅ `README.md` - Complete documentation
- ✅ `.gitignore` - Local file exclusions

### Files Excluded (via .gitignore)

- ❌ `node_modules/` - Dependencies (install with `pnpm install`)
- ❌ `*.log` - Log files
- ❌ `.cache/` - Cache directories

---

## 🚀 Quick Start for New Users

1. **Clone the repository** (or copy the `.mcp/mcp-enforcer/` directory)

2. **Install dependencies:**
   ```bash
   cd .mcp/mcp-enforcer
   pnpm install
   ```

3. **Run validation:**
   ```bash
   # Validate all servers
   node index.mjs

   # Validate specific server
   node index.mjs accounting-knowledge

   # Strict mode
   node index.mjs --strict
   ```

---

## 📋 Requirements

- Node.js 18+
- pnpm 8+
- Access to `.cursor/mcp-enforcement.yaml` (enforcement configuration)
- Access to `.cursor/mcp.json` (MCP server configuration)

---

## 🔧 Configuration

The enforcer reads from:
- `.cursor/mcp-enforcement.yaml` - Enforcement rules
- `.cursor/mcp.json` - MCP server registry
- `.mcp/*/` - MCP server directories

All paths are relative to the workspace root.

---

## 📝 License

MIT - Free to use and modify

---

## 🤝 Contributing

To improve the enforcer:
1. Update validation logic in `index.mjs`
2. Update documentation in `README.md`
3. Test with: `node index.mjs --strict`
4. Submit changes

---

**Status:** ✅ **Ready to Share**

