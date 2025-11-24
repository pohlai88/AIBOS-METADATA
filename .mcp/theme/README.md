# AIBOS Theme MCP Server

> **Token Management, Validation, and Tailwind Class Validation**

This MCP server provides comprehensive theme and token management for the AIBOS platform, including token validation, suggestions, and Tailwind class validation.

---

## Features

### ✅ Token Management
- Read tokens from `globals.css`
- Validate token existence
- Get token values
- Token naming convention validation

### ✅ Token Suggestions
- Suggest appropriate tokens for colors/values
- Match Figma tokens to Tailwind tokens
- Usage-specific suggestions (background, text, border, ring)

### ✅ Tailwind Class Validation
- Validate Tailwind class usage
- Check for arbitrary values
- Check for palette colors
- Suggest token-based alternatives
- Dynamic severity levels (error, warning, info)

### ✅ Performance Optimizations
- **CSS/variable caching** - Reuses parsed CSS and variables across calls
- File modification time (mtime) tracking for cache invalidation
- Prevents redundant file I/O and parsing operations

### ✅ Governance & Metadata
- **Governance metadata** - All results tagged with tool ID, domain, category, severity
- Integration-ready for `mdm_tool_registry` and governance workflows
- All responses include `registryContext` for upstream systems

---

## MCP Tools

### 1. `read_tailwind_config`

Returns Tailwind v4 CSS tokens from `globals.css`.

**Input:**
```typescript
{} // No parameters
```

**Output:**
```typescript
{
  cssPath: string;
  content: string; // Full CSS content
  registryContext: {
    toolId: "aibos-theme";
    domain: "ui_theme_validation";
    registryTable: "mdm_tool_registry";
  };
}
```

**Notes:**
- Uses CSS cache for performance (only re-reads when file changes)

**Example:**
```typescript
const tokens = await mcp_AIBOS_Theme_read_tailwind_config();
```

---

### 2. `validate_token_exists`

Check if a token exists in `globals.css` and validate token naming conventions.

**Input:**
```typescript
{
  tokenName: string; // Token name (with or without -- prefix)
}
```

**Output:**
```typescript
{
  exists: boolean;
  value: string | null;
  normalizedName: string;
  governance: {
    toolId: "aibos-theme";
    domain: "ui_theme_validation";
    registryTable: "mdm_tool_registry";
    category: "design-tokens";
    severity: "info" | "error"; // "info" if exists, "error" if missing
  };
}
```

**Notes:**
- Uses CSS cache for performance
- Severity is "error" if token doesn't exist, "info" if it exists

**Example:**
```typescript
const validation = await mcp_AIBOS_Theme_validate_token_exists({
  tokenName: "--aibos-primary"
});
```

---

### 3. `suggest_token`

Suggest appropriate token for a color/value, matching Figma tokens to Tailwind tokens.

**Input:**
```typescript
{
  color: string; // Color value (hex, rgb, or named color)
  usage?: "background" | "text" | "border" | "ring"; // Default: "background"
}
```

**Output:**
```typescript
{
  suggestions: Array<{
    token: string;
    className: string;
    value: string;
    match: "exact" | "partial";
  }>;
  originalColor: string;
  usage: string;
  governance: {
    toolId: "aibos-theme";
    domain: "ui_theme_validation";
    registryTable: "mdm_tool_registry";
    category: "design-tokens";
    severity: "info";
  };
}
```

**Notes:**
- Uses CSS cache for performance
- Returns top 5 matching suggestions sorted by match quality

**Example:**
```typescript
const suggestions = await mcp_AIBOS_Theme_suggest_token({
  color: "#22c55e",
  usage: "background"
});
```

---

### 4. `validate_tailwind_class`

Validate Tailwind class usage - check if class uses tokens vs arbitrary values.

**Input:**
```typescript
{
  className: string; // Tailwind class name to validate
}
```

**Output:**
```typescript
{
  valid: boolean;
  hasArbitrary: boolean;
  hasPalette: boolean;
  matchingTokens: Array<string>;
  suggestions: Array<string>;
  governance: {
    toolId: "aibos-theme";
    domain: "ui_theme_validation";
    registryTable: "mdm_tool_registry";
    category: "design-tokens";
    severity: "error" | "warning" | "info"; // Dynamic based on validation result
  };
}
```

**Notes:**
- Uses CSS cache for performance
- Severity levels:
  - `"error"` - Class is invalid (has arbitrary/palette colors and no matching tokens)
  - `"warning"` - Class has arbitrary or palette colors but also has matching tokens
  - `"info"` - Class is valid (uses tokens correctly)

