/**
 * Database Seeding Script
 * 
 * Run this script to seed your Neon database with initial data:
 * npx tsx apps/lib/seed.ts
 */

import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  // Try multiple locations for .env file
  const envPaths = [
    path.join(__dirname, '../../.env'),      // apps/.env
    path.join(__dirname, '../../../.env'),    // root .env
    path.join(process.cwd(), '.env'),        // current directory
  ];

  for (const envPath of envPaths) {
    try {
      if (readFileSync(envPath, 'utf-8')) {
        const envFile = readFileSync(envPath, 'utf-8');
        const lines = envFile.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
              const value = valueParts.join('=').trim();
              process.env[key.trim()] = value;
            }
          }
        }
        return; // Successfully loaded
      }
    } catch (error) {
      // Try next path
      continue;
    }
  }

  console.warn('⚠️  Could not read .env file, using existing environment variables');
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function createSchema() {
  console.log('📋 Creating database schema...');

  try {
    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log('   ✅ UUID extension enabled');

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✅ Created users table');

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✅ Created categories table');

    await sql`
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
      )
    `;
    console.log('   ✅ Created metadata_entries table');

    await sql`
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
      )
    `;
    console.log('   ✅ Created mdm_tool_registry table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_metadata_entries_category ON metadata_entries(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_metadata_entries_user ON metadata_entries(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_metadata_entries_status ON metadata_entries(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_metadata_entries_tags ON metadata_entries USING GIN(tags)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_metadata_entries_data ON metadata_entries USING GIN(data)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    console.log('   ✅ Created indexes');

    // Create trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    // Create triggers (drop first to avoid errors on re-run)
    await sql`DROP TRIGGER IF EXISTS update_users_updated_at ON users`;
    await sql`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    await sql`DROP TRIGGER IF EXISTS update_categories_updated_at ON categories`;
    await sql`CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    await sql`DROP TRIGGER IF EXISTS update_metadata_entries_updated_at ON metadata_entries`;
    await sql`CREATE TRIGGER update_metadata_entries_updated_at BEFORE UPDATE ON metadata_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    await sql`DROP TRIGGER IF EXISTS update_mdm_tool_registry_updated_at ON mdm_tool_registry`;
    await sql`CREATE TRIGGER update_mdm_tool_registry_updated_at BEFORE UPDATE ON mdm_tool_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    // Create standard packs table
    await sql`
      CREATE TABLE IF NOT EXISTS mdm_standard_pack (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        domain TEXT NOT NULL CHECK (domain IN ('FINANCE','HR','SCM','IT','OTHER')),
        authority_level TEXT NOT NULL CHECK (authority_level IN ('LAW','INDUSTRY','INTERNAL')),
        version TEXT NOT NULL DEFAULT '1.0.0',
        status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','DEPRECATED')),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    console.log('   ✅ Created mdm_standard_pack table');

    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_standard_pack_code ON mdm_standard_pack(code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_standard_pack_domain ON mdm_standard_pack(domain)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_standard_pack_status ON mdm_standard_pack(status)`;
    console.log('   ✅ Created standard pack indexes');

    await sql`DROP TRIGGER IF EXISTS update_mdm_standard_pack_updated_at ON mdm_standard_pack`;
    await sql`CREATE TRIGGER update_mdm_standard_pack_updated_at BEFORE UPDATE ON mdm_standard_pack FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    console.log('   ✅ Created standard pack triggers');

    // Create concepts table
    await sql`
      CREATE TABLE IF NOT EXISTS mdm_concept (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        canonical_key TEXT NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        domain TEXT NOT NULL CHECK (domain IN ('FINANCE','HR','SCM','IT','OTHER')),
        concept_type TEXT NOT NULL CHECK (concept_type IN ('FIELD','KPI','ENTITY','SERVICE_RULE')),
        governance_tier SMALLINT NOT NULL CHECK (governance_tier BETWEEN 1 AND 5),
        standard_pack_id_primary UUID REFERENCES mdm_standard_pack(id) ON DELETE SET NULL,
        standard_ref TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT uq_mdm_concept_tenant_key UNIQUE (tenant_id, canonical_key)
      )
    `;
    console.log('   ✅ Created mdm_concept table');

    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_concept_tenant ON mdm_concept(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_concept_canonical_key ON mdm_concept(canonical_key)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_concept_domain ON mdm_concept(domain)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_concept_type ON mdm_concept(concept_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_concept_governance_tier ON mdm_concept(governance_tier)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_concept_standard_pack ON mdm_concept(standard_pack_id_primary)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_concept_active ON mdm_concept(is_active)`;
    console.log('   ✅ Created concept indexes');

    await sql`DROP TRIGGER IF EXISTS update_mdm_concept_updated_at ON mdm_concept`;
    await sql`CREATE TRIGGER update_mdm_concept_updated_at BEFORE UPDATE ON mdm_concept FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    console.log('   ✅ Created concept triggers');

    // Create tier enforcement function and trigger
    await sql`
      CREATE OR REPLACE FUNCTION validate_tier_enforcement()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.domain = 'FINANCE' AND (NEW.governance_tier = 1 OR NEW.governance_tier = 2) THEN
          IF NEW.standard_pack_id_primary IS NULL THEN
            RAISE EXCEPTION 'FINANCE concepts with governance tier % must have a standard_pack_id_primary pointing to a LAW-level pack', NEW.governance_tier;
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM mdm_standard_pack 
            WHERE id = NEW.standard_pack_id_primary 
              AND authority_level = 'LAW'
              AND status = 'ACTIVE'
          ) THEN
            RAISE EXCEPTION 'FINANCE concepts with governance tier % must reference a LAW-level ACTIVE standard pack', NEW.governance_tier;
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;
    await sql`DROP TRIGGER IF EXISTS enforce_tier_validation ON mdm_concept`;
    await sql`CREATE TRIGGER enforce_tier_validation BEFORE INSERT OR UPDATE ON mdm_concept FOR EACH ROW EXECUTE FUNCTION validate_tier_enforcement()`;
    console.log('   ✅ Created tier enforcement trigger');

    // Create aliases table
    await sql`
      CREATE TABLE IF NOT EXISTS mdm_alias (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        concept_id UUID NOT NULL REFERENCES mdm_concept(id) ON DELETE CASCADE,
        alias_value TEXT NOT NULL,
        alias_type TEXT NOT NULL CHECK (alias_type IN ('LEXICAL','SEMANTIC','LEGACY_SYSTEM')),
        source_system TEXT,
        is_preferred_for_display BOOLEAN NOT NULL DEFAULT false,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT uq_mdm_alias_concept_value UNIQUE (concept_id, alias_value)
      )
    `;
    console.log('   ✅ Created mdm_alias table');

    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_alias_concept ON mdm_alias(concept_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_alias_value ON mdm_alias(alias_value)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_alias_type ON mdm_alias(alias_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_alias_source_system ON mdm_alias(source_system)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_alias_preferred ON mdm_alias(is_preferred_for_display)`;
    console.log('   ✅ Created alias indexes');

    await sql`DROP TRIGGER IF EXISTS update_mdm_alias_updated_at ON mdm_alias`;
    await sql`CREATE TRIGGER update_mdm_alias_updated_at BEFORE UPDATE ON mdm_alias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    console.log('   ✅ Created alias triggers');

    // Create rules table
    await sql`
      CREATE TABLE IF NOT EXISTS mdm_rule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rule_code TEXT NOT NULL UNIQUE,
        scope TEXT NOT NULL CHECK (scope IN ('SYSTEM','PACK','CONCEPT','DOMAIN')),
        target_id UUID,
        severity TEXT NOT NULL CHECK (severity IN ('INFO','WARNING','BLOCKING')),
        description TEXT NOT NULL,
        expression JSONB,
        is_enforced_in_code BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    console.log('   ✅ Created mdm_rule table');

    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_rule_code ON mdm_rule(rule_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_rule_scope ON mdm_rule(scope)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_rule_target ON mdm_rule(target_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_rule_severity ON mdm_rule(severity)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mdm_rule_enforced ON mdm_rule(is_enforced_in_code)`;
    console.log('   ✅ Created rule indexes');

    await sql`DROP TRIGGER IF EXISTS update_mdm_rule_updated_at ON mdm_rule`;
    await sql`CREATE TRIGGER update_mdm_rule_updated_at BEFORE UPDATE ON mdm_rule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    console.log('   ✅ Created rule triggers');

    console.log('✅ Schema created successfully!\n');
  } catch (error) {
    console.error('❌ Error creating schema:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function seedData() {
  console.log('🌱 Seeding database with initial data...\n');

  try {
    // Seed Users
    console.log('👤 Seeding users...');
    const users = await sql`
      INSERT INTO users (email, name, role) VALUES
        ('admin@aibos.com', 'Admin User', 'admin'),
        ('developer@aibos.com', 'Developer User', 'developer'),
        ('user@aibos.com', 'Regular User', 'user')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, name;
    `;
    console.log(`   ✅ Created ${users.length} users`);

    // Seed Categories
    console.log('📁 Seeding categories...');
    const categories = await sql`
      INSERT INTO categories (name, slug, description) VALUES
        ('Documentation', 'documentation', 'Documentation and guides'),
        ('Components', 'components', 'UI components and patterns'),
        ('Tools', 'tools', 'Development tools and utilities'),
        ('MCP Servers', 'mcp-servers', 'Model Context Protocol servers'),
        ('Configuration', 'configuration', 'Configuration files and settings')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, name, slug;
    `;
    console.log(`   ✅ Created ${categories.length} categories`);

    // Get category IDs for metadata entries
    const docCategory = await sql`SELECT id FROM categories WHERE slug = 'documentation' LIMIT 1`;
    const componentCategory = await sql`SELECT id FROM categories WHERE slug = 'components' LIMIT 1`;
    const toolCategory = await sql`SELECT id FROM categories WHERE slug = 'tools' LIMIT 1`;

    // Seed Metadata Entries
    console.log('📝 Seeding metadata entries...');
    const metadataEntries = await sql`
      INSERT INTO metadata_entries (title, description, category_id, data, tags, status) VALUES
        (
          'Next.js 16 Configuration',
          'Configuration guide for Next.js 16 with App Router',
          ${docCategory[0]?.id || null},
          '{"framework": "nextjs", "version": "16.0.3"}'::jsonb,
          ARRAY['nextjs', 'configuration', 'app-router'],
          'published'
        ),
        (
          'Tailwind CSS v4 Setup',
          'Tailwind CSS v4 configuration with PostCSS',
          ${docCategory[0]?.id || null},
          '{"cssFramework": "tailwindcss", "version": "4.1.6"}'::jsonb,
          ARRAY['tailwindcss', 'css', 'styling'],
          'published'
        ),
        (
          'Button Component',
          'Reusable button component with variants',
          ${componentCategory[0]?.id || null},
          '{"componentType": "button", "variants": ["primary", "secondary", "outline"]}'::jsonb,
          ARRAY['button', 'component', 'ui'],
          'published'
        ),
        (
          'Neon Database Integration',
          'Neon Postgres database setup and configuration',
          ${toolCategory[0]?.id || null},
          '{"database": "postgresql", "provider": "neon"}'::jsonb,
          ARRAY['database', 'neon', 'postgresql'],
          'published'
        )
      ON CONFLICT DO NOTHING
      RETURNING id, title;
    `;
    console.log(`   ✅ Created ${metadataEntries.length} metadata entries`);

    // Seed MCP Tool Registry
    console.log('🔧 Seeding MCP tool registry...');
    const mcpTools = await sql`
      INSERT INTO mdm_tool_registry (tool_id, tool_name, domain, category, description, metadata) VALUES
        (
          'aibos-ui-generator',
          'UI Generator',
          'ui-generation',
          'info',
          'Generates UI layouts and components from natural language',
          '{"server": "aibos-ui-generator", "type": "generation"}'::jsonb
        ),
        (
          'aibos-component-generator',
          'Component Generator',
          'component-generation',
          'info',
          'Generates React components following AIBOS conventions',
          '{"server": "aibos-component-generator", "type": "generation"}'::jsonb
        ),
        (
          'aibos-filesystem',
          'Filesystem Operations',
          'filesystem',
          'info',
          'Optimized filesystem access with controlled paths',
          '{"server": "aibos-filesystem", "type": "filesystem"}'::jsonb
        ),
        (
          'neon-database',
          'Neon Database',
          'database',
          'info',
          'Neon Postgres database operations',
          '{"server": "neon", "type": "database"}'::jsonb
        )
      ON CONFLICT (tool_id) DO NOTHING
      RETURNING tool_id, tool_name;
    `;
    console.log(`   ✅ Created ${mcpTools.length} MCP tool registry entries`);

    // Seed Standard Packs
    console.log('📦 Seeding standard packs...');
    const adminUser = await sql`SELECT id FROM users WHERE email = 'admin@aibos.com' LIMIT 1`;
    const adminUserId = adminUser[0]?.id || null;

    const standardPacks = await sql`
      INSERT INTO mdm_standard_pack (code, name, domain, authority_level, version, status, notes, created_by) VALUES
        (
          'IFRS_CORE',
          'IFRS Core Standards',
          'FINANCE',
          'LAW',
          '2024.1',
          'ACTIVE',
          'International Financial Reporting Standards - Core set of accounting standards',
          ${adminUserId}
        ),
        (
          'IAS_2_INV',
          'IAS 2 - Inventories',
          'FINANCE',
          'LAW',
          '1.0.0',
          'ACTIVE',
          'International Accounting Standard 2: Inventories - Measurement and recognition of inventory',
          ${adminUserId}
        ),
        (
          'IAS_16_PPE',
          'IAS 16 - Property, Plant and Equipment',
          'FINANCE',
          'LAW',
          '1.0.0',
          'ACTIVE',
          'International Accounting Standard 16: Property, Plant and Equipment - Recognition and measurement',
          ${adminUserId}
        ),
        (
          'GLOBAL_TAX',
          'Global Tax Standards',
          'FINANCE',
          'LAW',
          '2024.1',
          'ACTIVE',
          'Global tax compliance and reporting standards',
          ${adminUserId}
        ),
        (
          'HR_COMPLIANCE',
          'HR Compliance Standards',
          'HR',
          'INDUSTRY',
          '1.0.0',
          'ACTIVE',
          'Human Resources compliance and best practices',
          ${adminUserId}
        ),
        (
          'SCM_PROCUREMENT',
          'Supply Chain Procurement Standards',
          'SCM',
          'INDUSTRY',
          '1.0.0',
          'ACTIVE',
          'Supply Chain Management procurement standards',
          ${adminUserId}
        ),
        (
          'IT_SECURITY',
          'IT Security Standards',
          'IT',
          'INDUSTRY',
          '1.0.0',
          'ACTIVE',
          'Information Technology security and compliance standards',
          ${adminUserId}
        ),
        (
          'INTERNAL_POLICY',
          'Internal Company Policies',
          'OTHER',
          'INTERNAL',
          '1.0.0',
          'ACTIVE',
          'Internal company policies and procedures',
          ${adminUserId}
        )
      ON CONFLICT (code) DO NOTHING
      RETURNING code, name, domain;
    `;
    console.log(`   ✅ Created ${standardPacks.length} standard packs`);

    // Seed Concepts
    console.log('💡 Seeding concepts...');

    // Get standard pack IDs for references
    const ifrsCorePack = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IFRS_CORE' LIMIT 1`;
    const ias2Pack = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IAS_2_INV' LIMIT 1`;
    const ias16Pack = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IAS_16_PPE' LIMIT 1`;
    const globalTaxPack = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'GLOBAL_TAX' LIMIT 1`;

    // Generate a default tenant_id (using admin user's ID as tenant for now)
    const defaultTenantId = adminUserId || (await sql`SELECT id FROM users LIMIT 1`)[0]?.id;

    if (!defaultTenantId) {
      console.warn('   ⚠️  No users found, skipping concept seeding');
    } else {
      const concepts = await sql`
        INSERT INTO mdm_concept (
          tenant_id, canonical_key, label, description, domain, concept_type,
          governance_tier, standard_pack_id_primary, standard_ref, created_by
        ) VALUES
          (
            ${defaultTenantId},
            'revenue',
            'Revenue',
            'Income from ordinary activities of an entity',
            'FINANCE',
            'KPI',
            1,
            ${ifrsCorePack[0]?.id || null},
            'IFRS 15:31',
            ${adminUserId}
          ),
          (
            ${defaultTenantId},
            'deferred_revenue',
            'Deferred Revenue',
            'Revenue received but not yet earned',
            'FINANCE',
            'FIELD',
            1,
            ${ifrsCorePack[0]?.id || null},
            'IFRS 15:106',
            ${adminUserId}
          ),
          (
            ${defaultTenantId},
            'gl_journal_entry',
            'GL Journal Entry',
            'General Ledger journal entry transaction',
            'FINANCE',
            'ENTITY',
            2,
            ${ifrsCorePack[0]?.id || null},
            NULL,
            ${adminUserId}
          ),
          (
            ${defaultTenantId},
            'inventory_valuation',
            'Inventory Valuation',
            'Method for valuing inventory (FIFO, LIFO, Weighted Average)',
            'FINANCE',
            'SERVICE_RULE',
            1,
            ${ias2Pack[0]?.id || null},
            'IAS 2:25',
            ${adminUserId}
          ),
          (
            ${defaultTenantId},
            'pp_depreciation',
            'Property & Plant Depreciation',
            'Depreciation method for property, plant and equipment',
            'FINANCE',
            'SERVICE_RULE',
            1,
            ${ias16Pack[0]?.id || null},
            'IAS 16:50',
            ${adminUserId}
          ),
          (
            ${defaultTenantId},
            'tax_liability',
            'Tax Liability',
            'Current tax liability for reporting period',
            'FINANCE',
            'KPI',
            1,
            ${globalTaxPack[0]?.id || null},
            NULL,
            ${adminUserId}
          ),
          (
            ${defaultTenantId},
            'employee_headcount',
            'Employee Headcount',
            'Total number of employees',
            'HR',
            'KPI',
            3,
            NULL,
            NULL,
            ${adminUserId}
          ),
          (
            ${defaultTenantId},
            'purchase_order',
            'Purchase Order',
            'Purchase order entity for procurement',
            'SCM',
            'ENTITY',
            2,
            NULL,
            NULL,
            ${adminUserId}
          ),
          (
            ${defaultTenantId},
            'api_rate_limit',
            'API Rate Limit',
            'Rate limiting rule for API endpoints',
            'IT',
            'SERVICE_RULE',
            3,
            NULL,
            NULL,
            ${adminUserId}
          )
        ON CONFLICT (tenant_id, canonical_key) DO NOTHING
        RETURNING canonical_key, label, domain;
      `;
      console.log(`   ✅ Created ${concepts.length} concepts`);

      // Seed Aliases
      console.log('🏷️  Seeding aliases...');

      // Get concept IDs for aliases
      const revenueConcept = await sql`SELECT id FROM mdm_concept WHERE canonical_key = 'revenue' LIMIT 1`;
      const deferredRevenueConcept = await sql`SELECT id FROM mdm_concept WHERE canonical_key = 'deferred_revenue' LIMIT 1`;
      const glJournalConcept = await sql`SELECT id FROM mdm_concept WHERE canonical_key = 'gl_journal_entry' LIMIT 1`;
      const inventoryConcept = await sql`SELECT id FROM mdm_concept WHERE canonical_key = 'inventory_valuation' LIMIT 1`;
      const purchaseOrderConcept = await sql`SELECT id FROM mdm_concept WHERE canonical_key = 'purchase_order' LIMIT 1`;

      if (revenueConcept[0]?.id) {
        const aliases = await sql`
          INSERT INTO mdm_alias (
            concept_id, alias_value, alias_type, source_system,
            is_preferred_for_display, notes, created_by
          ) VALUES
            -- Revenue aliases
            (
              ${revenueConcept[0].id},
              'Sales',
              'LEXICAL',
              NULL,
              true,
              'Common lexical alias for revenue',
              ${adminUserId}
            ),
            (
              ${revenueConcept[0].id},
              'Turnover',
              'LEXICAL',
              NULL,
              false,
              'UK/European term for revenue',
              ${adminUserId}
            ),
            (
              ${revenueConcept[0].id},
              'REV',
              'LEGACY_SYSTEM',
              'ERP_NEXT',
              false,
              'Abbreviation used in legacy ERP system',
              ${adminUserId}
            ),
            (
              ${revenueConcept[0].id},
              'Revenue',
              'SEMANTIC',
              NULL,
              false,
              'Standard semantic alias',
              ${adminUserId}
            ),
            -- Deferred Revenue aliases
            (
              ${deferredRevenueConcept[0]?.id || null},
              'Unearned Revenue',
              'SEMANTIC',
              NULL,
              false,
              'Semantic equivalent term',
              ${adminUserId}
            ),
            (
              ${deferredRevenueConcept[0]?.id || null},
              'DEF_REV',
              'LEGACY_SYSTEM',
              'SAP',
              false,
              'SAP system abbreviation',
              ${adminUserId}
            ),
            -- GL Journal Entry aliases
            (
              ${glJournalConcept[0]?.id || null},
              'Journal Entry',
              'LEXICAL',
              NULL,
              true,
              'Shortened lexical form',
              ${adminUserId}
            ),
            (
              ${glJournalConcept[0]?.id || null},
              'JE',
              'LEGACY_SYSTEM',
              'QUICKBOOKS',
              false,
              'QuickBooks abbreviation',
              ${adminUserId}
            ),
            (
              ${glJournalConcept[0]?.id || null},
              'GL_ENTRY',
              'LEGACY_SYSTEM',
              'ERP_NEXT',
              false,
              'ERP system code',
              ${adminUserId}
            ),
            -- Inventory Valuation aliases
            (
              ${inventoryConcept[0]?.id || null},
              'Inventory Costing',
              'SEMANTIC',
              NULL,
              false,
              'Semantic alternative term',
              ${adminUserId}
            ),
            (
              ${inventoryConcept[0]?.id || null},
              'INV_VAL',
              'LEGACY_SYSTEM',
              'SAP',
              false,
              'SAP system code',
              ${adminUserId}
            ),
            -- Purchase Order aliases
            (
              ${purchaseOrderConcept[0]?.id || null},
              'PO',
              'LEGACY_SYSTEM',
              'ERP_NEXT',
              true,
              'Common abbreviation',
              ${adminUserId}
            ),
            (
              ${purchaseOrderConcept[0]?.id || null},
              'Purchase Requisition',
              'SEMANTIC',
              NULL,
              false,
              'Related semantic term',
              ${adminUserId}
            )
          ON CONFLICT (concept_id, alias_value) DO NOTHING
          RETURNING alias_value, alias_type;
        `;
        console.log(`   ✅ Created ${aliases.length} aliases`);
      } else {
        console.warn('   ⚠️  No concepts found, skipping alias seeding');
      }
    }

    // Seed Rules
    console.log('📜 Seeding rules...');

    // Get some IDs for target_id references (reuse existing queries if available)
    const ifrsCorePackForRule = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IFRS_CORE' LIMIT 1`;
    const revenueConceptForRule = await sql`SELECT id FROM mdm_concept WHERE canonical_key = 'revenue' LIMIT 1`;

    const rules = await sql`
      INSERT INTO mdm_rule (
        rule_code, scope, target_id, severity, description, expression,
        is_enforced_in_code, created_by
      ) VALUES
        -- System-level rules
        (
          'FIN_IFRS_TIER1_MUST_HAVE_PACK',
          'SYSTEM',
          NULL,
          'BLOCKING',
          'All FINANCE domain concepts with governance tier 1 must have a standard pack reference',
          '{"condition": "domain = ''FINANCE'' AND governance_tier = 1", "requirement": "standard_pack_id_primary IS NOT NULL"}'::jsonb,
          false,
          ${adminUserId}
        ),
        (
          'CONCEPT_MUST_HAVE_ALIAS',
          'SYSTEM',
          NULL,
          'WARNING',
          'All active concepts should have at least one alias for better discoverability',
          '{"condition": "is_active = true", "requirement": "EXISTS (SELECT 1 FROM mdm_alias WHERE concept_id = mdm_concept.id)"}'::jsonb,
          false,
          ${adminUserId}
        ),
        (
          'PACK_DEPRECATED_CONCEPTS',
          'SYSTEM',
          NULL,
          'INFO',
          'Concepts linked to deprecated standard packs should be reviewed',
          '{"condition": "standard_pack_id_primary IS NOT NULL", "check": "SELECT status FROM mdm_standard_pack WHERE id = standard_pack_id_primary"}'::jsonb,
          false,
          ${adminUserId}
        ),
        -- Pack-level rules
        (
          'PACK_IFRS_CORE_REQUIREMENTS',
          'PACK',
          ${ifrsCorePackForRule[0]?.id || null},
          'BLOCKING',
          'IFRS Core pack requires all concepts to have standard references',
          '{"pack_code": "IFRS_CORE", "requirement": "standard_ref IS NOT NULL"}'::jsonb,
          false,
          ${adminUserId}
        ),
        -- Concept-level rules
        (
          'CONCEPT_REVENUE_ALIAS_REQUIRED',
          'CONCEPT',
          ${revenueConceptForRule[0]?.id || null},
          'WARNING',
          'Revenue concept must have a preferred display alias',
          '{"concept_key": "revenue", "requirement": "EXISTS (SELECT 1 FROM mdm_alias WHERE concept_id = mdm_concept.id AND is_preferred_for_display = true)"}'::jsonb,
          false,
          ${adminUserId}
        ),
        -- Domain-level rules
        (
          'DOMAIN_FINANCE_GOVERNANCE',
          'DOMAIN',
          NULL,
          'WARNING',
          'FINANCE domain concepts with tier 1-2 must have standard pack references',
          '{"domain": "FINANCE", "tiers": [1, 2], "requirement": "standard_pack_id_primary IS NOT NULL"}'::jsonb,
          false,
          ${adminUserId}
        ),
        (
          'DOMAIN_HR_COMPLIANCE',
          'DOMAIN',
          NULL,
          'INFO',
          'HR domain concepts should have compliance-related standard packs',
          '{"domain": "HR", "suggestion": "Link to HR_COMPLIANCE pack when applicable"}'::jsonb,
          false,
          ${adminUserId}
        ),
        (
          'SYSTEM_UNIQUE_CANONICAL_KEYS',
          'SYSTEM',
          NULL,
          'BLOCKING',
          'Canonical keys must be unique within a tenant',
          '{"enforced_by": "database_constraint", "constraint": "uq_mdm_concept_tenant_key"}'::jsonb,
          true,
          ${adminUserId}
        ),
        (
          'SYSTEM_ALIAS_UNIQUENESS',
          'SYSTEM',
          NULL,
          'BLOCKING',
          'Alias values must be unique per concept',
          '{"enforced_by": "database_constraint", "constraint": "uq_mdm_alias_concept_value"}'::jsonb,
          true,
          ${adminUserId}
        )
      ON CONFLICT (rule_code) DO NOTHING
      RETURNING rule_code, scope, severity;
    `;
    console.log(`   ✅ Created ${rules.length} rules`);

    console.log('\n✅ Database seeding completed successfully!');

    // Show summary
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`;
    const entryCount = await sql`SELECT COUNT(*) as count FROM metadata_entries`;
    const toolCount = await sql`SELECT COUNT(*) as count FROM mdm_tool_registry`;
    const standardPackCount = await sql`SELECT COUNT(*) as count FROM mdm_standard_pack`;
    const conceptCount = await sql`SELECT COUNT(*) as count FROM mdm_concept`;
    const aliasCount = await sql`SELECT COUNT(*) as count FROM mdm_alias`;
    const ruleCount = await sql`SELECT COUNT(*) as count FROM mdm_rule`;

    console.log('\n📊 Database Summary:');
    console.log(`   Users: ${userCount[0]?.count || 0}`);
    console.log(`   Categories: ${categoryCount[0]?.count || 0}`);
    console.log(`   Metadata Entries: ${entryCount[0]?.count || 0}`);
    console.log(`   MCP Tools: ${toolCount[0]?.count || 0}`);
    console.log(`   Standard Packs: ${standardPackCount[0]?.count || 0}`);
    console.log(`   Concepts: ${conceptCount[0]?.count || 0}`);
    console.log(`   Aliases: ${aliasCount[0]?.count || 0}`);
    console.log(`   Rules: ${ruleCount[0]?.count || 0}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database seeding process...\n');
  if (databaseUrl) {
    console.log('📍 Database:', databaseUrl.replace(/:[^:@]+@/, ':****@'));
  }
  console.log('');

  try {
    // Create schema first
    await createSchema();

    // Then seed data
    await seedData();

    console.log('\n🎉 All done! Your database is ready to use.');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();

