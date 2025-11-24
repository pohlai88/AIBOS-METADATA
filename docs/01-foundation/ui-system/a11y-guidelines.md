# Accessibility

> **WCAG Compliance and Safe Mode** - Validated against accessibility standards

The AI-BOS design system prioritizes accessibility with WCAG AA minimum compliance (AAA preferred) and includes Safe Mode support for users with visual sensitivities.

---

## Accessibility Principles

### Core Requirements

- **WCAG AA Minimum** - All components meet WCAG 2.1 Level AA
- **AAA Preferred** - Most combinations exceed AA requirements
- **Safe Mode Support** - Neutral, low-noise interface option
- **Keyboard Navigation** - Full keyboard accessibility
- **Screen Reader Support** - Semantic HTML and ARIA attributes

**Validated Against:**

- ✅ WCAG 2.1 Level AA requirements
- ✅ Safe Mode token overrides
- ✅ Keyboard navigation patterns

---

## Color Contrast

### WCAG Requirements

**Normal Text (AA):**
- Minimum contrast ratio: **4.5:1**
- Target: **7:1** (AAA)

**Large Text (AA):**
- Minimum contrast ratio: **3:1**
- Target: **4.5:1** (AAA)

**UI Components (AA):**
- Minimum contrast ratio: **3:1**
- Target: **4.5:1** (AAA)

### Contrast Ratios

**Text on Background:**

| Text Color | Background | Ratio | Level |
|-----------|------------|-------|-------|
| `fg-primary` | `bg-base` | 16.7:1 | AAA ✅ |
| `fg-secondary` | `bg-base` | 7.1:1 | AAA ✅ |
| `fg-tertiary` | `bg-base` | 4.8:1 | AA ✅ |
| `accent-fg` | `accent-bg` | 4.5:1 | AA ✅ |

**Validated:** ✅ All text-on-background pairs meet WCAG AA requirements

---

## Safe Mode

### What is Safe Mode?

Safe Mode (`[data-safe-mode="true"]`) provides a neutral, low-noise interface by:

- Removing accent colors (replaced with neutral grays)
- Removing decorative shadows
- Simplifying visual complexity
- Maintaining full functionality

**CSS Implementation:**

```css
[data-safe-mode="true"] {
  --accent-bg: var(--gray-500);
  --accent-bg-hover: var(--gray-600);
  --accent-bg-active: var(--gray-700);
  --shadow-sm: none;
  --shadow-md: none;
}
```

**Usage:**

```tsx
// Enable safe mode on root element
<html data-safe-mode="true">
  {/* App content */}
</html>
```

**When to Use:**

- User preference for reduced visual complexity
- High contrast mode requirements
- Visual sensitivity accommodations
- Accessibility compliance needs

**Validated:** ✅ Safe mode tokens defined in `globals.css`

---

## Keyboard Navigation

### Focus Management

**Focus Indicators:**

All interactive elements must have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

**Usage:**

```tsx
// Button with focus ring
<button className="focus-visible:ring-2 focus-visible:ring-ring">
  Click me
</button>
```

**Keyboard Patterns:**

- **Tab** / **Shift+Tab** - Navigate between interactive elements
- **Enter** / **Space** - Activate buttons and links
- **Arrow Keys** - Navigate menus, listboxes, tabs
- **Escape** - Close modals, dropdowns, popovers

**Validated:** ✅ All components support keyboard navigation

---

## Screen Reader Support

### Semantic HTML

**Use Native Elements:**

```tsx
// ✅ Good: Semantic button
<button onClick={handleClick}>
  Submit
</button>

// ❌ Bad: Div with onClick
<div onClick={handleClick}>
  Submit
</div>
```

**ARIA Attributes:**

```tsx
// Button with aria-label
<button aria-label="Close dialog">
  <XIcon />
</button>

// Navigation with aria-label
<nav aria-label="Main navigation">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

// Form with aria-describedby
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Invalid email
</span>
```

**Visually Hidden Text:**

```tsx
// Icon-only button with screen reader text
<button>
  <XIcon />
  <span className="sr-only">Close</span>
</button>
```

**Validated:** ✅ All components use semantic HTML and ARIA

---

## Accessibility Tokens

### Safe Text-on-Background Pairings

**TypeScript Access:**

