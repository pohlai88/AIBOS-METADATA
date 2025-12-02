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

# Revenue vs Sales vs Income vs Gain (IFRS/MFRS Matrix)

## 🎯 Purpose

Define canonical concepts and aliases for revenue recognition across Finance, Operations, Tax, and BI contexts.

**SSOT Rule:** All these business terms map to specific canonical concepts. Code and reports MUST use canonical_key, not arbitrary aliases.

---

## 📊 Canonical Concepts

### 1. `revenue_ifrs_core`

**Definition:** Revenue from ordinary activities recognized per IFRS 15 (control transfer)

**Standard Pack:** `IFRS_CORE`

**Tier:** `tier1` (Critical for statutory reporting)

**Aliases:**
- **Finance:** "Revenue", "Revenue from Contracts with Customers"
- **MFRS:** "Revenue" (MFRS 15)
- **Tax:** "Taxable Revenue" (context-dependent)
- **Operations:** ❌ DO NOT USE (use `sales_value_operational` instead)

**Cross-Domain Rules:**
- ✅ **Finance Statutory Reports:** MUST use this
- ✅ **Tax Returns:** Use this for revenue recognition timing
- ❌ **Operations Dashboards:** DO NOT use (use `sales_value_operational`)
- ❌ **BI Ad-hoc:** Prefer `sales_value_operational` unless statutory compliance needed

---

### 2. `other_income_ifrs`

**Definition:** Income from non-ordinary activities (IFRS - Other Income)

**Standard Pack:** `IFRS_CORE`

**Tier:** `tier1`

**Aliases:**
- **Finance:** "Other Income", "Non-Operating Income"
- **Operations:** "Miscellaneous Income"
- **Tax:** "Other Revenue" (context-dependent)

**Cross-Domain Rules:**
- ✅ **Finance:** For non-core business income (rental, investment income)
- ❌ **Operations KPIs:** Generally excluded from operational metrics
- ✅ **Tax:** May be taxable, check jurisdiction

**Examples:**
- Rental income from unused property
- Interest income
- Dividend income
- Forex gains (if not core business)

---

### 3. `gain_ifrs_other`

**Definition:** Gains from disposal, revaluation, or other non-revenue activities

**Standard Pack:** `IFRS_CORE`

**Tier:** `tier2`

**Aliases:**
- **Finance:** "Gain on Disposal", "Revaluation Gain", "Fair Value Gain"
- **Operations:** ❌ NOT USED
- **Tax:** "Capital Gain" (jurisdiction-specific treatment)

**Cross-Domain Rules:**
- ✅ **Finance:** For P&L presentation (below operating profit)
- ❌ **Operations:** Never included in sales metrics
- ✅ **Tax:** Special treatment (may be tax-exempt or taxed differently)

**Examples:**
- Gain on sale of fixed assets
- Gain on disposal of investments
- Revaluation gain (property, equipment)
- Foreign exchange gains (non-operating)

---

### 4. `sales_value_operational`

**Definition:** Total sales value for operational/BI purposes (pre-discounts, pre-returns)

**Standard Pack:** `OPERATIONAL_OPS`

**Tier:** `tier2`

**Aliases:**
- **Operations:** "Sales", "Gross Sales", "Total Sales"
- **BI:** "Sales Value", "Revenue" (⚠️ context-dependent)
- **Finance:** ❌ DO NOT USE for statutory (use `revenue_ifrs_core`)

**Cross-Domain Rules:**
- ✅ **Operations Dashboards:** PRIMARY metric
- ✅ **BI Ad-hoc Reports:** Use this for speed/simplicity
- ❌ **Finance Statutory:** DO NOT use (use `revenue_ifrs_core`)
- ✅ **Tax:** May use as starting point, but reconcile to `revenue_ifrs_core`

**Calculation:**
```
sales_value_operational = SUM(invoice.line_items.amount)
(includes: full invoice value before discounts/returns)
```

---

### 5. `sales_quantity_operational`

**Definition:** Total quantity sold for operational tracking

**Standard Pack:** `OPERATIONAL_OPS`

**Tier:** `tier3`

**Aliases:**
- **Operations:** "Units Sold", "Quantity Sold", "Sales Quantity"
- **BI:** "Qty", "Volume"

**Cross-Domain Rules:**
- ✅ **Operations:** Track inventory turnover, production planning
- ✅ **BI:** Volume analysis, pricing analysis
- ❌ **Finance Statutory:** Not directly used
- ❌ **Tax:** Not used

---

## 🔄 Alias Matrix (Quick Reference)

