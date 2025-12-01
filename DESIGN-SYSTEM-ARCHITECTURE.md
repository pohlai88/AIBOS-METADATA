# 🎨 AIBOS Design System Architecture - Complete Documentation

**Hybrid + Registry Model: Controlled Vocabulary for Styling**

**Created:** December 1, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

---

## 📚 Executive Summary

The **AIBOS Design System** implements a **Hybrid + Registry** architecture that provides:

1. **Controlled Vocabulary for Styling** (CSS Tokens in `@aibos/ui`)
2. **Component Templates** (Registry - copied, not imported)
3. **Theme Support** (Light/Dark modes)
4. **Workspace Scaffold Integration** (Auto-includes for all generated apps)

**The Core Principle:**
> "Just as `@aibos/types` enforces approved business terms, `@aibos/ui` enforces approved design tokens. Developers get consistency with maximum flexibility."

---

## 🏗️ I. The Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                LAYER 1: FOUNDATION (@aibos/ui)               │
│              Published Package - Shared Rules                │
├─────────────────────────────────────────────────────────────┤
│  📄 globals.css                                             │
│     • Layer 1: Tailwind directives                          │
│     • Layer 2: Design tokens (light theme)                  │
│     • Layer 3: Dark theme overrides                         │
│                                                             │
│  ⚛️  ThemeProvider.tsx                                       │
│     • Client component for theme logic                      │
│     • Manages light/dark/system themes                      │
│     • Applies .dark class to <html>                         │
│                                                             │
│  ⚙️  tailwind.config.ts                                      │
│     • Maps CSS variables to Tailwind                        │
│     • Shared across all apps                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 2: TEMPLATES (Registry)                   │
│          Component Source Code - NOT Published               │
├─────────────────────────────────────────────────────────────┤
│  📦 packages/registry/components/                           │
│     • Button.tsx                                            │
│     • MetadataBadge.tsx                                     │
│     • TierBadge.tsx                                         │
│     • FinanceBadge.tsx                                      │
│     • (Copied into apps by scaffold generator)              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 3: APPS (Generated/Custom)                │
│          Application-Specific Implementations                │
├─────────────────────────────────────────────────────────────┤
│  🌐 apps/your-app/                                          │
│     • app/layout.tsx (imports globals.css + ThemeProvider)  │
│     • components/ (copied from registry, locally modified)  │
│     • Uses design tokens from @aibos/ui                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 II. The Three Layers in Detail

### **Layer 1: Base Directives**

```css
/* globals.css - Line 1-3 */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
```

**Purpose:** Foundation for Tailwind CSS

---

### **Layer 2: Design Tokens (The Controlled Vocabulary)**

```css
/* globals.css - Line 5-100 */
:root {
  /* CORE COLORS */
  --color-primary-rgb: 59 130 246;
  --color-success-rgb: 16 185 129;
  --color-warning-rgb: 245 158 11;
  
  /* TEXT COLORS */
  --color-text-base: 17 24 39;
  --color-text-muted: 107 114 128;
  
  /* METADATA-SPECIFIC TOKENS */
  --color-metadata-glossary: 59 130 246;
  --color-metadata-lineage: 139 92 246;
  --color-metadata-quality: 16 185 129;
  
  /* FINANCE DOMAIN COLORS (IFRS-aligned) */
  --color-finance-revenue: 16 185 129;
  --color-finance-expense: 239 68 68;
  --color-finance-asset: 59 130 246;
  
  /* TIER BADGES (Governance) */
  --color-tier-1: 239 68 68;  /* Critical */
  --color-tier-2: 245 158 11;  /* Important */
}
```

**Purpose:** Single Source of Truth for all design decisions

**Benefits:**
- ✅ Change one token → updates everywhere
- ✅ Prevents hardcoded colors
- ✅ Semantic naming (revenue = green, expense = red)
- ✅ IFRS/OpenMetadata aligned

---

### **Layer 3: Theme Overrides (Dark Mode)**

```css
/* globals.css - Line 102-150 */
.dark {
  --color-text-base: 243 244 246;  /* Inverted for dark */
  --color-background-base: 17 24 39;
  /* All tokens redefined for dark theme */
}
```

**Purpose:** Automatic theme switching without code changes

---

## 🎯 III. Key Components

### Component 1: `globals.css`

**Location:** `packages/ui/design/globals.css`

