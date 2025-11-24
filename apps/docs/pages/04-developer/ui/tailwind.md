# Tailwind CSS Integration

> **Tailwind v4 configuration** for the AI-BOS design system.

This document describes how Tailwind CSS is configured to work with the AI-BOS design system tokens.

---

## Configuration Overview

Tailwind v4 is configured via **CSS-based configuration** (no `tailwind.config.ts` needed):

1. **CSS Variables** (`packages/ui/src/design/globals.css`) - Design tokens as CSS custom properties
2. **@theme Directive** (`packages/ui/src/design/globals.css`) - Tailwind v4 theme configuration

---

## Tailwind v4 Configuration

Tailwind v4 uses CSS-based configuration via the `@theme` directive. All theme tokens are defined in `globals.css`:

```css
/* packages/ui/src/design/globals.css */

/* 0. Tailwind v4 core */
@import "tailwindcss";

/* 1. Plugins */
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';

/* 2. Custom variants */
@custom-variant dark (&:where(.dark, .dark *));

/* 3. Semantic design tokens */
:root {
  --color-bg: #f9fafb;
  --color-bg-muted: #f3f4f6;
  --color-bg-elevated: #ffffff;
  --color-fg: #111827;
  --color-primary: #2563eb;
  /* ... all tokens ... */
}

/* 4. Tailwind v4 theme tokens (via @theme inline) */
@theme inline {
  --color-bg: var(--color-bg);
  --color-bg-muted: var(--color-bg-muted);
  --color-bg-elevated: var(--color-bg-elevated);
  --color-fg: var(--color-fg);
  --color-primary: var(--color-primary);
  /* ... all tokens exposed to Tailwind ... */
}
```

**Note:** Tailwind v4 automatically:
- ✅ Detects content (no `content` array needed)
- ✅ Uses `@theme` for theme configuration
- ✅ No `tailwind.config.ts` required

---

## Usage Rules

### ✅ Allowed Semantic Utilities

Use semantic utilities that map to design tokens:

**Surfaces:**
- `bg-bg`, `bg-bg-muted`, `bg-bg-elevated`

**Text:**
- `text-fg`, `text-fg-muted`, `text-fg-subtle`

**Accent:**
- `bg-primary`, `bg-primary-soft`, `text-primary-foreground`

**Border / Ring:**
- `border-border`, `border-border-subtle`, `ring-ring`

**Status:**
- `bg-success-soft`, `bg-danger-soft`, `bg-warning-soft`

### ❌ Forbidden

**Raw Tailwind Palette Colors:**
- `bg-emerald-500`, `text-slate-400`, `border-[#123456]`

**Arbitrary Values:**
- Any `bg-[...hex...]` / `text-[...rgb...]` / arbitrary color class

**Reason:** These bypass the design system and break theme consistency.

---

## Safelist

In Tailwind v4, safelist is typically not needed because:
- All tokens are defined in `@theme` and automatically available
- Content detection is automatic
- If safelist is needed, it can be added via CSS `@layer utilities`

**Note:** The previous `tailwind.config.ts` safelist is no longer needed as all classes are defined in `@theme`.

---

## Dark Mode

Dark mode is configured using the `@custom-variant` directive in CSS:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Toggle dark mode by adding/removing the `dark` class on the `<html>` element:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle("dark");
```

CSS variables automatically adapt based on the theme:

```css
:root {
  --bg-base: #ffffff; /* Light mode */
}

.dark {
  --bg-base: #0a0a0a; /* Dark mode */
}
```

---

## Token Mapping

All Tailwind utilities map to CSS custom properties defined in `packages/ui/src/design/globals.css`:

| Tailwind Utility | CSS Variable | Purpose |
|-----------------|--------------|---------|
| `bg-bg-elevated` | `--bg-elevated` | Card backgrounds |
| `text-fg-primary` | `--fg-primary` | Primary text |
| `border-border-subtle` | `--border-subtle` | Subtle borders |
| `bg-accent` | `--accent-bg` | Primary accent |
| `rounded-md` | `--radius-md` | Medium border radius |
| `shadow-sm` | `--shadow-sm` | Small shadow |

**📖 Complete Token Reference:** See [Token System](../01-foundation/tokens.md)

---

## Next.js Integration

In Next.js App Router, import the global CSS file:

```tsx
// app/layout.tsx
import "@aibos/ui/design/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

## Validation

The design system validator enforces Tailwind usage rules:

- ✅ Checks for raw Tailwind palette colors
- ✅ Validates semantic token usage
- ✅ Ensures no arbitrary color values

**📖 Validation Rules:** See [Governance Documentation](../GOVERNANCE.md)

---

## Related Documentation

- [Token System](../01-foundation/tokens.md) - Complete token reference
- [Colors](../01-foundation/colors.md) - Color system documentation
- [Next.js Integration](./nextjs.md) - Next.js App Router setup
- [Governance](../GOVERNANCE.md) - Design system rules

---

**Last Updated:** 2024  
**Maintained By:** AIBOS Design System Team

