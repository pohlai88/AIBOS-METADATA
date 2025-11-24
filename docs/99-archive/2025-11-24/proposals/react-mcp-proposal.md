# React MCP Proposal

> **Proposal for React MCP Integration** - Component validation and best practices

This document proposes a React MCP (Model Context Protocol) server to validate React component patterns, Server/Client Component usage, and React best practices.

---

## Problem Statement

Currently, we validate components against:

- ✅ **Tailwind Tokens MCP** - Token usage accuracy
- ✅ **Figma MCP** - Design-code sync
- ✅ **Next.js MCP** - Framework best practices

However, we lack validation for:

- ❌ React-specific patterns (hooks, refs, forwardRef)
- ❌ Server vs Client Component usage
- ❌ React rendering patterns
- ❌ Component API consistency
- ❌ React performance best practices

---

## Proposed React MCP Server

### Purpose

Validate React components against:

1. React best practices
2. Server/Client Component patterns
3. Hook usage rules
4. Ref forwarding patterns
5. Component API consistency
6. Performance optimizations

---

## MCP Tools

### 1. `validate_react_component`

**Purpose:** Validate a React component file against best practices

**Input:**

```typescript
{
  filePath: string; // Path to component file
  componentName?: string; // Optional component name
}
```

**Output:**

```typescript
{
  valid: boolean;
  errors: Array<{
    type: string;
    message: string;
    line: number;
    suggestion?: string;
  }>;
  warnings: Array<{
    type: string;
    message: string;
    line: number;
  }>;
  suggestions: Array<string>;
}
```

**Validations:**

- ✅ Uses `forwardRef` when needed
- ✅ Sets `displayName`
- ✅ Correct Server/Client Component usage
- ✅ Hook usage follows rules
- ✅ Props interface extends correct HTML attributes
- ✅ No direct DOM manipulation
- ✅ Proper TypeScript types

---

### 2. `check_server_client_usage`

**Purpose:** Verify Server/Client Component usage is correct

**Input:**

```typescript
{
  filePath: string;
}
```

**Output:**

```typescript
{
  isClientComponent: boolean;
  shouldBeClient: boolean;
  reason: string;
  issues: Array<{
    type:
      | "missing-directive"
      | "unnecessary-directive"
      | "hook-usage"
      | "browser-api";
    message: string;
    line: number;
  }>;
}
```

**Checks:**

- ✅ `"use client"` directive when needed
- ✅ No `"use client"` when not needed
- ✅ Hook usage (useState, useEffect, etc.)
- ✅ Browser API usage (window, document, etc.)
- ✅ Event handlers (onClick, onChange, etc.)

---

### 3. `validate_component_api`

**Purpose:** Validate component API consistency

**Input:**

```typescript
{
  componentPath: string;
  expectedProps?: Record<string, any>; // Optional expected API
}
```

**Output:**

```typescript
{
  valid: boolean;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  missingProps: Array<string>;
  extraProps: Array<string>;
  inconsistencies: Array<{
    prop: string;
    issue: string;
  }>;
}
```

**Validations:**

- ✅ Props interface extends correct base types
- ✅ Required vs optional props
- ✅ Prop naming conventions
- ✅ Type consistency

---

### 4. `check_react_patterns`

**Purpose:** Check React patterns and best practices

**Input:**

```typescript
{
  filePath: string;
}
```

**Output:**

```typescript
{
  patterns: {
    forwardRef: boolean;
    displayName: boolean;
    propTypes?: boolean; // If using prop-types
    memo?: boolean; // If using React.memo
  };
  issues: Array<{
    pattern: string;
    missing: boolean;
    suggestion: string;
  }>;
  performance: {
    unnecessaryRerenders: Array<{
      component: string;
      reason: string;
    }>;
    missingOptimizations: Array<string>;
  };
}
```

---

### 5. `validate_hook_usage`

**Purpose:** Validate React hook usage

**Input:**

```typescript
{
  filePath: string;
}
```

**Output:**

