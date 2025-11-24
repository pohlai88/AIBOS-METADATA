# globals.css Architecture Proposal

> **Date:** 2025-11-24  
> **Status:** 📋 Proposed  
> **Priority:** High - Architecture Decision

---

## Overview

Proposal to implement a resilient CSS architecture with fallback mechanism to prevent system breakage when `@aibos/ui` package fails.

---

## Problem Statement

### Current State

**Current Architecture:**
```
apps/web/app/layout.tsx
  └── import "@aibos/ui/design/globals.css"
      └── packages/ui/src/design/globals.css (full tokens & styles)
```

**Risk:**
- ❌ **Single Point of Failure:** If `@aibos/ui` package breaks, the entire app breaks
- ❌ **Co-reliance Issue:** App is tightly coupled to UI package
- ❌ **No Fallback:** No recovery mechanism if package fails to load
- ❌ **Build Dependency:** App build fails if UI package has issues

### Real-World Scenarios

1. **Package Build Failure:**
   - UI package has TypeScript errors
   - App cannot build
   - Entire system down

2. **Import Resolution Failure:**
   - Package path changes
   - Export configuration breaks
   - App crashes at runtime

3. **Version Mismatch:**
   - UI package version incompatible
   - App fails to load styles
   - Broken UI

---

## Proposed Solution

### Architecture Pattern: **Layered CSS with Fallback**

```
apps/web/app/globals.css (Safe Mode - Minimal Fallback)
  ├── Basic reset & typography
  ├── Critical layout styles
  └── Fallback color variables

apps/web/app/layout.tsx
  ├── import "./globals.css" (Safe mode - always loads)
  └── import "@aibos/ui/design/globals.css" (Full tokens - optional)

packages/ui/src/design/globals.css (Full Design System)
  ├── Tailwind v4 configuration
  ├── Complete token system
  ├── Dark mode support
  └── All design system styles
```

### Implementation Strategy

#### 1. Safe Mode CSS (`apps/web/app/globals.css`)

**Purpose:** Minimal CSS that ensures app remains functional

**Contents:**
- CSS reset (minimal)
- Basic typography
- Critical layout utilities
- Fallback color variables (basic)
- Error state styles

**Characteristics:**
- ✅ **Self-contained:** No external dependencies
- ✅ **Minimal:** Only essential styles
- ✅ **Always loads:** Guaranteed to work
- ✅ **Fallback ready:** Provides basic styling

#### 2. Full Design System CSS (`packages/ui/src/design/globals.css`)

**Purpose:** Complete design system with tokens

**Contents:**
- Tailwind v4 configuration
- Complete token system
- Dark mode support
- All component styles
- Advanced features

**Characteristics:**
- ✅ **Feature-rich:** Full design system
- ✅ **Token-based:** Semantic design tokens
- ✅ **Optional:** Loads if available
- ✅ **Enhancement:** Enhances safe mode

---

## Implementation Details

### File Structure

```
apps/web/
├── app/
│   ├── globals.css          # NEW: Safe mode fallback
│   └── layout.tsx           # MODIFIED: Import both
└── ...

packages/ui/
└── src/
    └── design/
        └── globals.css      # EXISTING: Full design system
```

### Code Implementation

#### 1. Create Safe Mode CSS

**File:** `apps/web/app/globals.css`

```css
/* Safe Mode CSS - Minimal Fallback */
/* Ensures app remains functional if @aibos/ui fails */

/* Basic Reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  color: #111827;
  background-color: #ffffff;
}

/* Basic Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
}

/* Fallback Color Variables */
:root {
  --color-bg: #ffffff;
  --color-bg-muted: #f9fafb;
  --color-fg: #111827;
  --color-fg-muted: #6b7280;
  --color-primary: #2563eb;
  --color-border: #e5e7eb;
}

/* Critical Layout Utilities */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Error State Styles */
.error-boundary {
  padding: 2rem;
  text-align: center;
  color: #dc2626;
}
```

#### 2. Update Layout to Import Both

**File:** `apps/web/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import "./globals.css"; // Safe mode - always loads first
import "@aibos/ui/design/globals.css"; // Full design system - loads if available

export const metadata: Metadata = {
  title: "AI-BOS Platform",
  description: "AI-BOS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### 3. Error Handling (Optional Enhancement)

**File:** `apps/web/app/layout.tsx` (Enhanced version)

```typescript
import type { Metadata } from "next";
import "./globals.css"; // Safe mode - always loads