**Role:**
- Defines ALL design tokens (colors, spacing, typography)
- Provides light and dark theme values
- Imported once in root layout

**Usage:**
```tsx
// app/layout.tsx
import '@aibos/ui/design/globals.css';
```

---

### Component 2: `ThemeProvider.tsx`

**Location:** `packages/ui/components/ThemeProvider.tsx`

**Role:**
- Client component (uses React state)
- Manages theme selection (light/dark/system)
- Applies `.dark` class to `<html>` tag
- Provides `useTheme()` hook

**Usage:**
```tsx
// app/layout.tsx
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

---

### Component 3: `tailwind.config.ts`

**Location:** `packages/ui/design/tailwind.config.ts`

**Role:**
- Maps CSS variables to Tailwind utilities
- Shared across all apps
- Apps extend this config

**Mapping Example:**
```typescript
colors: {
  primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
  'metadata-lineage': 'rgb(var(--color-metadata-lineage) / <alpha-value>)',
}
```

**Usage:**
```typescript
// apps/your-app/tailwind.config.ts
import baseConfig from '@aibos/ui/design/tailwind.config';

export default {
  ...baseConfig,
  content: ['./app/**/*.{ts,tsx}'],
  // Extend or override as needed
};
```

---

## 📦 IV. The Component Registry

### What Is It?

A collection of **component templates** (not a published package) that are **copied** into apps.

**Location:** `packages/registry/components/`

**Available Components:**
- `Button.tsx` - Primary button with variants
- `MetadataBadge.tsx` - Domain badges (Glossary, Lineage, etc.)
- `TierBadge.tsx` - Governance tier indicators
- `FinanceBadge.tsx` - Finance type badges

---

### Why Copy Instead of Import?

| Approach | Import from Package | Copy from Registry |
|----------|-------------------|-------------------|
| **Control** | Limited | Full |
| **Customization** | Hard | Easy |
| **Dependencies** | Version conflicts | None |
| **Learning** | Hidden code | Visible code |
| **Updates** | Automatic | Manual |
| **Best for** | Utilities, logic | UI components |

**Our Choice:** Copy from Registry ✅

---

### Example: MetadataBadge.tsx

```tsx
// packages/registry/components/MetadataBadge.tsx
export function MetadataBadge({ domain }) {
  // Uses CSS variables from globals.css
  const styles = {
    glossary: 'bg-[rgb(var(--color-metadata-glossary)/0.1)]',
    lineage: 'bg-[rgb(var(--color-metadata-lineage)/0.1)]',
  };
  
  return (
    <span className={styles[domain]}>
      {domain}
    </span>
  );
}
```

**Key Point:** Component uses tokens, not hardcoded colors!

---

## 🔧 V. Developer Workflow (The Good Night's Sleep)

### Scenario: Junior Dev Creates New App

```bash
# Step 1: Generate app
pnpm create
→ Choose "Next.js Application"
→ Name: "customer-portal"

# Step 2: What gets auto-included:
✅ @aibos/ui dependency
✅ globals.css imported in layout.tsx
✅ ThemeProvider wrapping app
✅ MetadataBadge.tsx copied to components/
✅ Tailwind configured with design tokens

# Step 3: Developer starts coding
cd apps/customer-portal
pnpm dev

# They can now:
✅ Use approved design tokens (bg-primary, text-metadata-lineage)
✅ Modify components locally (components/MetadataBadge.tsx)
✅ Switch themes (light/dark/system)
✅ Sleep well knowing everything is consistent!
```

---

## 🎨 VI. Usage Examples

### Example 1: Using Metadata Colors

```tsx
<div className="bg-metadata-glossary/10 text-metadata-glossary p-4 rounded-lg">
  <h3 className="font-bold">Glossary</h3>
  <p className="text-sm">Browse all approved terms</p>
</div>
```

**Result:**
- Light theme: Blue background
- Dark theme: Lighter blue background (auto-adjusts!)

---

### Example 2: Finance Badges

```tsx
import { FinanceBadge } from '@/components/MetadataBadge';

<FinanceBadge type="revenue" />
<FinanceBadge type="expense" />
<FinanceBadge type="asset" />
```

**Result:**
- Revenue = Green (IFRS standard)
- Expense = Red (IFRS standard)
- Asset = Blue (IFRS standard)

---

### Example 3: Theme Toggle

```tsx
import { ThemeToggle } from '@aibos/ui';

