# MCP Integration Guide: Next.js, Figma, Tailwind & React

> **Complete Guide to Using All MCPs Together for Component Development**

---

## Overview

This guide shows you how to use **React MCP**, **Next.js MCP**, **Figma MCP**, and **Tailwind MCP** together to ensure your components meet best practices across all dimensions.

---

## MCP Servers Available

### ✅ React MCP (`.mcp/react/server.mjs`)
- **Purpose:** Validate React patterns, RSC boundaries, component best practices
- **Tools:** `validate_react_component`, `check_server_client_usage`, `validate_rsc_boundary`, `validate_imports`

### ✅ Next.js MCP (Built-in Next.js 16+)
- **Purpose:** Runtime diagnostics, route info, Next.js best practices
- **Tools:** `nextjs_runtime`, `nextjs_docs`, `nextjs_runtime_discover_servers`

### ✅ Figma MCP (Cursor Built-in)
- **Purpose:** Design-code sync, extract design tokens, component specs
- **Tools:** `mcp_Figma_get_design_context`, `mcp_Figma_get_variable_defs`, `mcp_Figma_get_code_connect_map`

### ✅ Tailwind MCP (`.mcp/theme/server.mjs` or `tools/mcp-tailwind-tokens.mjs`)
- **Purpose:** Token validation, theme access, design system compliance
- **Tools:** `read_tailwind_config`, `getTheme`, `validate_tokens`

---

## Complete Validation Workflow

### Step 1: Generate Component from Figma Design

```typescript
// Get design context from Figma
const figmaDesign = await mcp_Figma_get_design_context({
  fileKey: "YOUR_FIGMA_FILE_KEY",
  nodeId: "COMPONENT_NODE_ID",
  clientLanguages: "typescript",
  clientFrameworks: "react"
});

// Extract design tokens
const figmaTokens = await mcp_Figma_get_variable_defs({
  fileKey: "YOUR_FIGMA_FILE_KEY",
  nodeId: "DESIGN_SYSTEM_NODE_ID"
});
```

### Step 2: Get Tailwind Tokens

```typescript
// Get current tokens from globals.css
const tailwindConfig = await mcp_Tailwind_read_tailwind_config();

// Validate tokens match Figma
const tokenValidation = await mcp_Tailwind_validate_tokens({
  figmaTokens: figmaTokens,
  currentTokens: tailwindConfig.content
});
```

### Step 3: Generate Component Code

```typescript
// Generate component using UI Generator MCP
const componentCode = await mcp_UI_Generator_generate_ui({
  componentName: "Button",
  description: "Primary button component",
  designContext: figmaDesign,
  tokens: tailwindConfig
});
```

### Step 4: Validate React Patterns

```typescript
// Validate React component
const reactValidation = await mcp_React_validate_react_component({
  filePath: "packages/ui/src/components/button.tsx",
  componentName: "Button"
});

if (!reactValidation.valid) {
  console.error("React validation failed:");
  reactValidation.errors.forEach(error => {
    console.error(`  ${error.type}: ${error.message} (line ${error.line})`);
  });
}
```

### Step 5: Validate Next.js RSC Boundary

```typescript
// Check Server/Client Component usage
const rscCheck = await mcp_React_check_server_client_usage({
  filePath: "packages/ui/src/components/button.tsx"
});

if (rscCheck.shouldBeClient && !rscCheck.isClientComponent) {
  console.warn(`Missing "use client" directive: ${rscCheck.reason}`);
}

// Validate RSC boundary
const rscBoundary = await mcp_React_validate_rsc_boundary({
  filePath: "packages/ui/src/components/button.tsx"
});

if (!rscBoundary.valid) {
  console.error("RSC boundary violations:");
  rscBoundary.violations.forEach(violation => {
    console.error(`  ${violation.type}: ${violation.message} (line ${violation.line})`);
  });
}
```

### Step 6: Validate Next.js Patterns

```typescript
// Get Next.js runtime info
const nextjsRuntime = await mcp_NextJS_runtime_list_tools();

// Check for Next.js errors
const errors = await mcp_NextJS_runtime_call_tool({
  toolName: "get_errors"
});

if (errors.length > 0) {
  console.error("Next.js errors found:");
  errors.forEach(error => console.error(`  ${error.message}`));
}
```

### Step 7: Validate Design-Code Sync

```typescript
// Compare Figma design with generated code
const codeConnectMap = await mcp_Figma_get_code_connect_map({
  fileKey: "YOUR_FIGMA_FILE_KEY"
});

// Verify component matches Figma design
const designSync = compareDesignToCode(figmaDesign, componentCode);
if (designSync.mismatches.length > 0) {
  console.warn("Design-code mismatches:");
  designSync.mismatches.forEach(mismatch => {
    console.warn(`  ${mismatch.property}: ${mismatch.figmaValue} vs ${mismatch.codeValue}`);
  });
}
```

