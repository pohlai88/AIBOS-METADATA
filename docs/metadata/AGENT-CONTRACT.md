# Metadata Kernel Agent Contract

> **Version:** 1.0.0  
> **Purpose:** Formal contract for AI agents and humans working with finance metadata  
> **Last Updated:** 2025-01-27

---

## 🎯 Purpose

This document defines the **mandatory contract** that all AI agents and humans must follow when working with finance concepts, fields, and services in the AIBOS platform.

**Core Principle:** The metadata kernel is the **single source of truth** for finance terminology. No finance code can exist without being anchored to a canonical concept.

---

## 📋 Contract Rules

### Rule 1: Lookup Before Naming

**Before using any FINANCE term in code, documentation, or UI:**

1. **Call `metadata.lookupConcept(tenantId, term)`**
   - This returns the canonical concept, standard pack, and aliases
   - Use the canonical key, not aliases, in database schemas

2. **If concept not found:**
   - **DO NOT** invent new terms
   - **DO NOT** use aliases as canonical keys
   - **DO** ask a human to create the concept first

**Example:**
```typescript
// ❌ WRONG: Using alias directly
const revenueColumn = 'sales'; // 'sales' is an alias, not canonical

// ✅ CORRECT: Lookup first, use canonical key
const concept = await metadataService.lookupConcept(tenantId, 'sales');
if (!concept) {
  throw new Error('Concept "sales" not found. Please create it first.');
}
const revenueColumn = concept.concept.canonical_key; // 'revenue'
```

---

### Rule 2: Tier 1/2 Finance Must Have LAW-Level Pack

**For Tier 1 or Tier 2 FINANCE concepts:**

- **MUST** be anchored to `standard_pack_id_primary` with `authority_level='LAW'`
- **MUST NOT** use `INDUSTRY` or `INTERNAL` packs for Tier 1/2 finance
- **MUST** include `standard_ref` (e.g., 'IFRS 15:31', 'IAS 2:9')

**Validation:**
- The system will **block** creation of Tier 1 finance concepts without LAW-level packs
- Runtime validation in `GLPostingService` enforces this

**Example:**
```typescript
// ❌ WRONG: Tier 1 concept without LAW pack
{
  canonical_key: 'revenue',
  governance_tier: 1,
  domain: 'FINANCE',
  standard_pack_id_primary: null // BLOCKED
}

// ✅ CORRECT: Tier 1 concept with IFRS pack
{
  canonical_key: 'revenue',
  governance_tier: 1,
  domain: 'FINANCE',
  standard_pack_id_primary: ifrsCorePackId, // LAW-level
  standard_ref: 'IFRS 15:31'
}
```

---

### Rule 3: No Finance Code Without a Concept

**When creating finance fields, tables, or services:**

1. **Define the field configuration:**
   ```typescript
   const config: FinanceFieldConfig = {
     dbColumnName: 'journal_entry_amount',
     mdmConceptKey: 'gl_journal_entry',
     requiredDomain: 'FINANCE',
     requiredGovernanceTier: 1,
     standardPackCode: 'IFRS_CORE'
   };
   ```

2. **Validate before deployment:**
   ```typescript
   const result = await conceptValidator.validateFieldConfig(tenantId, config);
   if (!result.valid) {
     throw new Error(`Field validation failed: ${result.errors.join(', ')}`);
   }
   ```

3. **All `mdmConceptKey` refs must be resolvable**
   - Bootstrap/deploy scripts check this
   - Prevents random "rev_v2_tmp" fields from sneaking in

---

### Rule 4: Use Canonical Keys, Not Aliases

**In database schemas and code:**

- **USE** canonical keys: `revenue`, `gl_journal_entry`, `deferred_revenue`
- **DO NOT** use aliases as column names: `sales`, `REV`, `turnover`
- **DO** use aliases for UI display and user input

**Example:**
```typescript
// ❌ WRONG: Using alias in schema
CREATE TABLE revenue (
  sales_amount DECIMAL -- 'sales' is an alias
);

// ✅ CORRECT: Using canonical key in schema
CREATE TABLE revenue (
  revenue_amount DECIMAL -- 'revenue' is canonical
);

// ✅ CORRECT: Using alias for UI
const displayLabel = concept.aliases.find(a => a.is_preferred_for_display)?.alias_value || concept.label;
```

---

### Rule 5: Journal Entries Must Anchor to Standard Pack

**When posting journal entries:**

1. **Set `standard_pack_id`** (which IFRS/MFRS law governs this entry)
2. **Set `amount_concept_id`** (links to 'gl_journal_entry_amount' concept)
3. **Set `account_concept_id`** (links to 'gl_account' concept)

**Validation:**
- `GLPostingService.validatePosting()` checks all anchors
- Tier 1 accounts must have LAW-level pack anchors
- Entries without anchors will log warnings

