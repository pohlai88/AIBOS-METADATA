# GL to Lawbook Wiring - Quick Reference

> **Complete wiring guide for connecting GL to IFRS metadata kernel**

---

## 🎯 Architecture Overview

```
┌─────────────────┐
│  AI Agent / UI  │
│  (Constructs JE) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PostingGuard    │ ◄─── Uses MetadataService
│ (IFRS Police)   │
└────────┬────────┘
         │
         ├─► Validates: debits = credits
         ├─► Validates: soTPackId exists & ACTIVE
         ├─► Validates: Tier 1/2 accounts → LAW-level packs
         └─► Builds: mdm_snapshot per line
         │
         ▼
┌─────────────────┐
│   Database      │
│  journal_entries│ (with so_t_pack_id)
│  journal_lines  │ (with mdm_snapshot)
│  accounts       │ (with mdm_concept_id)
└─────────────────┘
```

---

## 📋 Database Schema

### 1. Journal Entries

```sql
ALTER TABLE journal_entries
  ADD COLUMN so_t_pack_id UUID REFERENCES mdm_standard_pack(id);
  
ALTER TABLE journal_entries
  ADD COLUMN mdm_metadata JSONB DEFAULT '{}'::jsonb;
```

**Usage:**
- Normal journals → `IFRS_CORE`
- FX revaluation → `IAS_21_FX`
- Inventory valuation → `IAS_2_INV`

### 2. Accounts

```sql
ALTER TABLE accounts
  ADD COLUMN mdm_concept_id UUID REFERENCES mdm_concept(id);
  
ALTER TABLE accounts
  ADD COLUMN governance_tier SMALLINT DEFAULT 3
    CHECK (governance_tier BETWEEN 1 AND 5);
```

**Tier Levels:**
- **Tier 1:** Critical finance accounts (Revenue, COGS, Tax) → Must have `mdm_concept_id` → Must use LAW-level pack
- **Tier 2:** Important accounts → Must have `mdm_concept_id` → Must use LAW-level pack
- **Tier 3-5:** Other accounts → Optional concept mapping

### 3. Journal Lines

```sql
ALTER TABLE journal_lines
  ADD COLUMN mdm_snapshot JSONB DEFAULT '{}'::jsonb;
```

**Snapshot Structure:**
```json
{
  "concept_key": "revenue",
  "standard_pack": "IFRS_CORE",
  "standard_ref": "IFRS 15:31",
  "governance_tier": 1,
  "validated_at": "2025-01-27T10:00:00Z"
}
```

---

## 🔧 TypeScript API

### 1. Metadata Service

```typescript
import { metadataService } from './lib/metadataService';

// Get standard pack by ID
const pack = await metadataService.getStandardPackById(packId);

// Get concept by ID (with pack info)
const concept = await metadataService.getConceptById(conceptId);

// Lookup concept by term
const result = await metadataService.lookupConcept(tenantId, 'revenue');
```

### 2. PostingGuard

```typescript
import { validateJournalBeforePost, postJournal } from './lib/postingGuard';

// Validate without posting
const validation = await validateJournalBeforePost(journal);
if (!validation.valid) {
  console.error('Errors:', validation.errors);
  return;
}

// Post with validation (recommended)
const result = await postJournal(journal);
if (result.status !== 'posted') {
  console.error('Posting failed:', result.errors);
}
```

### 3. GL Posting Service

```typescript
import { glPostingService } from './lib/accounting-kernel/gl-posting-service';

// Post journal entry (with full validation)
const result = await glPostingService.postJournalEntry(journal);
```

---

## 📝 Journal Entry Structure

```typescript
type JournalEntry = {
  id: string;                    // UUID
  tenantId: string;              // UUID
  postingDate: string;            // ISO date: '2025-01-27'
  soTPackId: string | null;       // REQUIRED: UUID of standard pack
  description?: string;
  journalNumber?: string;
  lines: JournalLine[];
};

type JournalLine = {
  id: string;                    // UUID
  accountId: string;             // UUID of account
  debit: number;                 // Must be > 0 OR credit > 0
  credit: number;                 // Must be > 0 OR debit > 0
  description?: string;
  lineNumber?: number;
};
```

---

## ✅ Validation Rules

