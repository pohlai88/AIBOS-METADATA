# AIBOS Accessibility MCP Server

> **Version:** 2.0.0  
> **Domain:** `ui_accessibility_validation`  
> **Tool ID:** `aibos-a11y-validation`

Accessibility validation for React components with WCAG 2.1 compliance and governance metadata integration.

## Features

- ✅ **WCAG 2.1 Compliance** - Validates against WCAG 2.1 AA standards
- ✅ **AST-Based Analysis** - Deep component analysis using Babel parser
- ✅ **Contrast Checking** - Real WCAG contrast ratio calculations
- ✅ **Governance Metadata** - Integrated with `mdm_tool_registry`
- ✅ **AST Caching** - Performance optimization via shared AST cache
- ✅ **Next.js Compatible** - Follows Next.js App Router best practices

## Tools

### `validate_component`

Validates React component accessibility with WCAG 2.1 compliance.

**Parameters:**
- `filePath` (required): Path to the React component file
- `componentName` (optional): Specific component name to validate

**Returns:**
- `valid`: Boolean indicating if component passes validation
- `violations`: Array of accessibility violations (errors)
- `warnings`: Array of accessibility warnings
- `registryContext`: Governance metadata
- `summary`: Validation summary with counts

**Validation Rules:**
1. Icon-only buttons must have `aria-label` or `aria-labelledby`
2. Form inputs must have associated labels
3. Divs with `onClick` must use button element or proper ARIA roles
4. Interactive elements must have proper roles and keyboard support
5. Images must have alt text
6. Required inputs should have `aria-required`
7. Error states should have `aria-invalid`
8. Modals/dialogs must have `role="dialog"`
9. Buttons should have explicit type attribute
10. Headings should follow logical hierarchy

### `check_contrast`

Checks WCAG 2.1 contrast ratio between foreground and background colors.

**Parameters:**
- `foreground` (required): Foreground color (hex, rgb, rgba, hsl, or named color)
- `background` (required): Background color (hex, rgb, rgba, hsl, or named color)

**Returns:**
- `contrast`: Calculated contrast ratio (rounded to 2 decimals)
- `passesAA`: Boolean for WCAG AA compliance (4.5:1)
- `passesAALarge`: Boolean for WCAG AA Large Text (3.0:1)
- `passesAAA`: Boolean for WCAG AAA compliance (7.0:1)
- `passesAAALarge`: Boolean for WCAG AAA Large Text (4.5:1)
- `level`: Compliance level string ("AAA", "AA", "AA (Large Text)", or "Fail")
- `registryContext`: Governance metadata

## Usage

### Via MCP Client

```typescript
// Validate component
const result = await mcp.callTool("aibos-a11y-validation", "validate_component", {
  filePath: "app/components/Button.tsx",
  componentName: "Button"
});

// Check contrast
const contrast = await mcp.callTool("aibos-a11y-validation", "check_contrast", {
  foreground: "#000000",
  background: "#ffffff"
});
```

### Direct Execution

```bash
node .mcp/a11y/server.mjs
```

## Governance Integration

All validation results include governance metadata:

```typescript
{
  registryContext: {
    toolId: "aibos-a11y-validation",
    domain: "ui_accessibility_validation",
    registryTable: "mdm_tool_registry"
  }
}
```

This enables:
- Policy enforcement based on tool metadata
- Usage tracking and analytics
- Quality metrics and dashboards
- Compliance reporting

## Performance

- **AST Caching**: Parsed files are cached to avoid redundant parsing
- **Efficient Traversal**: Optimized Babel AST traversal
- **Memory Management**: Cache invalidation on file changes

## Next.js Best Practices

This server follows Next.js App Router best practices:

- ✅ **Server Components**: Validates RSC boundaries correctly
- ✅ **Client Components**: Properly detects `"use client"` directives
- ✅ **TypeScript Support**: Full TypeScript and JSX parsing
- ✅ **Module Resolution**: Handles Next.js path aliases

## Related MCP Servers

- [React MCP](../react/README.md) - React component validation
- [Theme MCP](../theme/README.md) - Theme and token validation
- [UI Generator MCP](../ui-generator/README.md) - UI component generation

## Architecture

See [MCP Architecture](../ARCHITECTURE.md) for directory structure and organization guidelines.

