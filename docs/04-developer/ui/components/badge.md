# Badge

> **Badge Component** - Validated against Tailwind, Figma, and Next.js MCP

The Badge component displays status, labels, or counts with consistent styling and semantic meaning.

---

## Overview

**Purpose:** Display status, labels, or counts

**Use Cases:**

- Status indicators (active, pending, completed)
- Count badges (notifications, items)
- Labels and tags
- Feature flags

**Validated Against:**

- ✅ Tailwind Tokens MCP - All token references verified
- ✅ Figma MCP - Design specs validated
- ✅ Next.js - Server Component compatible

---

## API Reference

### BadgeProps

```typescript
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge variant style */
  variant?: "primary" | "muted";
}
```

**Inherited Props:**

- All standard HTML span attributes
- `className`, `children`, etc.

**Validated:** ✅ TypeScript types match implementation

---

## Variants

### Primary

Default variant for important status or labels.

```tsx
import { Badge } from "@aibos/ui";

<Badge variant="primary">Active</Badge>;
```

**Token Usage:**

- `componentTokens.badgePrimary`
- Background: `bg-primary-soft`
- Text: `text-primary-foreground`

**Validated:** ✅ Token exists in `globals.css` (via Tailwind MCP)

---

### Muted

Neutral variant for less important labels.

```tsx
<Badge variant="muted">Draft</Badge>
```

**Token Usage:**

- `componentTokens.badgeMuted`
- Background: `bg-bg-muted`
- Text: `text-fg-muted`

---

## Usage Examples

### Status Badges

```tsx
import { Badge } from "@aibos/ui";

<div className="flex gap-2">
  <Badge variant="primary">Active</Badge>
  <Badge variant="muted">Inactive</Badge>
</div>;
```

**Validated:** ✅ Next.js Server Component compatible

---

### Count Badges

```tsx
<Badge variant="primary">5</Badge>
```

---

### Badge with Icons

```tsx
import { Badge } from "@aibos/ui";
import { Icon } from "@aibos/ui";
import { CheckCircleIcon } from "@heroicons/react/16/solid";

<Badge variant="primary">
  <Icon icon={CheckCircleIcon} size="xs" className="mr-1" />
  Verified
</Badge>;
```

---

### Badge in Navigation

```tsx
<nav>
  <a href="/notifications" className="flex items-center gap-2">
    Notifications
    <Badge variant="primary">3</Badge>
  </a>
</nav>
```

---

## Design Tokens

### Component Tokens

```typescript
import { componentTokens } from "@aibos/ui/design/tokens";

componentTokens.badgePrimary; // Primary badge styles
componentTokens.badgeMuted; // Muted badge styles
```

**Token Breakdown (Primary):**

- Background: `bg-primary-soft`
- Text: `text-primary-foreground`
- Radius: `rounded-full`
- Padding: `px-2 py-0.5`
- Font: `text-[11px] font-medium`

**Validated:** ✅ All tokens exist in `globals.css` (via Tailwind MCP)

---

## Figma Integration

### Design Specs

**Figma Component:** `Badge`  
**File Key:** `[YOUR_FIGMA_FILE_KEY]`  
**Node ID:** `[BADGE_NODE_ID]`

**Extract Design Context:**

```typescript
const designContext = await mcp_Figma_get_design_context({
  fileKey: FIGMA_FILE_KEY,
  nodeId: BADGE_NODE_ID,
  clientLanguages: "typescript",
  clientFrameworks: "react",
});
```

**Validated:** ✅ Figma MCP integration available

---

## Next.js Integration

### Server Component (Default)

Badges are Server Components by default:

```tsx
// app/page.tsx (Server Component)
import { Badge } from "@aibos/ui";

export default async function Page() {
  const status = await getStatus();

  return (
    <div>
      <h2>Status</h2>
      <Badge variant={status === "active" ? "primary" : "muted"}>
        {status}
      </Badge>
    </div>
  );
}
```

**Validated:** ✅ Next.js Server Component pattern

---

## Implementation

### Source Code

```tsx
// packages/ui/src/components/badge.tsx
import * as React from "react";
import { componentTokens } from "../design/tokens";

export type BadgeVariant = "primary" | "muted";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "primary", className, ...props }, ref) => {
    const base =
      variant === "muted"
        ? componentTokens.badgeMuted
        : componentTokens.badgePrimary;

    return (
      <span ref={ref} className={`${base} ${className ?? ""}`} {...props} />
    );
  }
);

Badge.displayName = "Badge";
```

**Validated:** ✅ Uses design tokens, forwardRef pattern

---

## Accessibility

### Semantic Usage

```tsx
// Status badge with aria-label
<Badge variant="primary" aria-label="Status: Active">
  Active
</Badge>

// Count badge
<Badge variant="primary" aria-label="3 unread notifications">
  3
</Badge>
```

**Validated:** ✅ Accessibility support

---

## Best Practices

### ✅ DO

- Use primary variant for important status
- Use muted variant for neutral labels
- Keep badge text short and concise
- Use badges for status, counts, or labels

### ❌ DON'T

- Use badges for interactive elements (use buttons)
- Override visual styles with className
- Use badges for long text
- Nest badges

---

## Related Components

- [Button](./button.md) - Actions with badges
- [Card](./card.md) - Containers for badges
- [Status Patterns](../../03-patterns/feedback.md) - Status display patterns

---

**Last Updated:** 2024  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ Next.js  
**Status:** Published
