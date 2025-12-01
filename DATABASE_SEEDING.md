# Database Seeding Guide

## ✅ Seeding Complete!

Your Neon database has been successfully seeded with initial data.

---

## 📊 Database Schema

### Tables Created

1. **users** - User accounts and authentication

   - `id` (UUID, Primary Key)
   - `email` (VARCHAR, Unique)
   - `name` (VARCHAR)
   - `role` (VARCHAR: admin, developer, user)
   - `created_at`, `updated_at` (Timestamps)

2. **categories** - Categories for organizing metadata

   - `id` (UUID, Primary Key)
   - `name` (VARCHAR)
   - `slug` (VARCHAR, Unique)
   - `description` (TEXT)
   - `parent_id` (UUID, Self-referencing for nested categories)
   - `created_at`, `updated_at` (Timestamps)

3. **metadata_entries** - Main metadata entries

   - `id` (UUID, Primary Key)
   - `title` (VARCHAR)
   - `description` (TEXT)
   - `category_id` (UUID, Foreign Key)
   - `user_id` (UUID, Foreign Key)
   - `data` (JSONB) - Flexible JSON data storage
   - `tags` (TEXT[]) - Array of tags
   - `status` (VARCHAR: draft, published, archived)
   - `created_at`, `updated_at` (Timestamps)

4. **mdm_tool_registry** - MCP Tool Registry for governance

   - `id` (UUID, Primary Key)
   - `tool_id` (VARCHAR, Unique)
   - `tool_name` (VARCHAR)
   - `domain` (VARCHAR)
   - `category` (VARCHAR)
   - `description` (TEXT)
   - `metadata` (JSONB)
   - `created_at`, `updated_at` (Timestamps)

5. **mdm_standard_pack** - Law / Standard Packs (IFRS, IAS 2, IAS 16, Global Tax, etc.)

   - `id` (UUID, Primary Key)
   - `code` (TEXT, Unique) - e.g. 'IFRS_CORE', 'IAS_2_INV'
   - `name` (TEXT)
   - `domain` (TEXT) - CHECK: 'FINANCE', 'HR', 'SCM', 'IT', 'OTHER'
   - `authority_level` (TEXT) - CHECK: 'LAW', 'INDUSTRY', 'INTERNAL'
   - `version` (TEXT, Default: '1.0.0')
   - `status` (TEXT, Default: 'ACTIVE') - CHECK: 'ACTIVE', 'DEPRECATED'
   - `notes` (TEXT)
   - `created_by`, `updated_by` (UUID, Foreign Keys to users)
   - `created_at`, `updated_at` (Timestamps)

6. **mdm_concept** - Canonical definition of concepts (Revenue, Deferred Revenue, GL Journal, etc.)

   - `id` (UUID, Primary Key)
   - `tenant_id` (UUID, NOT NULL) - Multi-tenant identifier
   - `canonical_key` (TEXT, NOT NULL) - Machine key: 'revenue', 'gl_journal_entry'
   - `label` (TEXT, NOT NULL) - UI label
   - `description` (TEXT)
   - `domain` (TEXT, NOT NULL) - CHECK: 'FINANCE', 'HR', 'SCM', 'IT', 'OTHER'
   - `concept_type` (TEXT, NOT NULL) - CHECK: 'FIELD', 'KPI', 'ENTITY', 'SERVICE_RULE'
   - `governance_tier` (SMALLINT, NOT NULL) - CHECK: 1-5 (1 = highest governance)
   - `standard_pack_id_primary` (UUID, Foreign Key to mdm_standard_pack)
   - `standard_ref` (TEXT) - e.g. 'IFRS 15:31', 'IAS 2:9'
   - `is_active` (BOOLEAN, Default: true)
   - `created_by`, `updated_by` (UUID, Foreign Keys to users)
   - `created_at`, `updated_at` (Timestamps)
   - UNIQUE constraint on `(tenant_id, canonical_key)`

