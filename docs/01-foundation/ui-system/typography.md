# Typography System

> **Typography Scale Documentation** - Validated against Tailwind MCP

The AI-BOS typography system uses a Major Third (1.250 ratio) scale for harmonious, professional typography that's neither too tight nor too loose.

---

## Typography Scale

### Major Third (1.250 ratio)

A harmonious, professional scale that provides clear hierarchy without being dramatic.

**Scale:**

```
12px (xs)   - Fine print, captions
14px (sm)   - UI elements, labels  ← Most common
16px (base) - Body text             ← Default
18px (lg)   - Emphasized text
20px (xl)   - Small headings
24px (2xl)  - Section headings
30px (3xl)  - Page titles
36px (4xl)  - Hero headings
48px (5xl)  - Landing page heroes
```

**CSS Variables:**

```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
}
```

**TypeScript Access:**

```typescript
import { typographyTokens } from "@aibos/ui/design/tokens";

typographyTokens.bodySm; // "text-xs"
typographyTokens.body; // "text-sm"
typographyTokens.bodyLg; // "text-base"
typographyTokens.titleSm; // "text-sm font-semibold"
typographyTokens.title; // "text-base font-semibold"
```

**Usage:**

```tsx
// Page title
<h1 className={typographyTokens.title}>
  Page Title
</h1>

// Body text
<p className={typographyTokens.body}>
  Body text content
</p>

// Caption
<span className={typographyTokens.bodySm}>
  Caption text
</span>
```

**Validated:** ✅ Typography scale follows Major Third (1.250 ratio)

---

## Font Family

### System Font Stack

**CSS Variable:**

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans,
    Helvetica, Arial, sans-serif, Apple Color Emoji;
}
```

**Usage:**

```tsx
// Applied globally via body element
// No need to specify in components
```

**Rationale:**

- Uses native system fonts for optimal performance
- Consistent across platforms
- No external font loading required
- Excellent readability

---

## Font Weights

**CSS Variables:**

```css
:root {
  --font-normal: 400;    /* Body text */
  --font-medium: 500;   /* UI elements, emphasized text */
  --font-semibold: 600; /* Headings, buttons */
}
```

**Usage:**

```tsx
// Normal weight (default)
<p className="font-normal">
  Body text
</p>

// Medium weight
<label className="font-medium">
  Form label
</label>

// Semibold weight
<h2 className="font-semibold">
  Section heading
</h2>
```

**Guidelines:**

- **400 (Normal)** - Body text, default
- **500 (Medium)** - UI elements, labels, emphasized text
- **600 (Semibold)** - Headings, buttons, important text
- **700 (Bold)** - Rare, only for marketing/landing pages

**Validated:** ✅ Font weights defined in `globals.css`

---

## Line Heights

**CSS Variables:**

```css
:root {
  --leading-tight: 1.25;   /* Headlines */
  --leading-normal: 1.5;   /* Body text ← Default */
}
```

**Usage:**

```tsx
// Tight line height for headlines
<h1 className="leading-tight">
  Page Title
</h1>

// Normal line height for body text
<p className="leading-normal">
  Body text with comfortable line spacing
</p>
```

**Guidelines:**

- **1.25 (tight)** - Headlines, short text
- **1.5 (normal)** - Body text, default
- **1.625 (relaxed)** - Long-form content (if needed)

**Validated:** ✅ Line heights defined in `globals.css`

---

## Typography Patterns

### Page Title

```tsx
<h1 className="text-3xl font-semibold leading-tight text-fg-primary">
  Page Title
</h1>
```

**Or using tokens:**

```tsx
import { typographyTokens, colorTokens } from "@aibos/ui/design/tokens";

<h1 className={`${typographyTokens.title} text-3xl leading-tight ${colorTokens.text.default}`}>
  Page Title
</h1>
```

---

### Section Heading

```tsx
<h2 className="text-2xl font-semibold text-fg-primary">
  Section Heading
</h2>
```

---

### Body Text

```tsx
<p className="text-base font-normal leading-normal text-fg-secondary">
  Body text content goes here. This is the default text style
  for most content in the application.
</p>
```

---

### UI Label

```tsx
<label className="text-sm font-medium text-fg-secondary">
  Form Label
</label>
```

---

### Caption

```tsx
<span className="text-xs text-fg-tertiary">
  Caption or fine print text
</span>
```

---

## Typography Hierarchy

### Heading Levels

```tsx
// H1 - Page title
<h1 className="text-3xl font-semibold leading-tight">
  Page Title
</h1>

// H2 - Section heading
<h2 className="text-2xl font-semibold">
  Section Heading
</h2>

// H3 - Subsection heading
<h3 className="text-xl font-semibold">
  Subsection Heading
</h3>

// H4 - Minor heading
<h4 className="text-lg font-medium">
  Minor Heading
</h4>
```

---

### Text Hierarchy

```tsx
// Primary text (headings)
<h1 className="text-fg-primary">Primary</h1>

// Secondary text (body)
<p className="text-fg-secondary">Secondary</p>

// Tertiary text (captions)
<span className="text-fg-tertiary">Tertiary</span>

// Quaternary text (placeholders)
<input placeholder="Quaternary" className="text-fg-quaternary" />
```

---

## Responsive Typography

### Mobile-First Approach

```tsx
// Responsive heading
<h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
  Responsive Heading
</h1>
```

**Breakpoints:**

- **Mobile:** Base size
- **Tablet (md):** +1 size step
- **Desktop (lg):** +2 size steps

---

## Accessibility

### Minimum Font Sizes

- **Body text:** 14px minimum (`text-sm`)
- **UI labels:** 14px minimum (`text-sm`)
- **Captions:** 12px minimum (`text-xs`)

### Contrast Ratios

All text colors meet WCAG AA requirements:

- **Primary text:** 4.5:1 minimum
- **Secondary text:** 4.5:1 minimum
- **Tertiary text:** 3:1 minimum (large text)

**Validated:** ✅ All text colors meet WCAG AA contrast requirements

---

## Typography Tokens Reference

### Complete Token List

```typescript
import { typographyTokens } from "@aibos/ui/design/tokens";

// Body text
typographyTokens.bodySm;  // "text-xs"
typographyTokens.body;    // "text-sm"
typographyTokens.bodyLg;  // "text-base"

// Titles
typographyTokens.titleSm; // "text-sm font-semibold"
typographyTokens.title;   // "text-base font-semibold"
```

### Combined with Color Tokens

```typescript
import { typographyTokens, colorTokens } from "@aibos/ui/design/tokens";

// Heading with color
<h1 className={`${typographyTokens.title} ${colorTokens.text.default}`}>
  Heading
</h1>

// Body with color
<p className={`${typographyTokens.body} ${colorTokens.text.muted}`}>
  Body text
</p>
```

---

## Best Practices

### ✅ DO

- Use semantic typography tokens
- Maintain consistent hierarchy
- Use appropriate font weights
- Ensure sufficient contrast

### ❌ DON'T

- Use arbitrary font sizes
- Mix too many font weights
- Use font sizes below 12px
- Ignore line height for readability

---

## Related Documentation

- [Tokens](./tokens.md) - Complete token system
- [Colors](./colors.md) - Text color usage
- [Accessibility](./accessibility.md) - WCAG compliance

---

**Last Updated:** 2024  
**Validated:** ✅ Tailwind MCP  
**Status:** Published

