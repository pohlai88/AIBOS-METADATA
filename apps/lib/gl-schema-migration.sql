-- GL Schema Migration: Wire GL to Metadata Kernel
-- This migration tags GL tables with metadata so the ledger cannot escape IFRS

-- ===========================================
-- 1. JOURNAL ENTRIES: Tag with standard pack (which law governs this entry)
-- ===========================================

-- Add standard pack reference (which IFRS/MFRS law governs this journal)
ALTER TABLE IF NOT EXISTS journal_entries
  ADD COLUMN IF NOT EXISTS so_t_pack_id UUID NULL
    REFERENCES mdm_standard_pack(id) ON DELETE SET NULL;

-- Optional: basic metadata trace
ALTER TABLE IF NOT EXISTS journal_entries
  ADD COLUMN IF NOT EXISTS mdm_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Create index for standard pack lookups
CREATE INDEX IF NOT EXISTS idx_journal_entries_so_t_pack 
  ON journal_entries(so_t_pack_id);

-- ===========================================
-- 2. ACCOUNTS: Tag with canonical concept
-- ===========================================

-- Add concept reference (canonical metadata concept for this account)
ALTER TABLE IF NOT EXISTS accounts
  ADD COLUMN IF NOT EXISTS mdm_concept_id UUID NULL
    REFERENCES mdm_concept(id) ON DELETE SET NULL;

-- Mark account criticality (governance tier)
ALTER TABLE IF NOT EXISTS accounts
  ADD COLUMN IF NOT EXISTS governance_tier SMALLINT
    DEFAULT 3
    CHECK (governance_tier BETWEEN 1 AND 5);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accounts_mdm_concept 
  ON accounts(mdm_concept_id);

CREATE INDEX IF NOT EXISTS idx_accounts_governance_tier 
  ON accounts(governance_tier);

-- ===========================================
-- 3. JOURNAL LINES: Tag with metadata snapshot (time-travel capability)
-- ===========================================

-- Add metadata snapshot (freeze what metadata was applied when posting)
ALTER TABLE IF NOT EXISTS journal_lines
  ADD COLUMN IF NOT EXISTS mdm_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Create index for metadata queries
CREATE INDEX IF NOT EXISTS idx_journal_lines_mdm_snapshot 
  ON journal_lines USING GIN(mdm_snapshot);

-- ===========================================
-- 4. Create GL tables if they don't exist (basic structure)
-- ===========================================

-- Accounts table (if not exists)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_accounts_tenant_code UNIQUE (tenant_id, code)
);

-- Journal Entries table (if not exists)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  journal_number TEXT NOT NULL,
  posting_date DATE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'REVERSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT uq_journal_entries_tenant_number UNIQUE (tenant_id, journal_number)
);

-- Journal Lines table (if not exists)
CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  debit DECIMAL(18, 2) NOT NULL DEFAULT 0,
  credit DECIMAL(18, 2) NOT NULL DEFAULT 0,
  description TEXT,
  line_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_journal_lines_debit_credit 
    CHECK ((debit = 0 AND credit > 0) OR (debit > 0 AND credit = 0))
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_tenant 
  ON journal_entries(tenant_id);

CREATE INDEX IF NOT EXISTS idx_journal_entries_posting_date 
  ON journal_entries(posting_date);

CREATE INDEX IF NOT EXISTS idx_journal_lines_journal 
  ON journal_lines(journal_id);

CREATE INDEX IF NOT EXISTS idx_journal_lines_account 
  ON journal_lines(account_id);

CREATE INDEX IF NOT EXISTS idx_accounts_tenant 
  ON accounts(tenant_id);

CREATE INDEX IF NOT EXISTS idx_accounts_code 
  ON accounts(code);

-- ===========================================
-- 5. Ensure update_updated_at_column function exists
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 6. Add updated_at trigger for accounts
-- ===========================================

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

