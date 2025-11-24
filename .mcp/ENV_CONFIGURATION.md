# MCP Environment Variables Configuration

> **Date:** 2025-11-24  
> **Purpose:** Document environment variable configuration for MCP servers

---

## 🔐 OpenAI API Key Configuration

### **Server:** `aibos-ui-generator`

The `aibos-ui-generator` MCP server requires an OpenAI API key to generate UI components from natural language prompts.

### **Configuration Method**

The API key is configured in `.cursor/mcp.json` via the `env` field:

```json
{
  "mcpServers": {
    "aibos-ui-generator": {
      "command": "node",
      "args": [".mcp/ui-generator/server.mjs"],
      "env": {
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

### **Source**

The API key is read from `.env` file in the workspace root:

```
OpenAI API Key = sk-...
```

**Note:** The `.env` file format uses `"OpenAI API Key ="` (with spaces), which is automatically converted to the standard `OPENAI_API_KEY` environment variable name for the MCP server.

### **Security**

- ✅ **`.env` file is gitignored** - API key is not committed to repository
- ✅ **Environment variable** - Key is passed via MCP configuration, not hardcoded
- ✅ **No disclosure** - Key value is never logged or exposed in documentation

### **Verification**

To verify the configuration:

```bash
# Check if key is configured
cat .cursor/mcp.json | grep -A 5 "aibos-ui-generator"
```

The configuration should show:
- `"env"` field present
- `"OPENAI_API_KEY"` key exists
- Key value is set (not empty)

---

## 🔄 Alternative Configuration Methods

### **Method 1: Environment Variable (System Level)**

You can also set the environment variable at the system level:

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY = "sk-..."
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY="sk-..."
```

**Note:** If set at system level, you don't need to configure it in `mcp.json`.

### **Method 2: .env File (Recommended)**

✅ **Recommended** - Keep API keys in `.env` file:
- ✅ Version controlled (but gitignored)
- ✅ Easy to manage
- ✅ Consistent across team

**Format:**
```
OpenAI API Key = sk-...
```

**Auto-conversion:**
- The configuration script automatically converts `"OpenAI API Key"` to `OPENAI_API_KEY`
- Spaces around `=` are handled automatically

---

## 📋 Other Environment Variables

### **aibos-ui-generator**

| Variable | Required | Purpose | Default |
|----------|----------|---------|---------|
| `OPENAI_API_KEY` | ✅ Yes | OpenAI API key for LLM access | None |
| `AIBOS_UI_GENERATOR_MODEL` | ❌ No | Override default model | `gpt-5.1-thinking` |

### **react-validation**

| Variable | Required | Purpose | Default |
|----------|----------|---------|---------|
| `AIBOS_DESIGN_TOKEN_PREFIXES` | ❌ No | Comma-separated approved token prefixes | None |

### **github**

| Variable | Required | Purpose | Default |
|----------|----------|---------|---------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | ✅ Yes | GitHub personal access token | None |

---

## 🔧 Configuration Script

The API key is automatically configured from `.env` file using:

```powershell
# Extract key from .env
$envContent = Get-Content ".env" -Raw
if ($envContent -match "OpenAI API Key\s*=\s*(.+)") {
    $apiKey = $matches[1].Trim()
    # Add to mcp.json
}
```

**Features:**
- ✅ Handles spaces around `=`
- ✅ Trims whitespace
- ✅ Validates key exists
- ✅ Updates mcp.json automatically

---

## ✅ Verification

After configuration, verify:

1. **Check mcp.json:**
   ```bash
   cat .cursor/mcp.json | grep -A 10 "aibos-ui-generator"
   ```

2. **Test Server:**
   ```bash
   node .mcp/ui-generator/server.mjs
   # Should start without errors
   ```

3. **Test in Cursor:**
   ```
   Generate a button component using UI Generator MCP
   ```

---

## 🔒 Security Best Practices

### ✅ Do

- ✅ Keep `.env` file in `.gitignore`
- ✅ Use environment variables, not hardcoded keys
- ✅ Rotate keys regularly
- ✅ Use separate keys for dev/staging/prod
- ✅ Never commit API keys to repository

### ❌ Don't

- ❌ Hardcode API keys in code
- ❌ Commit `.env` files to git
- ❌ Share API keys in chat or documentation
- ❌ Use production keys in development

---

## 📝 Troubleshooting

### **"OPENAI_API_KEY not set"**

1. **Check .env file:**
   ```bash
   cat .env | grep "OpenAI API Key"
   ```

2. **Check mcp.json:**
   ```bash
   cat .cursor/mcp.json | grep -A 5 "aibos-ui-generator"
   ```

3. **Re-run configuration:**
   ```bash
   # Re-extract and configure
   ```

### **"Invalid API key"**

1. **Verify key format:**
   - Should start with `sk-`
   - Should be 164+ characters
   - No extra spaces or newlines

2. **Check key validity:**
   - Test key at https://platform.openai.com/api-keys
   - Ensure key has proper permissions

### **"Server not loading"**

1. **Check configuration:**
   ```bash
   node .mcp/ui-generator/server.mjs
   ```

2. **Check environment:**
   ```bash
   echo $OPENAI_API_KEY  # Linux/Mac
   echo $env:OPENAI_API_KEY  # Windows
   ```

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS MCP Team

