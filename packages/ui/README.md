# 🎨 AIBOS Design System (@aibos/ui)

**Controlled Vocabulary for Styling - The Foundation Layer**

---

## 🎯 What Is This?

The **AIBOS Design System** provides a **controlled vocabulary for styling** - just like `@aibos/types` provides controlled vocabulary for business terminology.

**Key Principle:**
> "Developers can only use approved design tokens, ensuring visual consistency across all applications."

---

## 🏗️ Architecture: Hybrid + Registry Model

```
┌─────────────────────────────────────────────────────────┐
│                   @aibos/ui (Package)                    │
│            Shared Foundation - Published                 │
├─────────────────────────────────────────────────────────┤
│  • globals.css (Design tokens - The Controlled Vocab)   │
│  • ThemeProvider (Light/Dark theme logic)               │
│  • tailwind.config.ts (Shared Tailwind setup)           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              packages/registry (Templates)               │
│         Component Templates - NOT Published              │
├─────────────────────────────────────────────────────────┤
│  • Button.tsx                                           │
│  • MetadataBadge.tsx                                    │
│  • TierBadge.tsx                                        │
│  • (Copied into apps, not imported)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Installation

The `@aibos/ui` package is automatically included when you use the workspace scaffold:

```bash
pnpm create
# → Choose "Next.js Application"
# → Design system is already included! ✅
```

### 2. Manual Installation (if needed)

```bash
pnpm add @aibos/ui
```

### 3. Setup in Your App

```tsx
// app/layout.tsx
import '@aibos/ui/design/globals.css';  // ← Import design tokens
import { ThemeProvider } from '@aibos/ui';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 4. Use Design Tokens

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <div className="bg-bg-muted text-text-base p-md rounded-lg">
      <h1 className="text-2xl font-bold text-primary">
        Using approved design tokens!
      </h1>
    </div>
  );
}
```

---

## 🛠️ Utility Functions

### `cn()` - Class Name Utility

The `cn` utility intelligently merges Tailwind CSS classes, resolving conflicts and handling conditional classes.

**Installation:**
```tsx
import { cn } from '@aibos/ui';
// or
import { cn } from '@aibos/ui/utils/cn';
```

**Usage:**
```tsx
// Conflict resolution (last value wins)
cn('p-4', 'p-6')  // → 'p-6'

// Conditional classes
cn('bg-primary', isActive && 'bg-primary-hover')

// Merge with props
cn('default-class', props.className)

// Complex example
cn(
  'px-4 py-2 rounded-md',
  isLarge ? 'text-lg' : 'text-sm',
  isDisabled && 'opacity-50 cursor-not-allowed',
  className
)
```

**How it works:**
- Uses `clsx` for conditional class handling
- Uses `tailwind-merge` for conflict resolution
- Prevents duplicate classes (e.g., `p-4 p-6` becomes `p-6`)
- Handles arrays, objects, and conditional expressions

---

## 📚 Three Layers of the Design System

### **Layer 1: Base Directives**

Tailwind CSS foundation (`@import 'tailwindcss/base'`, etc.)

### **Layer 2: Design Tokens (The Controlled Vocabulary)**

```css
:root {
  /* Core Colors */
  --color-primary-rgb: 59 130 246;
  --color-success-rgb: 16 185 129;
  
  /* Text Colors */
  --color-text-base: 17 24 39;
  --color-text-muted: 107 114 128;
  
  /* Metadata Colors */
  --color-metadata-glossary: 59 130 246;
  --color-metadata-lineage: 139 92 246;
  
  /* Finance Colors */
  --color-finance-revenue: 16 185 129;
  --color-finance-expense: 239 68 68;
  
  /* Tier Colors */
  --color-tier-1: 239 68 68;  /* Critical */
  --color-tier-2: 245 158 11;  /* Important */
}
```

### **Layer 3: Theme Overrides (Dark Mode)**

```css
.dark {
  --color-text-base: 243 244 246;
  --color-background-base: 17 24 39;
  /* All tokens inverted for dark mode */
}
```

---

## 🎨 Available Design Tokens

### Colors

| Token | Tailwind Class | Use Case |
|-------|----------------|----------|
| `--color-primary-rgb` | `bg-primary`, `text-primary` | Primary actions, links |
| `--color-success-rgb` | `bg-success`, `text-success` | Success states |
| `--color-warning-rgb` | `bg-warning`, `text-warning` | Warning states |
| `--color-danger-rgb` | `bg-danger`, `text-danger` | Error states |

### Text Colors

| Token | Tailwind Class | Use Case |
|-------|----------------|----------|
| `--color-text-base` | `text-text-base` | Primary text |
| `--color-text-muted` | `text-text-muted` | Secondary text |
| `--color-text-subtle` | `text-text-subtle` | Tertiary text |

### Metadata Colors

| Token | Tailwind Class | Domain |
|-------|----------------|--------|
| `--color-metadata-glossary` | `bg-metadata-glossary` | Glossary |
| `--color-metadata-lineage` | `bg-metadata-lineage` | Data Lineage |
| `--color-metadata-quality` | `bg-metadata-quality` | Data Quality |
| `--color-metadata-governance` | `bg-metadata-governance` | Governance |

### Finance Colors (IFRS-aligned)

| Token | Tailwind Class | Account Type |
|-------|----------------|--------------|
| `--color-finance-revenue` | `bg-finance-revenue` | Revenue |
| `--color-finance-expense` | `bg-finance-expense` | Expense |
| `--color-finance-asset` | `bg-finance-asset` | Asset |
| `--color-finance-liability` | `bg-finance-liability` | Liability |
| `--color-finance-equity` | `bg-finance-equity` | Equity |

### Tier Colors (Governance)

| Token | Tailwind Class | Tier Level |
|-------|----------------|------------|
| `--color-tier-1` | `bg-tier-1` | Critical (Tier 1) |
| `--color-tier-2` | `bg-tier-2` | Important (Tier 2) |
| `--color-tier-3` | `bg-tier-3` | Standard (Tier 3) |
| `--color-tier-4` | `bg-tier-4` | Low Priority (Tier 4) |

---

## 🌓 Theme Support

### Using the Theme Provider

```tsx
import { ThemeProvider, ThemeToggle, useTheme } from '@aibos/ui';