**Example:**
```typescript
const entry = {
  tenant_id: tenantId,
  standard_pack_id: ifrsCorePackId, // Required
  amount_concept_id: glJournalAmountConceptId, // Required
  account_concept_id: glAccountConceptId, // Required
  journal_date: new Date(),
  amount: 1000.00,
  account_code: 'REV-001',
  description: 'Revenue recognition'
};

const validation = await glPostingService.validatePosting(tenantId, entry);
if (!validation.valid) {
  throw new Error(`Posting failed: ${validation.errors.join(', ')}`);
}
```

---

## 🚫 Prohibited Actions

**You are NOT allowed to:**

1. ❌ **Invent new Tier 1 concepts** without human approval
2. ❌ **Use aliases as canonical keys** in DB schemas
3. ❌ **Create finance fields** without concept anchors
4. ❌ **Post journal entries** without standard pack anchors
5. ❌ **Bypass metadata validation** in production code

---

## ✅ Required Actions

**You MUST:**

1. ✅ **Lookup concepts** before using finance terms
2. ✅ **Use canonical keys** in database schemas
3. ✅ **Anchor Tier 1/2 finance** to LAW-level packs
4. ✅ **Validate field configs** during bootstrap/deploy
5. ✅ **Log concept usage** for analytics (automatic)

---

## 🔍 Validation Points

### Bootstrap/Deploy Time

- **Field Config Validation:** All `FinanceFieldConfig` entries validated
- **Concept Existence:** All `mdmConceptKey` refs must exist
- **Pack Requirements:** Tier 1/2 finance must have LAW packs

### Runtime

- **Journal Posting:** `GLPostingService` validates before posting
- **Concept Lookups:** Logged to `mdm_usage_log` for analytics
- **Tool Registry:** MCP tools check governance before execution

---

## 📊 Usage Analytics

**The system tracks:**

- Which concepts are used by agents vs humans
- Which Tier 1 concepts have zero usage (maybe over-specified)
- Whether agents over-use aliases instead of canonical keys
- Concept lookup patterns and frequency

**Access via:**
- View: `v_concept_usage_summary`
- Query: `SELECT * FROM mdm_usage_log WHERE concept_id = ?`

---

## 🎓 Examples

### Example 1: Creating a New Finance Field

```typescript
// Step 1: Define field config
const config: FinanceFieldConfig = {
  dbColumnName: 'deferred_revenue_balance',
  mdmConceptKey: 'deferred_revenue',
  requiredDomain: 'FINANCE',
  requiredGovernanceTier: 1,
  standardPackCode: 'IFRS_CORE'
};

// Step 2: Validate
const result = await conceptValidator.validateFieldConfig(tenantId, config);
if (!result.valid) {
  throw new Error(`Validation failed: ${result.errors.join(', ')}`);
}

// Step 3: Use canonical key in schema
CREATE TABLE revenue_accounts (
  deferred_revenue_balance DECIMAL, -- Uses canonical key
  ...
);
```

### Example 2: Posting a Journal Entry

```typescript
// Step 1: Lookup concepts
const revenueConcept = await metadataService.lookupConcept(tenantId, 'revenue');
const glAccountConcept = await metadataService.lookupConcept(tenantId, 'gl_account');

// Step 2: Get standard pack
const ifrsPack = (await metadataService.listStandardPacks('FINANCE'))
  .find(p => p.code === 'IFRS_CORE');

// Step 3: Create entry with anchors
const entry = {
  tenant_id: tenantId,
  standard_pack_id: ifrsPack!.id,
  amount_concept_id: revenueConcept!.concept.id,
  account_concept_id: glAccountConcept!.concept.id,
  journal_date: new Date(),
  amount: 5000.00,
  account_code: 'REV-001',
  description: 'Monthly revenue recognition'
};

// Step 4: Post (validation happens automatically)
const posted = await glPostingService.postJournalEntry(tenantId, entry);
```

### Example 3: UI Display with Aliases

```typescript
// Step 1: Lookup concept
const concept = await metadataService.lookupConcept(tenantId, 'revenue');

// Step 2: Use preferred alias for display
const displayLabel = concept!.aliases
  .find(a => a.is_preferred_for_display)?.alias_value 
  || concept!.concept.label;

// UI shows: "Sales" (alias) but stores: "revenue" (canonical)
```

---

## 🔗 Related Documentation

- [Metadata Governance Guide](../METADATA_GOVERNANCE.md)
- [Metadata Seed Guide](../METADATA_SEED_GUIDE.md)
- [Database Seeding Guide](../DATABASE_SEEDING.md)
- [Metadata Service API](../../apps/lib/metadataService.ts)
- [Concept Validator](../../apps/lib/metadata-contract.ts)

---

## 📝 Version History

- **1.0.0** (2025-01-27): Initial contract definition

---

**Status:** ✅ **Active Contract**  
**Enforcement:** Code validation + runtime checks  
**Compliance:** Required for all finance code