7. **mdm_alias** - Aliases for concepts (Sales / Turnover / REV / Apple / APPLE etc.)

   - `id` (UUID, Primary Key)
   - `concept_id` (UUID, NOT NULL, Foreign Key to mdm_concept, CASCADE on delete)
   - `alias_value` (TEXT, NOT NULL) - The alias text: 'Sales', 'REV', 'PO', etc.
   - `alias_type` (TEXT, NOT NULL) - CHECK: 'LEXICAL', 'SEMANTIC', 'LEGACY_SYSTEM'
   - `source_system` (TEXT) - e.g. 'ERP_NEXT', 'SAP', 'QUICKBOOKS'
   - `is_preferred_for_display` (BOOLEAN, Default: false) - Preferred alias for UI display
   - `notes` (TEXT)
   - `created_by`, `updated_by` (UUID, Foreign Keys to users)
   - `created_at`, `updated_at` (Timestamps)
   - UNIQUE constraint on `(concept_id, alias_value)`

8. **mdm_rule** - Small rule registry (human + future machine enforcement)
   - `id` (UUID, Primary Key)
   - `rule_code` (TEXT, NOT NULL, Unique) - e.g. 'FIN_IFRS_TIER1_MUST_HAVE_PACK'
   - `scope` (TEXT, NOT NULL) - CHECK: 'SYSTEM', 'PACK', 'CONCEPT', 'DOMAIN'
   - `target_id` (UUID, nullable) - PACK/CONCEPT etc; no FK to keep it flexible
   - `severity` (TEXT, NOT NULL) - CHECK: 'INFO', 'WARNING', 'BLOCKING'
   - `description` (TEXT, NOT NULL)
   - `expression` (JSONB) - optional: DSL, JSON logic, etc.
   - `is_enforced_in_code` (BOOLEAN, Default: false) - Whether rule is enforced programmatically
   - `created_by`, `updated_by` (UUID, Foreign Keys to users)
   - `created_at`, `updated_at` (Timestamps)

### Indexes Created

- ✅ `idx_metadata_entries_category` - Fast category lookups
- ✅ `idx_metadata_entries_user` - Fast user lookups
- ✅ `idx_metadata_entries_status` - Fast status filtering
- ✅ `idx_metadata_entries_tags` - GIN index for tag searches
- ✅ `idx_metadata_entries_data` - GIN index for JSONB queries
- ✅ `idx_categories_parent` - Fast parent category lookups
- ✅ `idx_users_email` - Fast email lookups
- ✅ `idx_mdm_standard_pack_code` - Fast code lookups
- ✅ `idx_mdm_standard_pack_domain` - Fast domain filtering
- ✅ `idx_mdm_standard_pack_status` - Fast status filtering
- ✅ `idx_mdm_concept_tenant` - Fast tenant lookups
- ✅ `idx_mdm_concept_canonical_key` - Fast canonical key lookups
- ✅ `idx_mdm_concept_domain` - Fast domain filtering
- ✅ `idx_mdm_concept_type` - Fast concept type filtering
- ✅ `idx_mdm_concept_governance_tier` - Fast governance tier filtering
- ✅ `idx_mdm_concept_standard_pack` - Fast standard pack lookups
- ✅ `idx_mdm_concept_active` - Fast active status filtering
- ✅ `idx_mdm_alias_concept` - Fast concept lookups
- ✅ `idx_mdm_alias_value` - Fast alias value lookups
- ✅ `idx_mdm_alias_type` - Fast alias type filtering
- ✅ `idx_mdm_alias_source_system` - Fast source system filtering
- ✅ `idx_mdm_alias_preferred` - Fast preferred display alias filtering
- ✅ `idx_mdm_rule_code` - Fast rule code lookups
- ✅ `idx_mdm_rule_scope` - Fast scope filtering
- ✅ `idx_mdm_rule_target` - Fast target ID lookups
- ✅ `idx_mdm_rule_severity` - Fast severity filtering
- ✅ `idx_mdm_rule_enforced` - Fast enforced status filtering

### Triggers Created

- ✅ Auto-update `updated_at` timestamp on all tables

---

## 🌱 Seeded Data

### Users (3)

- `admin@aibos.com` - Admin User (role: admin)
- `developer@aibos.com` - Developer User (role: developer)
- `user@aibos.com` - Regular User (role: user)

### Categories (5)

- Documentation
- Components
- Tools
- MCP Servers
- Configuration

### Metadata Entries (4)

- Next.js 16 Configuration
- Tailwind CSS v4 Setup
- Button Component
- Neon Database Integration

### MCP Tool Registry (4)

- aibos-ui-generator
- aibos-component-generator
- aibos-filesystem
- neon-database

