# ✅ Wiki Structure Complete - Metadata SSOT + Domain Wikis

## 🎯 What Was Implemented

The **documentation layer** for your metadata governance system is now in place.

This sits on top of the technical layer ([Naming Convention System](./NAMING-SYSTEM-COMPLETE.md)) and provides the human-readable governance rules.

---

## 📂 Directory Structure Created

```
docs/
├── metadata-ssot/                    # SSOT Layer (LAW)
│   ├── index.md                      # ✅ SSOT guide & principles
│   ├── finance-revenue-matrix.md     # ✅ Revenue/Sales/Income/Gain matrix
│   ├── finance-inventory-matrix.md   # 🔜 Planned
│   ├── ops-kpi-matrix.md             # 🔜 Planned
│   ├── design-tokens-matrix.md       # 🔜 Planned
│   └── tax-matrix.md                 # 🔜 Planned
│
└── domains/                          # Domain Layer (PRACTICE)
    ├── README.md                     # ✅ Domain wikis guide
    ├── finance/
    │   └── index.md                  # ✅ Finance domain home
    ├── erp-engine/
    │   ├── index.md                  # ✅ ERP Engine domain home
    │   └── posting-rules-sales-invoice.md  # ✅ Example domain page
    ├── operations/                   # 🔜 Planned
    ├── metadata-studio/              # 🔜 Planned
    └── tax/                          # 🔜 Planned
```

---

## ✅ Minimal Definition of Done (ACHIEVED)

### SSOT Layer ✅

- [x] **`docs/metadata-ssot/index.md`** - How canonical keys, aliases, naming variants work
- [x] **`docs/metadata-ssot/finance-revenue-matrix.md`** - Full matrix page with 5 canonical concepts

### Domain Layer ✅

- [x] **`docs/domains/README.md`** - Domain wikis guide
- [x] **`docs/domains/finance/index.md`** - Finance domain home
- [x] **`docs/domains/erp-engine/index.md`** - ERP Engine domain home
- [x] **`docs/domains/erp-engine/posting-rules-sales-invoice.md`** - Full example with SSOT references

### Conventions ✅

- [x] Front-matter pattern (`wiki_type`, `domain`, `canonical_concepts`, `ssot_refs`)
- [x] SSOT as LAW, domain wikis as PRACTICE NOTES
- [x] All domain pages link back to SSOT definitions

---

## 📊 What's in the SSOT Matrix

### Canonical Concepts Defined

| Canonical Key | Aliases | Domain | Status |
|---------------|---------|--------|--------|
| `revenue_ifrs_core` | Revenue, Turnover | Finance | ✅ Approved |
| `other_income_ifrs` | Other Income, Non-Operating Income | Finance | ✅ Approved |
| `gain_ifrs_other` | Gain on Disposal, Revaluation Gain | Finance | ✅ Approved |
| `sales_value_operational` | Sales, Gross Sales, Total Sales | Operations | ✅ Approved |
| `sales_quantity_operational` | Units Sold, Quantity Sold | Operations | ✅ Approved |

### Alias Matrix

| Business Term | Finance IFRS | Operations | BI | Tax |
|---------------|-------------|------------|-----|-----|
| "Revenue" | `revenue_ifrs_core` | ❌ Use "Sales" | Context-dependent | `revenue_ifrs_core` |
| "Sales" | ❌ Use "Revenue" | `sales_value_operational` | `sales_value_operational` | N/A |
| "Income" | `revenue_ifrs_core` OR `other_income_ifrs` | ❌ Ambiguous | ❌ Avoid | Context-dependent |
| "Turnover" | `revenue_ifrs_core` | `sales_value_operational` | `sales_value_operational` | `revenue_ifrs_core` |
| "Gain" | `gain_ifrs_other` | ❌ Never | ❌ Never | `gain_ifrs_other` |

---

## 🏗️ How Domain Pages Reference SSOT

### Example: ERP Engine Posting Rules

**File:** `docs/domains/erp-engine/posting-rules-sales-invoice.md`

