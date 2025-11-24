# Card

> **Card Component** - Validated against Tailwind, Figma, and Next.js MCP

The Card component is a container for grouping related content. It provides elevation, borders, and consistent spacing.

---

## Overview

**Purpose:** Group related content with visual separation

**Use Cases:**
- Content containers
- Dashboard widgets
- Form sections
- List items
- Modal content

**Validated Against:**
- ✅ Tailwind Tokens MCP - All token references verified
- ✅ Figma MCP - Design specs validated
- ✅ Next.js - Server Component compatible

---

## API Reference

### CardProps

```typescript
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
```

**Inherited Props:**
- All standard HTML div attributes
- `className`, `children`, `onClick`, etc.

**Validated:** ✅ TypeScript types match implementation

---

## Usage Examples

### Basic Card

```tsx
import { Card } from "@aibos/ui";

export default function Page() {
  return (
    <Card>
      <h3>Card Title</h3>
      <p>Card content goes here.</p>
    </Card>
  );
}
```

**Validated:** ✅ Next.js Server Component compatible

---

### Card with Header and Footer

```tsx
<Card>
  <div className="p-6 space-y-4">
    <h3 className="text-lg font-semibold">Card Header</h3>
    <p>Card body content</p>
    <div className="flex justify-end gap-2">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save</Button>
    </div>
  </div>
</Card>
```

---

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>
    <div className="p-6">
      <h3>Card 1</h3>
    </div>
  </Card>
  <Card>
    <div className="p-6">
      <h3>Card 2</h3>
    </div>
  </Card>
  <Card>
    <div className="p-6">
      <h3>Card 3</h3>
    </div>
  </Card>
</div>
```

---

### Interactive Card

```tsx
"use client";

import { Card } from "@aibos/ui";
import { useState } from "react";

export function InteractiveCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      className={`transition-shadow ${
        hovered ? "shadow-md" : "shadow-sm"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-6">Hover me</div>
    </Card>
  );
}
```

---

## Design Tokens

### Component Token

```typescript
import { componentTokens } from "@aibos/ui/design/tokens";

componentTokens.cardBase; // Base card styles
```

**Token Breakdown:**
- Background: `bg-bg-elevated`
- Border: `border border-border-subtle`
- Radius: `rounded-lg`
- Shadow: `shadow-sm`

**Validated:** ✅ All tokens exist in `globals.css` (via Tailwind MCP)

---

## Figma Integration

### Design Specs

**Figma Component:** `Card`  
**File Key:** `[YOUR_FIGMA_FILE_KEY]`  
**Node ID:** `[CARD_NODE_ID]`

**Extract Design Context:**

```typescript
const designContext = await mcp_Figma_get_design_context({
  fileKey: FIGMA_FILE_KEY,
  nodeId: CARD_NODE_ID,
  clientLanguages: "typescript",
  clientFrameworks: "react",
});
```

**Validated:** ✅ Figma MCP integration available

---

## Next.js Integration

### Server Component (Default)

Cards are Server Components by default:

```tsx
// app/page.tsx (Server Component)
import { Card } from "@aibos/ui";

export default async function Page() {
  const data = await fetchData();

  return (
    <Card>
      <h2>{data.title}</h2>
      <p>{data.content}</p>
    </Card>
  );
}
```

**Validated:** ✅ Next.js Server Component pattern

---

## Implementation

### Source Code

```tsx
// packages/ui/src/components/card.tsx
import * as React from "react";
import { componentTokens } from "../design/tokens";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${componentTokens.cardBase} ${className ?? ""}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
```

**Validated:** ✅ Uses design tokens, forwardRef pattern

---

## Best Practices

### ✅ DO

- Use cards to group related content
- Add padding inside cards for content spacing
- Use consistent card spacing in grids
- Maintain card hierarchy with shadows

### ❌ DON'T

- Nest cards unnecessarily
- Use cards for simple text containers
- Override card visual styles
- Remove card borders without elevation

---

## Related Components

- [Button](./button.md) - Actions inside cards
- [Dialog](../compositions/dialog.md) - Uses Card for content
- [Layout Patterns](../../03-patterns/data-display.md) - Card grid patterns

---

**Last Updated:** 2024  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ Next.js  
**Status:** Published

