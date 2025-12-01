# Next.js MCP Integration in apps/web

## Overview

The `apps/web` Next.js application has built-in MCP (Model Context Protocol) support enabled automatically in Next.js 16+.

## MCP Endpoint

When the dev server is running, the MCP endpoint is available at:

```
http://localhost:3000/_next/mcp
```

## Configuration

MCP is **automatically enabled** in Next.js 16.0.3+. No additional configuration needed.

The `next.config.ts` includes a comment documenting MCP availability:

```typescript
// Next.js MCP (Model Context Protocol) is automatically enabled in Next.js 16+
// MCP endpoint available at: http://localhost:3000/_next/mcp (dev server only)
// Provides runtime diagnostics, route info, and documentation search
```

## Available MCP Tools

When the dev server is running, the following MCP tools are available via Cursor:

### Runtime Diagnostics
- `nextjs_runtime` - Query runtime information
- `nextjs_runtime_discover_servers` - Find running Next.js servers
- `nextjs_runtime_list_tools` - List available MCP tools
- `nextjs_runtime_get_errors` - Get compilation errors
- `nextjs_runtime_get_routes` - Get all routes
- `nextjs_runtime_get_logs` - Get runtime logs

### Documentation
- `nextjs_docs` - Search Next.js documentation
- `nextjs_docs_get` - Get specific documentation page

## Usage in Cursor

### Example Queries

1. **Check for errors:**
   ```
   Use nextjs_runtime to check for errors in the Next.js app
   ```

2. **Get route information:**
   ```
   Show me all available routes in the Next.js app
   ```

3. **Check build status:**
   ```
   What's the current build status of the Next.js app?
   ```

4. **Search documentation:**
   ```
   How do I use Server Actions in Next.js 16?
   ```

## Integration with Other MCP Servers

The Next.js MCP works alongside your custom MCP servers:

- **ui-generator** - Generate components
- **react-validation** - Validate React code
- **a11y-validation** - Check accessibility
- **aibos-theme** - Manage themes

All servers work together to provide comprehensive development support.

## Development Workflow

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **MCP automatically connects** - No additional setup needed

3. **Use in Cursor:**
   - Ask about runtime state
   - Query routes and errors
   - Get build diagnostics
   - Search documentation

## Troubleshooting

### MCP Endpoint Not Available

**Check:**
1. Dev server is running: `pnpm dev`
2. Next.js version is 16+: `cat package.json | grep "next"`
3. Port 3000 is available

### Common Issues

**Issue:** "Cannot connect to Next.js"
- **Solution:** Ensure dev server is running on port 3000

**Issue:** "MCP endpoint returns 404"
- **Solution:** Verify Next.js 16+ is installed (MCP support added in v16)

## Best Practices

1. **Always run dev server** when using Next.js MCP tools
2. **Use runtime diagnostics** before making changes
3. **Check documentation** for Next.js-specific patterns
4. **Combine with other MCPs** for full development workflow

## Related Documentation

- [Next.js MCP Guide](../../.cursor/NEXTJS_MCP_GUIDE.md)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Next.js 16 Documentation](https://nextjs.org/docs)

