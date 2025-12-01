-- Accounting Knowledge Base Schema
-- Tracks solutions, training materials, UI/UX, upgrades, bugs for accounting domain

-- Knowledge Categories
CREATE TABLE IF NOT EXISTS accounting_knowledge_category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'SOLUTION', 'TRAINING', 'UI_UX', 'UPGRADE', 'BUG'
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounting Knowledge Entries
CREATE TABLE IF NOT EXISTS accounting_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES accounting_knowledge_category(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- Full content/markdown
  tags TEXT[] DEFAULT '{}',
  related_concept_id UUID REFERENCES mdm_concept(id) ON DELETE SET NULL, -- Link to metadata concept
  related_standard_pack_id UUID REFERENCES mdm_standard_pack(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'ARCHIVED')),
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}' -- Flexible storage for category-specific data
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_category ON accounting_knowledge(category_id);
CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_status ON accounting_knowledge(status);
CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_tags ON accounting_knowledge USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_concept ON accounting_knowledge(related_concept_id);
CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_pack ON accounting_knowledge(related_standard_pack_id);
CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_metadata ON accounting_knowledge USING GIN(metadata);

-- Create trigger for updated_at (only if function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER update_accounting_knowledge_updated_at BEFORE UPDATE ON accounting_knowledge
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Seed categories
INSERT INTO accounting_knowledge_category (name, description) VALUES
  ('SOLUTION', 'Accounting solutions, workflows, and problem-solving guides'),
  ('TRAINING', 'Training materials, tutorials, and educational content'),
  ('UI_UX', 'UI/UX improvements, design patterns, and user experience notes'),
  ('UPGRADE', 'Upgrade notes, migration guides, and version changes'),
  ('BUG', 'Bug reports, fixes, and workarounds')
ON CONFLICT (name) DO NOTHING;

