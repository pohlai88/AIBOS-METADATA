# ✅ Alias System Complete - "Sales" is No Longer Dangerous

## 🎯 What Was Implemented

The **context-aware alias system** is now complete. This is the final piece that makes ambiguous business terms like "Sales", "Revenue", and "Income" safe to use by governing them based on context.

---

## 📊 The Problem We Solved

### Before (Chaos):

```
"Sales" could mean:
  - Revenue (IFRS statutory)
  - Gross sales value (operational)
  - Units sold (quantity)
  - ???

Result: Confusion, reconciliation nightmares, incorrect reports
```

### After (Governed):

```
"Sales" is context-aware:
  - FINANCIAL_REPORTING → revenue_ifrs_core (SECONDARY_LABEL)
  - MANAGEMENT_REPORTING → sales_value_operational (PRIMARY_LABEL)
  - OPERATIONS → sales_quantity_operational (DISCOURAGED - prefer "Units Sold")
  - STATUTORY_DISCLOSURE → FORBIDDEN (too ambiguous)

Result: Clear meaning per context, enforced by metadata
```

---

## 🗂️ Database Table Created

**Table:** `mdm_alias`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `alias_text` | TEXT | The alias term (e.g., "Sales", "Revenue") |
| `concept_id` | UUID | Links to mdm_global_metadata.id |
| `canonical_key` | TEXT | Links to mdm_global_metadata.canonical_key |
| `language` | TEXT | Language code (e.g., 'en', 'en-MY') |
| `context_domain` | TEXT | Where used: FINANCIAL_REPORTING, OPERATIONS, etc. |
| `strength` | TEXT | How preferred: PRIMARY_LABEL, SECONDARY_LABEL, DISCOURAGED, FORBIDDEN |
| `source_system` | TEXT | Where from: AIBOS, LEGACY_ERP, TAX_SYSTEM |
| `notes` | TEXT | Optional guidance |
| `is_active` | BOOLEAN | Whether alias is active |

**Constraints:**
- Unique per (alias_text, canonical_key, context_domain, source_system)
- Check constraint for valid strengths and contexts

---

## 📝 Aliases Loaded

### "Sales" - Context-Aware

| Alias Text | Canonical Key | Context | Strength | Meaning |
|------------|---------------|---------|----------|---------|
| Sales | revenue_ifrs_core | FINANCIAL_REPORTING | SECONDARY_LABEL | UI wording only; prefer "Revenue" in statutory notes |
| Sales | sales_value_operational | MANAGEMENT_REPORTING | PRIMARY_LABEL | Default for operational dashboards |
| Sales | sales_quantity_operational | OPERATIONS | DISCOURAGED | Avoid for volume; prefer "Units Sold" |

### "Revenue" - Context-Aware

| Alias Text | Canonical Key | Context | Strength | Meaning |
|------------|---------------|---------|----------|---------|
| Revenue | revenue_ifrs_core | FINANCIAL_REPORTING | PRIMARY_LABEL | Preferred for statutory revenue |
| Revenue | sales_value_operational | MANAGEMENT_REPORTING | SECONDARY_LABEL | Sometimes used informally; clarify meaning |

### "Income" - Context-Aware

| Alias Text | Canonical Key | Context | Strength | Meaning |
|------------|---------------|---------|----------|---------|
| Income | revenue_ifrs_core | GENERIC_SPEECH | DISCOURAGED | Too broad; clarify Revenue or Other Income |
| Income | other_income_ifrs | FINANCIAL_REPORTING | SECONDARY_LABEL | Allowed as "Other income" section label |

### Other Aliases

- **Gain / Gains** → gain_ifrs_other (PRIMARY_LABEL in FINANCIAL_REPORTING)
- **Turnover** → revenue_ifrs_core, sales_value_operational (SECONDARY_LABEL in MANAGEMENT_REPORTING)

---

## 🔧 Loader Features

### ✅ Zod Validation

