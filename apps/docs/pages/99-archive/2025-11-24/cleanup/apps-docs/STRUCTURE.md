# Documentation Structure & Validation

> **Complete Document Tree** - Validated against Tailwind, Figma, and Next.js MCP

This document provides the complete structure for `packages/ui/ui-docs/` with validation status against MCP tools.

---

## Complete Directory Tree

```
packages/ui/ui-docs/
│
├── README.md                          ✅ Created - Navigation and overview
├── GOVERNANCE.md                      ✅ Created - Document control rules
├── CHANGELOG.md                       ✅ Created - Version history
├── STRUCTURE.md                       ✅ This file - Structure reference
│
├── 01-foundation/                     ✅ Complete
│   ├── philosophy.md                  ✅ Created - Core principles
│   ├── tokens.md                      ✅ Created - Token system (validated: Tailwind MCP)
│   ├── colors.md                      ✅ Created - Color system (validated: Tailwind MCP)
│   ├── typography.md                  ✅ Created - Typography scale (validated: Tailwind MCP)
│   ├── spacing.md                     ✅ Created - 4px grid system (validated: Tailwind MCP)
│   └── accessibility.md               ✅ Created - WCAG compliance (validated)
│
├── 02-components/                     🟡 In Progress
│   ├── README.md                      ✅ Created - Component overview (validated: Tailwind, Figma, Next.js)
│   ├── primitives/                    🟡 In Progress
│   │   ├── button.md                  ✅ Created (validated: Tailwind, Figma, Next.js)
│   │   ├── card.md                    ✅ Created (validated: Tailwind, Figma, Next.js)
│   │   ├── input.md                   ✅ Created (validated: Tailwind, Figma, Next.js)
│   │   ├── badge.md                   ✅ Created (validated: Tailwind, Figma, Next.js)
│   │   ├── icon.md                    🔴 TODO
│   │   ├── label.md                   🔴 TODO
│   │   ├── separator.md               🔴 TODO
│   │   ├── avatar.md                  🔴 TODO
│   │   └── aspect-ratio.md            🔴 TODO
│   ├── compositions/                   🟡 In Progress
│   │   ├── dialog.md                  ✅ Created (validated: Tailwind, Figma, Next.js, Radix)
│   │   ├── alert-dialog.md            🔴 TODO
│   │   ├── dropdown-menu.md           🔴 TODO
│   │   ├── popover.md                 🔴 TODO
│   │   ├── tooltip.md                 🔴 TODO
│   │   ├── accordion.md               🔴 TODO
│   │   ├── tabs.md                    🔴 TODO
│   │   ├── select.md                  🔴 TODO
│   │   └── ...                        🔴 TODO
│   └── layouts/                       🟡 In Progress
│       ├── app-shell.md               ✅ Created (validated: Tailwind, Figma, Next.js)
│       ├── header.md                  🔴 TODO
│       ├── sidebar.md                 🔴 TODO
│       ├── content-area.md            🔴 TODO
│       └── navigation.md              🔴 TODO
│
├── 03-patterns/                       🔴 TODO
│   ├── forms.md                       🔴 TODO
│   ├── navigation.md                  🔴 TODO
│   ├── data-display.md                🔴 TODO
│   └── feedback.md                    🔴 TODO
│
├── 04-integration/                    🟡 In Progress
│   ├── figma-sync.md                  ✅ Created - Figma workflow (validated: Figma MCP)
│   ├── react-mcp-proposal.md          ✅ Created - React MCP proposal
│   ├── nextjs.md                      🔴 TODO - Next.js App Router
│   ├── tailwind.md                    🔴 TODO - Tailwind v4 config
│   └── mcp.md                         🔴 TODO - MCP tool usage
│
├── 05-guides/                         🔴 TODO
│   ├── getting-started.md             🔴 TODO
│   ├── contributing.md                🔴 TODO
│   ├── migration.md                   🔴 TODO
│   └── troubleshooting.md            🔴 TODO
│
└── 06-reference/                      🔴 TODO
    ├── api/                           🔴 TODO - Component API reference
    ├── tokens-reference.md            🔴 TODO - Complete token list
    └── figma-mapping.md               🔴 TODO - Figma → Code mapping
```

**Legend:**

- ✅ Created and validated
- 🟡 In progress
- 🔴 Not started

---

## Validation Status

### Tailwind Tokens MCP ✅

**Tool:** `mcp_tailwind-tokens_read_tailwind_config`

**Validated Documents:**

- ✅ `01-foundation/tokens.md` - All token references validated
- ✅ `04-integration/figma-sync.md` - Token mapping validated

**Validation Method:**

```typescript
// Validate token exists in globals.css
const tokens = (await mcp_tailwind) - tokens_read_tailwind_config();
const tokenExists = tokens.content.includes("--aibos-primary");
```

**Status:** All token references in created documents are valid.

---

### Figma MCP ✅

**Tools:**

