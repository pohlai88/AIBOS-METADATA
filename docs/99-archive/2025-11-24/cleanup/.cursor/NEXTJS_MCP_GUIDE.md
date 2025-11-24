# Next.js MCP Integration Guide

## Overview

Next.js 16+ includes built-in MCP (Model Context Protocol) support that provides runtime diagnostics, documentation search, and build information directly to Cursor.

## Configuration

The Next.js MCP is already configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

## Requirements

- ✅ Next.js 16.0.0 or later
- ✅ Development server running (`pnpm dev`)
- ✅ MCP endpoint automatically available at `/_next/mcp`

## Available Tools

### 1. Runtime Diagnostics

**Tool:** `nextjs_runtime`

Query runtime information from your Next.js application:

- Get current routes
- Check for errors
- View component tree
- Inspect build status

**Example Usage in Cursor:**
```
Use nextjs_runtime to check for errors in the app
```

### 2. Documentation Search

**Tool:** `nextjs_docs`

Search Next.js official documentation:

- Find API references
- Get code examples
- Understand best practices

**Example Usage in Cursor:**
```
Search Next.js docs for App Router patterns
```

### 3. Server Discovery

**Tool:** `nextjs_runtime_discover_servers`

Automatically discover running Next.js dev servers.

## How to Use

### Step 1: Start Dev Server

```bash
pnpm dev
```

This starts Next.js on `http://localhost:3000` and enables the MCP endpoint.

### Step 2: Use in Cursor

The MCP server connects automatically. You can now:

1. **Ask about runtime state:**
   ```
   What errors are in the Next.js app?
   ```

2. **Query routes:**
   ```
   Show me all available routes
   ```

3. **Get diagnostics:**
   ```
   Check the Next.js build status
   ```

4. **Search documentation:**
   ```
   How do I use Server Actions in Next.js 16?
   ```

## Troubleshooting

### MCP Server Not Connecting

1. **Check dev server is running:**
   ```bash
   # Should see: "Ready on http://localhost:3000"
   pnpm dev
   ```

2. **Verify Next.js version:**
   ```bash
   # Should be 16.0.0 or later
   cat apps/web/package.json | grep "next"
   ```

3. **Check MCP endpoint:**
   ```bash
   # Should return MCP info
   curl http://localhost:3000/_next/mcp
   ```

### Common Issues

**Issue:** "MCP server not found"
- **Solution:** Ensure `next-devtools-mcp` is installed (it auto-installs via npx)

**Issue:** "Cannot connect to Next.js"
- **Solution:** Make sure dev server is running on port 3000

**Issue:** "MCP endpoint not available"
- **Solution:** Upgrade to Next.js 16+ (MCP support was added in v16)

## Integration with Other MCP Servers

The Next.js MCP works alongside your custom MCP servers:

- **react-validation** - Validates React components
- **a11y-validation** - Checks accessibility
- **ui-generator** - Generates components
- **aibos-theme** - Manages themes

All servers work together to provide comprehensive development support.

## Best Practices

1. **Always run dev server** when using Next.js MCP tools
2. **Use runtime diagnostics** before making changes
3. **Check documentation** for Next.js-specific patterns
4. **Combine with other MCPs** for full development workflow

## Example Workflow

```bash
# 1. Start dev server
pnpm dev

# 2. In Cursor, ask:
"Check for errors in the Next.js app using nextjs_runtime"

# 3. Fix issues, then:
"Validate the fixed component using react-validation"

# 4. Generate new component:
"Generate a new DashboardCard component using ui-generator"
```

## Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Next.js MCP GitHub](https://github.com/vercel/next.js/tree/canary/packages/next-devtools-mcp)

