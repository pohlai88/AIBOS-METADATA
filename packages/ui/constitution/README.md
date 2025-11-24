# UI Constitution

> **Design governance rules** for the `@aibos/ui` package.

This directory contains the design system constitution files that define rules and governance for UI components, React Server Components, and design tokens.

---

## 📁 Files

### `components.yml`
Component structure and validation rules (86 rules)
- Component patterns (primitive, composition, layout)
- Props rules and validation
- Accessibility requirements
- State management patterns

### `rsc.yml`
React Server Component boundary rules
- Server/Client component separation
- Forbidden browser APIs in RSC
- Styling rules for RSC
- Hook usage restrictions

### `tokens.yml`
Token governance and hierarchy rules
- Token versioning and immutability
- Token hierarchy (5 levels)
- Token categories (color, spacing, typography, radius, shadow)
- RSC token rules
- Tenant override boundaries
- Safe mode rules
- **Source of Truth:** `packages/ui/src/design/globals.css`

---

## 🎯 Purpose

These constitution files are used by:

1. **MCP Component Generator** (`tools/mcp-component-generator.mjs`)
   - Validates generated components against rules
   - Ensures AI-generated code follows design system

2. **UI Constitution Validator** (`.mcp/component-generator/tools/validate-constitution.ts`)
   - Validates existing code against rules
   - Prevents violations in codebase

3. **Documentation**
   - References for design system rules
   - Governance documentation

---

## 🔗 Related Files

### Token Implementation
- **Source of Truth:** `packages/ui/src/design/globals.css` - CSS variable definitions
- **TypeScript Tokens:** `src/design/tokens.ts` - Type-safe token access

### Documentation
- **UI Docs:** `ui-docs/` - Complete UI documentation
- **Design System Guide:** `../../docs/design-system-guide.md` - High-level overview

---

## 📝 Token Source of Truth

**Important:** All base token values are defined in `packages/ui/src/design/globals.css` as CSS variables.

The `tokens.yml` file defines:
- **Governance rules** for tokens
- **Token hierarchy** and precedence
- **Validation rules** for token usage
- **Reference** to `globals.css` as source of truth

When `globals.css` tokens change:
1. Update token values in `packages/ui/src/design/globals.css`
2. Update `tokens.yml` if governance rules change
3. Update `src/design/tokens.ts` if TypeScript types change

---

## ✅ Validation

To validate code against constitution rules:

```bash
# Validate UI constitution
pnpm lint:ui-constitution

# Generate component (validates against constitution)
# Use MCP component-generator server or CLI tool
```

---

**Last Updated:** 2024  
**Maintained By:** AIBOS Platform Team

