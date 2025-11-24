# globals.css Migration Complete

> **Date:** 2024  
> **Status:** ✅ **COMPLETE**

## Summary

Successfully migrated `globals.css` from `apps/web/app/globals.css` to `packages/ui/src/design/globals.css` following monorepo best practices.

---

## Migration Details

### File Movement

**From:** `apps/web/app/globals.css`  
**To:** `packages/ui/src/design/globals.css`

**Rationale:**
- ✅ Design tokens belong in the design system package
- ✅ Co-locates with `tokens.ts` (same directory)
- ✅ Follows monorepo best practices (shared code in packages)
- ✅ Enables reusability across multiple apps

---

## Changes Made

### 1. ✅ File Migration
- Created `packages/ui/src/design/globals.css`
- Deleted `apps/web/app/globals.css`

### 2. ✅ Package Configuration
**`packages/ui/package.json`:**
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./design/globals.css": "./src/design/globals.css"
  }
}
```

### 3. ✅ App Import Updated
**`apps/web/app/layout.tsx`:**
```tsx
// Before
import "./globals.css";

// After
import "@aibos/ui/design/globals.css";
```

### 4. ✅ MCP Theme Server Updated
**`.mcp/theme/server.mjs`:**
```javascript
// Before
const globalsCssPath = path.resolve(workspaceRoot, "apps/web/app/globals.css");

// After
const globalsCssPath = path.resolve(workspaceRoot, "packages/ui/src/design/globals.css");
```

### 5. ✅ Documentation Updated

**Files Updated:**
- `packages/ui/constitution/README.md`
- `packages/ui/constitution/tokens.yml`
- `packages/ui/ui-docs/04-integration/tailwind.md`
- `docs/design-system-guide.md`
- `.mcp/GLOBALS_CSS_LOCATION_RECOMMENDATION.md`

**All references changed from:**
- `apps/web/app/globals.css` → `packages/ui/src/design/globals.css`

---

## New Structure

```
packages/ui/
├── src/
│   ├── design/
│   │   ├── globals.css          # ✅ Design system tokens + Tailwind config
│   │   └── tokens.ts             # ✅ TypeScript token definitions
│   ├── components/              # Uses tokens from globals.css
│   └── ...
└── package.json                 # Exports globals.css
```

---

## Benefits Achieved

1. ✅ **Better Organization** - Design tokens co-located with TypeScript definitions
2. ✅ **Monorepo Best Practice** - Shared design system code in shared package
3. ✅ **Reusability** - Other apps can import: `@aibos/ui/design/globals.css`
4. ✅ **Clear Ownership** - Design system owns its tokens
5. ✅ **Maintainability** - Single source of truth for design tokens

---

## Usage

### In Next.js Apps

```tsx
// apps/web/app/layout.tsx
import "@aibos/ui/design/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### In Other Apps (Future)

Any app can now import the design system CSS:

```tsx
import "@aibos/ui/design/globals.css";
```

---

## Validation

✅ **File Structure:** Correct  
✅ **Package Exports:** Configured  
✅ **App Import:** Updated  
✅ **MCP Server:** Updated  
✅ **Documentation:** Updated  
✅ **Old File:** Removed  

---

## Related Files

- `packages/ui/src/design/globals.css` - ✅ New location
- `packages/ui/src/design/tokens.ts` - Co-located TypeScript definitions
- `packages/ui/package.json` - Package exports
- `apps/web/app/layout.tsx` - App import
- `.mcp/theme/server.mjs` - MCP server path

---

**Migration Status:** ✅ **COMPLETE**  
**Next Steps:** None - migration is complete and validated

