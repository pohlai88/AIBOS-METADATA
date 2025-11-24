# 📦 Monorepo Compliance - Documentation MCP Server

> **Package Manager:** `pnpm@8.15.0`  
> **Status:** ✅ Compliant  
> **Date:** 2025-11-24

---

## ✅ Compliance Checklist

### **Package Manager** ✅
- ✅ Uses `pnpm` (not npm)
- ✅ SDK version matches other MCP servers: `^1.22.0`
- ✅ `packageManager` field specified: `pnpm@8.15.0`
- ✅ `engines.pnpm` specified: `>=8.0.0`

### **Dependencies** ✅
- ✅ Dependencies installed via pnpm workspace
- ✅ No `package-lock.json` (npm artifact removed)
- ✅ No local `node_modules` (uses workspace root)
- ✅ SDK version aligned: `@modelcontextprotocol/sdk@^1.22.0`

### **Workspace Integration** ✅
- ✅ Works with pnpm workspace structure
- ✅ Dependencies hoisted to workspace root
- ✅ Server loads successfully
- ✅ Compatible with monorepo tooling

---

## 🔧 Installation

### **From Workspace Root** (Recommended)
```bash
# Install all workspace dependencies
pnpm install
```

This installs dependencies for all workspace packages, including MCP servers.

### **From MCP Directory**
```bash
cd .mcp/documentation
pnpm install
```

Dependencies will be hoisted to workspace root (`node_modules/`).

---

## 📋 Package Configuration

### **package.json**
```json
{
  "name": "@aibos/documentation-mcp",
  "version": "2.0.0",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.22.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

### **Key Points**
- **SDK Version:** `^1.22.0` (matches other MCP servers)
- **Package Manager:** `pnpm@8.15.0` (matches root)
- **Node Version:** `>=18.0.0` (matches root)

---

## 🔍 Verification

### **Check Package Manager**
```bash
# Verify pnpm version
pnpm --version

# Should match: 8.15.0 (or compatible)
```

### **Check Dependencies**
```bash
# Verify SDK is installed
pnpm list @modelcontextprotocol/sdk

# Should show: @modelcontextprotocol/sdk@1.22.0
```

### **Test Server**
```bash
cd .mcp/documentation
node -e "import('./server.mjs').then(() => console.log('✅ Server loads')).catch(e => console.error('❌', e))"
```

---

## 🚫 What NOT to Do

### **❌ Don't Use npm**
```bash
# ❌ WRONG - Don't use npm
npm install

# ✅ CORRECT - Use pnpm
pnpm install
```

### **❌ Don't Create package-lock.json**
- npm creates `package-lock.json`
- pnpm uses `pnpm-lock.yaml` (at workspace root)
- Remove any `package-lock.json` files if found

### **❌ Don't Use Different SDK Versions**
- All MCP servers should use `^1.22.0`
- Don't use older versions like `^1.0.4`

---

## 📊 Comparison with Other MCP Servers

| MCP Server | SDK Version | Package Manager | Status |
|------------|------------|-----------------|--------|
| documentation | `^1.22.0` | `pnpm@8.15.0` | ✅ Compliant |
| theme | `^1.0.0` | pnpm | ⚠️ Should update |
| filesystem | `^1.0.0` | pnpm | ⚠️ Should update |
| component-generator | `^1.22.0` | pnpm | ✅ Compliant |
| a11y | `^1.22.0` | pnpm | ✅ Compliant |

**Note:** Some MCP servers still use `^1.0.0`. Consider updating them to `^1.22.0` for consistency.

---

## ✅ Status

**Compliance:** ✅ **FULLY COMPLIANT**

- ✅ Uses pnpm (not npm)
- ✅ SDK version matches workspace standard
- ✅ No npm artifacts
- ✅ Works with workspace structure
- ✅ Server loads and runs successfully

---

**Last Updated:** 2025-11-24  
**Verified By:** Automated Compliance Check

