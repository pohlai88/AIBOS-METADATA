# Tailwind v4 Content Detection - Correct Approach

**Reference:** https://tailwindcss.com/docs/detecting-classes-in-source-files

## ⚠️ CRITICAL: v4 Uses `@source` in CSS, NOT `content` in Config

### ❌ WRONG (v3 Pattern - DO NOT USE)
```js
// tailwind.config.js
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
}
```

### ✅ CORRECT (v4 Pattern)
```css
/* globals.css */
@import "tailwindcss";
@source "../app";
@source "../components";
@source "../packages/ui";
```

---

## How Tailwind v4 Content Detection Works

### 1. Automatic Detection (Default)

Tailwind v4 **automatically scans your entire project** by default, except:
- Files in `.gitignore`
- `node_modules/` directory
- Binary files (images, videos, zip)
- CSS files
- Lock files (package-lock.json, etc.)

**No configuration needed** for most projects!

---

### 2. Explicit Registration with `@source`

Use `@source` directive in your CSS file to explicitly register paths:

```css
@import "tailwindcss";

/* Register specific paths */
@source "../app";
@source "../components";
@source "../packages/ui";
@source "../packages/registry";
```

**Why use `@source`?**
- Monorepo: Need to scan shared packages
- External libraries: Scan `node_modules` packages
- Multiple stylesheets: Different scopes for different stylesheets

---

### 3. Setting Base Path (Monorepos)

When build runs from monorepo root, set base path:

```css
@import "tailwindcss" source("../src");
@source "./components";
@source "./app";
```

This sets `../src` as the base, then relative paths work from there.

---

### 4. Ignoring Specific Paths

Use `@source not` to exclude directories:

```css
@import "tailwindcss";
@source not "../src/components/legacy";
@source not "../src/vendor";
```

---

### 5. Disabling Auto-Detection

For explicit control (useful for multiple stylesheets):

```css
@import "tailwindcss" source(none);
@source "../admin";
@source "../shared";
```

This disables automatic scanning and only scans explicitly registered paths.

---

### 6. Safelisting Classes

Force generation of specific classes that might not be detected:

```css
@import "tailwindcss";

/* Single class */
@source inline("underline");

/* With variants */
@source inline("{hover:,focus:,}underline");

/* With ranges */
@source inline("{hover:,}bg-red-{50,{100..900..100},950}");
```

---

### 7. External Libraries

Scan `node_modules` packages (normally ignored):

```css
@import "tailwindcss";
@source "../node_modules/@acmecorp/ui-lib";
```

---

## Dynamic Class Names - IMPORTANT

Tailwind scans files as **plain text**, not as code. It doesn't understand string interpolation.

### ❌ WRONG - Won't be detected
```tsx
// Tailwind can't see "bg-red-600" or "bg-blue-600"
<div className={`bg-${color}-600`}>
```

### ✅ CORRECT - Will be detected
```tsx
// Tailwind sees complete class names
const colors = {
  red: "bg-red-600 hover:bg-red-500",
  blue: "bg-blue-600 hover:bg-blue-500",
};
<div className={colors[color]}>
```

---

## Real-World Examples

### Example 1: Simple Next.js App
```css
/* app/globals.css */
@import "tailwindcss";
/* Auto-detection works! No @source needed */
```

### Example 2: Monorepo with Shared Packages
```css
/* apps/web/src/app/globals.css */
@import "tailwindcss" source("../../");
@source "./app";
@source "./components";
@source "../../packages/ui";
@source "../../packages/registry";
```

### Example 3: External Component Library
```css
/* globals.css */
@import "tailwindcss";
@source "../node_modules/@shadcn/ui";
```

---

## Key Takeaways

1. **v4 = CSS-First**: Content detection configured in CSS, not JS
2. **Auto-detection works**: Most projects don't need explicit `@source`
3. **Use `@source` for**: Monorepos, external libs, multiple stylesheets
4. **Never construct classes dynamically**: Always use complete class names
5. **Reference**: https://tailwindcss.com/docs/detecting-classes-in-source-files

---

## Migration from v3

**Before (v3):**
```js
// tailwind.config.js
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
}
```

**After (v4):**
```css
/* globals.css */
@import "tailwindcss";
@source "../app";
```

Or just rely on auto-detection - it works for most cases!

