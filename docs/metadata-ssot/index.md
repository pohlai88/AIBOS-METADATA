# Metadata SSOT (Single Source of Truth)

## 🎯 Purpose

This directory contains the **canonical definitions** for all business concepts, naming conventions, and cross-domain rules in the AI-BOS platform.

**Rule:** All canonical concepts, aliases, and naming variants are defined HERE FIRST, before being used in domain-specific code or documentation.

---

## 📋 Core Principles

### 1. Canonical Key is Always `snake_case`

Every business concept has ONE canonical key in `snake_case` format stored in `mdm_concept_global`.

**Example:**
- ✅ Canonical: `revenue_ifrs_core`
- ❌ Not canonical: `RevenueIFRSCore`, `revenue-ifrs-core`, `REVENUE_IFRS_CORE`

### 2. Aliases Map to Canonical Concepts

Multiple business terms (Sales, Revenue, Income, Turnover) map to ONE canonical concept.

**Example:**
- Canonical: `revenue_ifrs_core`
- Aliases: "Revenue", "Sales", "Turnover", "Income" (context-dependent)

### 3. Naming Variants are Generated

Different technical contexts need different casing:
- `db`: `revenue_ifrs_core` (snake_case)
- `typescript`: `revenueIfrsCore` (camelCase)
- `graphql`: `RevenueIfrsCore` (PascalCase)
- `const`: `REVENUE_IFRS_CORE` (UPPER_SNAKE)
- `api_path`: `revenue-ifrs-core` (kebab-case)

These are stored in `mdm_naming_variant` table or auto-generated.

### 4. Cross-Domain Rules are Explicit

What's allowed in Finance vs Operations vs Tax is defined in SSOT matrix pages, not scattered in code.

---

## 🗂️ SSOT Matrix Pages

| Domain | SSOT Page | Status | Owner |
|--------|-----------|--------|-------|
| Finance | [Revenue vs Sales vs Income vs Gain](./finance-revenue-matrix.md) | ✅ Draft-MVP | CID |
| Finance | [Inventory & COGS Matrix](./finance-inventory-matrix.md) | 🔜 Planned | CID |
| Operations | [KPI Matrix](./ops-kpi-matrix.md) | 🔜 Planned | Operations |
| Design | [Design Tokens Matrix](./design-tokens-matrix.md) | 🔜 Planned | UX |
| Tax | [Tax Compliance Matrix](./tax-matrix.md) | 🔜 Planned | Finance × Tax |

---

## 📝 How to Use SSOT

### For Developers

Before using any business term in code:

1. **Search SSOT** - Find the canonical_key
2. **Use naming system** - Get the right variant for your context
3. **Reference SSOT** - Link back to the matrix page in comments/docs

```typescript
// Reference: docs/metadata-ssot/finance-revenue-matrix.md
// Canonical: revenue_ifrs_core
import { resolveNameForConcept } from './naming';

const tsName = await resolveNameForConcept({
  canonicalKey: "revenue_ifrs_core",
  context: "typescript",
  tenantId: "tenant-123",
});
// Returns: "revenueIfrsCore"
```

### For Metadata Stewards

When creating new concepts:

1. **Propose canonical_key** (must be snake_case)
2. **Define aliases** (business terms that map to this concept)
3. **Add to SSOT matrix page**
4. **Create entry in `mdm_concept_global`**
5. **Generate naming variants** (auto or manual)

### For AI Agents

AI agents MUST:

1. **Resolve canonical_key first** via Metadata MCP
2. **Never trust domain-specific aliases** without validation
3. **Use SSOT as ground truth** for all business logic

---

## 🏗️ Front-Matter Format

Every SSOT matrix page uses this front-matter:

```yaml
---
title: Revenue vs Sales vs Income vs Gain (IFRS/MFRS Matrix)
wiki_type: ssot
domain: FINANCE
canonical_concepts:
  - revenue_ifrs_core
  - other_income_ifrs
  - gain_ifrs_other
  - sales_value_operational
  - sales_quantity_operational
owner: CID – Central Insight Department
status: Draft-MVP
last_updated: 2025-12-02
---
```

---

## 🔒 Governance Rules

### Rule 1: SSOT Defines, Domains Apply

- ✅ **SSOT:** "Revenue is recognized when control transfers (IFRS 15)"
- ✅ **Domain Wiki:** "In sales invoice posting, we recognize revenue_ifrs_core..."
- ❌ **Domain Wiki:** "Revenue means when customer pays" (redefining SSOT)

### Rule 2: New Concepts Must Flow Through SSOT

```
Domain Need → Metadata Approval → SSOT Entry → Domain Usage
```

Not:
```
Domain Need → Direct Code → Chaos ❌
```

### Rule 3: One Canonical Key, Many Aliases

- Canonical key: Stable, technical, snake_case
- Aliases: Flexible, business-friendly, context-dependent
- Never the other way around

---

## 🚀 Quick Start

1. **Find a concept:** Browse matrix pages or search for business term
2. **Get canonical_key:** Copy from `canonical_concepts` list
3. **Resolve name variant:** Use naming system for your context
4. **Reference in code:** Link back to SSOT page

---

## 📚 Related Documentation

- [Naming Convention System](../../NAMING-SYSTEM-COMPLETE.md) - Technical implementation
- [Domain Wikis](../domains/README.md) - How to apply SSOT in your domain
- [Metadata Studio Approval Workflow](../../metadata-studio/README.md) - How concepts are approved

---

**Remember:** SSOT is LAW. Domain wikis are PRACTICE NOTES.

