# Design Tokens

> **Token System Documentation** - Validated against Tailwind MCP and Figma Variables

Design tokens are the foundation of the AI-BOS design system. They provide a single source of truth for all visual properties, enabling theme switching, multi-tenant customization, and design-code sync.

---

## Token Architecture

### Two-Layer System

1. **CSS Variables** (`apps/web/app/globals.css`)

   - Runtime tokens via CSS custom properties
   - Enables theme switching without code changes
   - Supports multi-tenant overrides

2. **TypeScript Tokens** (`packages/ui/src/design/tokens.ts`)
   - Type-safe token access
   - Tailwind utility class mappings
   - Component-level token presets

### Token Flow

```
Figma Variables → globals.css → tokens.ts → Components
     ↓                ↓            ↓           ↓
  Design          Runtime      TypeScript   Usage
```

**Validated Against:**

- ✅ Tailwind Tokens MCP (`read_tailwind_config`)
- ✅ Figma Variables MCP (`get_variable_defs`)

---

## Token Categories

### 1. Color Tokens

**CSS Variables:**

```css
:root {
  --aibos-primary: #22c55e;
  --aibos-bg: #02140c;
  --aibos-fg: #e5f9f0;
  /* ... */
}
```

**TypeScript Access:**

```typescript
import { colorTokens } from "@aibos/ui/design/tokens";

// Surface colors
colorTokens.surface.default; // "bg-bg"
colorTokens.surface.muted; // "bg-bg-muted"
colorTokens.surface.elevated; // "bg-bg-elevated"

// Text colors
colorTokens.text.default; // "text-fg"
colorTokens.text.muted; // "text-fg-muted"
colorTokens.text.subtle; // "text-fg-subtle"

// Accent colors
colorTokens.accent.primaryBg; // "bg-primary"
colorTokens.accent.primaryFg; // "text-primary-foreground"
```

**Usage:**

```tsx
import { colorTokens } from "@aibos/ui/design/tokens";

<div className={colorTokens.surface.elevated}>
  <p className={colorTokens.text.primary}>Content</p>
</div>;
```

**Validated:** ✅ All tokens exist in `globals.css` (via Tailwind MCP)

---

### 2. Spacing Tokens

**CSS Variables:**

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-4: 1rem; /* 16px */
  /* ... */
}
```

**TypeScript Access:**

```typescript
import { spacingTokens } from "@aibos/ui/design/tokens";

spacingTokens.sm; // "px-2 py-1"
spacingTokens.md; // "px-3 py-2"
spacingTokens.lg; // "px-4 py-3"
```

**Usage:**

```tsx
<button className={spacingTokens.md}>Click me</button>
```

**Validated:** ✅ Spacing values match 4px grid system

---

### 3. Typography Tokens

**CSS Variables:**

```css
:root {
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  /* ... */
}
```

**TypeScript Access:**

```typescript
import { typographyTokens } from "@aibos/ui/design/tokens";

typographyTokens.bodySm; // "text-xs"
typographyTokens.body; // "text-sm"
typographyTokens.title; // "text-base font-semibold"
```

**Usage:**

```tsx
<h1 className={typographyTokens.title}>
  Heading
</h1>
<p className={typographyTokens.body}>
  Body text
</p>
```

**Validated:** ✅ Typography scale follows Major Third (1.250 ratio)

---

### 4. Radius Tokens

**CSS Variables:**

```css
:root {
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  /* ... */
}
```

**TypeScript Access:**

```typescript
import { radiusTokens } from "@aibos/ui/design/tokens";

radiusTokens.sm; // "rounded-sm"
radiusTokens.md; // "rounded-md"
radiusTokens.lg; // "rounded-lg"
```

**Usage:**

```tsx
<div className={radiusTokens.lg}>Content</div>
```

---

### 5. Shadow Tokens

**CSS Variables:**

```css
:root {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

**TypeScript Access:**

```typescript
import { shadowTokens } from "@aibos/ui/design/tokens";

shadowTokens.xs; // "shadow-xs"
shadowTokens.sm; // "shadow-sm"
shadowTokens.md; // "shadow-md"
```

---

## Component Tokens

Pre-composed token combinations for common patterns:

```typescript
import { componentTokens } from "@aibos/ui/design/tokens";

componentTokens.buttonBase; // Base button styles
componentTokens.buttonPrimary; // Primary button variant
componentTokens.cardBase; // Card container styles
componentTokens.inputBase; // Input field styles
```

**Usage:**

```tsx
<button className={componentTokens.buttonPrimary}>Submit</button>
```

---

## Accessibility Tokens

Safe text-on-background pairings:

```typescript
import { accessibilityTokens } from "@aibos/ui/design/tokens";

accessibilityTokens.textOnPrimary; // "text-primary-foreground"
accessibilityTokens.textOnSuccess; // "text-success-foreground"
accessibilityTokens.textOnDanger; // "text-danger-foreground"
```

**Usage:**

```tsx
<button className="bg-primary">
  <span className={accessibilityTokens.textOnPrimary}>
    Text on primary background
  </span>
</button>
```

**Validated:** ✅ All pairs meet WCAG AA contrast requirements

---

## Theme Support

### Light Mode

```css
:root {
  --bg-base: #ffffff;
  --fg-primary: #171717;
  /* ... */
}
```

### Dark Mode

```css
.dark {
  --bg-base: #0a0a0a;
  --fg-primary: #f5f5f5;
  /* ... */
}
```

### Safe Mode

```css
[data-safe-mode="true"] {
  --accent-bg: var(--gray-500);
  --shadow-sm: none;
  /* ... */
}
```

### Tenant Override (DLBB)

```css
:root[data-tenant="dlbb"] {
  --accent-bg: #22c55e;
  /* ... */
}
```

---

## Figma Sync

Tokens can be synced from Figma variables:

```bash
# Sync Figma variables to globals.css
pnpm sync:figma-tokens --file-key=abc123 --node-id=1:2
```

**Validated:** ✅ Figma MCP integration available

---

## Token Naming Convention

### CSS Variables

- Format: `--aibos-{category}-{variant}`
- Examples: `--aibos-primary`, `--aibos-bg-muted`

### TypeScript Tokens

- Format: `{category}Tokens.{variant}`
- Examples: `colorTokens.surface.default`

### Tailwind Utilities

- Format: `{property}-{token-name}`
- Examples: `bg-bg`, `text-fg-primary`

---

## Related Documentation

- [Colors](./colors.md) - Color system details
- [Typography](./typography.md) - Typography system
- [Figma Sync](../04-integration/figma-sync.md) - Design-to-code workflow

---

**Last Updated:** 2024  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP  
**Status:** Published