**Example:**
```typescript
const validation = await mcp_AIBOS_Theme_validate_tailwind_class({
  className: "bg-primary"
});
```

---

### 5. `get_token_value`

Get actual CSS value for a token - useful for validation and comparison.

**Input:**
```typescript
{
  tokenName: string; // Token name (with or without -- prefix)
}
```

**Output:**
```typescript
{
  exists: boolean;
  token: string;
  value: string | null;
  className: string;
  error?: string;
  governance: {
    toolId: "aibos-theme";
    domain: "ui_theme_validation";
    registryTable: "mdm_tool_registry";
    category: "design-tokens";
    severity: "info" | "error"; // "info" if exists, "error" if missing
  };
}
```

**Notes:**
- Uses CSS cache for performance
- Includes suggested Tailwind class name for the token

**Example:**
```typescript
const tokenValue = await mcp_AIBOS_Theme_get_token_value({
  tokenName: "--aibos-primary"
});
```

---

## Integration with Other MCPs

### Workflow: Theme + React MCP

```
1. React MCP: Validate component code
   ↓
2. Theme MCP: Validate tokens exist
   ↓
3. Theme MCP: Suggest token fixes
   ↓
4. React MCP: Report violations with suggestions
```

### Example Integration

```typescript
// 1. Validate component with React MCP
const reactValidation = await mcp_React_validate_react_component({
  filePath: "packages/ui/src/components/button.tsx"
});

// 2. For token violations, use Theme MCP to suggest fixes
for (const error of reactValidation.errors) {
  if (error.type === "palette-color") {
    // Extract color from error
    const color = extractColorFromError(error);
    
    // Use Theme MCP to suggest correct token
    const suggestion = await mcp_AIBOS_Theme_suggest_token({
      color: color,
      usage: "background"
    });
    
    console.log(`Replace ${color} with ${suggestion.suggestions[0].token}`);
  }
}
```

---

## Usage in Cursor

### Get Tokens

```
Get Tailwind tokens from globals.css
```

### Validate Token

```
Check if --aibos-primary token exists
```

### Suggest Token

```
Suggest a token for color #22c55e for background usage
```

### Validate Class

```
Validate if bg-primary class uses tokens correctly
```

---

## Configuration

The server is configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aibos-theme": {
      "command": "node",
      "args": [".mcp/theme/server.mjs"]
    }
  }
}
```

---

## Dependencies

- `@modelcontextprotocol/sdk` - MCP SDK

Install with:
```bash
pnpm add -D @modelcontextprotocol/sdk
```

---

## Best Practices

### ✅ Do

- Use Theme MCP to validate tokens before using them
- Use `suggest_token` when migrating from palette colors
- Validate Tailwind classes before committing
- Use token values for comparison with Figma
- Leverage governance metadata for integration with `mdm_tool_registry`
- Take advantage of CSS caching for better performance

### ❌ Don't

- Use arbitrary values without checking tokens first
- Use palette colors without suggesting token alternatives
- Skip token validation in CI/CD
- Ignore governance metadata in automated workflows

## Governance Integration

All validation results include governance metadata for integration with upstream systems:

```typescript
{
  governance: {
    toolId: "aibos-theme",
    domain: "ui_theme_validation",
    registryTable: "mdm_tool_registry",
    category: "design-tokens",
    severity: "error" | "warning" | "info"
  }
}
```

This allows you to:
- Map validation results to `mdm_tool_registry` tables
- Build dashboards and reports
- Create enforcement workflows based on severity:
  - `severity === "error"` → block merge / block publish
  - `severity === "warning"` → allow but log + show in dashboard
  - `severity === "info"` → advisory / analytics only
- Track validation metrics over time

---

## Related Documentation

- [React MCP](../react/README.md) - React component validation
- [Figma Sync](../../packages/ui/ui-docs/04-integration/figma-sync.md) - Design-code sync
- [Token System](../../packages/ui/ui-docs/01-foundation/tokens.md) - Token architecture

---

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Location:** `.mcp/theme/server.mjs`

## Recent Improvements

### v2.0.0 Enhancements

- ✅ **CSS/variable caching** - Performance optimization via file modification time tracking
- ✅ **Governance metadata** - All results tagged for `mdm_tool_registry` integration
- ✅ **Dynamic severity levels** - Error/warning/info based on validation results
- ✅ **Cache invalidation** - Automatic cache refresh when `globals.css` changes

