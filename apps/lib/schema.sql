-- AIBOS Metadata Platform Database Schema
-- Created for Neon Postgres

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table for organizing metadata
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metadata entries table
CREATE TABLE IF NOT EXISTS metadata_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  data JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MCP Tool Registry (for governance metadata)
CREATE TABLE IF NOT EXISTS mdm_tool_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id VARCHAR(255) UNIQUE NOT NULL,
  tool_name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  category VARCHAR(50),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_metadata_entries_category ON metadata_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_metadata_entries_user ON metadata_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_metadata_entries_status ON metadata_entries(status);
CREATE INDEX IF NOT EXISTS idx_metadata_entries_tags ON metadata_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_metadata_entries_data ON metadata_entries USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metadata_entries_updated_at BEFORE UPDATE ON metadata_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mdm_tool_registry_updated_at BEFORE UPDATE ON mdm_tool_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Standard Packs table (IFRS, IAS 2, IAS 16, Global Tax, etc.)
CREATE TABLE IF NOT EXISTS mdm_standard_pack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- e.g. 'IFRS_CORE', 'IAS_2_INV'
  name TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (
    domain IN ('FINANCE','HR','SCM','IT','OTHER')
  ),
  authority_level TEXT NOT NULL CHECK (
    authority_level IN ('LAW','INDUSTRY','INTERNAL')
  ),
  version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (
    status IN ('ACTIVE','DEPRECATED')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for standard pack code lookups
CREATE INDEX IF NOT EXISTS idx_mdm_standard_pack_code ON mdm_standard_pack(code);
CREATE INDEX IF NOT EXISTS idx_mdm_standard_pack_domain ON mdm_standard_pack(domain);
CREATE INDEX IF NOT EXISTS idx_mdm_standard_pack_status ON mdm_standard_pack(status);

-- Create trigger for updated_at (using existing function)
CREATE TRIGGER update_mdm_standard_pack_updated_at BEFORE UPDATE ON mdm_standard_pack
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Concepts table (Canonical definition of concepts like Revenue, Deferred Revenue, GL Journal, etc.)
CREATE TABLE IF NOT EXISTS mdm_concept (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  canonical_key TEXT NOT NULL, -- machine key: 'revenue', 'gl_journal_entry'
  label TEXT NOT NULL, -- UI label
  description TEXT,
  domain TEXT NOT NULL CHECK (
    domain IN ('FINANCE','HR','SCM','IT','OTHER')
  ),
  concept_type TEXT NOT NULL CHECK (
    concept_type IN ('FIELD','KPI','ENTITY','SERVICE_RULE')
  ),
  governance_tier SMALLINT NOT NULL CHECK (governance_tier BETWEEN 1 AND 5),
  standard_pack_id_primary UUID REFERENCES mdm_standard_pack(id) ON DELETE SET NULL,
  standard_ref TEXT, -- e.g. 'IFRS 15:31', 'IAS 2:9'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT uq_mdm_concept_tenant_key UNIQUE (tenant_id, canonical_key)
);

-- Create indexes for concept lookups
CREATE INDEX IF NOT EXISTS idx_mdm_concept_tenant ON mdm_concept(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mdm_concept_canonical_key ON mdm_concept(canonical_key);
CREATE INDEX IF NOT EXISTS idx_mdm_concept_domain ON mdm_concept(domain);
CREATE INDEX IF NOT EXISTS idx_mdm_concept_type ON mdm_concept(concept_type);
CREATE INDEX IF NOT EXISTS idx_mdm_concept_governance_tier ON mdm_concept(governance_tier);
CREATE INDEX IF NOT EXISTS idx_mdm_concept_standard_pack ON mdm_concept(standard_pack_id_primary);
CREATE INDEX IF NOT EXISTS idx_mdm_concept_active ON mdm_concept(is_active);

-- Create trigger for updated_at (using existing function)
CREATE TRIGGER update_mdm_concept_updated_at BEFORE UPDATE ON mdm_concept
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Aliases table (Sales / Turnover / REV / Apple / APPLE etc.)
CREATE TABLE IF NOT EXISTS mdm_alias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id UUID NOT NULL REFERENCES mdm_concept(id) ON DELETE CASCADE,
  alias_value TEXT NOT NULL,
  alias_type TEXT NOT NULL CHECK (
    alias_type IN ('LEXICAL','SEMANTIC','LEGACY_SYSTEM')
  ),
  source_system TEXT, -- e.g. 'ERP_NEXT', 'SAP', 'QUICKBOOKS'
  is_preferred_for_display BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT uq_mdm_alias_concept_value UNIQUE (concept_id, alias_value)
);

-- Create indexes for alias lookups
CREATE INDEX IF NOT EXISTS idx_mdm_alias_concept ON mdm_alias(concept_id);
CREATE INDEX IF NOT EXISTS idx_mdm_alias_value ON mdm_alias(alias_value);
CREATE INDEX IF NOT EXISTS idx_mdm_alias_type ON mdm_alias(alias_type);
CREATE INDEX IF NOT EXISTS idx_mdm_alias_source_system ON mdm_alias(source_system);
CREATE INDEX IF NOT EXISTS idx_mdm_alias_preferred ON mdm_alias(is_preferred_for_display);

-- Create trigger for updated_at (using existing function)
CREATE TRIGGER update_mdm_alias_updated_at BEFORE UPDATE ON mdm_alias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rules table (Small rule registry for human + future machine enforcement)
CREATE TABLE IF NOT EXISTS mdm_rule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code TEXT NOT NULL UNIQUE, -- 'FIN_IFRS_TIER1_MUST_HAVE_PACK'
  scope TEXT NOT NULL CHECK (
    scope IN ('SYSTEM','PACK','CONCEPT','DOMAIN')
  ),
  target_id UUID, -- nullable: PACK/CONCEPT etc; no FK to keep it flexible
  severity TEXT NOT NULL CHECK (
    severity IN ('INFO','WARNING','BLOCKING')
  ),
  description TEXT NOT NULL,
  expression JSONB, -- optional: DSL, JSON logic, etc.
  is_enforced_in_code BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for rule lookups
CREATE INDEX IF NOT EXISTS idx_mdm_rule_code ON mdm_rule(rule_code);
CREATE INDEX IF NOT EXISTS idx_mdm_rule_scope ON mdm_rule(scope);
CREATE INDEX IF NOT EXISTS idx_mdm_rule_target ON mdm_rule(target_id);
CREATE INDEX IF NOT EXISTS idx_mdm_rule_severity ON mdm_rule(severity);
CREATE INDEX IF NOT EXISTS idx_mdm_rule_enforced ON mdm_rule(is_enforced_in_code);

-- Create trigger for updated_at (using existing function)
CREATE TRIGGER update_mdm_rule_updated_at BEFORE UPDATE ON mdm_rule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Usage Log table (minimal telemetry for Metadata Studio analytics)
-- Tracks which concepts are being used by agents and humans
CREATE TABLE IF NOT EXISTS mdm_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name VARCHAR(255) NOT NULL, -- e.g. 'metadata.lookupConcept'
  concept_id UUID REFERENCES mdm_concept(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_type TEXT NOT NULL CHECK (
    actor_type IN ('AGENT', 'HUMAN', 'SYSTEM')
  ),
  matched_via TEXT, -- 'canonical_key', 'alias', etc.
  metadata JSONB DEFAULT '{}', -- Additional context
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for usage log queries
CREATE INDEX IF NOT EXISTS idx_mdm_usage_log_concept ON mdm_usage_log(concept_id);
CREATE INDEX IF NOT EXISTS idx_mdm_usage_log_tenant ON mdm_usage_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mdm_usage_log_used_at ON mdm_usage_log(used_at);
CREATE INDEX IF NOT EXISTS idx_mdm_usage_log_actor_type ON mdm_usage_log(actor_type);
CREATE INDEX IF NOT EXISTS idx_mdm_usage_log_tool_name ON mdm_usage_log(tool_name);