```typescript
const AliasRowSchema = z.object({
  alias_text: z.string().min(1),
  canonical_key: z.string().optional().default(''),
  language: z.string().min(1).default('en'),
  context_domain: z.string().min(1),
  strength: z.enum(['PRIMARY_LABEL', 'SECONDARY_LABEL', 'DISCOURAGED', 'FORBIDDEN']),
  source_system: z.string().min(1).default('AIBOS'),
  notes: z.string().optional().default(''),
});
```

### ✅ Idempotent Upsert

Safe to run multiple times:
- **If alias exists:** Updates strength, notes, language
- **If alias doesn't exist:** Inserts new record
- **No duplicates created**

### ✅ Foreign Key Validation

Checks that `canonical_key` exists in `mdm_global_metadata` before creating alias.

### ✅ FORBIDDEN Handling

Rows with empty `canonical_key` are skipped with a warning (for FORBIDDEN aliases that shouldn't map to any concept).

---

## 🚀 How to Use

### 1. Run Bootstrap

```bash
cd metadata-studio
pnpm metadata:bootstrap
```

**Expected Output:**

```
🚀 Bootstrapping Metadata...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Loading Standard Packs...
  ✅ Created: MFRS15_REVENUE
  ... (4 packs)

📝 Loading Canonical Concepts...
  ✅ Created: revenue_ifrs_core
  ... (5 concepts)

🏷️  Loading Aliases...
  ✅ Created: "Sales" → sales_value_operational (MANAGEMENT_REPORTING)
  ✅ Created: "Revenue" → revenue_ifrs_core (FINANCIAL_REPORTING)
  ... (11 aliases)

✅ Loaded 11 alias(es) (inserted=11, updated=0, skipped=0)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Metadata Bootstrap Complete!
```

### 2. Verify in Supabase

```sql
-- View all aliases
SELECT 
  alias_text, 
  canonical_key, 
  context_domain, 
  strength,
  notes
FROM mdm_alias
ORDER BY alias_text, context_domain;

-- Find what "Sales" means in different contexts
SELECT 
  context_domain,
  canonical_key,
  strength,
  notes
FROM mdm_alias
WHERE alias_text = 'Sales'
ORDER BY context_domain;
```

### 3. Query Example Results

```
alias_text | canonical_key              | context_domain        | strength
-----------|----------------------------|-----------------------|------------------
Sales      | revenue_ifrs_core          | FINANCIAL_REPORTING   | SECONDARY_LABEL
Sales      | sales_value_operational    | MANAGEMENT_REPORTING  | PRIMARY_LABEL
Sales      | sales_quantity_operational | OPERATIONS            | DISCOURAGED
Revenue    | revenue_ifrs_core          | FINANCIAL_REPORTING   | PRIMARY_LABEL
Revenue    | sales_value_operational    | MANAGEMENT_REPORTING  | SECONDARY_LABEL
```

---

## 📋 Alias Strength Levels

| Strength | Meaning | Usage |
|----------|---------|-------|
| **PRIMARY_LABEL** | ✅ **Preferred** | This is the recommended term for this context |
| **SECONDARY_LABEL** | ⚠️ **Allowed** | Can be used, but clarify meaning |
| **DISCOURAGED** | 🟡 **Warning** | Avoid if possible; use with caution and clarification |
| **FORBIDDEN** | 🚫 **Blocked** | Do NOT use in this context; too ambiguous or incorrect |

---

## 📖 Context Domains

| Domain | Purpose | Example |
|--------|---------|---------|
| **FINANCIAL_REPORTING** | Statutory financial statements (IFRS/MFRS) | P&L, Balance Sheet, FS Notes |
| **MANAGEMENT_REPORTING** | Internal management reports, dashboards | Sales dashboard, KPI reports |
| **OPERATIONS** | Operational metrics, real-time tracking | Outlet performance, inventory |
| **STATUTORY_DISCLOSURE** | Regulatory filings, audit reports | Annual report, tax returns |
| **GENERIC_SPEECH** | Everyday conversation, UI labels | Chat, emails, informal docs |

---

## 🔍 Helper Functions

The Drizzle schema includes helper functions:

```typescript
// Check if alias is allowed
isAliasAllowed('PRIMARY_LABEL')  // true
isAliasAllowed('FORBIDDEN')      // false

// Get warning message
getAliasWarning('Sales', 'FORBIDDEN', 'STATUTORY_DISCLOSURE', 'revenue_ifrs_core')
// Returns: "Sales" is FORBIDDEN in STATUTORY_DISCLOSURE. Use "revenue_ifrs_core" instead.

getAliasWarning('Sales', 'DISCOURAGED', 'OPERATIONS', 'sales_quantity_operational')
// Returns: "Sales" is DISCOURAGED in OPERATIONS. Prefer "sales_quantity_operational" for clarity.
```

---

## 🎯 Integration with Other Systems

### Wiki Integration

**SSOT Wiki:** Already documents these concepts  
**Location:** `docs/metadata-ssot/finance-revenue-matrix.md`

**Alias Matrix Table:**

| Business Term | Finance IFRS | Operations | BI | Tax |
|---------------|-------------|------------|-----|-----|
| "Revenue" | `revenue_ifrs_core` | ❌ Use "Sales" | Context-dependent | `revenue_ifrs_core` |
| "Sales" | ❌ Use "Revenue" | `sales_value_operational` | `sales_value_operational` | N/A |

Now backed by `mdm_alias` table! ✅

### SDK Integration (Future)

```typescript
// Resolve alias to canonical concept
const concept = await resolveAlias({
  aliasText: "Sales",
  contextDomain: "MANAGEMENT_REPORTING",
  tenantId: "tenant-123",
});
// Returns: { canonical_key: "sales_value_operational", strength: "PRIMARY_LABEL" }

// Get all aliases for a concept
const aliases = await getAliasesForConcept({
  canonicalKey: "revenue_ifrs_core",
  tenantId: "tenant-123",
});
// Returns: ["Revenue", "Sales", "Turnover", ...]
```

### AI/MCP Integration (Future)

```typescript
// AI checks alias before using
const validation = await validateAliasUsage({
  aliasText: "Sales",
  contextDomain: "STATUTORY_DISCLOSURE",
});
// Returns: { allowed: false, warning: "FORBIDDEN in STATUTORY_DISCLOSURE" }
```

---

## 🔄 The Complete Governance Stack

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CSV Files (Source of Truth)                             │
│    ├─ concepts/finance-core.csv                            │
│    └─ aliases/finance-aliases.csv                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Loader Script (Validation)                              │
│    ├─ Validates canonical_key exists                       │
│    ├─ Validates context_domain                             │
│    └─ Idempotent upsert                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Database Tables (Supabase)                              │
│    ├─ mdm_standard_pack                                    │
│    ├─ mdm_global_metadata (canonical concepts)             │
│    ├─ mdm_naming_variant (technical variants)              │
│    └─ mdm_alias (business term mappings) ✨ NEW            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SSOT Wiki (Documentation)                               │
│    └─ Alias matrix documented                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Application Code (Runtime)                              │
│    ├─ resolveAlias("Sales", "MANAGEMENT_REPORTING")        │
│    ├─ validateAliasUsage("Sales", "STATUTORY_DISCLOSURE")  │
│    └─ getAliasWarning() for user guidance                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎊 Status

**Alias System:** ✅ COMPLETE

You now have:

1. ✅ **Database Table** - `mdm_alias` created in Supabase
2. ✅ **Drizzle Schema** - Type-safe alias table with helper functions
3. ✅ **CSV Source File** - 11 aliases defined with contexts
4. ✅ **Loader Integration** - Aliases loaded during bootstrap
5. ✅ **Context-Aware Governance** - "Sales" is safe to use!

---

## 📚 Related Documentation

- [Naming Convention System](./NAMING-SYSTEM-COMPLETE.md) - Technical name variants
- [Wiki Structure](./WIKI-STRUCTURE-COMPLETE.md) - SSOT + Domain wikis
- [Bootstrap System](./BOOTSTRAP-SYSTEM-COMPLETE.md) - CSV → Database loader
- [Event System](./EVENT-SYSTEM-INTEGRATION-COMPLETE.md) - Event-driven architecture

---

**"Sales" is no longer dangerous. It's governed.** 🎉

---

**Last Updated:** 2025-12-02  
**Owner:** CID – Central Insight Department