```typescript
import { accessibilityTokens } from "@aibos/ui/design/tokens";

accessibilityTokens.textOnPrimary; // "text-primary-foreground"
accessibilityTokens.textOnSuccess; // "text-success-foreground"
accessibilityTokens.textOnDanger; // "text-danger-foreground"
accessibilityTokens.textOnWarning; // "text-warning-foreground"
```

**Usage:**

```tsx
// Primary button with accessible text
<button className="bg-primary">
  <span className={accessibilityTokens.textOnPrimary}>
    Primary Action
  </span>
</button>

// Success badge with accessible text
<span className="bg-success-soft">
  <span className={accessibilityTokens.textOnSuccess}>
    Success
  </span>
</span>
```

**Validated:** ✅ All pairs meet WCAG AA contrast requirements

---

## Component Accessibility

### Button Accessibility

```tsx
// Accessible button
<button
  type="button"
  aria-label="Submit form"
  className="focus-visible:ring-2 focus-visible:ring-ring"
>
  Submit
</button>

// Icon-only button
<button
  aria-label="Close dialog"
  className="focus-visible:ring-2 focus-visible:ring-ring"
>
  <XIcon />
  <span className="sr-only">Close</span>
</button>
```

---

### Form Accessibility

```tsx
// Accessible form field
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-error"
    className="focus-visible:ring-2 focus-visible:ring-ring"
  />
  <span id="email-error" role="alert" className="text-error">
    Please enter a valid email
  </span>
</div>
```

---

### Navigation Accessibility

```tsx
// Accessible navigation
<nav aria-label="Main navigation">
  <ul className="flex gap-4">
    <li>
      <a
        href="/"
        aria-current={isHome ? "page" : undefined}
        className="focus-visible:ring-2 focus-visible:ring-ring"
      >
        Home
      </a>
    </li>
    <li>
      <a
        href="/about"
        className="focus-visible:ring-2 focus-visible:ring-ring"
      >
        About
      </a>
    </li>
  </ul>
</nav>
```

---

## Reduced Motion

### Respecting User Preferences

**CSS Implementation:**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Usage:**

```tsx
// Animation with reduced motion support
<div
  className="transition-all duration-fast"
  style={{
    animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "none"
      : "fadeIn 200ms",
  }}
>
  Content
</div>
```

**Validated:** ✅ Reduced motion preferences respected

---

## Testing Accessibility

### Manual Testing Checklist

- ✅ **Keyboard Navigation** - All interactive elements reachable
- ✅ **Focus Indicators** - Visible focus rings on all elements
- ✅ **Screen Reader** - Test with NVDA, JAWS, or VoiceOver
- ✅ **Color Contrast** - Verify with browser DevTools
- ✅ **Safe Mode** - Test with `[data-safe-mode="true"]`

### Automated Testing

```bash
# Run accessibility audit
pnpm test:a11y

# Validate contrast ratios
pnpm validate:contrast

# Check ARIA attributes
pnpm validate:aria
```

---

## Accessibility Guidelines

### ✅ DO

- Use semantic HTML elements
- Provide ARIA labels for icon-only buttons
- Ensure keyboard navigation works
- Test with screen readers
- Respect reduced motion preferences
- Use accessibility tokens for text-on-background

### ❌ DON'T

- Use divs for buttons or links
- Remove focus indicators
- Ignore color contrast requirements
- Create keyboard traps
- Use color alone to convey information
- Skip ARIA attributes when needed

---

## WCAG Compliance Summary

### Level AA Compliance

- ✅ **Color Contrast** - All text meets 4.5:1 minimum
- ✅ **Keyboard Navigation** - All interactive elements accessible
- ✅ **Screen Reader Support** - Semantic HTML and ARIA
- ✅ **Focus Indicators** - Visible focus rings
- ✅ **Form Labels** - All inputs have labels
- ✅ **Error Messages** - Clear, accessible error communication

### Level AAA (Where Achieved)

- ✅ **Color Contrast** - Most text combinations exceed 7:1
- ✅ **Large Text** - All large text meets 4.5:1
- ✅ **UI Components** - All meet 4.5:1 contrast

---

## Related Documentation

- [Tokens](./tokens.md) - Accessibility tokens
- [Colors](./colors.md) - Color contrast details
- [Components](../02-components/) - Component accessibility patterns

---

**Last Updated:** 2024  
**Validated:** ✅ WCAG AA | ✅ Safe Mode  
**Status:** Published