### Standard Packs (8)

**FINANCE Domain:**

- IFRS_CORE - IFRS Core Standards (LAW)
- IAS_2_INV - IAS 2 - Inventories (LAW)
- IAS_16_PPE - IAS 16 - Property, Plant and Equipment (LAW)
- GLOBAL_TAX - Global Tax Standards (LAW)

**HR Domain:**

- HR_COMPLIANCE - HR Compliance Standards (INDUSTRY)

**SCM Domain:**

- SCM_PROCUREMENT - Supply Chain Procurement Standards (INDUSTRY)

**IT Domain:**

- IT_SECURITY - IT Security Standards (INDUSTRY)

**OTHER Domain:**

- INTERNAL_POLICY - Internal Company Policies (INTERNAL)

### Concepts (9)

**FINANCE Domain:**

- `revenue` - Revenue (KPI, Tier 1, IFRS 15:31)
- `deferred_revenue` - Deferred Revenue (FIELD, Tier 1, IFRS 15:106)
- `gl_journal_entry` - GL Journal Entry (ENTITY, Tier 2)
- `inventory_valuation` - Inventory Valuation (SERVICE_RULE, Tier 1, IAS 2:25)
- `pp_depreciation` - Property & Plant Depreciation (SERVICE_RULE, Tier 1, IAS 16:50)
- `tax_liability` - Tax Liability (KPI, Tier 1)

**HR Domain:**

- `employee_headcount` - Employee Headcount (KPI, Tier 3)

**SCM Domain:**

- `purchase_order` - Purchase Order (ENTITY, Tier 2)

**IT Domain:**

- `api_rate_limit` - API Rate Limit (SERVICE_RULE, Tier 3)

### Aliases (13)

**Revenue Concept:**

- `Sales` (LEXICAL, preferred)
- `Turnover` (LEXICAL)
- `REV` (LEGACY_SYSTEM, ERP_NEXT)
- `Revenue` (SEMANTIC)

**Deferred Revenue Concept:**

- `Unearned Revenue` (SEMANTIC)
- `DEF_REV` (LEGACY_SYSTEM, SAP)

**GL Journal Entry Concept:**

- `Journal Entry` (LEXICAL, preferred)
- `JE` (LEGACY_SYSTEM, QUICKBOOKS)
- `GL_ENTRY` (LEGACY_SYSTEM, ERP_NEXT)

**Inventory Valuation Concept:**

- `Inventory Costing` (SEMANTIC)
- `INV_VAL` (LEGACY_SYSTEM, SAP)

**Purchase Order Concept:**

- `PO` (LEGACY_SYSTEM, ERP_NEXT, preferred)
- `Purchase Requisition` (SEMANTIC)

### Rules (9)

**System-Level Rules (5):**

- `FIN_IFRS_TIER1_MUST_HAVE_PACK` (BLOCKING) - All FINANCE domain concepts with governance tier 1 must have a standard pack reference
- `CONCEPT_MUST_HAVE_ALIAS` (WARNING) - All active concepts should have at least one alias for better discoverability
- `PACK_DEPRECATED_CONCEPTS` (INFO) - Concepts linked to deprecated standard packs should be reviewed
- `SYSTEM_UNIQUE_CANONICAL_KEYS` (BLOCKING, enforced) - Canonical keys must be unique within a tenant
- `SYSTEM_ALIAS_UNIQUENESS` (BLOCKING, enforced) - Alias values must be unique per concept

**Pack-Level Rules (1):**

- `PACK_IFRS_CORE_REQUIREMENTS` (BLOCKING) - IFRS Core pack requires all concepts to have standard references

**Concept-Level Rules (1):**

- `CONCEPT_REVENUE_ALIAS_REQUIRED` (WARNING) - Revenue concept must have a preferred display alias

**Domain-Level Rules (2):**

- `DOMAIN_FINANCE_GOVERNANCE` (WARNING) - FINANCE domain concepts with tier 1-2 must have standard pack references
- `DOMAIN_HR_COMPLIANCE` (INFO) - HR domain concepts should have compliance-related standard packs

---

## 🚀 Usage

### Run Seeding

```bash
cd apps
pnpm db:seed
```

### Query Data