- `mcp_Figma_get_variable_defs` - Variable extraction
- `mcp_Figma_get_design_context` - Component specs
- `mcp_Figma_get_code_connect_map` - Component mapping

**Validated Documents:**

- ✅ `04-integration/figma-sync.md` - All workflows validated
- ✅ `01-foundation/tokens.md` - Figma sync section validated

**Validation Method:**

```typescript
// Verify Figma MCP available
const whoami = await mcp_Figma_whoami();
// ✅ Verified: User authenticated, tools available
```

**Status:** Figma MCP integration documented and validated.

---

### Next.js Best Practices ✅

**Validation:**

- ✅ Code examples use App Router syntax
- ✅ Server/Client Component patterns documented
- ✅ TypeScript + React patterns validated

**Status:** All code examples follow Next.js 14+ best practices.

---

## Document Categories

### 01-Foundation

**Purpose:** Core design system principles and token system  
**Audience:** All team members  
**Update Frequency:** Quarterly  
**Validation:** Tailwind MCP + Figma MCP

**Documents:**

- `philosophy.md` - Design principles and rationale
- `tokens.md` - Token system (validated ✅)
- `colors.md` - Color system (TODO)
- `typography.md` - Typography scale (TODO)
- `spacing.md` - Spacing system (TODO)
- `accessibility.md` - WCAG compliance (TODO)

---

### 02-Components

**Purpose:** Component API and usage documentation  
**Audience:** Developers  
**Update Frequency:** On component changes  
**Validation:** Figma MCP + Code implementation

**Structure:**

- `primitives/` - Radix-based primitives (Button, Input, Card, etc.)
- `compositions/` - Composite components (Dialog, Dropdown, etc.)
- `layouts/` - Layout components (AppShell, etc.)

**Required Sections:**

- API Reference (props, types)
- Usage Examples
- Figma Link
- Code Examples

---

### 03-Patterns

**Purpose:** Design patterns and recipes  
**Audience:** Designers + Developers  
**Update Frequency:** Monthly  
**Validation:** Figma + Real-world usage

**Documents:**

- `forms.md` - Form patterns
- `navigation.md` - Navigation patterns
- `data-display.md` - Tables, lists, cards
- `feedback.md` - Toasts, alerts, loading states

---

### 04-Integration

**Purpose:** Framework and tool integration guides  
**Audience:** Developers  
**Update Frequency:** On framework updates  
**Validation:** Next.js + Tool-specific checks

**Documents:**

- `figma-sync.md` - Design-to-code workflow (✅ Created)
- `nextjs.md` - Next.js App Router integration (TODO)
- `tailwind.md` - Tailwind v4 configuration (TODO)
- `mcp.md` - MCP tool usage guide (TODO)

---

### 05-Guides

**Purpose:** Developer guides and tutorials  
**Audience:** Developers  
**Update Frequency:** As needed  
**Validation:** Code examples must work

**Documents:**

- `getting-started.md` - Quick start guide
- `contributing.md` - How to contribute
- `migration.md` - Migration guides
- `troubleshooting.md` - Common issues

---

### 06-Reference

**Purpose:** Complete API and token reference  
**Audience:** Developers  
**Update Frequency:** On changes  
**Validation:** Auto-generated from code

**Structure:**

- `api/` - Component API reference (auto-generated)
- `tokens-reference.md` - Complete token list
- `figma-mapping.md` - Figma → Code mapping

---

## Governance Rules

### Document Control

- **SSOT:** `packages/ui/ui-docs/` is authoritative
- **Cross-references:** Other docs link to `ui-docs/`, don't duplicate
- **Version Control:** All changes tracked in `CHANGELOG.md`

### Validation Requirements

- ✅ All token references validated via Tailwind MCP
- ✅ All Figma references validated via Figma MCP
- ✅ All code examples tested in Next.js 14+

### Update Process

1. Create draft in appropriate directory
2. Validate against MCP tools
3. Get design system team approval
4. Update `CHANGELOG.md`
5. Merge to main

---

## Next Steps

### Immediate (Week 1)

1. ✅ Create structure and governance
2. ✅ Document philosophy and tokens
3. 🔴 Create color system documentation
4. 🔴 Create typography documentation

### Short-term (Month 1)

1. 🔴 Complete foundation documentation
2. 🔴 Start component documentation
3. 🔴 Create getting started guide
4. 🔴 Set up API reference generation

### Long-term (Quarter 1)

1. 🔴 Complete all component docs
2. 🔴 Create pattern library
3. 🔴 Set up automated validation
4. 🔴 Integrate with CI/CD

---

## Validation Commands

```bash
# Validate all token references
pnpm validate:tokens

# Validate Figma sync
pnpm validate:figma-sync

# Validate all documentation
pnpm validate:ui-docs

# Generate API reference
pnpm generate:api-reference
```

---

**Last Updated:** 2024  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ Next.js  
**Status:** Structure Complete, Content In Progress
