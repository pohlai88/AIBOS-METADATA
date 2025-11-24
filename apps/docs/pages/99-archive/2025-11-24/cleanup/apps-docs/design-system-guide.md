# AI-BOS Design System Guide

> **High-level overview** of the AI-BOS design system. For detailed documentation, see [`packages/ui/ui-docs/`](../packages/ui/ui-docs/).

This document provides a quick reference and overview of the design system. All detailed documentation, component APIs, tokens, and integration guides are maintained in the [`@aibos/ui` package documentation](../packages/ui/ui-docs/).

---

## 🎯 Quick Links

- **[Complete UI Documentation](../packages/ui/ui-docs/)** - Full design system documentation
- **[Design Tokens](../packages/ui/ui-docs/01-foundation/tokens.md)** - Token system reference
- **[Component Documentation](../packages/ui/ui-docs/02-components/)** - Component API and usage
- **[Integration Guides](../packages/ui/ui-docs/04-integration/)** - Next.js, Figma, and MCP integration

---

## 1. Overview & Philosophy

The AI-BOS design system follows these core principles:

- **Lego, not Jenga**: All UI must be composed from small, stable building blocks
- **Token-first, theme-second**: All styling derived from design tokens
- **Safe Mode & Compliance**: WCAG AA/AAA compliance with safe mode support
- **Multi-tenant ready**: Token system supports tenant customization

**📖 Detailed Philosophy:** See [Design Philosophy](../packages/ui/ui-docs/01-foundation/philosophy.md)

---

## 2. Token System

The design system uses a dual-layer token architecture:

1. **CSS Variables** (`packages/ui/src/design/globals.css`) - Runtime theme switching
2. **TypeScript Tokens** (`packages/ui/src/design/tokens.ts`) - Type-safe token access

**📖 Detailed Token Documentation:** See [Token System](../packages/ui/ui-docs/01-foundation/tokens.md)

**Key Token Categories:**
- [Colors](../packages/ui/ui-docs/01-foundation/colors.md) - Color system and usage
- [Typography](../packages/ui/ui-docs/01-foundation/typography.md) - Typography scale
- [Spacing](../packages/ui/ui-docs/01-foundation/spacing.md) - 4px grid system

---

## 3. Tailwind Utilities

Tailwind v4 is configured via `@theme` in `packages/ui/src/design/globals.css` (no `tailwind.config.ts` needed).

**✅ Allowed:** Semantic utilities using design tokens
- Surfaces: `bg-bg`, `bg-bg-muted`, `bg-bg-elevated`
- Text: `text-fg`, `text-fg-muted`, `text-fg-subtle`
- Accent: `bg-primary`, `bg-primary-soft`, `text-primary-foreground`

**❌ Forbidden:** Raw Tailwind palette colors or arbitrary values
- `bg-emerald-500`, `text-slate-400`, `border-[#123456]`

**📖 Configuration Details:** See [Tailwind Configuration](../packages/ui/ui-docs/04-integration/tailwind.md)

---

## 4. Component Architecture

**Rule:** Never use Radix primitives directly in app code. All Radix usage must be wrapped inside `packages/ui` components.

**📖 Component Documentation:** See [Component Overview](../packages/ui/ui-docs/02-components/README.md)

---

## 5. Accessibility

The design system follows WCAG AA/AAA standards with safe mode support.

**📖 Accessibility Guidelines:** See [Accessibility Documentation](../packages/ui/ui-docs/01-foundation/accessibility.md)

---

## 6. Component Patterns

Components live in `packages/ui/src/components` and follow consistent patterns.

**📖 Component Documentation:**
- [Primitives](../packages/ui/ui-docs/02-components/primitives/) - Base components
- [Compositions](../packages/ui/ui-docs/02-components/compositions/) - Composite components
- [Layouts](../packages/ui/ui-docs/02-components/layouts/) - Layout components

---

## 7. Layer Responsibilities

- **`packages/ui`** → Primitives & patterns (tokens, Radix, base behaviors)
- **`apps/*/components`** → Feature compositions (no raw Radix, no raw Tailwind colors)
- **`apps/*/layouts`** → Page shells, navigation, app chrome
- **`app/globals.css`** → Theme + tokens

**Rule:** Business logic never lives in `packages/ui`; only layout, styling, and interaction patterns.

---

## 8. CI/CD & Validation

Automated validation enforces design system rules:

- No raw CSS colors
- No Radix imports outside `packages/ui`
- No inline styles for colors/shadows
- Token usage compliance

**📖 Validation Details:** See [Governance Rules](../packages/ui/ui-docs/GOVERNANCE.md)

---

## 9. Change Management

- **Token changes:** Must be backwards compatible when possible
- **Component changes:** Breaking changes require major version bump
- **Additions:** New primitives require RFC

**📖 Change Management:** See [CHANGELOG](../packages/ui/ui-docs/CHANGELOG.md) and [Governance](../packages/ui/ui-docs/GOVERNANCE.md)

---

## 10. Quick Reference

**Import tokens from:** `packages/ui/src/design/tokens.ts`

**For AI prompts:**
- Use `colorTokens`, `radiusTokens`, `shadowTokens`, `componentTokens`
- Avoid Tailwind default color palette classes

**For feature pages:**
- Compose from `@aibos/ui` components and semantic utilities only

---

## 📚 Complete Documentation

For detailed documentation, see the [complete UI documentation](../packages/ui/ui-docs/):

- [Design Tokens](../packages/ui/ui-docs/01-foundation/tokens.md)
- [Component API Reference](../packages/ui/ui-docs/02-components/)
- [Integration Guides](../packages/ui/ui-docs/04-integration/)
- [Developer Guides](../packages/ui/ui-docs/05-guides/)

---

**Last Updated:** 2024  
**Maintained By:** AIBOS Design System Team

