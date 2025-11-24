# React MCP Decision: HYBRID Architecture

> **Decision Document** - React MCP Integration Strategy

**Decision:** ✅ **HYBRID with Optimization**

**Date:** 2024  
**Status:** Approved for Implementation

---

## Executive Summary

**Recommendation:** Implement a **hybrid architecture** that:

1. **Preserves** `globals.css` as SSOT for base tokens
2. **Adds** React MCP layer for runtime overrides and AI generation
3. **Bridges** static CSS variables with dynamic MCP tokens
4. **Enables** AI-driven component generation and manifest-driven UI

**Rationale:** Best of both worlds — performance of CSS variables + flexibility of MCP runtime.

---

## Evidence-Based Analysis

### ✅ Current Architecture Strengths

**Evidence from `apps/web/app/globals.css`:**

```css
/* Lines 22-134: Base tokens in CSS variables */
:root {
  --accent-bg: #4285f4;
  --accent-bg-hover: #3367d6;
  /* ... */
}

/* Line 168: Tenant overrides via CSS */
:root[data-tenant="dlbb"] {
  --accent-bg: #22c55e;
  /* ... */
}

/* Line 157: Safe mode via CSS */
[data-safe-mode="true"] {
  --accent-bg: var(--gray-500);
  /* ... */
}
```

**Strengths:**

- ✅ Zero JavaScript overhead for base tokens
- ✅ CSS cascade handles tenant/safe mode automatically
- ✅ Works with Server Components
- ✅ Fast initial render
- ✅ Already production-ready

**Evidence from `packages/ui/src/components/button.tsx`:**

```tsx
// Uses static componentTokens (Tailwind classes)
const base = componentTokens.buttonPrimary;
return <button className={`${base} ${className ?? ""}`} {...props} />;
```

**Strengths:**

- ✅ Simple, predictable
- ✅ Type-safe via tokens.ts
- ✅ No runtime overhead

---

### ❌ Current Architecture Gaps

**Missing Capabilities:**

1. **No AI-Driven Component Generation**

   - Cannot generate components from MCP tokens
   - No manifest-driven UI
   - No real-time preview

2. **No Runtime Theme Switching**

   - Tenant switching requires page reload
   - Cannot preview themes dynamically
   - No theme marketplace support

3. **No MCP-to-React Bridge**

   - Components don't know about MCP
   - Cannot leverage Supabase/GitHub MCP for UI
   - No real-time design sync

4. **No Component Validation**
   - Cannot validate React patterns via MCP
   - No Server/Client Component checking
   - No hook usage validation

---

## Hybrid Architecture Design

### Layer 1: CSS SSOT (Preserve)

**Keep:** `globals.css` as base token source

```css
/* Base tokens remain in CSS */
:root {
  --accent-bg: #4285f4;
  /* ... */
}
```

**Why:** Performance, Server Component compatibility, zero JS overhead.

---

### Layer 2: MCP Runtime Override (Add)

**Add:** React MCP hooks for runtime overrides

```tsx
// packages/mcp-client/hooks/useMcpTheme.ts
export function useMcpTheme(tenant?: string, safeMode = false) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      // Get base from CSS (already loaded)
      const base = getComputedStyle(document.documentElement);

      // Get overrides from MCP
      const mcpOverrides = tenant
        ? await call("theme", "getTenantOverrides", { tenantId: tenant })
        : {};

      // Merge: CSS base + MCP overrides
      setOverrides(mcpOverrides);
    }
    load();
  }, [tenant, safeMode]);

  return overrides;
}
```

**Why:** Enables runtime theme switching, AI generation, manifest-driven UI.

---

### Layer 3: CSS Variable Injector (Bridge)

**Add:** Dynamic CSS variable injection for MCP overrides

```tsx
// packages/ui/mcp/ThemeCssVariables.tsx
export function McpCssVariables({ tenant, safeMode }) {
  const overrides = useMcpTheme(tenant, safeMode);

  useEffect(() => {
    if (!overrides) return;

    // Inject MCP overrides as CSS variables
    Object.entries(overrides).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    return () => {
      // Cleanup on unmount
      Object.keys(overrides).forEach((key) => {
        document.documentElement.style.removeProperty(`--${key}`);
      });
    };
  }, [overrides]);

  return null; // No DOM output
}
```

**Why:** Bridges MCP tokens with CSS variables, maintains CSS performance.

---

### Layer 4: Component Generator (Enable AI)

**Add:** MCP-driven component generation

```tsx
// packages/ui/mcp/McpComponentGenerator.tsx
export async function generateComponentFromMcp(
  componentName: string,
  description: string
) {
  // 1. Get tokens from MCP
  const tokens = await call("theme", "getTheme");

  // 2. Get design from Figma MCP
  const design = await call("figma", "get_design_context", {
    componentName,
  });

  // 3. Generate component code
  const code = await call("ui-generator", "generate", {
    componentName,
    description,
    tokens,
    design,
  });

  return code;
}
```

**Why:** Enables AI-driven component generation, manifest-driven UI.

---

### Layer 5: Validation Layer (Quality)

**Add:** React MCP validation tools

```tsx
// packages/mcp-client/validation/validateComponent.ts
export async function validateReactComponent(filePath: string) {
  return await call("react-validation", "validate_react_component", {
    filePath,
  });
}
```

