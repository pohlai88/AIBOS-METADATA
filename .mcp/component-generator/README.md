# AIBOS Component Generator MCP Server

> **Version:** 3.0.0  
> **Domain:** `ui_component_generation`  
> **Tool ID:** `aibos-component-generator`

AI-driven component generation with complete constitution governance (86 rules), design drift detection, and comprehensive validation.

## Features

- ✅ **86 Constitution Rules** - Comprehensive validation covering all aspects of component generation
- ✅ **Design Drift Detection** - Compares generated code with design specifications
- ✅ **Token Mapping** - Automatic token alias mapping for variants
- ✅ **Governance Metadata** - Integrated with `mdm_tool_registry`
- ✅ **Next.js Compatible** - Follows Next.js App Router best practices
- ✅ **RSC Boundary Validation** - Ensures proper Server/Client component usage
- ✅ **Accessibility Validation** - WCAG compliance checks
- ✅ **Keyboard Navigation** - Validates keyboard event handlers
- ✅ **Focus Management** - Validates focus trapping in dialogs/modals
- ✅ **Semantic Structure** - Validates landmarks and heading hierarchy
- ✅ **Styling Rules** - Enforces token-only styling (no raw colors)
- ✅ **Motion Safety** - Validates reduced motion support

## Tools

### `generate_component`

Generates React component with complete constitution validation.

**Parameters:**
- `componentName` (required): Component name in PascalCase
- `description` (optional): Component description
- `tokens` (optional): Theme tokens object
- `design` (optional): Figma design object
- `componentType` (optional): `"primitive"`, `"composition"`, or `"layout"` (default: `"primitive"`)
- `figmaNodeId` (optional): Figma node ID
- `previousVersion` (optional): Previous version code for drift detection

**Returns:**
- `success`: Boolean indicating success
- `code`: Generated component code
- `tokens`: Theme tokens used
- `tokenMappings`: Token alias mappings
- `validation`: Constitution and code validation results
- `designDrift`: Design drift detection results (if previousVersion provided)
- `registryContext`: Governance metadata
- `summary`: Validation summary with governance score

**Validation Categories:**
1. **Token Constitution** - Token usage validation
2. **Component Constitution** - Component structure validation
3. **RSC Boundary** - Server/Client component validation
4. **React Structure** - Component structure validation
5. **Accessibility** - WCAG compliance (20 rules)
6. **Keyboard Navigation** - Enter, Space, Escape, Arrow keys
7. **Focus Trapping** - Dialog/modal focus management
8. **Semantic Landmarks** - Header, main, nav, footer validation
9. **Heading Hierarchy** - H1-H6 hierarchy validation
10. **Props Structure** - TypeScript props interface validation
11. **Styling Rules** - Token-only enforcement
12. **Import Validation** - Allowed/forbidden imports
13. **Radix Boundaries** - Radix UI usage rules
14. **Semantic Naming** - Prop naming conventions
15. **Token Alias Mapping** - Variant-to-token mapping
16. **Motion Safety** - Reduced motion support
17. **Style Drift** - Design-to-code comparison

## Usage

### Via MCP Client

```typescript
const result = await mcp.callTool("aibos-component-generator", "generate_component", {
  componentName: "Button",
  description: "Primary action button",
  componentType: "primitive",
  tokens: { /* theme tokens */ },
  design: { /* figma design */ }
});
```

### Direct Execution

```bash
node .mcp/component-generator/server.mjs
```

## Constitution Files

The server loads constitution files from:
- `packages/ui/constitution/tokens.yml`
- `packages/ui/constitution/rsc.yml`
- `packages/ui/constitution/components.yml`

## Governance Integration

All results include governance metadata:

```typescript
{
  registryContext: {
    toolId: "aibos-component-generator",
    domain: "ui_component_generation",
    registryTable: "mdm_tool_registry"
  }
}
```

## Governance Score

The server calculates a governance score based on:
- Total rules checked
- Violations (10 points penalty each)
- Warnings (2 points penalty each)

**Score Grades:**
- **A**: 90-100
- **B**: 80-89
- **C**: 70-79
- **D**: <70

## Next.js Best Practices

This server follows Next.js App Router best practices:

- ✅ **Server Components**: Validates RSC boundaries correctly
- ✅ **Client Components**: Properly detects `"use client"` directives
- ✅ **TypeScript Support**: Full TypeScript and JSX parsing
- ✅ **Module Resolution**: Handles Next.js path aliases
- ✅ **Token Usage**: Enforces token-only styling (no raw colors)

## Related MCP Servers

- [React MCP](../react/README.md) - React component validation
- [Theme MCP](../theme/README.md) - Theme and token validation
- [UI Generator MCP](../ui-generator/README.md) - UI component generation
- [Accessibility MCP](../a11y/README.md) - Accessibility validation

## Architecture

See [MCP Architecture](../ARCHITECTURE.md) for directory structure and organization guidelines.

