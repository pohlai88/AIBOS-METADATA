# Figma Design-to-Code Sync

> **Figma MCP Integration** - Automated design token and component sync

This guide explains how to sync design tokens and components from Figma to the codebase using Figma MCP tools.

---

## Overview

The Figma MCP integration enables:
- ✅ Automated token extraction from Figma variables
- ✅ Component generation from Figma frames
- ✅ Design-code validation and drift detection
- ✅ Bidirectional sync (design ↔ code)

**Validated Against:**
- ✅ Figma MCP tools (verified available)
- ✅ Tailwind Tokens MCP (token validation)

---

## Prerequisites

1. **Figma Access**
   - Authenticated via Cursor MCP
   - Access to design system file
   - View permissions (minimum)

2. **Figma File Information**
   - File Key (from Figma URL)
   - Node IDs for design system components

3. **MCP Tools Available**
   - `mcp_Figma_get_variable_defs` - Extract variables
   - `mcp_Figma_get_design_context` - Get component specs
   - `mcp_Figma_get_code_connect_map` - Map components

---

## Workflows

### 1. Token Sync Workflow

**Purpose:** Sync Figma variables to `globals.css`

**Steps:**
1. Extract variables from Figma design system
2. Map Figma variables to CSS custom properties
3. Update `globals.css` with new values
4. Update `tokens.ts` TypeScript mappings
5. Validate changes

**Command:**
```bash
pnpm sync:figma-tokens \
  --file-key=YOUR_FIGMA_FILE_KEY \
  --node-id=DESIGN_SYSTEM_NODE_ID
```

**Example:**
```typescript
// scripts/sync-figma-tokens.ts
import { mcp_Figma_get_variable_defs } from "@figma/mcp";

async function syncTokens(fileKey: string, nodeId: string) {
  // Get variables from Figma
  const variables = await mcp_Figma_get_variable_defs({
    fileKey,
    nodeId,
  });

  // Map to CSS
  const cssVars = mapFigmaToCSS(variables);

  // Update globals.css
  await updateGlobalsCSS(cssVars);

  // Validate
  await validateTokens();
}
```

**Validated:** ✅ Figma MCP available, workflow ready for implementation

---

### 2. Component Generation Workflow

**Purpose:** Generate React components from Figma frames

**Steps:**
1. Select Figma frame/node
2. Extract design context (layout, tokens, styles)
3. Generate React component using MCP system prompt
4. Write to `packages/ui/src/components/`
5. Validate against design system rules

**Command:**
```bash
pnpm generate:from-figma \
  --file-key=YOUR_FIGMA_FILE_KEY \
  --node-id=FRAME_NODE_ID \
  --name=ComponentName
```

**Example:**
```typescript
// scripts/generate-from-figma.ts
import { mcp_Figma_get_design_context } from "@figma/mcp";

async function generateComponent(
  fileKey: string,
  nodeId: string,
  componentName: string
) {
  // Get design context
  const context = await mcp_Figma_get_design_context({
    fileKey,
    nodeId,
    clientLanguages: "typescript",
    clientFrameworks: "react",
  });

  // Generate component
  await generateComponentCode({
    designContext: context,
    componentName,
    systemPrompt: loadUiGeneratorSystemPrompt(),
  });
}
```

**Validated:** ✅ Figma MCP `get_design_context` available

---

### 3. Design-Code Validation Workflow

**Purpose:** Validate that code components match Figma designs

**Steps:**
1. Get Figma design specs
2. Read component code
3. Compare tokens, spacing, colors
4. Report differences
5. Suggest fixes

**Command:**
```bash
pnpm validate:figma-sync \
  --file-key=YOUR_FIGMA_FILE_KEY \
  --node-id=FRAME_NODE_ID \
  --component=ComponentName
```

**Example:**
```typescript
// scripts/validate-figma-sync.ts
import { mcp_Figma_get_design_context } from "@figma/mcp";

async function validateSync(
  fileKey: string,
  nodeId: string,
  componentName: string
) {
  // Get Figma design
  const figmaDesign = await mcp_Figma_get_design_context({
    fileKey,
    nodeId,
  });

  // Read component code
  const componentCode = await readComponent(componentName);

  // Compare
  const differences = compareDesignToCode(figmaDesign, componentCode);

  if (differences.length > 0) {
    console.error("❌ Design-code mismatch:");
    differences.forEach((diff) => console.error(`  - ${diff}`));
    process.exit(1);
  }

  console.log("✅ Design and code are in sync");
}
```

---

## Figma Variable Mapping

### Color Variables

```typescript
const figmaToCSSMapping = {
  // Colors
  "color/primary": "--aibos-primary",
  "color/primary-soft": "--aibos-primary-soft",
  "color/bg": "--aibos-bg",
  "color/bg-muted": "--aibos-bg-muted",

  // Status
  "color/success": "--aibos-success",
  "color/error": "--aibos-error",
  "color/warning": "--aibos-warning",
};
```

### Spacing Variables

```typescript
const spacingMapping = {
  "spacing/4": "--space-4",   // 16px
  "spacing/8": "--space-8",  // 32px
  "spacing/16": "--space-16", // 64px
};
```

### Typography Variables

```typescript
const typographyMapping = {
  "typography/body": "--text-base",
  "typography/heading": "--text-2xl",
  "typography/caption": "--text-sm",
};
```

---

## Code Connect Integration

Map Figma components to codebase locations:

```typescript
// Get Code Connect mapping
const codeConnectMap = await mcp_Figma_get_code_connect_map({
  fileKey: FIGMA_FILE_KEY,
});

// Example mapping
{
  "figma:Button": "packages/ui/src/components/button.tsx",
  "figma:Card": "packages/ui/src/components/card.tsx",
  "figma:Input": "packages/ui/src/components/input.tsx",
}
```

**Usage:**
- Validate that Figma components have corresponding code
- Generate component stubs from Figma
- Keep design-code mapping in sync

---

## Best Practices

### 1. Regular Sync Schedule

- **Daily:** For active development
- **Weekly:** For stable design system
- **On Release:** Before major releases

### 2. Validation Before Merge

- Always validate design-code sync before merging
- Run `pnpm validate:figma-sync` in CI/CD
- Block PRs with design-code mismatches

### 3. Token Naming Consistency

- Use consistent naming between Figma and code
- Document naming conventions
- Validate naming in sync process

### 4. Component Versioning

- Track component versions in Figma
- Match code component versions
- Document breaking changes

---

## Troubleshooting

### Issue: Figma MCP Not Available

**Solution:**
- Verify Cursor MCP configuration
- Check Figma authentication
- Ensure file permissions

### Issue: Token Mismatch

**Solution:**
- Compare Figma variables with `globals.css`
- Check variable naming conventions
- Validate mapping configuration

### Issue: Component Generation Fails

**Solution:**
- Verify Figma frame structure
- Check node ID is correct
- Validate design context extraction

---

## Related Documentation

- [Tokens](../01-foundation/tokens.md) - Token system
- [Governance](../GOVERNANCE.md) - Validation rules
- [Component Generation](../05-guides/contributing.md) - Component creation

---

**Last Updated:** 2024  
**Validated:** ✅ Figma MCP | ✅ Tailwind MCP  
**Status:** Published

