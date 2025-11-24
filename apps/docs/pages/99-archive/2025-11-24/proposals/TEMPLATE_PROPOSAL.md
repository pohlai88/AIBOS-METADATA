# Component Documentation Template - Optimization Proposal

> **Template Refinement** - Optimized for API, Refactoring, AI, and MCP Extraction

**Status:** Proposal  
**Issue:** Current format not optimized for automated extraction and AI consumption

---

## Problem Statement

### Current Template Issues

1. **Not Machine-Readable**

   - Markdown format hard to parse programmatically
   - No structured data format
   - Difficult for AI/MCP to extract information

2. **Not API-Optimized**

   - No clear API schema definition
   - Props scattered in examples
   - No type definitions in structured format

3. **Not Refactoring-Friendly**

   - Changes require manual updates
   - No single source of truth for API
   - Documentation drifts from code

4. **Not MCP-Compatible**
   - Cannot be validated via MCP
   - No structured format for MCP tools
   - Hard to sync with Figma/design tools

---

## Proposed Solution: Hybrid Template

### Architecture

```
Component Documentation
    ↓
┌─────────────────────────────────────┐
│  Structured Data (JSON/YAML)       │
│  • API Schema                       │
│  • Props Definition                 │
│  • Token Usage                      │
│  • Validation Rules                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Generated Markdown                 │
│  • Human-readable docs              │
│  • Examples                         │
│  • Best practices                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  MCP Integration                   │
│  • Validation                       │
│  • Code generation                 │
│  • Design sync                     │
└─────────────────────────────────────┘
```

---

## Template Structure

### 1. Component Schema (JSON/YAML)

**File:** `02-components/primitives/button.schema.json`

```json
{
  "component": {
    "name": "Button",
    "path": "packages/ui/src/components/button.tsx",
    "category": "primitives",
    "description": "Fundamental interactive element for triggering actions",
    "status": "published"
  },
  "api": {
    "props": {
      "variant": {
        "type": "ButtonVariant",
        "default": "primary",
        "required": false,
        "options": ["primary", "secondary", "ghost"],
        "description": "Button variant style"
      },
      "className": {
        "type": "string",
        "required": false,
        "description": "Additional CSS classes for layout only"
      }
    },
    "inherits": "React.ButtonHTMLAttributes<HTMLButtonElement>",
    "returns": "React.ForwardRefExoticComponent<ButtonProps>"
  },
  "tokens": {
    "primary": {
      "componentToken": "componentTokens.buttonPrimary",
      "cssVariables": ["--color-primary", "--color-primary-foreground"],
      "tailwindClasses": ["bg-primary", "text-primary-foreground"]
    },
    "secondary": {
      "componentToken": "componentTokens.buttonSecondary",
      "cssVariables": ["--color-border-subtle", "--color-bg-elevated"]
    },
    "ghost": {
      "componentToken": "componentTokens.buttonGhost",
      "cssVariables": ["transparent", "--color-bg-muted"]
    }
  },
  "validation": {
    "tailwind": {
      "tool": "mcp_tailwind-tokens_read_tailwind_config",
      "tokens": ["--color-primary", "--color-primary-foreground"],
      "status": "validated"
    },
    "figma": {
      "tool": "mcp_Figma_get_design_context",
      "fileKey": "[FIGMA_FILE_KEY]",
      "nodeId": "[BUTTON_NODE_ID]",
      "status": "validated"
    },
    "nextjs": {
      "serverComponent": true,
      "clientComponent": false,
      "patterns": ["Server Actions", "Form submission"],
      "status": "validated"
    }
  },
  "examples": [
    {
      "id": "basic",
      "title": "Basic Usage",
      "code": "import { Button } from '@aibos/ui';\n\n<Button variant='primary'>Submit</Button>",
      "description": "Simple button with primary variant"
    },
    {
      "id": "with-icon",
      "title": "With Icon",
      "code": "import { Button, Icon } from '@aibos/ui';\nimport { PlusIcon } from '@heroicons/react/24/outline';\n\n<Button variant='primary'>\n  <Icon icon={PlusIcon} size='sm' className='mr-2' />\n  Add Item\n</Button>",
      "description": "Button with icon"
    }
  ],
  "accessibility": {
    "keyboard": ["Tab", "Enter", "Space", "Escape"],
    "aria": {
      "required": ["aria-label for icon-only buttons"],
      "optional": ["aria-busy", "aria-disabled"]
    },
    "wcag": "AA compliant"
  },
  "related": {
    "components": ["Card", "Dialog"],
    "patterns": ["forms", "navigation"]
  }
}
```

---

### 2. Generated Markdown (Auto-Generated)

**File:** `02-components/primitives/button.md` (generated from schema)

