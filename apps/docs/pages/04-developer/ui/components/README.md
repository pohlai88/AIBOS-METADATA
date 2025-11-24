# Component Documentation

> **Component API and Usage Documentation** - Validated against Tailwind, Figma, and Next.js MCP

This directory contains documentation for all UI components in the `@aibos/ui` package. All components are validated against design tokens, Figma designs, and Next.js best practices.

---

## Component Categories

### Primitives (`primitives/`)

Simple, atomic components built without external dependencies:

- **Button** - Primary, secondary, ghost variants
- **Card** - Container component
- **Input** - Form input field
- **Badge** - Status and label badges
- **Icon** - Icon wrapper component
- **Label** - Form label
- **Separator** - Visual divider
- **Avatar** - User avatar display
- **AspectRatio** - Aspect ratio container

**Characteristics:**

- No Radix dependencies
- Use `componentTokens` presets
- Simple props interface
- Server Component compatible (unless interactive)

---

### Compositions (`compositions/`)

Complex components built on Radix UI primitives:

- **Dialog** - Modal dialogs
- **AlertDialog** - Confirmation dialogs
- **DropdownMenu** - Dropdown menus
- **Popover** - Popover overlays
- **Tooltip** - Tooltip overlays
- **Accordion** - Collapsible sections
- **Tabs** - Tab navigation
- **Select** - Select dropdowns
- **Checkbox** - Checkbox input
- **RadioGroup** - Radio button groups
- **Switch** - Toggle switch
- **Slider** - Range slider
- **Progress** - Progress indicator
- **Toast** - Toast notifications
- **ContextMenu** - Context menus
- **Menubar** - Menu bar
- **NavigationMenu** - Navigation menu
- **HoverCard** - Hover card
- **Collapsible** - Collapsible content
- **ScrollArea** - Custom scroll area
- **Toggle** - Toggle button
- **ToggleGroup** - Toggle button group
- **Toolbar** - Toolbar container
- **OneTimePasswordField** - OTP input
- **PasswordToggleField** - Password input with toggle

**Characteristics:**

- Built on Radix UI primitives
- Client Component (`"use client"`)
- Complex behavior and accessibility
- Multiple sub-components

---

### Layouts (`layouts/`)

Layout and structural components:

- **AppShell** - Complete application shell
- **Header** - Page header
- **Sidebar** - Sidebar navigation
- **ContentArea** - Main content container
- **Navigation** - Navigation component

**Characteristics:**

- Composed from primitives and compositions
- Client Component for interactivity
- Responsive design
- Full keyboard navigation

---

## Component Documentation Structure

Each component document includes:

1. **Overview** - Purpose and use cases
2. **API Reference** - Props, types, interfaces
3. **Usage Examples** - Basic and advanced examples
4. **Variants** - Available variants and options
5. **Accessibility** - ARIA attributes and keyboard navigation
6. **Figma Link** - Link to Figma design (if available)
7. **Next.js Integration** - Server/Client Component usage
8. **Token Usage** - Design tokens used
9. **Validation** - MCP validation status

---

## Validation Requirements

All component documentation **MUST** be validated against:

### ✅ Tailwind Tokens MCP

- Verify all token references exist in `globals.css`
- Validate token naming conventions
- Check token usage patterns

**Tool:** `mcp_tailwind-tokens_read_tailwind_config`

### ✅ Figma MCP

- Link to Figma component design
- Validate design-code sync
- Extract component specs from Figma

**Tools:**

- `mcp_Figma_get_design_context`
- `mcp_Figma_get_code_connect_map`

### ✅ Next.js Best Practices

- Verify Server/Client Component usage
- Check App Router compatibility
- Validate React patterns

**Validation:** Code review and Next.js runtime checks

---

## Component Patterns

### Primitive Pattern

```tsx
// packages/ui/src/components/button.tsx
import * as React from "react";
import { componentTokens } from "../design/tokens";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => {
    const base = componentTokens.buttonPrimary; // or variant-based

    return (
      <button ref={ref} className={`${base} ${className ?? ""}`} {...props} />
    );
  }
);

Button.displayName = "Button";
```

**Validated:** ✅ Uses design tokens, forwardRef pattern, Next.js compatible

---

### Composition Pattern (Radix-based)

```tsx
// packages/ui/src/components/dialog.tsx
"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { componentTokens, colorTokens } from "../design/tokens";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={colorTokens.bgOverlay} />
        <DialogPrimitive.Content
          ref={ref}
          className={`${componentTokens.cardBase} ${className ?? ""}`}
          {...props}
        />
      </DialogPrimitive.Portal>
    );
  }
);
```

**Validated:** ✅ Radix integration, token usage, Client Component

---

## Server vs Client Components

### Server Components (Default)

Primitives that don't require interactivity:

- **Card** - Static container
- **Separator** - Visual divider
- **AspectRatio** - Layout container
- **Avatar** - Display component

**Usage:**

```tsx
// No "use client" directive needed
import { Card } from "@aibos/ui";

export default function Page() {
  return <Card>Content</Card>;
}
```

### Client Components

Components requiring interactivity or browser APIs:

- **Button** - Click handlers
- **Input** - Form inputs
- **Dialog** - Modal interactions
- **All Radix-based components** - Require client-side behavior

**Usage:**

```tsx
// Component file has "use client"
"use client";

import { Button } from "@aibos/ui";

export function InteractiveComponent() {
  return <Button onClick={() => alert("Clicked")}>Click</Button>;
}
```

**Validated:** ✅ Next.js App Router patterns

---

## Figma Integration

### Code Connect Mapping

Components can be mapped to Figma designs:

```typescript
// Get Code Connect mapping
const codeConnect = await mcp_Figma_get_code_connect_map({
  fileKey: FIGMA_FILE_KEY,
});

// Example mapping
{
  "figma:Button": "packages/ui/src/components/button.tsx",
  "figma:Card": "packages/ui/src/components/card.tsx",
}
```

### Design Context Extraction

Extract component specs from Figma:

```typescript
const designContext = await mcp_Figma_get_design_context({
  fileKey: FIGMA_FILE_KEY,
  nodeId: COMPONENT_NODE_ID,
  clientLanguages: "typescript",
  clientFrameworks: "react",
});
```

**Validated:** ✅ Figma MCP integration available

---

## Related Documentation

- [Foundation](../01-foundation/) - Design tokens and principles
- [Patterns](../03-patterns/) - Design patterns and recipes
- [Integration](../04-integration/) - Framework integration guides

---

**Last Updated:** 2024  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ Next.js  
**Status:** In Progress
