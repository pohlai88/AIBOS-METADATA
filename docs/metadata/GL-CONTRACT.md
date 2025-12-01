# GL (General Ledger) Contract for AI Agents

> **Version:** 1.0.0  
> **Purpose:** Formal contract for AI agents constructing journal entries  
> **Last Updated:** 2025-01-27

---

## 🎯 Purpose

This document defines the **mandatory contract** that all AI agents must follow when constructing journal entries in the AIBOS platform.

**Core Principle:** The ledger literally cannot escape IFRS. Every journal entry must be anchored to a standard pack (law) and validated before posting.

---

## 📋 Contract Rules

### Rule 1: Every Journal Must Have a Standard Pack

**Before constructing any journal entry:**

1. **Determine which IFRS/MFRS law governs this transaction:**
   - Normal revenue/expense → `IFRS_CORE`
   - FX revaluation → `IAS_21_FX`
   - Inventory valuation → `IAS_2_INV`
   - Tax adjustments → `GLOBAL_TAX`

2. **Lookup the standard pack:**
   ```typescript
   const packs = await metadataService.listStandardPacks('FINANCE');
   const ifrsCorePack = packs.find(p => p.code === 'IFRS_CORE');
   ```

3. **Set `soTPackId` in the journal entry:**
   ```typescript
   const journal: JournalEntry = {
     id: generateId(),
     tenantId: tenantId,
     postingDate: '2025-01-27',
     soTPackId: ifrsCorePack.id, // REQUIRED
     lines: [...]
   };
   ```

**Validation:**
- `soTPackId` is **required** (PostingGuard will reject if missing)
- Standard pack must exist and be `ACTIVE`
- PostingGuard validates this before allowing the journal to post

---

### Rule 2: Tier 1/2 Accounts Must Have Concept Anchors

**For Tier 1/2 finance accounts (Revenue, COGS, Tax, Inventory, etc.):**

1. **Accounts are pre-mapped to concepts** (via `seed-account-concept-mapping`)
2. **You don't need to set concept IDs manually** - they're on the account
3. **PostingGuard automatically validates:**
   - Account has `mdm_concept_id`
   - Concept is anchored to a LAW-level standard pack
   - Concept's `authority_level` is `LAW` (not `INDUSTRY` or `INTERNAL`)

**What this means:**
- If you use a Tier 1 account (e.g., Revenue account 4000), PostingGuard will:
  1. Check the account has `mdm_concept_id` → `revenue` concept
  2. Check the concept's pack is `IFRS_CORE` (LAW-level)
  3. Reject if either check fails

**You cannot post a journal with a Tier 1 account that isn't properly anchored to IFRS.**

---

### Rule 3: Debits Must Equal Credits

**Basic accounting invariant:**

```typescript
const totalDebit = journal.lines.reduce((s, l) => s + (l.debit ?? 0), 0);
const totalCredit = journal.lines.reduce((s, l) => s + (l.credit ?? 0), 0);

// PostingGuard will reject if these don't match
```

**Each line must have either debit OR credit (not both, not neither):**
- ✅ `{ debit: 1000, credit: 0 }`
- ✅ `{ debit: 0, credit: 1000 }`
- ❌ `{ debit: 1000, credit: 1000 }` (both)
- ❌ `{ debit: 0, credit: 0 }` (neither)

---

### Rule 4: Use PostingGuard Before Posting

**Always validate before posting:**

```typescript
import { validateJournalBeforePost, postJournal } from './lib/postingGuard';

// Option 1: Validate first, then post
const validation = await validateJournalBeforePost(journal);
if (!validation.valid) {
  throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
}
const result = await postJournal(journal);

// Option 2: Use GLPostingService (does both)
import { glPostingService } from './lib/accounting-kernel/gl-posting-service';
const result = await glPostingService.postJournalEntry(journal);
```

**PostingGuard checks:**
1. ✅ Debits = credits
2. ✅ `soTPackId` exists and pack is ACTIVE
3. ✅ Tier 1/2 accounts have concept anchors
4. ✅ Tier 1/2 concepts use LAW-level packs
5. ✅ All accounts exist and belong to tenant
6. ✅ Builds `mdm_snapshot` for time-travel

---

## 🚫 Prohibited Actions

**You are NOT allowed to:**

1. ❌ **Post journals without `soTPackId`**
   - Every journal must state which law governs it

2. ❌ **Use Tier 1/2 accounts without concept anchors**
   - PostingGuard will reject these

3. ❌ **Post journals with non-LAW packs for Tier 1/2 accounts**
   - Tier 1/2 finance must use IFRS/MFRS (LAW-level)

4. ❌ **Bypass PostingGuard**
   - All journals must go through validation

5. ❌ **Post unbalanced journals**
   - Debits must equal credits

---

## ✅ Required Actions