// Wrap your app
<ThemeProvider defaultTheme="system">
  {children}
</ThemeProvider>

// Add a theme toggle button
<ThemeToggle />

// Use the theme hook
function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Current theme: {resolvedTheme}
    </button>
  );
}
```

---

## 🛠️ Component Registry

**Components are NOT in this package.**  
They live in `packages/registry/` and are **copied** (not imported) into apps.

### Why?

✅ **Full control** - Modify components without affecting other apps  
✅ **No dependency hell** - No version conflicts  
✅ **Learning** - Developers see the source code  
✅ **Consistency** - Components still use the same design tokens  

### Available Utility Functions

- `cn()` - Intelligent Tailwind class merging (resolves conflicts, handles conditionals)

### Available Registry Components

- `Button.tsx` - Primary button with variants
- `MetadataBadges.tsx` - Metadata domain, governance tier, and finance type badges (all in one file)
- `Typography.tsx` - Type scale and visual hierarchy component (H1-H3, Subtitle, Body, Caption)

See `packages/registry/README.md` for details.

---

## 📋 Usage Examples

### Example 1: Using Color Tokens

```tsx
<div className="bg-metadata-glossary/10 text-metadata-glossary p-4 rounded-lg">
  Glossary Badge
</div>
```

### Example 2: Finance Badges

```tsx
<span className="bg-finance-revenue/10 text-finance-revenue px-2 py-1 rounded">
  Revenue
</span>
```

### Example 3: Tier Indicators

```tsx
<div className="border-tier-1 bg-tier-1/10 text-tier-1 p-3">
  Critical - Tier 1
</div>
```

### Example 4: Dark Mode Support

```tsx
// Automatically adapts to light/dark theme
<div className="bg-bg-muted text-text-base">
  This text and background change with theme!
</div>
```

---

## 🎯 Controlled Vocabulary Enforcement

### ✅ DO (Approved)

```tsx
// Use design tokens
<div className="bg-primary text-white">Primary button</div>
<span className="text-metadata-lineage">Lineage</span>
```

### ❌ DON'T (Not Approved)

```tsx
// Don't hardcode colors
<div className="bg-[#3b82f6]">❌ No!</div>
<span className="text-[#8b5cf6]">❌ No!</span>

// Use approved tokens instead
<div className="bg-primary">✅ Yes!</div>
<span className="text-metadata-lineage">✅ Yes!</span>
```

---

## 🔧 Extending the Design System

### Adding New Tokens

1. Edit `packages/ui/design/globals.css`:

```css
:root {
  --color-my-new-token: 100 200 300;
}
```

2. Update `packages/ui/design/tailwind.config.ts`:

```ts
colors: {
  'my-new-color': 'rgb(var(--color-my-new-token) / <alpha-value>)',
}
```

3. Use in your app:

```tsx
<div className="bg-my-new-color">New color!</div>
```

---

## 📊 Benefits

| Benefit | Description |
|---------|-------------|
| **Consistency** | All apps use same design tokens |
| **Centralized Updates** | Change one token → updates everywhere |
| **Theme Support** | Light/dark mode built-in |
| **Type Safety** | TypeScript autocomplete for theme functions |
| **OpenMetadata Compatible** | Aligns with your metadata UI |
| **Junior Dev Friendly** | Autocomplete shows only approved tokens |

---

## 🎓 For Junior Developers

### What You Need to Know

1. **Import globals.css in layout.tsx**
   ```tsx
   import '@aibos/ui/design/globals.css';
   ```

2. **Use Tailwind classes with approved tokens**
   ```tsx
   <div className="bg-primary text-white p-4">
     This uses approved tokens!
   </div>
   ```

3. **Don't hardcode colors**
   ```tsx
   ❌ <div style={{color: '#123456'}}>
   ✅ <div className="text-primary">
   ```

4. **Copy components from registry, then modify**
   - Components in `components/` folder are yours
   - Modify them freely!
   - They still use the same design tokens

---

## 📝 Summary

**What is @aibos/ui?**
- Design system package with controlled vocabulary for styling
- CSS tokens (the "approved words" for colors, spacing, etc.)
- Theme provider for light/dark mode
- Shared Tailwind configuration

**What is in the registry?**
- Component templates (Button, Badges, etc.)
- Copied into apps (not imported)
- Full customization freedom

**Why this architecture?**
- ✅ Consistency through tokens (centralized)
- ✅ Flexibility through templates (decentralized)
- ✅ Junior dev friendly (autocomplete, clear errors)
- ✅ Perfect for workspace scaffold (auto-includes)

---

**Created by:** AIBOS Platform Team  
**Version:** 1.0.0  
**Last Updated:** December 1, 2025  
**Part of:** AIBOS Metadata Platform