---

## Usage Examples in Cursor

### Example 1: Create a New Component

```
Create a Button component from Figma design node-id=1:2 in file-key=abc123.
Validate it against React best practices, Next.js RSC boundaries, and Tailwind tokens.
```

**What happens:**
1. Fetches design from Figma MCP
2. Gets tokens from Tailwind MCP
3. Generates component code
4. Validates with React MCP
5. Checks Next.js patterns
6. Reports any issues

---

### Example 2: Validate Existing Component

```
Validate the Button component at packages/ui/src/components/button.tsx
Check React patterns, RSC boundaries, token compliance, and Next.js compatibility.
```

**What happens:**
1. Validates React patterns (forwardRef, displayName, props)
2. Checks Server/Client Component usage
3. Validates RSC boundaries
4. Checks token compliance
5. Validates Next.js patterns
6. Reports all issues

---

### Example 3: Fix RSC Boundary Issues

```
Check if ServerComponent.tsx has any RSC boundary violations.
Fix any issues found.
```

**What happens:**
1. Validates RSC boundary
2. Traces imports transitively
3. Detects browser APIs and client hooks
4. Suggests fixes
5. Applies fixes if possible

---

## Integration Checklist

### ✅ Setup Complete

- [x] React MCP server at `.mcp/react/server.mjs`
- [x] Next.js MCP enabled (automatic in Next.js 16+)
- [x] Figma MCP connected (verified earlier)
- [x] Tailwind MCP available
- [x] All MCPs registered in `.cursor/mcp.json`

### ✅ Validation Workflow

- [x] Generate component from Figma
- [x] Validate React patterns
- [x] Check RSC boundaries
- [x] Validate tokens
- [x] Check Next.js compatibility
- [x] Verify design-code sync

---

## Best Practices

### 1. Always Validate Before Committing

```bash
# Run full validation
pnpm validate:component packages/ui/src/components/MyComponent.tsx
```

### 2. Use MCPs in Order

1. **Figma MCP** - Get design context
2. **Tailwind MCP** - Get tokens
3. **UI Generator MCP** - Generate code
4. **React MCP** - Validate patterns
5. **Next.js MCP** - Validate framework usage

### 3. Fix Issues Systematically

1. Fix React pattern issues first
2. Fix RSC boundary violations
3. Fix token compliance
4. Fix Next.js compatibility
5. Verify design-code sync

---

## Troubleshooting

### Issue: React MCP Not Available

**Solution:**
1. Check `.cursor/mcp.json` has `react-validation` entry
2. Verify path points to `.mcp/react/server.mjs`
3. Install dependencies: `pnpm add -D @modelcontextprotocol/sdk @babel/parser @babel/traverse`

### Issue: Next.js MCP Not Working

**Solution:**
1. Ensure Next.js 16+ is installed
2. Start dev server: `pnpm dev`
3. MCP endpoint available at `/_next/mcp`

### Issue: Figma MCP Not Connected

**Solution:**
1. Verify Figma authentication (we verified earlier - ✅ connected)
2. Check file permissions
3. Ensure file key and node ID are correct

### Issue: Token Mismatch

**Solution:**
1. Compare Figma tokens with Tailwind tokens
2. Update `globals.css` if needed
3. Re-validate component

---

## Quick Reference

### React MCP Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `validate_react_component` | Validate React patterns | After generating/editing component |
| `check_server_client_usage` | Check Server/Client usage | Before committing component |
| `validate_rsc_boundary` | Validate RSC boundaries | For all Server Components |
| `validate_imports` | Trace imports | When debugging RSC issues |

### Next.js MCP Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `nextjs_runtime` | Runtime diagnostics | Check app status |
| `nextjs_docs` | Search docs | Look up Next.js patterns |
| `nextjs_runtime_get_errors` | Get errors | Debug build issues |

### Figma MCP Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `get_design_context` | Get design specs | Before generating component |
| `get_variable_defs` | Get design tokens | Sync tokens from Figma |
| `get_code_connect_map` | Map components | Verify design-code sync |

### Tailwind MCP Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `read_tailwind_config` | Get tokens | Before generating component |
| `validate_tokens` | Validate tokens | After syncing from Figma |

---

## Summary

✅ **React MCP** - Validates React patterns and RSC boundaries  
✅ **Next.js MCP** - Validates Next.js patterns and runtime  
✅ **Figma MCP** - Syncs design and extracts tokens  
✅ **Tailwind MCP** - Validates tokens and theme  

**All MCPs work together** to ensure your components meet best practices across all dimensions!

---

**Last Updated:** 2024  
**Status:** ✅ Ready for Production Use

