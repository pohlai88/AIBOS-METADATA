# Metadata Seed SQL Guide

This guide explains how to apply the metadata seed SQL that includes packs, concepts, aliases, and rules.

## Quick Start

1. **Get your tenant ID:**
   ```bash
   cd apps
   pnpm db:tenant-id
   ```
   This will output your tenant ID (e.g., `20571899-2b11-49cc-8c63-9622eae0f47a`)

2. **Prepare the seed SQL:**

   ```bash
   # Save your seed SQL to a file (e.g., seed-metadata.sql)
   # Then prepare it with tenant ID replacement:
   pnpm db:prepare-seed seed-metadata.sql seed-metadata-ready.sql
   ```

3. **Execute the prepared SQL:**

   **Option A: Via Neon Console (Recommended)**
   - Go to https://console.neon.tech
   - Open your project → SQL Editor
   - Paste and execute the prepared SQL

   **Option B: Via psql**
   ```bash
   psql "$DATABASE_URL" -f seed-metadata-ready.sql
   ```

## What the Script Does

1. **Automatically gets your tenant ID** from the database (uses admin user's ID)
2. **Replaces the placeholder** `00000000-0000-0000-0000-000000000001` with your actual tenant ID
3. **Executes the SQL** statements safely
4. **Reports success/errors** for each statement

## Manual Approach

If you prefer to do it manually:

1. Get your tenant ID:
   ```bash
   cd apps
   pnpm db:tenant-id
   ```

2. Copy the output (e.g., `20571899-2b11-49cc-8c63-9622eae0f47a`)

3. In your seed SQL, replace:
   ```sql
   00000000-0000-0000-0000-000000000001
   ```
   with your actual tenant ID

4. Execute the SQL directly in your database (via Neon console, psql, etc.)

## Expected Seed Data

The seed SQL should include:

- **Packs**: IFRS, IAS 2, IAS 16, Tax standards
- **~12 core concepts**: Revenue, Deferred Revenue, GL Journal, etc.
- **Aliases**: Sales, Turnover, REV, etc.
- **Minimal rule set**: Governance rules for validation

## Troubleshooting

**Error: "No users found"**
- Run the main seed script first: `pnpm db:seed`

**Error: "DATABASE_URL not found"**
- Ensure your `.env` file is in the root directory
- Check that `DATABASE_URL` is set correctly

**SQL execution errors**
- Check that tables exist (run `pnpm db:seed` first)
- Verify SQL syntax is correct
- Check for duplicate key violations (use `ON CONFLICT DO NOTHING` if needed)

## Files

- `apps/lib/get-tenant-id.ts` - Get tenant ID script
- `apps/lib/apply-metadata-seed.ts` - Apply seed SQL script
- `apps/lib/seed-metadata.sql` - Placeholder for your seed SQL