| Business Term | Finance IFRS | Operations | BI | Tax |
|---------------|-------------|------------|-----|-----|
| **"Revenue"** | `revenue_ifrs_core` | ❌ Use "Sales" | Context-dependent | `revenue_ifrs_core` |
| **"Sales"** | ❌ Use "Revenue" | `sales_value_operational` | `sales_value_operational` | N/A |
| **"Income"** | `revenue_ifrs_core` OR `other_income_ifrs` | ❌ Ambiguous | ❌ Avoid | Context-dependent |
| **"Turnover"** | `revenue_ifrs_core` | `sales_value_operational` | `sales_value_operational` | `revenue_ifrs_core` |
| **"Gain"** | `gain_ifrs_other` | ❌ Never | ❌ Never | `gain_ifrs_other` |

---

## 🚨 Common Mistakes (DO NOT DO THIS)

### ❌ Mistake 1: Using "Revenue" in Operations Code

```typescript
// ❌ WRONG
const revenue = calculateOperationalRevenue();

// ✅ CORRECT
const salesValue = await resolveNameForConcept({
  canonicalKey: "sales_value_operational",
  context: "typescript",
  tenantId: "tenant-123",
});
// Returns: "salesValueOperational"
```

### ❌ Mistake 2: Using "Sales" in Statutory Finance Reports

```sql
-- ❌ WRONG (in statutory report)
SELECT SUM(sales_value) FROM invoices

-- ✅ CORRECT
SELECT SUM(revenue_amount) FROM gl_revenue
WHERE account_type = 'revenue_ifrs_core'
```

### ❌ Mistake 3: Mixing Operational and Statutory Metrics

```typescript
// ❌ WRONG - mixing contexts
const report = {
  revenue_ifrs: getStatutoryRevenue(),  // IFRS
  sales_total: getOperationalSales(),   // Operational
  // ☠️ DANGER: These won't reconcile!
};

// ✅ CORRECT - keep contexts separate
const statutoryReport = {
  revenue: getMetric("revenue_ifrs_core"),
  otherIncome: getMetric("other_income_ifrs"),
};

const operationalDashboard = {
  salesValue: getMetric("sales_value_operational"),
  salesQty: getMetric("sales_quantity_operational"),
};
```

---

## 🔗 Naming Variants (Technical)

Each canonical concept has variants for different technical contexts:

### Example: `revenue_ifrs_core`

| Context | Style | Value | Usage |
|---------|-------|-------|-------|
| `db` | `snake_case` | `revenue_ifrs_core` | Database column names |
| `typescript` | `camelCase` | `revenueIfrsCore` | TypeScript properties |
| `graphql` | `PascalCase` | `RevenueIfrsCore` | GraphQL types |
| `const` | `UPPER_SNAKE` | `REVENUE_IFRS_CORE` | Constants |
| `api_path` | `kebab-case` | `revenue-ifrs-core` | API endpoints |

**Implementation:** See [Naming Convention System](../../NAMING-SYSTEM-COMPLETE.md)

---

## 🏗️ Domain-Specific Usage

### Finance (Statutory Reporting)

**Use:** `revenue_ifrs_core`, `other_income_ifrs`, `gain_ifrs_other`

**Reference:** [Posting Rules - Sales Invoice](../domains/erp-engine/posting-rules-sales-invoice.md)

### Operations (Dashboards, KPIs)

**Use:** `sales_value_operational`, `sales_quantity_operational`

**Avoid:** `revenue_ifrs_core` (too slow, too complex for real-time dashboards)

### BI (Ad-hoc Analysis)

**Prefer:** `sales_value_operational` (faster, simpler)

**When needed:** `revenue_ifrs_core` (for compliance/audit)

### Tax (Returns, Compliance)

**Primary:** `revenue_ifrs_core`

**Reconciliation:** May start with `sales_value_operational`, reconcile to `revenue_ifrs_core`

---

## 📋 Approval Status

| Canonical Concept | Status | Approved By | Date |
|-------------------|--------|-------------|------|
| `revenue_ifrs_core` | ✅ Approved | CID + CFO | 2025-12-02 |
| `other_income_ifrs` | ✅ Approved | CID + CFO | 2025-12-02 |
| `gain_ifrs_other` | ✅ Approved | CID | 2025-12-02 |
| `sales_value_operational` | ✅ Approved | CID + Ops | 2025-12-02 |
| `sales_quantity_operational` | ✅ Approved | Ops | 2025-12-02 |

---

## 🔗 Related SSOT Pages

- [Inventory & COGS Matrix](./finance-inventory-matrix.md) (🔜 Planned)
- [KPI Matrix](./ops-kpi-matrix.md) (🔜 Planned)
- [Tax Compliance Matrix](./tax-matrix.md) (🔜 Planned)

---

## 📚 External References

- **IFRS 15:** Revenue from Contracts with Customers
- **MFRS 15:** Revenue from Contracts with Customers (Malaysian equivalent)
- **IAS 1:** Presentation of Financial Statements

---

**Last Updated:** 2025-12-02  
**Next Review:** 2026-Q1  
**Owner:** CID – Central Insight Department