**Front-matter:**
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
---
```

**Content shows:**
1. ✅ Links to SSOT definitions
2. ✅ How to use canonical concepts in code
3. ✅ Control transfer rules (IFRS 15)
4. ✅ Operational vs statutory tracking
5. ✅ What NOT to do (common mistakes)
6. ✅ Integration with other systems

---

## 🔒 Governance Rules Enforced

### Rule 1: SSOT Defines, Domains Apply

- ✅ SSOT: "Revenue is recognized when control transfers (IFRS 15)"
- ✅ Domain: "When posting sales invoice, we recognize `revenue_ifrs_core`..."
- ❌ Domain: "Revenue means when customer pays" (redefining SSOT)

### Rule 2: New Concepts Must Flow Through SSOT

```
Domain Need → Metadata Approval → SSOT Entry → Domain Usage
```

### Rule 3: All References Must Be Valid

Every `ssot_refs` in domain pages must exist in:
- `mdm_concept_global` table
- A SSOT matrix page

---

## 🎯 How This Prevents Chaos

### Before (Jenga):

```
Finance code:     "Revenue" (means IFRS 15)
Operations code:  "Revenue" (means invoice value)
BI dashboards:    "Revenue" (means ??? maybe both?)
Tax system:       "Revenue" (means statutory)

☠️ Result: 4 different definitions, reconciliation nightmare
```

### After (Lego):

```
SSOT:
  - revenue_ifrs_core (Finance, Tax) - IFRS 15 control transfer
  - sales_value_operational (Operations, BI) - Invoice value

Finance:        Uses revenue_ifrs_core ✅
Operations:     Uses sales_value_operational ✅
BI:             Uses sales_value_operational ✅
Tax:            Uses revenue_ifrs_core ✅

✅ Result: Clear definitions, easy reconciliation
```

---

## 🚀 What You Can Do Now

### For Developers

```typescript
// 1. Check SSOT first
// docs/metadata-ssot/finance-revenue-matrix.md#revenue_ifrs_core

// 2. Resolve name variant
const tsName = await resolveNameForConcept({
  canonicalKey: "revenue_ifrs_core",
  context: "typescript",
  tenantId: "tenant-123",
});
// Returns: "revenueIfrsCore"

// 3. Use in code
const revenue = await getMetric(tsName);
```

### For Metadata Stewards

1. Define new concept in SSOT matrix page
2. Add to `mdm_concept_global` table
3. Pre-generate naming variants
4. Domain wikis can now reference it

### For AI Agents

1. Always resolve canonical_key via Metadata MCP
2. Reference SSOT page for definition
3. Apply domain-specific logic from domain wikis
4. Never trust aliases without validation

---

## 📋 Next Steps (When Ready)

### Immediate (Optional)

- [ ] Add more SSOT matrix pages:
  - Inventory & COGS Matrix
  - Operations KPI Matrix
  - Tax Compliance Matrix

- [ ] Add more domain pages:
  - Revenue Reporting Playbook (Finance)
  - Outlet Sales Dashboard (Operations)
  - Payment Allocation Rules (ERP Engine)

### Later

- [ ] MCP tools integration
  - `get-concept` returns SSOT definition + page link
  - Domain-specific MCPs reference metadata MCP

- [ ] Validation tools
  - Check all `ssot_refs` exist
  - Validate front-matter format
  - Auto-generate concept index

- [ ] Dashboard integration
  - When building dashboards, auto-link to SSOT pages
  - Show canonical_key + aliases in metadata tooltips

---

## 📚 Files Created

```
✅ docs/metadata-ssot/index.md
✅ docs/metadata-ssot/finance-revenue-matrix.md
✅ docs/domains/README.md
✅ docs/domains/finance/index.md
✅ docs/domains/erp-engine/index.md
✅ docs/domains/erp-engine/posting-rules-sales-invoice.md
✅ WIKI-STRUCTURE-COMPLETE.md (this file)
```

---

## 🎊 Status

**Wiki Structure:** ✅ LOCKED IN

You now have:

1. ✅ **Technical Layer** - Naming system with DB table
2. ✅ **Documentation Layer** - Wiki structure with governance
3. ✅ **Example Content** - Revenue matrix + ERP posting rules

This is **Lego, not Jenga**:
- SSOT is the foundation (stable, single source of truth)
- Domain wikis are modules (add/change without breaking SSOT)
- Technical system enforces snake_case SSOT rule
- Documentation layer provides human-readable governance

---

**The foundation is complete. The chaos is prevented. The platform is ready to scale.** 🎉

---

## 🔗 Related Documentation

- [Naming Convention System](./NAMING-SYSTEM-COMPLETE.md) - Technical implementation
- [Event System Integration](./EVENT-SYSTEM-INTEGRATION-COMPLETE.md) - Event-driven architecture
- [Server Status](./SERVER-IS-LIVE.md) - Running server details

