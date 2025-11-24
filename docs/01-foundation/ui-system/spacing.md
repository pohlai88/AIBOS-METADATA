# Spacing System

> **4px Base Grid System** - Validated against Tailwind MCP

The AI-BOS spacing system uses a 4px base grid for perfect pixel alignment across all screen densities. All spacing values are multiples of 4px.

---

## 4px Base Grid

### Why 4px?

- **Perfect pixel alignment** - Works on 1x, 2x, 3x screen densities
- **Industry standard** - Material Design, Apple HIG
- **Flexible** - Provides fine-grained control without being too granular
- **Consistent** - Easy to maintain and scale

**Alternatives Considered:**

- **8px** - Too large for compact UIs, loses flexibility
- **2px** - Too granular, harder to maintain consistency
- **4px** - Optimal balance between flexibility and consistency

**Validated:** ✅ Spacing values match 4px grid system

---

## Spacing Scale

### Standard Spacing Values

```
0px   (0)     - Reset, no spacing
4px   (1)     - Tight padding, minimal gaps
8px   (2)     - Small gaps, compact layouts ← Most common
12px  (3)     - Compact layouts, form rows
16px  (4)     - Default gaps, standard padding ← Default
20px  (5)     - Medium spacing
24px  (6)     - Section spacing, card padding
32px  (8)     - Large sections, modal padding
48px  (12)    - Page sections, hero spacing
64px  (16)    - Hero sections, major breaks
```

**CSS Variables:**

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
}
```

**TypeScript Access:**

```typescript
import { spacingTokens } from "@aibos/ui/design/tokens";

spacingTokens.sm; // "px-2 py-1"  (8px horizontal, 4px vertical)
spacingTokens.md; // "px-3 py-2"  (12px horizontal, 8px vertical)
spacingTokens.lg; // "px-4 py-3"  (16px horizontal, 12px vertical)
```

**Usage:**

```tsx
// Button padding
<button className={spacingTokens.md}>
  Click me
</button>

// Card padding
<div className="p-6">
  {/* Card content */}
</div>
```

**Validated:** ✅ All spacing values are multiples of 4px

---

## Spacing Patterns

### Component Internal Padding

**Buttons:**

```tsx
// Small button
<button className="px-2 py-1">
  Small
</button>

// Default button
<button className="px-4 py-2">
  Default
</button>

// Large button
<button className="px-6 py-3">
  Large
</button>
```

**Cards:**

```tsx
// Compact card
<div className="p-4">
  {/* Card content */}
</div>

// Default card
<div className="p-6">
  {/* Card content */}
</div>

// Spacious card
<div className="p-8">
  {/* Card content */}
</div>
```

**Inputs:**

```tsx
// Default input
<input className="px-3 py-2" />

// Large input
<input className="px-4 py-3" />
```

---

### Component Gaps

**Tight Spacing (8px):**

```tsx
// Form rows
<div className="space-y-2">
  <input />
  <input />
</div>

// Icon groups
<div className="flex gap-2">
  <Icon />
  <Icon />
</div>
```

**Default Spacing (16px):**

```tsx
// Grid items
<div className="grid gap-4">
  <Card />
  <Card />
</div>

// Stacked elements
<div className="space-y-4">
  <Section />
  <Section />
</div>
```

**Loose Spacing (24px):**

```tsx
// Sections
<div className="space-y-6">
  <Section />
  <Section />
</div>
```

**Large Spacing (32px):**

```tsx
// Page sections
<div className="space-y-8">
  <HeroSection />
  <ContentSection />
</div>
```

---

## Spacing Utilities

### Tailwind Spacing Classes

**Padding:**

```tsx
// All sides
<div className="p-4">Padding 16px</div>

// Horizontal
<div className="px-4">Padding horizontal 16px</div>

// Vertical
<div className="py-4">Padding vertical 16px</div>

// Individual sides
<div className="pt-4 pr-4 pb-4 pl-4">
  Individual padding
</div>
```

**Margin:**

```tsx
// All sides
<div className="m-4">Margin 16px</div>

// Horizontal
<div className="mx-4">Margin horizontal 16px</div>

// Vertical
<div className="my-4">Margin vertical 16px</div>
```

**Gap:**

```tsx
// Flex gap
<div className="flex gap-4">
  <Item />
  <Item />
</div>

// Grid gap
<div className="grid gap-4">
  <Item />
  <Item />
</div>
```

**Space Between:**

```tsx
// Vertical spacing
<div className="space-y-4">
  <Item />
  <Item />
</div>

// Horizontal spacing
<div className="space-x-4">
  <Item />
  <Item />
</div>
```

---

## Common Spacing Patterns

### Form Layout

```tsx
<form className="space-y-6">
  {/* Form section */}
  <div className="space-y-4">
    <label className="block">Label</label>
    <input className="w-full" />
  </div>

  {/* Button group */}
  <div className="flex gap-3">
    <button>Cancel</button>
    <button>Submit</button>
  </div>
</form>
```

---

### Card Layout

```tsx
<div className="p-6 space-y-4">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-sm">Card content</p>
  <div className="flex gap-2">
    <button>Action 1</button>
    <button>Action 2</button>
  </div>
</div>
```

---

### Dashboard Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>
```

---

### Navigation Spacing

```tsx
<nav className="flex items-center gap-4">
  <Link>Home</Link>
  <Link>About</Link>
  <Link>Contact</Link>
</nav>
```

---

## Responsive Spacing

### Mobile-First Approach

```tsx
// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>

// Responsive gap
<div className="gap-4 md:gap-6 lg:gap-8">
  Responsive gap
</div>

// Responsive spacing
<div className="space-y-4 md:space-y-6 lg:space-y-8">
  Responsive spacing
</div>
```

**Breakpoints:**

- **Mobile:** Base spacing (4px, 8px, 16px)
- **Tablet (md):** +1 step (6px, 12px, 24px)
- **Desktop (lg):** +2 steps (8px, 16px, 32px)

---

## Spacing Guidelines

### When to Use Each Size

**4px (space-1):**
- Tight padding in compact components
- Minimal gaps in dense layouts
- Icon spacing in toolbars

**8px (space-2):**
- Small gaps between related elements
- Icon groups
- Form field spacing (compact)

**16px (space-4):**
- Default padding in components
- Standard gaps between elements
- Form field spacing (default)

**24px (space-6):**
- Card padding
- Section spacing
- Form section spacing

**32px (space-8):**
- Modal padding
- Large section spacing
- Page section breaks

---

## Best Practices

### ✅ DO

- Use multiples of 4px
- Maintain consistent spacing patterns
- Use semantic spacing tokens when available
- Consider responsive spacing needs

### ❌ DON'T

- Use arbitrary spacing values (5px, 7px, 13px)
- Mix different spacing scales
- Use spacing for layout (use flex/grid instead)
- Ignore responsive spacing needs

---

## Spacing Tokens Reference

### Component Tokens

```typescript
import { spacingTokens } from "@aibos/ui/design/tokens";

spacingTokens.sm; // "px-2 py-1"  - Small padding
spacingTokens.md; // "px-3 py-2"  - Medium padding
spacingTokens.lg; // "px-4 py-3"  - Large padding
```

### Direct CSS Variables

```tsx
// Using CSS variables directly
<div style={{ padding: "var(--space-4)" }}>
  Content
</div>
```

---

## Related Documentation

- [Tokens](./tokens.md) - Complete token system
- [Typography](./typography.md) - Text spacing
- [Components](../02-components/) - Component spacing patterns

---

**Last Updated:** 2024  
**Validated:** ✅ Tailwind MCP  
**Status:** Published