```typescript
import { sql } from "@/lib/db";

// Get all users
const users = await sql`SELECT * FROM users`;

// Get metadata entries with categories
const entries = await sql`
  SELECT 
    me.*,
    c.name as category_name,
    u.name as user_name
  FROM metadata_entries me
  LEFT JOIN categories c ON me.category_id = c.id
  LEFT JOIN users u ON me.user_id = u.id
  WHERE me.status = 'published'
`;

// Search by tags
const tagged = await sql`
  SELECT * FROM metadata_entries
  WHERE 'nextjs' = ANY(tags)
`;

// Get concepts by domain and governance tier
const financeConcepts = await sql`
  SELECT 
    c.*,
    sp.name as standard_pack_name,
    sp.code as standard_pack_code
  FROM mdm_concept c
  LEFT JOIN mdm_standard_pack sp ON c.standard_pack_id_primary = sp.id
  WHERE c.domain = 'FINANCE' 
    AND c.is_active = true
    AND c.governance_tier <= 2
  ORDER BY c.governance_tier, c.canonical_key
`;

// Get concepts by type
const kpiConcepts = await sql`
  SELECT * FROM mdm_concept
  WHERE concept_type = 'KPI' AND is_active = true
  ORDER BY governance_tier, label
`;

// Get all aliases for a concept
const revenueAliases = await sql`
  SELECT 
    a.*,
    c.canonical_key,
    c.label as concept_label
  FROM mdm_alias a
  JOIN mdm_concept c ON a.concept_id = c.id
  WHERE c.canonical_key = 'revenue'
  ORDER BY a.is_preferred_for_display DESC, a.alias_type, a.alias_value
`;

// Find concept by alias (reverse lookup)
const conceptByAlias = await sql`
  SELECT 
    c.*,
    a.alias_value,
    a.alias_type,
    a.source_system
  FROM mdm_concept c
  JOIN mdm_alias a ON c.id = a.concept_id
  WHERE LOWER(a.alias_value) = LOWER('Sales')
  LIMIT 1
`;

// Get preferred aliases for display
const preferredAliases = await sql`
  SELECT 
    c.canonical_key,
    c.label as concept_label,
    a.alias_value as preferred_alias
  FROM mdm_concept c
  JOIN mdm_alias a ON c.id = a.concept_id
  WHERE a.is_preferred_for_display = true
    AND c.is_active = true
`;

// Get all blocking rules
const blockingRules = await sql`
  SELECT * FROM mdm_rule
  WHERE severity = 'BLOCKING'
  ORDER BY scope, rule_code
`;

// Get rules for a specific scope
const packRules = await sql`
  SELECT * FROM mdm_rule
  WHERE scope = 'PACK' AND target_id = ${packId}
  ORDER BY severity DESC
`;

// Get enforced rules
const enforcedRules = await sql`
  SELECT * FROM mdm_rule
  WHERE is_enforced_in_code = true
  ORDER BY rule_code
`;
```

### Create New Entry

```typescript
import { sql } from "@/lib/db";

const newEntry = await sql`
  INSERT INTO metadata_entries (title, description, category_id, data, tags, status)
  VALUES (
    'My New Entry',
    'Description here',
    ${categoryId},
    '{"key": "value"}'::jsonb,
    ARRAY['tag1', 'tag2'],
    'published'
  )
  RETURNING *
`;
```

---

## 📝 Files Created

- `apps/lib/schema.sql` - Database schema definition
- `apps/lib/seed.ts` - Seeding script
- `apps/lib/db.ts` - Database connection utility

---

## 🔄 Re-seeding

To re-seed the database (will skip existing records):

```bash
cd apps
pnpm db:seed
```

The script uses `ON CONFLICT DO NOTHING` to avoid duplicates.

---

## 🗑️ Reset Database

To completely reset and re-seed:

```sql
-- Connect to your database and run:
DROP TABLE IF EXISTS mdm_rule CASCADE;
DROP TABLE IF EXISTS mdm_alias CASCADE;
DROP TABLE IF EXISTS mdm_concept CASCADE;
DROP TABLE IF EXISTS mdm_standard_pack CASCADE;
DROP TABLE IF EXISTS metadata_entries CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS mdm_tool_registry CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

Then run `pnpm db:seed` again.

---

**Last Updated:** 2025-01-27  
**Status:** ✅ Ready to Use
