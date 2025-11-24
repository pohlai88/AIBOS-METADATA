# MCP Secrets Configuration - Best Practices

> **Date:** 2025-11-24  
> **Purpose:** Document the correct method to configure secrets in MCP servers

---

## ⚠️ **CRITICAL: Never Commit Secrets to mcp.json**

**DO NOT** hardcode API keys or secrets directly in `.cursor/mcp.json` because:
- ❌ `.cursor/mcp.json` is committed to git
- ❌ Secrets will be exposed in the repository
- ❌ GitHub push protection will block the commit

---

## ✅ **Correct Method: Environment Variable Inheritance**

### **Recommended: Environment Variable Inheritance**

MCP servers automatically inherit environment variables from the parent process (Cursor). You don't need to configure them in `mcp.json`.

**Configuration:**

```json
{
  "mcpServers": {
    "aibos-ui-generator": {
      "command": "node",
      "args": [".mcp/ui-generator/server.mjs"]
      // NO env field needed - inherits from system
    }
  }
}
```

**Setup:**

1. **Keep secret in `.env` file (gitignored):**
   ```
   OPENAI_API_KEY=sk-...
   ```

2. **Cursor automatically loads `.env` files:**
   - Cursor reads `.env` files in the workspace root
   - Environment variables are passed to MCP servers automatically
   - No additional configuration needed

3. **MCP server reads from `process.env`:**
   ```javascript
   // .mcp/ui-generator/server.mjs
   const openai = createOpenAI({
     apiKey: process.env.OPENAI_API_KEY, // Inherits from parent process
   });
   ```

**Benefits:**
- ✅ No secrets in git
- ✅ Works automatically
- ✅ Secure by default
- ✅ Easy to manage

---

## 🔄 **Alternative: Environment Variable Reference**

If your MCP client supports environment variable references, you can use:

```json
{
  "mcpServers": {
    "aibos-ui-generator": {
      "command": "node",
      "args": [".mcp/ui-generator/server.mjs"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"  // Reference, not value
      }
    }
  }
}
```

**Note:** 
- This syntax may not be supported by all MCP clients
- Cursor MCP may not support `${VAR}` syntax
- **Recommended:** Use environment inheritance instead (no `env` field)

---

## 🔍 **How to Verify Current Configuration**

### **Check if mcp.json contains secrets:**

```bash
# Check for API keys in mcp.json
cat .cursor/mcp.json | grep -i "sk-"
```

**If you see API keys:** ❌ **REMOVE THEM IMMEDIATELY**

### **Verify environment variable is set:**

```bash
# Windows PowerShell
echo $env:OPENAI_API_KEY

# Linux/Mac
echo $OPENAI_API_KEY
```

### **Test MCP server:**

```bash
# Set environment variable
$env:OPENAI_API_KEY = "sk-..."  # Windows
export OPENAI_API_KEY="sk-..."   # Linux/Mac

# Test server
node .mcp/ui-generator/server.mjs
```

---

## 📋 **Recommended Setup for AI-BOS Platform**

### **Step 1: Keep .env file (gitignored)**

```bash
# .env (in workspace root)
OPENAI_API_KEY=sk-...
```

**Verify `.env` is in `.gitignore`:**
```bash
cat .gitignore | grep "\.env"
```

### **Step 2: Configure mcp.json WITHOUT secrets**

```json
{
  "mcpServers": {
    "aibos-ui-generator": {
      "command": "node",
      "args": [".mcp/ui-generator/server.mjs"]
      // No env field - inherits from Cursor's environment
    }
  }
}
```

### **Step 3: Ensure Cursor loads .env**

Cursor automatically loads `.env` files from the workspace root. Verify:
- `.env` file exists in workspace root
- File is readable
- Format is correct: `OPENAI_API_KEY=sk-...`

### **Step 4: Verify server reads from environment**

The server code should read from `process.env`:

```javascript
// .mcp/ui-generator/server.mjs
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ Reads from environment
});
```

---

## 🔧 **Automated Configuration Script**

Use the provided script to configure secrets correctly:

```bash
node .mcp/scripts/configure-secrets.mjs
```

This script:
- ✅ Reads `OPENAI_API_KEY` from `.env`
- ✅ Updates `mcp.json` to use environment inheritance
- ✅ Verifies no secrets are hardcoded
- ✅ Provides configuration summary

---

## 🔒 **Security Checklist**

- [ ] `.env` file is in `.gitignore`
- [ ] No secrets in `mcp.json`
- [ ] No secrets in any committed files
- [ ] Environment variables are set before starting Cursor
- [ ] MCP server reads from `process.env`, not hardcoded values
- [ ] Secrets are rotated regularly
- [ ] Different keys for dev/staging/prod

---

## 🚨 **If You Accidentally Committed Secrets**

1. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .cursor/mcp.json" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Or use BFG Repo Cleaner:**
   ```bash
   bfg --replace-text secrets.txt
   ```

3. **Force push (coordinate with team):**
   ```bash
   git push --force --all
   ```

4. **Rotate the exposed secret immediately**

---

## 📝 **Example: Correct Configuration**

### **`.env` (gitignored):**
```
OPENAI_API_KEY=sk-proj-abc123...
```

### **`.cursor/mcp.json` (committed):**
```json
{
  "mcpServers": {
    "aibos-ui-generator": {
      "command": "node",
      "args": [".mcp/ui-generator/server.mjs"]
    }
  }
}
```

### **`.mcp/ui-generator/server.mjs`:**
```javascript
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ From environment
});
```

---

## ✅ **Summary**

**The correct method:**
1. ✅ Keep secrets in `.env` (gitignored)
2. ✅ Don't put secrets in `mcp.json`
3. ✅ Don't use `env` field in `mcp.json` (rely on inheritance)
4. ✅ Let MCP servers read from `process.env`
5. ✅ Cursor automatically passes environment to MCP servers

**This ensures:**
- ✅ No secrets in git
- ✅ Secure by default
- ✅ Easy to manage
- ✅ Works across different environments

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS MCP Team