// Try to load full design system, but don't fail if it doesn't
let designSystemLoaded = false;
try {
  require("@aibos/ui/design/globals.css");
  designSystemLoaded = true;
} catch (error) {
  console.warn("Design system CSS failed to load, using safe mode:", error);
  // App continues with safe mode CSS
}

export const metadata: Metadata = {
  title: "AI-BOS Platform",
  description: "AI-BOS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-design-system={designSystemLoaded ? "loaded" : "safe-mode"}>
      <body>{children}</body>
    </html>
  );
}
```

---

## Benefits

### ✅ Resilience

- **No Single Point of Failure:** App works even if UI package breaks
- **Graceful Degradation:** Falls back to safe mode automatically
- **Build Independence:** App can build without UI package

### ✅ Maintainability

- **Clear Separation:** Safe mode vs. full design system
- **Easy Debugging:** Can disable design system to test fallback
- **Version Flexibility:** Can update UI package independently

### ✅ Developer Experience

- **Fast Development:** Safe mode loads instantly
- **Clear Intent:** Explicit fallback mechanism
- **Easy Testing:** Can test both modes

---

## Validation with Next.js MCP

### Next.js Compatibility

✅ **CSS Import Order:** Next.js processes CSS imports in order
✅ **Fallback Support:** CSS cascade allows safe mode to be overridden
✅ **Build Optimization:** Next.js optimizes both CSS files
✅ **No Breaking Changes:** Backward compatible

### Next.js Best Practices

✅ **App Router:** Follows App Router CSS import patterns
✅ **CSS Modules:** Can use CSS modules if needed
✅ **PostCSS:** Works with existing PostCSS setup
✅ **Turbopack:** Compatible with Turbopack

---

## Migration Plan

### Phase 1: Create Safe Mode CSS

1. Create `apps/web/app/globals.css` with minimal styles
2. Test that app works with only safe mode
3. Verify no visual regressions

### Phase 2: Update Layout

1. Update `apps/web/app/layout.tsx` to import both
2. Test that full design system still works
3. Verify CSS cascade works correctly

### Phase 3: Add Error Handling (Optional)

1. Add try-catch for design system import
2. Add data attribute for debugging
3. Test fallback scenario

### Phase 4: Documentation

1. Document the architecture
2. Update migration guide
3. Add troubleshooting guide

---

## Testing Strategy

### Test Scenarios

1. **Normal Operation:**
   - Both CSS files load
   - Full design system active
   - All styles work correctly

2. **Fallback Mode:**
   - UI package fails to load
   - Safe mode CSS active
   - App remains functional

3. **Build Scenarios:**
   - App builds without UI package
   - App builds with UI package
   - Both scenarios work

### Test Cases

```typescript
// Test 1: Safe mode works independently
// - Remove @aibos/ui import
// - Verify app still renders
// - Verify basic styles work

// Test 2: Full design system enhances safe mode
// - Both imports present
// - Verify full styles work
// - Verify no conflicts

// Test 3: Fallback on error
// - Simulate package error
// - Verify safe mode activates
// - Verify app doesn't crash
```

---

## Risk Assessment

### Low Risk ✅

- Creating safe mode CSS
- Updating layout imports
- CSS cascade behavior

### Medium Risk ⚠️

- CSS specificity conflicts
- Build optimization issues
- Import order dependencies

### Mitigation

- **CSS Specificity:** Use consistent naming
- **Build Issues:** Test both build scenarios
- **Import Order:** Document import order

---

## Recommendations

### ✅ Recommended Approach

**Option 1: Simple Import (Recommended)**
- Import safe mode first
- Import design system second
- Let CSS cascade handle it
- **Pros:** Simple, reliable, standard CSS behavior
- **Cons:** No runtime error detection

**Option 2: Error Handling (Advanced)**
- Try-catch for design system import
- Data attribute for debugging
- **Pros:** Better error visibility
- **Cons:** More complex, may not work in all scenarios

### ❌ Not Recommended

- **Conditional Import:** Too complex, breaks build optimization
- **Runtime CSS Injection:** Performance issues
- **Separate CSS Bundles:** Unnecessary complexity

---

## Next Steps

1. **Review & Approve** this proposal
2. **Create Safe Mode CSS:** `apps/web/app/globals.css`
3. **Update Layout:** Import both CSS files
4. **Test Scenarios:** Verify both modes work
5. **Document:** Update architecture docs

---

## Related Documentation

- [Next.js CSS Documentation](https://nextjs.org/docs/app/building-your-application/styling)
- [CSS Cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade)
- [Design System Architecture](../../01-foundation/ui-system/tokens.md)

---

**Proposed By:** Architecture Review  
**Date:** 2025-11-24  
**Status:** 📋 Awaiting Approval

