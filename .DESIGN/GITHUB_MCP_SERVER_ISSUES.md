# 🔍 GitHub MCP Server Configuration Issues

**Date:** 2025-01-27  
**Status:** Issues Identified

---

## 🐛 Issues Found

### 1. ❌ Missing Environment Variable

**Problem:** `GITHUB_PERSONAL_ACCESS_TOKEN` is not set in the environment.

**Current Configuration:**
```json
{
  "github": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "-e",
      "GITHUB_PERSONAL_ACCESS_TOKEN",
      "ghcr.io/github/github-mcp-server"
    ],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  }
}
```

**Issue:** The `${GITHUB_PERSONAL_ACCESS_TOKEN}` placeholder is not being resolved because:
- The environment variable is not set in the system
- Cursor may not be resolving the `${}` syntax correctly
- Docker needs the token to be available when it runs

**Verification:**
```powershell
# Token check result:
Token is NOT set
```

---

### 2. ⚠️ Docker Dependency

**Current Setup:** Uses Docker to run the GitHub MCP server.

**Status:** ✅ Docker is installed (version 28.4.0)

**Potential Issues:**
- Docker must be running
- Docker must have access to pull from `ghcr.io`
- Docker container needs network access
- May have performance overhead vs native execution

---

### 3. 🔄 Alternative Configuration Available

**Option 1: Use NPX (Recommended)**

Instead of Docker, you can use the npm package directly:

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  }
}
```

**Benefits:**
- ✅ No Docker dependency
- ✅ Faster startup
- ✅ Easier to debug
- ✅ Works on all platforms

**Option 2: Use Official GitHub MCP Server (if available)**

Check if there's an official npm package:
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "github-mcp-server"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  }
}
```

---

## ✅ Solutions

### Solution 1: Set Environment Variable

**Windows (PowerShell):**
```powershell
# Set for current session
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_your_token_here"

# Set permanently (User-level)
[System.Environment]::SetEnvironmentVariable("GITHUB_PERSONAL_ACCESS_TOKEN", "ghp_your_token_here", "User")
```

**Windows (Command Prompt):**
```cmd
setx GITHUB_PERSONAL_ACCESS_TOKEN "ghp_your_token_here"
```

**Create `.env` file in workspace root:**
```env
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
```

**Note:** Cursor automatically loads `.env` files, so the token will be available to MCP servers.

---

### Solution 2: Switch to NPX Configuration

**Update `.cursor/mcp.json`:**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Benefits:**
- No Docker required
- Faster startup
- Easier troubleshooting
- Works if Docker is not running

---

### Solution 3: Verify Docker Configuration

If you want to keep using Docker:

1. **Ensure Docker is running:**
   ```powershell
   docker ps
   ```

2. **Test pulling the image:**
   ```powershell
   docker pull ghcr.io/github/github-mcp-server
   ```

3. **Test running the container:**
   ```powershell
   docker run --rm -e GITHUB_PERSONAL_ACCESS_TOKEN="test" ghcr.io/github/github-mcp-server --help
   ```

---

## 🔐 Getting a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set expiration and select scopes:
   - `repo` - Full control of private repositories
   - `read:org` - Read org and team membership
   - `read:user` - Read user profile data
4. Copy the token (starts with `ghp_`)
5. Store it securely (never commit to git)

---

## 📋 Recommended Fix

**Best Approach:** Use NPX + Environment Variable

1. **Create `.env` file** (already in `.gitignore`):
   ```env
   GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
   ```

2. **Update `.cursor/mcp.json`**:
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
         }
       }
     }
   }
   ```

3. **Restart Cursor** to load the new configuration

---

## 🧪 Testing

After applying the fix, test the GitHub MCP server:

1. **Check if it's loaded:**
   - Open Cursor
   - Check MCP server status
   - Look for "github" in the list

2. **Test a GitHub operation:**
   - Try asking Cursor to list GitHub repositories
   - Try creating an issue or PR
   - Check for any error messages

---

## 📚 References

- [GitHub MCP Server Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [MCP Server Configuration Guide](https://modelcontextprotocol.io/docs)
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)

---

## ✅ Checklist

- [ ] GitHub Personal Access Token created
- [ ] Token added to `.env` file (or system environment)
- [ ] `.cursor/mcp.json` updated (if switching to NPX)
- [ ] Cursor restarted
- [ ] GitHub MCP server appears in Cursor's MCP list
- [ ] Test GitHub operations work

---

_Last Updated: 2025-01-27_