### Standard Pack
- ✅ `soTPackId` is **required** (cannot be null)
- ✅ Pack must exist in `mdm_standard_pack`
- ✅ Pack must be `ACTIVE` (not `DEPRECATED`)

### Accounts
- ✅ All accounts must exist and belong to tenant
- ✅ Tier 1/2 accounts must have `mdm_concept_id`
- ✅ Tier 1/2 concepts must be anchored to **LAW-level** packs
- ✅ Tier 1/2 concepts cannot use `INDUSTRY` or `INTERNAL` packs

### Accounting
- ✅ Debits must equal credits (rounded to 2 decimals)
- ✅ Each line must have either debit OR credit (not both, not neither)
- ✅ Journal must have at least one line

---

## 🚀 Setup Steps

### 1. Apply Schema Migration

```bash
cd apps
tsx -e "import { sql } from './lib/db'; import { readFileSync } from 'fs'; await sql.unsafe(readFileSync('lib/gl-schema-migration.sql', 'utf-8'));"
```

### 2. Seed Account Mappings

```bash
cd apps
tsx lib/seed-account-concept-mapping.ts
```

### 3. Verify Setup

```sql
-- Check accounts with concept mappings
SELECT 
  a.code,
  a.name,
  a.governance_tier,
  c.canonical_key,
  p.code AS standard_pack_code,
  p.authority_level
FROM accounts a
LEFT JOIN mdm_concept c ON a.mdm_concept_id = c.id
LEFT JOIN mdm_standard_pack p ON c.standard_pack_id_primary = p.id
WHERE a.governance_tier <= 2
ORDER BY a.code;
```

---

## 📊 Example: Posting a Revenue Journal

```typescript
import { postJournal } from './lib/postingGuard';

// 1. Get IFRS_CORE pack ID
const packs = await metadataService.listStandardPacks();
const ifrsCorePack = packs.find(p => p.code === 'IFRS_CORE');

// 2. Get revenue account (must have mdm_concept_id)
const revenueAccount = await sql`
  SELECT id FROM accounts 
  WHERE code = '4000' AND tenant_id = ${tenantId}::uuid
`;

// 3. Construct journal
const journal = {
  id: crypto.randomUUID(),
  tenantId: tenantId,
  postingDate: '2025-01-27',
  soTPackId: ifrsCorePack.id,  // REQUIRED
  description: 'Revenue recognition - Product sales',
  lines: [
    {
      id: crypto.randomUUID(),
      accountId: revenueAccount.id,
      debit: 0,
      credit: 1000.00,
      description: 'Product sales revenue',
      lineNumber: 1,
    },
    {
      id: crypto.randomUUID(),
      accountId: cashAccount.id,
      debit: 1000.00,
      credit: 0,
      description: 'Cash received',
      lineNumber: 2,
    },
  ],
};

// 4. Post (with validation)
const result = await postJournal(journal);
if (result.status === 'posted') {
  console.log('✅ Journal posted successfully');
} else {
  console.error('❌ Posting failed:', result.errors);
}
```

---

## 🔍 Error Messages

### Standard Pack Errors

```
PostingGuard: so_t_pack_id is required for all journal entries.
PostingGuard: Standard pack {id} not found
PostingGuard: Standard pack {code} is not ACTIVE (status={status})
```

### Account Errors

```
PostingGuard: Account {id} not found or does not belong to tenant {tenantId}
PostingGuard: Tier {tier} finance account {code} / {name} has no mdm_concept_id
PostingGuard: mdm_concept {id} not found for account {code}
PostingGuard: Tier {tier} finance account {code} is anchored to non-LAW pack {code}
```

### Accounting Errors

```
PostingGuard: Debits ({debit}) do not equal credits ({credit})
PostingGuard: Journal entry has no lines
PostingGuard: Journal line {id} has both debit and credit
PostingGuard: Journal line {id} has neither debit nor credit
```

---

## 📚 Related Files

- **Schema:** `apps/lib/gl-schema-migration.sql`
- **Guard:** `apps/lib/postingGuard.ts`
- **Service:** `apps/lib/metadataService.ts`
- **GL Service:** `apps/lib/accounting-kernel/gl-posting-service.ts`
- **Mapping:** `apps/lib/seed-account-concept-mapping.ts`
- **Contract:** `docs/metadata/GL-CONTRACT.md`

---

**Status:** ✅ **Fully Wired - Ledger Cannot Escape IFRS**

