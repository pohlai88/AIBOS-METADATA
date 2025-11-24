# globals.css Location Recommendation

> **Question:** Should `globals.css` be in `apps/web/app/` or `packages/ui/`?  
> **Date:** 2024

## Current State

**Location:** `packages/ui/src/design/globals.css` ✅ **MIGRATED**

**Contents:**
- Design system tokens (CSS variables)
- Tailwind v4 `@theme` configuration
- Design system foundation (not app-specific)

**Usage:**
- Imported in `apps/web/app/layout.tsx`
- Referenced by MCP theme server as source of truth
- Referenced in documentation as design system source
- Used by `@aibos/ui` components

---

## Analysis

### What `globals.css` Contains

1. **Design System Tokens** (CSS variables)
   - Colors, spacing, typography, shadows, etc.
   - Light and dark mode variants
   - These are **design system tokens**, not app-specific styles

2. **Tailwind v4 Configuration** (`@theme` directive)
   - Exposes tokens to Tailwind utilities
   - Part of the design system configuration

3. **Design System Foundation**
   - Not app-specific customization
   - Core design system values

### Current References

**MCP Theme Server:**
```javascript
// .mcp/theme/server.mjs
const globalsCssPath = path.resolve(workspaceRoot, "apps/web/app/globals.css");
```

**Documentation:**
- `packages/ui/constitution/README.md` - References `apps/web/app/globals.css` as source of truth
- `packages/ui/ui-docs/` - Multiple references to `globals.css` as design system source

**UI Package:**
- Components in `@aibos/ui` depend on these tokens
- Design system is part of the UI package

---

## Best Practice Recommendation

### ✅ **RECOMMENDED: Move to `packages/ui/`**

**Rationale:**

1. **Design System Ownership**
   - Tokens are part of the design system, not app-specific
   - Design system code belongs in the design system package (`@aibos/ui`)

2. **Monorepo Best Practices**
   - Shared design system code should live in shared packages
   - Apps consume from packages, not the other way around
   - Follows "packages own shared code" principle

3. **Reusability**
   - If you add more apps later, they can import from `@aibos/ui`
   - Single source of truth for design tokens
   - Easier to maintain and version

4. **Co-location**
   - Design tokens live with design system components
   - Constitution files reference tokens → tokens should be in same package
   - Easier to discover and maintain

5. **Package Autonomy**
   - `@aibos/ui` package should be self-contained
   - Design system should not depend on app structure

---

## Recommended Structure

### Option 1: `packages/ui/src/styles/globals.css` ✅ **RECOMMENDED**

```
packages/ui/
├── src/
│   ├── styles/
│   │   └── globals.css          # Design system tokens + Tailwind config
│   ├── components/              # Components that use tokens
│   └── design/
│       └── tokens.ts            # TypeScript token definitions
└── package.json
```

**Pros:**
- Clear separation: styles in `src/styles/`
- Follows package structure conventions
- Easy to import: `@aibos/ui/styles/globals.css`

**App Usage:**
```tsx
// apps/web/app/layout.tsx
import "@aibos/ui/styles/globals.css";
```

### Option 2: `packages/ui/globals.css` (Root level)

```
packages/ui/
├── globals.css                  # Design system tokens
├── src/
│   ├── components/
│   └── design/
└── package.json
```

**Pros:**
- Simpler path
- Root-level visibility

**Cons:**
- Mixes config with source code
- Less clear organization

---

## Migration Plan

### Step 1: Move File

```bash
# Move globals.css to UI package
mv apps/web/app/globals.css packages/ui/src/styles/globals.css
```

### Step 2: Update Package Exports

**`packages/ui/package.json`:**
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./styles/globals.css": "./src/styles/globals.css"
  }
}
```

### Step 3: Update App Import

**`apps/web/app/layout.tsx`:**
```tsx
// Before
import "./globals.css";

// After
import "@aibos/ui/styles/globals.css";
```

### Step 4: Update MCP Theme Server

**`.mcp/theme/server.mjs`:**
```javascript
// Before
const globalsCssPath = path.resolve(workspaceRoot, "apps/web/app/globals.css");

// After
const globalsCssPath = path.resolve(workspaceRoot, "packages/ui/src/styles/globals.css");
```

### Step 5: Update Documentation

Update references in:
- `packages/ui/constitution/README.md`
- `packages/ui/ui-docs/**/*.md`
- `packages/ui/constitution/tokens.yml`
- Any other documentation files

---

## Alternative: Keep in App (Not Recommended)

### If You Keep It in `apps/web/app/globals.css`

**Pros:**
- ✅ Next.js convention (globals.css in app directory)
- ✅ No migration needed
- ✅ App-specific customization easier

**Cons:**
- ❌ Design system tokens in app directory (wrong ownership)
- ❌ Harder to share across multiple apps
- ❌ Violates monorepo best practices
- ❌ Design system depends on app structure
- ❌ MCP theme server points to app directory (confusing)

**When to Use:**
- Only if tokens are truly app-specific (not the case here)
- Only if you'll never have multiple apps (unlikely in monorepo)

---

## Comparison Table

| Aspect | `apps/web/app/` | `packages/ui/src/styles/` |
|--------|-----------------|---------------------------|
| **Ownership** | ❌ App owns design system | ✅ Design system owns itself |
| **Reusability** | ❌ Hard to share | ✅ Easy to import |
| **Monorepo Best Practice** | ❌ Violates principle | ✅ Follows principle |
| **Next.js Convention** | ✅ Standard location | ⚠️ Requires import path |
| **Co-location** | ❌ Separated from design system | ✅ With design system |
| **Maintenance** | ❌ App-specific location | ✅ Design system location |
| **MCP Server** | ⚠️ Points to app | ✅ Points to package |

---

## Final Recommendation

### ✅ **Move to `packages/ui/src/styles/globals.css`**

**Reasons:**
1. Design tokens are part of the design system, not the app
2. Follows monorepo best practices (shared code in packages)
3. Enables reusability across multiple apps
4. Better co-location with design system code
5. Clearer ownership and maintenance

**Trade-off:**
- Requires updating import path in app (one line change)
- Requires updating MCP server path (one line change)
- Small migration effort for better architecture

---

## Related Files

- `apps/web/app/layout.tsx` - Imports globals.css
- `.mcp/theme/server.mjs` - Reads globals.css
- `packages/ui/constitution/README.md` - References globals.css
- `packages/ui/constitution/tokens.yml` - References globals.css

---

**Recommendation:** ✅ **Move to `packages/ui/src/styles/globals.css`**

