# Scripts Directory

This directory contains utility scripts for testing and development.

## GL Playground

**File:** `glPlayground.ts`

**Purpose:** Demonstrates GL-to-lawbook wiring by showing:
- Tier 1/2 finance concepts from metadata
- Account-to-concept mappings
- Good journal that passes PostingGuard
- Bad journals that fail PostingGuard

**Prerequisites:**

1. **Set up database views:**
   ```bash
   cd apps
   tsx -e "import { sql } from './lib/db'; import { readFileSync } from 'fs'; await sql.unsafe(readFileSync('lib/gl-views.sql', 'utf-8'));"
   ```

2. **Ensure metadata is seeded:**
   - Concepts (run `seed-core-concepts.ts`)
   - Standard packs (run seed scripts)
   - Accounts (create accounts, then run `seed-account-concept-mapping.ts`)

3. **Set environment variable:**
   ```bash
   export DATABASE_URL="your-neon-connection-string"
   ```

**Usage:**

```bash
npx tsx scripts/glPlayground.ts
```

**Output:**

The script will show:
- ✅ Tier 1/2 finance concepts with their standard packs
- ✅ Account-to-concept mappings (Tier 1/2 marked with 🔥)
- ✅ Good journal that passes PostingGuard validation
- ✅ Bad journals that correctly fail validation:
  - Unbalanced journal (debits ≠ credits)
  - Journal without standard pack

**Example Output:**

```
🎭 GL Playground — Metadata-Governed Journals

Using tenant: abc123...

===========================================
  Tier 1/2 Finance Concepts (from metadata)
===========================================

  • revenue (Revenue) [Tier 1] — Pack: IFRS_CORE (LAW), Ref: IFRS 15:31
  • tax_liability (Tax Liability) [Tier 1] — Pack: IFRS_CORE (LAW), Ref: IAS 12:5
  ...

===========================================
  Account → Concept Mapping (Tier 1/2 focus)
===========================================

🔥 4000   Revenue Account              — Tier 1 | concept=revenue | pack=IFRS_CORE (LAW)
🔥 1300   Inventory Account            — Tier 1 | concept=inventory_cost | pack=IAS_2_INV (LAW)
...

===========================================
  Demo 1: GOOD Journal (should PASS)
===========================================

✅ PostingGuard PASSED for GOOD journal.

   Metadata Snapshots:
     Line abc12345...:
       concept_key: revenue
       standard_pack: IFRS_CORE
       governance_tier: 1
       validated_at: 2025-01-27T10:00:00Z
...
```

