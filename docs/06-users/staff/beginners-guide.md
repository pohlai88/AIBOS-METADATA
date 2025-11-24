# Getting Started with AI-BOS UI

> **Quick start guide** for using the AI-BOS design system in your Next.js application.

This guide provides practical examples and common patterns to get you started quickly. For detailed documentation, see the [complete documentation index](../README.md).

---

## ✅ What's Included

The AI-BOS design system provides:

- ✨ Automatic dark mode (detects system preference)
- 🎨 Professional emerald green accent color
- 📐 Harmonious typography scale
- 🎯 Semantic color tokens
- ♿ WCAG AA accessibility
- 🌓 Smooth theme transitions

---

## 🎨 Using Colors

### Surface Colors (Backgrounds)

```tsx
<div className="bg-bg-base">         {/* Page background */}
<div className="bg-bg-elevated">     {/* Cards, modals */}
<div className="bg-bg-subtle">       {/* Alternate sections */}
<div className="bg-bg-muted">        {/* Disabled states */}
```

### Text Colors

```tsx
<h1 className="text-fg-primary">     {/* Headlines */}
<p className="text-fg-secondary">    {/* Body text */}
<span className="text-fg-tertiary">  {/* Captions */}
<input placeholder className="text-fg-quaternary"> {/* Placeholders */}
```

### Borders

```tsx
<div className="border border-border-subtle">  {/* Default borders */}
<div className="border border-border-medium">  {/* Input borders */}
<div className="border border-border-strong">  {/* Hover states */}
```

### Accent Color (Emerald Green)

```tsx
<button className="bg-accent text-accent-fg">    {/* Primary button */}
<button className="hover:bg-accent-hover">       {/* Hover state */}
<div className="bg-accent-subtle text-accent">   {/* Subtle highlight */}
```

### Status Colors (Use Sparingly!)

```tsx
<div className="bg-success-light text-success">  {/* Success state */}
<div className="bg-warning-light text-warning">  {/* Warning state */}
<div className="bg-error-light text-error">      {/* Error state */}
<div className="bg-info-light text-info">        {/* Info state */}
```

**📖 Detailed Color System:** See [Colors Documentation](../01-foundation/colors.md)

---

## 📝 Typography Examples

```tsx
{/* Page Title */}
<h1 className="text-3xl font-semibold text-fg-primary">
  Dashboard
</h1>

{/* Section Heading */}
<h2 className="text-2xl font-semibold text-fg-primary">
  Recent Activity
</h2>

{/* Card Title */}
<h3 className="text-lg font-medium text-fg-primary">
  Total Revenue
</h3>

{/* Body Text */}
<p className="text-base text-fg-secondary">
  Your account has been successfully updated.
</p>

{/* Caption */}
<span className="text-sm text-fg-tertiary">
  Last updated 2 hours ago
</span>
```

**📖 Typography System:** See [Typography Documentation](../01-foundation/typography.md)

---

## 🎯 Common Patterns

### Professional Card

```tsx
<div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 shadow-sm 
                hover:shadow-md transition-shadow duration-200">
  <h3 className="text-lg font-semibold text-fg-primary mb-2">
    Card Title
  </h3>
  <p className="text-fg-secondary">
    Card content goes here...
  </p>
</div>
```

### Primary Button

```tsx
<button className="bg-accent hover:bg-accent-hover text-accent-fg 
                   px-4 py-2.5 rounded font-medium 
                   shadow-xs hover:shadow-sm 
                   transition-all duration-fast">
  Save Changes
</button>
```

### Secondary Button

```tsx
<button className="bg-bg-elevated hover:bg-interactive-hover 
                   text-fg-secondary hover:text-fg-primary
                   border border-border-medium hover:border-border-strong
                   px-4 py-2.5 rounded font-medium 
                   transition-all duration-fast">
  Cancel
</button>
```

### Input Field

```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-fg-secondary">
    Email Address
  </label>
  <input 
    type="email"
    className="w-full px-3 py-2.5 text-sm
               bg-bg-elevated text-fg-primary
               border border-border-medium hover:border-border-strong
               focus:border-accent focus:ring-2 focus:ring-accent-subtle
               rounded transition-all duration-fast
               placeholder:text-fg-quaternary"
    placeholder="you@example.com"
  />
</div>
```

**📖 Component Patterns:** See [Component Documentation](../02-components/)

---

## 📐 Spacing Scale

Use consistent spacing for professional layouts:

```tsx
{/* Tight spacing (8px) */}
<div className="space-y-2">

{/* Default spacing (16px) */}
<div className="space-y-4">

{/* Loose spacing (24px) */}
<div className="space-y-6">

{/* Section spacing (32px) */}
<div className="space-y-8">
```

### Common Padding Values

```tsx
<div className="p-2">      {/* 8px - Tight */}
<div className="p-4">      {/* 16px - Default */}
<div className="p-6">      {/* 24px - Cards */}
<div className="p-8">      {/* 32px - Modals */}
```

**📖 Spacing System:** See [Spacing Documentation](../01-foundation/spacing.md)

---

## 🌓 Dark Mode

The design system automatically detects system preference. For manual theme control:

```tsx
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Detect system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", darkMode ? "light" : "dark");
  };

  return (
    <button onClick={toggleTheme}>
      {darkMode ? <Sun /> : <Moon />}
    </button>
  );
}
```

---

## ♿ Accessibility Checklist

- ✅ Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- ✅ Provide `aria-label` for icon-only buttons
- ✅ Use `sr-only` class for screen reader text
- ✅ Ensure 4.5:1 contrast ratio minimum (AA)
- ✅ Test keyboard navigation
- ✅ Respect `prefers-reduced-motion`

```tsx
{/* Accessible icon button */}
<button aria-label="Close dialog" className="...">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</button>
```

**📖 Accessibility Guidelines:** See [Accessibility Documentation](../01-foundation/accessibility.md)

---

## 💡 Pro Tips

1. **Always use semantic tokens**, not raw colors:
   - ✅ `bg-bg-elevated`
   - ❌ `bg-white`

2. **Test both themes** when building new features

3. **Use the accent color sparingly** - only for primary actions

4. **Stick to the spacing scale** - 8px, 16px, 24px, 32px...

5. **Let the system do the work** - tokens automatically adapt to themes

---

## 🎓 Next Steps

1. **Explore Components** - See [Component Documentation](../02-components/)
2. **Read Design Tokens** - See [Token System](../01-foundation/tokens.md)
3. **Check Integration Guides** - See [Integration Documentation](../04-integration/)
4. **Review Patterns** - See [Design Patterns](../03-patterns/) (when available)

---

## 🆘 Need Help?

- **Component API:** See [Component Documentation](../02-components/)
- **Design Tokens:** See [Token System](../01-foundation/tokens.md)
- **Integration:** See [Integration Guides](../04-integration/)
- **Governance:** See [Governance Rules](../GOVERNANCE.md)

---

**Your design system is ready! Start building with confidence.** 🚀

