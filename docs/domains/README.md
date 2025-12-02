# Domain Wikis

## 🎯 Purpose

Domain wikis contain **local knowledge** and **implementation details** for specific business domains.

**Rule:** Domain wikis MUST reference [Metadata SSOT](../metadata-ssot/index.md) for all canonical concepts. They **apply** SSOT definitions, they do NOT redefine them.

---

## 📂 Domain Structure

| Domain | Owner | Status | Description |
|--------|-------|--------|-------------|
| [Finance](./finance/index.md) | Finance Team | 🔜 Setup | Statutory reporting, IFRS compliance |
| [ERP Engine](./erp-engine/index.md) | ERP Team | ✅ Draft-MVP | Posting rules, JE logic, workflows |
| [Operations](./operations/index.md) | Ops Team | 🔜 Planned | KPIs, dashboards, real-time metrics |
| [Metadata Studio](./metadata-studio/index.md) | CID | 🔜 Planned | Concept creation, approval workflows |
| [Tax](./tax/index.md) | Finance × Tax | 🔜 Planned | Tax returns, compliance |

---

## 🏗️ Front-Matter Format

Every domain wiki page uses this front-matter:

```yaml
---
title: Sales Invoice Posting Rules (ERP Engine)
wiki_type: domain
domain: ERP_ENGINE
ssot_refs:
  - revenue_ifrs_core
  - sales_value_operational
  - sales_quantity_operational
owner: Finance × ERP Engine
status: Draft
last_updated: 2025-12-02
---
```

**Required Fields:**
- `title`: Page title
- `wiki_type`: Always `domain` (not `ssot`)
- `domain`: Which domain this belongs to
- `ssot_refs`: List of canonical_concepts referenced (MUST exist in SSOT)
- `owner`: Responsible team(s)
- `status`: Draft, Review, Approved
- `last_updated`: ISO date

---

## 🔒 Governance Rules

### Rule 1: Reference SSOT, Don't Redefine

✅ **CORRECT:**
```markdown
When posting a sales invoice, we recognize `revenue_ifrs_core` 
according to IFRS 15 control transfer rules.

See: [Revenue SSOT Matrix](../../metadata-ssot/finance-revenue-matrix.md)
```

❌ **WRONG:**
```markdown
Revenue is the amount we receive when the customer pays.
```

### Rule 2: Link Back to SSOT Pages

Every time you mention a business concept, link to its SSOT definition:

```markdown
The posting rule uses [`revenue_ifrs_core`](../../metadata-ssot/finance-revenue-matrix.md#1-revenue_ifrs_core)
```

### Rule 3: SSOT References Must Be Valid

Before publishing a domain wiki page, verify all `ssot_refs` exist in:
- `mdm_concept_global` table (database)
- A SSOT matrix page (`docs/metadata-ssot/`)

---

## 📖 How to Create a Domain Wiki Page

1. **Identify SSOT concepts** your page will use
2. **Verify they exist** in [SSOT index](../metadata-ssot/index.md)
3. **Add front-matter** with `ssot_refs`
4. **Write content** with links back to SSOT
5. **Review** with domain owner + CID

---

## 🚀 Quick Links

- [Metadata SSOT](../metadata-ssot/index.md) - Canonical definitions
- [Naming Convention System](../../NAMING-SYSTEM-COMPLETE.md) - Technical implementation
- [Approval Workflow](../../metadata-studio/README.md) - How concepts are approved

---

**Remember:** SSOT defines WHAT. Domain wikis define HOW.