**Why:** Ensures quality, validates patterns, catches errors early.

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

1. **MCP Client Core**

   - Create `packages/mcp-client/index.ts`
   - Connect to existing MCP servers (Tailwind, Figma, Next.js)
   - Add theme MCP server connection

2. **Theme Hooks**
   - Implement `useMcpTheme` hook
   - Bridge CSS variables with MCP tokens
   - Support tenant/safe mode

**Deliverable:** Runtime theme switching working

---

### Phase 2: Integration (Week 2)

3. **CSS Variable Injector**

   - Implement `McpCssVariables` component
   - Inject MCP overrides into CSS variables
   - Maintain CSS cascade priority

4. **Theme Provider**
   - Create `McpThemeProvider` context
   - Integrate with AppShell
   - Support tenant switching

**Deliverable:** Full theme system integrated

---

### Phase 3: AI Generation (Week 3)

5. **Component Generator**

   - Implement MCP-driven component generation
   - Connect Figma MCP for design sync
   - Enable manifest-driven UI

6. **Validation Tools**
   - Implement React MCP validation
   - Server/Client Component checking
   - Hook usage validation

**Deliverable:** AI-driven component generation working

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           globals.css (SSOT)                    │
│  Base tokens, tenant overrides, safe mode      │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         React Components                        │
│  Use CSS variables via Tailwind classes         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         MCP Runtime Layer                       │
│  • useMcpTheme() - Runtime overrides            │
│  • McpCssVariables - Inject MCP tokens          │
│  • Theme Provider - Context management         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         MCP Servers                             │
│  • Theme MCP - Token generation                 │
│  • Figma MCP - Design sync                      │
│  • React MCP - Validation                      │
│  • Supabase MCP - Data                          │
└─────────────────────────────────────────────────┘
```

---

## Benefits of Hybrid Approach

### ✅ Performance

- **CSS variables** for base tokens (zero JS overhead)
- **MCP overrides** only when needed (lazy loading)
- **Server Components** remain fast (no client JS for base)

### ✅ Flexibility

- **Runtime theme switching** via MCP
- **AI-driven generation** from tokens
- **Manifest-driven UI** becomes possible
- **Real-time preview** of themes

### ✅ Compatibility

- **Existing components** continue working
- **CSS cascade** still handles tenant/safe mode
- **MCP overrides** enhance, don't replace
- **Backward compatible** with current system

### ✅ AI Integration

- **Component generation** from MCP tokens
- **Design-code sync** via Figma MCP
- **Validation** via React MCP
- **Manifest-driven** UI generation

---

## Risks and Mitigations

### Risk 1: Performance Overhead

**Mitigation:**

- MCP overrides only loaded when needed
- CSS variables remain primary
- Lazy load MCP hooks

### Risk 2: Complexity

**Mitigation:**

- Clear separation of concerns
- CSS remains SSOT
- MCP is enhancement layer

### Risk 3: Duplication

**Mitigation:**

- CSS for base, MCP for overrides
- Clear documentation of when to use each
- Validation ensures consistency

---

## Success Criteria

### ✅ Phase 1 Success

- [ ] MCP client connects to theme server
- [ ] `useMcpTheme` hook works
- [ ] Runtime theme switching functional

### ✅ Phase 2 Success

- [ ] CSS variable injection working
- [ ] Theme provider integrated
- [ ] Tenant switching at runtime

### ✅ Phase 3 Success

- [ ] Component generation from MCP
- [ ] React validation working
- [ ] Manifest-driven UI functional

---

## Comparison: Full MCP vs Hybrid

| Aspect                | Full MCP (Proposed)  | Hybrid (Recommended)            |
| --------------------- | -------------------- | ------------------------------- |
| **Performance**       | ⚠️ All tokens via JS | ✅ CSS base + MCP overrides     |
| **Server Components** | ❌ Requires client   | ✅ Works with Server Components |
| **Complexity**        | ⚠️ Higher            | ✅ Lower (CSS remains SSOT)     |
| **AI Generation**     | ✅ Full support      | ✅ Full support                 |
| **Runtime Switching** | ✅ Yes               | ✅ Yes                          |
| **Backward Compat**   | ❌ Breaking change   | ✅ Fully compatible             |
| **Initial Load**      | ⚠️ Slower (JS)       | ✅ Fast (CSS)                   |

**Winner:** Hybrid approach

---

## Next Steps

1. **Approve Architecture** - Review and approve hybrid design
2. **Implement Phase 1** - MCP client core and hooks
3. **Test Integration** - Verify CSS + MCP bridge works
4. **Document Usage** - Update component docs with MCP patterns
5. **Deploy Phase 2** - CSS variable injector and provider
6. **Enable AI Generation** - Phase 3 component generator

---

## Related Documentation

- [React MCP Proposal](./react-mcp-proposal.md) - Original proposal
- [Figma Sync](./figma-sync.md) - Design-code sync
- [Token System](../01-foundation/tokens.md) - Token architecture
- [Component Documentation](../02-components/) - Component patterns

---

**Decision:** ✅ **HYBRID with Optimization**  
**Priority:** High  
**Estimated Effort:** 3 weeks (3 phases)  
**Risk Level:** Low (backward compatible)

---

**Last Updated:** 2024  
**Next Review:** After Phase 1 implementation
