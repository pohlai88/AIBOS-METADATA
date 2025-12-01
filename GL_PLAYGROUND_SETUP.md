# GL Playground Setup Guide

> **Quick setup to run the GL playground and see the lawbook in action**

---

## 🚀 Quick Start

### 1. Create Helper Views

First, create the database views for easy inspection:

```bash
cd apps
tsx -e "import { sql } from './lib/db'; import { readFileSync } from 'fs'; await sql.unsafe(readFileSync('lib/gl-views.sql', 'utf-8'));"
```

**Or manually:**
```bash
# Connect to your Neon database and run:
psql $DATABASE_URL < apps/lib/gl-views.sql
```

---

### 2. Ensure Metadata is Seeded

Make sure you have:
- ✅ Concepts (Tier 1/2 finance concepts)
- ✅ Standard packs (IFRS_CORE, IAS_21_FX, etc.)
- ✅ Accounts with concept mappings

**If not seeded yet:**

```bash
cd apps

# Seed core concepts
tsx lib/seed-core-concepts.ts

# Seed account mappings
tsx lib/seed-account-concept-mapping.ts
```

---

### 3. Run the Playground

```bash
npx tsx scripts/glPlayground.ts
```

---

## 📊 What You'll See

### 1. Tier 1/2 Finance Concepts

Shows all finance concepts with governance tier ≤ 2:

```
===========================================
  Tier 1/2 Finance Concepts (from metadata)
===========================================

  • revenue (Revenue) [Tier 1] — Pack: IFRS_CORE (LAW), Ref: IFRS 15:31
  • tax_liability (Tax Liability) [Tier 1] — Pack: IFRS_CORE (LAW), Ref: IAS 12:5
  • inventory_cost (Inventory Cost) [Tier 1] — Pack: IAS_2_INV (LAW), Ref: IAS 2:9
```

---

### 2. Account → Concept Mappings

Shows which accounts are mapped to which concepts:

```
===========================================
  Account → Concept Mapping (Tier 1/2 focus)
===========================================

🔥 4000   Revenue Account              — Tier 1 | concept=revenue | pack=IFRS_CORE (LAW)
🔥 1300   Inventory Account            — Tier 1 | concept=inventory_cost | pack=IAS_2_INV (LAW)
·  5000   Operating Expenses            — Tier 3 | concept=NONE | pack=NONE (-)
```

**Legend:**
- 🔥 = Tier 1/2 account (must have concept mapping)
- · = Tier 3+ account (concept mapping optional)

---

### 3. Good Journal (PASSES)

A valid journal that passes PostingGuard:

```
===========================================
  Demo 1: GOOD Journal (should PASS)
===========================================

   Using accounts: 4000 (Revenue Account) and 1300 (Inventory Account)

✅ PostingGuard PASSED for GOOD journal.

   Metadata Snapshots:
     Line abc12345...:
       concept_key: revenue
       standard_pack: IFRS_CORE
       governance_tier: 1
       validated_at: 2025-01-27T10:00:00Z
```

---

### 4. Bad Journal - Unbalanced (FAILS)

A journal where debits ≠ credits:

```
===========================================
  Demo 2: BAD Journal (unbalanced, should FAIL)
===========================================

✅ PostingGuard correctly REJECTED unbalanced journal:
     - PostingGuard: Debits (999.99) do not equal credits (1000)
```

---

### 5. Bad Journal - No Pack (FAILS)

A journal without a standard pack:

```
===========================================
  Demo 3: BAD Journal (no standard pack, should FAIL)
===========================================

✅ PostingGuard correctly REJECTED journal without pack:
     - PostingGuard: so_t_pack_id is required for all journal entries.
```

---

## 🔧 Configuration

### Environment Variables

The script uses:
- `DATABASE_URL` - Neon database connection string (required)
- `TEST_TENANT_ID` - Optional, defaults to first user in database

### Account Codes

The script tries to use:
- `4000` - Revenue account
- `1300` - Inventory account

If these don't exist, it will use any available accounts for testing.

---

## 🐛 Troubleshooting

### "No Tier 1/2 finance concepts found"

**Solution:** Run seed scripts:
```bash
cd apps
tsx lib/seed-core-concepts.ts
```

### "View v_finance_tier12_concepts does not exist"

**Solution:** Create the views:
```bash
cd apps
tsx -e "import { sql } from './lib/db'; import { readFileSync } from 'fs'; await sql.unsafe(readFileSync('lib/gl-views.sql', 'utf-8'));"
```

### "No accounts found"

**Solution:** 
1. Create accounts in your database
2. Run account mapping:
```bash
cd apps
tsx lib/seed-account-concept-mapping.ts
```

### "Pack IFRS_CORE not found"

**Solution:** Seed standard packs:
```bash
cd apps
tsx lib/seed-core-concepts.ts  # This also seeds packs
```

---

## 📚 Related Files

- **Playground Script:** `scripts/glPlayground.ts`
- **Helper Views:** `apps/lib/gl-views.sql`
- **PostingGuard:** `apps/lib/postingGuard.ts`
- **Account Mapping:** `apps/lib/seed-account-concept-mapping.ts`

---

## ✅ Success Criteria

When everything works, you should see:

1. ✅ List of Tier 1/2 finance concepts
2. ✅ Account mappings with Tier 1/2 marked
3. ✅ Good journal passes validation
4. ✅ Bad journals correctly fail with clear errors
5. ✅ Metadata snapshots shown for valid journals

---

**Status:** ✅ **Ready to Play**