**You MUST:**

1. ✅ **Set `soTPackId`** for every journal entry
2. ✅ **Use PostingGuard** before posting
3. ✅ **Ensure debits = credits**
4. ✅ **Use properly mapped accounts** (Tier 1/2 accounts are pre-mapped)
5. ✅ **Handle validation errors** gracefully

---

## 📊 Metadata Snapshots

**PostingGuard automatically creates `mdm_snapshot` for each journal line:**

```json
{
  "concept_key": "revenue",
  "standard_pack": "IFRS_CORE",
  "standard_ref": "IFRS 15:31",
  "governance_tier": 1,
  "validated_at": "2025-01-27T10:00:00Z"
}
```

**This enables:**
- **Time-travel:** See what metadata was applied when the journal was posted
- **Audit trail:** Track which IFRS standard governed each line
- **Compliance:** Prove journals were validated against the lawbook

---

## 🎓 Examples

### Example 1: Revenue Recognition Journal

```typescript
import { metadataService } from './lib/metadataService';
import { glPostingService } from './lib/accounting-kernel/gl-posting-service';

// 1. Get standard pack
const packs = await metadataService.listStandardPacks('FINANCE');
const ifrsCorePack = packs.find(p => p.code === 'IFRS_CORE');

// 2. Construct journal
const journal = {
  id: crypto.randomUUID(),
  tenantId: tenantId,
  postingDate: '2025-01-27',
  soTPackId: ifrsCorePack.id, // REQUIRED
  description: 'Monthly revenue recognition',
  lines: [
    {
      id: crypto.randomUUID(),
      accountId: revenueAccountId, // Account 4000 (pre-mapped to 'revenue' concept)
      debit: 0,
      credit: 5000.00,
      description: 'Revenue from sales',
      lineNumber: 1,
    },
    {
      id: crypto.randomUUID(),
      accountId: arAccountId, // Accounts Receivable
      debit: 5000.00,
      credit: 0,
      description: 'AR increase',
      lineNumber: 2,
    },
  ],
};

// 3. Post (PostingGuard validates automatically)
const result = await glPostingService.postJournalEntry(journal);
// ✅ Journal posted with IFRS validation
```

### Example 2: FX Revaluation Journal

```typescript
// 1. Get FX standard pack
const packs = await metadataService.listStandardPacks('FINANCE');
const ias21Pack = packs.find(p => p.code === 'IAS_21_FX');

// 2. Construct FX journal
const fxJournal = {
  id: crypto.randomUUID(),
  tenantId: tenantId,
  postingDate: '2025-01-27',
  soTPackId: ias21Pack.id, // IAS 21 for FX
  description: 'Monthly FX revaluation',
  lines: [
    {
      id: crypto.randomUUID(),
      accountId: fxGainAccountId,
      debit: 0,
      credit: 150.00,
      description: 'FX gain',
      lineNumber: 1,
    },
    {
      id: crypto.randomUUID(),
      accountId: foreignCurrencyAccountId,
      debit: 150.00,
      credit: 0,
      description: 'FC account revaluation',
      lineNumber: 2,
    },
  ],
};

// 3. Post (validated against IAS 21)
const result = await glPostingService.postJournalEntry(fxJournal);
```

### Example 3: Handling Validation Errors

```typescript
try {
  const result = await glPostingService.postJournalEntry(journal);
  console.log('Journal posted:', result.journalId);
} catch (error) {
  if (error.message.includes('PostingGuard')) {
    // Handle validation errors
    console.error('Validation failed:', error.message);
    // Fix the journal and retry
  } else {
    // Handle other errors
    console.error('Posting error:', error);
  }
}
```

---

## 🔍 Validation Flow

```
Journal Entry Created
        ↓
PostingGuard.validateJournalBeforePost()
        ↓
    ┌───┴───┐
    │       │
  Valid   Invalid
    │       │
    │       └──→ Reject with errors
    │
    ↓
PostingGuard.postJournal()
        ↓
  Transaction Begin
        ↓
  Insert journal_entries (with so_t_pack_id)
        ↓
  Insert journal_lines (with mdm_snapshot)
        ↓
  Transaction Commit
        ↓
  ✅ Journal Posted
```

---

## 📚 Related Documentation

- [Metadata Agent Contract](./AGENT-CONTRACT.md)
- [PostingGuard Implementation](../../apps/lib/postingGuard.ts)
- [GL Posting Service](../../apps/lib/accounting-kernel/gl-posting-service.ts)
- [Account Mapping Guide](../../apps/lib/seed-account-concept-mapping.ts)

---

## 📝 Version History

- **1.0.0** (2025-01-27): Initial contract definition

---

**Status:** ✅ **Active Contract**  
**Enforcement:** PostingGuard runtime validation  
**Compliance:** Required for all journal entries