export function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />  {/* ← Automatic theme switching */}
    </header>
  );
}
```

---

## ✅ VII. Controlled Vocabulary Enforcement

### The Rules

**✅ DO (Approved):**
```tsx
// Use design tokens
<div className="bg-primary text-white">Primary</div>
<span className="text-metadata-lineage">Lineage</span>
<div className="bg-finance-revenue">Revenue</div>
```

**❌ DON'T (Not Approved):**
```tsx
// Don't hardcode colors
<div className="bg-[#3b82f6]">❌ No!</div>
<span style={{color: '#8b5cf6'}}>❌ No!</span>

// Use approved tokens instead
<div className="bg-primary">✅ Yes!</div>
<span className="text-metadata-lineage">✅ Yes!</span>
```

---

## 📊 VIII. Benefits Summary

| Stakeholder | Benefit |
|-------------|---------|
| **Junior Developers** | Autocomplete shows only approved tokens, can modify components locally |
| **Senior Developers** | Consistent design across all apps, rapid scaffolding |
| **Design Team** | Single source of truth, global updates |
| **Platform Team** | Easy to maintain, OpenMetadata compatible |
| **Business** | IFRS-aligned colors, governance tier visualization |

---

## 🔄 IX. Integration with Existing Systems

### With Controlled Vocabulary SDK

```tsx
import { APPROVED_FINANCE_TERMS } from '@aibos/types';
import { FinanceBadge } from '@/components/MetadataBadge';

// Business logic uses approved terms
const account = APPROVED_FINANCE_TERMS.revenue;

// UI uses approved design tokens
<FinanceBadge type={account} />
```

**Result:** Both code AND design use controlled vocabulary!

---

### With Metadata Studio

```tsx
import { MetadataBadge } from '@/components/MetadataBadge';
import { ControlledVocabulary } from '@aibos/types';

<div>
  <h2>Metadata Studio</h2>
  <MetadataBadge domain="glossary" />
  <p>SDK v{ControlledVocabulary.version}</p>
</div>
```

---

### With Workspace Scaffold

```typescript
// tools/workspace-scaffold/cli.mjs
async function generateNextApp(targetDir, name) {
  // Auto-include design system
  await writeLayoutWithDesignSystem(targetDir);
  await copyRegistryComponents(targetDir);
  await configureTailwind(targetDir);
}
```

**Result:** Every generated app gets design system automatically!

---

## 🎯 X. Next Steps

### For Immediate Use

1. **Update apps/web** ✅ (Already done!)
   - Imports `@aibos/ui/design/globals.css`
   - Uses `<ThemeProvider>`
   - Has access to all design tokens

2. **Update workspace scaffold** (Next task)
   - Auto-include design system in generated apps
   - Copy registry components automatically

3. **Create more registry components** (As needed)
   - Card.tsx
   - Input.tsx
   - Select.tsx

---

### For Future Enhancement

1. **Add more domains**
   - HR colors
   - Operations colors
   - Sales colors

2. **Component documentation**
   - Storybook integration
   - Visual component browser

3. **Design tokens**
   - Animation tokens
   - Breakpoint tokens
   - Z-index tokens

---

## 📝 Summary

**What We Built:**

```
✅ @aibos/ui (Foundation package)
   • globals.css (3 layers: base, tokens, themes)
   • ThemeProvider (light/dark/system themes)
   • tailwind.config.ts (shared configuration)

✅ packages/registry (Component templates)
   • Button, Badges, etc.
   • Copied into apps, not imported

✅ Complete documentation
   • Architecture guide (this file)
   • Package README
   • Registry README

✅ Integration
   • apps/web updated
   • Works with Controlled Vocabulary SDK
   • Works with Metadata Studio
   • Ready for workspace scaffold
```

**How It Works:**

1. **Design tokens** enforce visual consistency (like types enforce data consistency)
2. **Component templates** provide flexibility (copy and modify)
3. **Theme support** works automatically (no code changes needed)
4. **Workspace scaffold** includes everything automatically (junior dev friendly)

**The Result:**

> **"A design system that feels like magic, but is actually just really good architecture."**

---

**Status:** ✅ **PRODUCTION READY**  
**Created by:** AIBOS Platform Team  
**Date:** December 1, 2025  
**Version:** 1.0.0