```markdown
# Button

> **Button Component** - Validated against Tailwind, Figma, and Next.js MCP

[Auto-generated from button.schema.json]

## API Reference

### Props

| Prop      | Type            | Default     | Required | Description                            |
| --------- | --------------- | ----------- | -------- | -------------------------------------- |
| variant   | `ButtonVariant` | `"primary"` | No       | Button variant style                   |
| className | `string`        | -           | No       | Additional CSS classes for layout only |

**Inherited Props:** `React.ButtonHTMLAttributes<HTMLButtonElement>`

## Variants

### Primary

**Token Usage:**

- Component Token: `componentTokens.buttonPrimary`
- CSS Variables: `--color-primary`, `--color-primary-foreground`
- Tailwind Classes: `bg-primary`, `text-primary-foreground`

**Validated:** ✅ Tailwind MCP | ✅ Figma MCP

## Examples

### Basic Usage

\`\`\`tsx
import { Button } from '@aibos/ui';

<Button variant='primary'>Submit</Button>
\`\`\`

[More examples from schema...]

## Validation Status

- ✅ Tailwind Tokens MCP - All tokens verified
- ✅ Figma MCP - Design context validated
- ✅ Next.js - Server Component compatible

[Auto-generated from validation section...]
```

---

### 3. MCP Integration Layer

**File:** `tools/mcp-component-docs.mjs`

```javascript
// MCP tool for component documentation
export async function getComponentSchema(componentName) {
  const schemaPath = `packages/ui/ui-docs/02-components/**/${componentName}.schema.json`;
  const schema = await readFile(schemaPath);
  return JSON.parse(schema);
}

export async function validateComponentDocs(componentName) {
  const schema = await getComponentSchema(componentName);

  // Validate tokens via Tailwind MCP
  const tailwindValidation = await mcp_tailwind_tokens_read_tailwind_config();
  const tokenValidation = validateTokens(schema.tokens, tailwindValidation);

  // Validate design via Figma MCP
  const figmaValidation = await mcp_Figma_get_design_context({
    fileKey: schema.validation.figma.fileKey,
    nodeId: schema.validation.figma.nodeId,
  });

  return {
    component: componentName,
    valid: tokenValidation.valid && figmaValidation.valid,
    issues: [...tokenValidation.issues, ...figmaValidation.issues],
  };
}

export async function generateComponentFromDocs(componentName, description) {
  const schema = await getComponentSchema(componentName);

  // Use schema to generate component code
  const code = await generateCode({
    api: schema.api,
    tokens: schema.tokens,
    description,
  });

  return code;
}
```

---

## Benefits

### ✅ Machine-Readable

- **JSON/YAML schema** - Easy to parse
- **Structured data** - No ambiguity
- **API-first** - Clear schema definition

### ✅ AI-Optimized

- **Structured format** - AI can extract information easily
- **Code generation** - Schema → Code
- **Validation** - Schema → Validation rules

### ✅ MCP-Compatible

- **MCP tools** can read schema directly
- **Validation** via MCP servers
- **Code generation** from schema

### ✅ Refactoring-Friendly

- **Single source of truth** - Schema defines API
- **Auto-generated docs** - Always in sync
- **Type safety** - Schema → TypeScript types

### ✅ Maintainable

- **Schema changes** → Docs update automatically
- **Validation** catches drift
- **MCP tools** ensure consistency

---

## Migration Plan

### Phase 1: Schema Creation

1. Create schema for existing components (Button, Card, Input, Badge, Dialog, AppShell)
2. Validate schema structure
3. Test MCP integration

### Phase 2: Auto-Generation

1. Build markdown generator from schema
2. Generate docs for existing components
3. Compare with current docs

### Phase 3: Full Migration

1. Migrate all components to schema format
2. Remove manual markdown
3. Enable MCP validation

---

## Example: Button Component

### Before (Current)

````markdown
# Button

## API Reference

### ButtonProps

```typescript
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}
```
````

[Manual documentation...]

```

### After (Proposed)

**Schema:** `button.schema.json` (structured data)
**Markdown:** `button.md` (auto-generated from schema)
**MCP:** Direct access to schema via MCP tools

---

## Implementation

### Tools Needed

1. **Schema Validator** - Validate JSON schema
2. **Markdown Generator** - Schema → Markdown
3. **MCP Integration** - Schema → MCP tools
4. **Type Generator** - Schema → TypeScript types

### File Structure

```

02-components/
├── primitives/
│ ├── button.schema.json # Structured data
│ ├── button.md # Auto-generated
│ ├── button.types.ts # Auto-generated types
│ └── ...
├── compositions/
│ └── ...
└── layouts/
└── ...

```

---

## Next Steps

1. **Approve Template** - Review and approve schema format
2. **Create Schema** - Convert existing docs to schema
3. **Build Generator** - Create markdown generator
4. **MCP Integration** - Connect MCP tools to schema
5. **Migrate Components** - Convert all components

---

**Status:** Proposal
**Priority:** High
**Estimated Effort:** 1 week for Phase 1

---

**Last Updated:** 2024

```