```typescript
{
  valid: boolean;
  hooks: Array<{
    name: string;
    line: number;
    valid: boolean;
    issue?: string;
  }>;
  violations: Array<{
    hook: string;
    rule: string;
    line: number;
    message: string;
  }>;
}
```

**Validations:**

- ✅ Hooks called at top level
- ✅ Hooks in correct order
- ✅ No conditional hook calls
- ✅ Proper dependency arrays
- ✅ Custom hook patterns

---

## Implementation Plan

### Phase 1: Basic Validation

**Tools:**

1. `validate_react_component` - Basic component validation
2. `check_server_client_usage` - Server/Client Component check

**Implementation:**

```typescript
// tools/mcp-react-validation.mjs
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

// Parse React component
function parseComponent(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const ast = parse(content, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
  return ast;
}

// Validate component
function validateComponent(ast: any) {
  const issues = [];

  // Check for forwardRef
  // Check for displayName
  // Check for "use client"
  // Check hook usage

  return issues;
}
```

---

### Phase 2: Advanced Validation

**Tools:** 3. `validate_component_api` - API consistency 4. `check_react_patterns` - Pattern validation 5. `validate_hook_usage` - Hook validation

---

### Phase 3: Integration

**Integration Points:**

- CI/CD pipeline
- Pre-commit hooks
- Documentation validation
- Component generation validation

---

## Usage Examples

### Validate Component

```typescript
// Validate a component
const result = await mcp_React_validate_react_component({
  filePath: "packages/ui/src/components/button.tsx",
});

if (!result.valid) {
  console.error("Component validation failed:");
  result.errors.forEach((error) => {
    console.error(`  ${error.type}: ${error.message} (line ${error.line})`);
  });
}
```

### Check Server/Client Usage

```typescript
// Check if component should be Client Component
const check = await mcp_React_check_server_client_usage({
  filePath: "packages/ui/src/components/dialog.tsx",
});

if (check.shouldBeClient && !check.isClientComponent) {
  console.warn(`Missing "use client" directive: ${check.reason}`);
}
```

---

## Benefits

### For Documentation

- ✅ Validate component examples are correct
- ✅ Ensure Server/Client Component patterns are documented
- ✅ Verify React patterns in code examples

### For Development

- ✅ Catch React pattern violations early
- ✅ Ensure consistent component APIs
- ✅ Validate hook usage
- ✅ Optimize component performance

### For AI Generation

- ✅ Validate generated components
- ✅ Ensure generated code follows React best practices
- ✅ Check Server/Client Component usage

---

## Integration with Existing MCPs

### Workflow

```
Component Code
    ↓
React MCP (validate patterns)
    ↓
Tailwind MCP (validate tokens)
    ↓
Figma MCP (validate design sync)
    ↓
Next.js MCP (validate framework usage)
    ↓
Documentation
```

---

## Recommended Implementation

### Option 1: Custom MCP Server

Create `tools/mcp-react-validation.mjs`:

```javascript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import fs from "fs";

const server = new Server({
  name: "react-validation",
  version: "1.0.0",
});

// Implement tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Validate component
  // Check Server/Client usage
  // Validate hooks
  // etc.
});
```

### Option 2: Use Existing Tools

Leverage existing React linting tools:

- ESLint with React plugins
- TypeScript compiler
- React DevTools

Wrap in MCP interface for consistency.

---

## Next Steps

1. **Evaluate Options** - Custom MCP vs wrapping existing tools
2. **Implement Phase 1** - Basic validation tools
3. **Integrate with CI/CD** - Automated validation
4. **Update Documentation** - Add React MCP validation
5. **Extend to Phase 2** - Advanced validation

---

## Related Documentation

- [MCP Integration](./mcp.md) - General MCP usage
- [Next.js Integration](./nextjs.md) - Next.js patterns
- [Component Documentation](../02-components/) - Component docs

---

**Status:** Proposal  
**Priority:** High  
**Estimated Effort:** 2-3 days for Phase 1

---

**Last Updated:** 2024  
**Next Review:** After Phase 1 implementation
