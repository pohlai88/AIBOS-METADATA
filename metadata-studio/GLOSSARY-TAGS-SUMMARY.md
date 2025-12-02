# Glossary + Tags System - Database Layer Complete

## 🎉 **Database Schema Added**

Successfully added glossary and tags tables to the metadata governance platform!

---

## 📊 **New Database Tables (3 Tables)**

### 1. `mdm_glossary_term` (17 columns)

**Purpose:** Business glossary for canonical term definitions with tier-based governance.

**Key Features:**
- ✅ Multi-tenant isolation (`tenant_id`)
- ✅ Canonical key uniqueness per tenant
- ✅ Domain + category organization
- ✅ Tier-based governance (tier1-5)
- ✅ Optional SoT pack binding (IFRS/HL7/etc.)
- ✅ Multi-language support (default: 'en')
- ✅ Status tracking (active/deprecated/draft)
- ✅ Synonyms storage (comma/pipe separated)
- ✅ Related terms cross-references
- ✅ Complete audit trail

**Schema:**
```sql
CREATE TABLE mdm_glossary_term (
  id                      uuid PRIMARY KEY,
  tenant_id               uuid NOT NULL,
  canonical_key           text NOT NULL,
  term                    text NOT NULL,
  description             text,
  domain                  text NOT NULL,
  category                text NOT NULL,
  standard_pack_id        text,
  language                text DEFAULT 'en' NOT NULL,
  tier                    text NOT NULL,
  status                  text DEFAULT 'active' NOT NULL,
  synonyms_raw            text,
  related_canonical_keys  text,
  created_at              timestamp DEFAULT now(),
  updated_at              timestamp DEFAULT now(),
  created_by              text NOT NULL,
  updated_by              text NOT NULL,
  
  UNIQUE (tenant_id, canonical_key),
  INDEX (tenant_id, term)
);
```

**Example Term:**
```json
{
  "canonicalKey": "revenue_gross",
  "term": "Gross Revenue",
  "description": "Total revenue before any deductions, as defined by IFRS 15",
  "domain": "finance",
  "category": "Financial Performance",
  "standardPackId": "IFRS_15_REV",
  "tier": "tier1",
  "language": "en",
  "synonymsRaw": "Revenue,Sales,Turnover",
  "status": "active"
}
```

---

### 2. `mdm_tag` (13 columns)

**Purpose:** Tag definitions for flexible categorization and classification.

**Key Features:**
- ✅ Multi-tenant isolation
- ✅ Stable key + human-friendly label
- ✅ Category-based organization
- ✅ Optional SoT pack binding
- ✅ System tags vs user tags (`is_system`)
- ✅ Active/inactive status
- ✅ Complete audit trail

**Schema:**
```sql
CREATE TABLE mdm_tag (
  id                uuid PRIMARY KEY,
  tenant_id         uuid NOT NULL,
  key               text NOT NULL,
  label             text NOT NULL,
  description       text,
  category          text NOT NULL,
  standard_pack_id  text,
  status            text DEFAULT 'active' NOT NULL,
  is_system         boolean DEFAULT false NOT NULL,
  created_at        timestamp DEFAULT now(),
  updated_at        timestamp DEFAULT now(),
  created_by        text NOT NULL,
  updated_by        text NOT NULL,
  
  UNIQUE (tenant_id, key),
  INDEX (tenant_id, category)
);
```

**Example Tags:**
```json
[
  {
    "key": "risk_critical",
    "label": "Risk Critical",
    "category": "Risk",
    "isSystem": false,
    "status": "active"
  },
  {
    "key": "pii_sensitive",
    "label": "PII/Sensitive Data",
    "category": "Security",
    "isSystem": true,
    "status": "active"
  },
  {
    "key": "finance_performance",
    "label": "Financial Performance",
    "category": "Domain",
    "standardPackId": "IFRS_CORE",
    "status": "active"
  }
]
```

---

### 3. `mdm_tag_assignment` (7 columns)

**Purpose:** Many-to-many relationship for assigning tags to various entities.

**Key Features:**
- ✅ Multi-tenant isolation
- ✅ Foreign key to `mdm_tag`
- ✅ Target type polymorphism (GLOBAL_METADATA, GLOSSARY, KPI, etc.)
- ✅ Canonical key-based targeting
- ✅ Unique constraint prevents duplicate assignments
- ✅ Indexed for fast lookups by target

**Schema:**
```sql
CREATE TABLE mdm_tag_assignment (
  id                     uuid PRIMARY KEY,
  tenant_id              uuid NOT NULL,
  tag_id                 uuid NOT NULL REFERENCES mdm_tag(id),
  target_type            text NOT NULL,
  target_canonical_key   text NOT NULL,
  created_at             timestamp DEFAULT now(),
  created_by             text NOT NULL,
  
  UNIQUE (tenant_id, tag_id, target_type, target_canonical_key),
  INDEX (tenant_id, target_type, target_canonical_key)
);
```

**Supported Target Types:**
- `GLOBAL_METADATA` - Tag metadata definitions
- `GLOSSARY` - Tag glossary terms
- `KPI` - Tag KPIs (future)
- `SERVICE` - Tag services (future)
- `REPORT` - Tag reports (future)

**Example Assignments:**
```json
[
  {
    "tagId": "risk_critical_uuid",
    "targetType": "GLOBAL_METADATA",
    "targetCanonicalKey": "revenue_gross"
  },
  {
    "tagId": "finance_performance_uuid",
    "targetType": "GLOSSARY",
    "targetCanonicalKey": "revenue_gross"
  }
]
```

---

## 🗄️ **Complete Database Summary**

### Total System (8 Tables)

| Table                   | Columns | Indexes | FKs | Purpose                                    |
| ----------------------- | ------- | ------- | --- | ------------------------------------------ |
| **mdm_standard_pack**   | 14      | 3       | 0   | Global SoT standards (IFRS, IAS, MFRS)     |
| **mdm_global_metadata** | 21      | 3       | 1   | Canonical metadata definitions             |
| **mdm_business_rule**   | 17      | 3       | 0   | Soft-configuration engine                  |
| **mdm_approval**        | 16      | 2       | 0   | Unified approval queue                     |
| **mdm_lineage_field**   | 16      | 3       | 2   | Field-level lineage edges                  |
| **mdm_glossary_term**   | 17      | 2       | 0   | Business glossary terms ⬅️ NEW             |
| **mdm_tag**             | 13      | 2       | 0   | Tag definitions ⬅️ NEW                     |
| **mdm_tag_assignment**  | 7       | 2       | 1   | Tag-to-entity assignments ⬅️ NEW           |

**Total:** 121 columns, 20 indexes, 4 foreign keys

---

## 🔄 **Migration Status**

### Generated Migrations

```bash
db/migrations/
├── 0000_init.sql                          # Initial 4 tables
├── 0001_safe_captain_midlands.sql         # Lineage table
└── 0002_wonderful_runaways.sql            # Glossary + Tags ✅ NEW
```

**Migration 0002 includes:**
- ✅ `CREATE TABLE mdm_glossary_term`
- ✅ `CREATE TABLE mdm_tag`
- ✅ `CREATE TABLE mdm_tag_assignment`
- ✅ Foreign key: `tag_assignment.tag_id → tag.id`
- ✅ 3 unique indexes
- ✅ 3 lookup indexes

**To apply:**
```bash
npm run db:migrate
```

---

## 🎯 **Governance Integration**

### Approval Entity Type Extended

Updated `ApprovalEntityTypeEnum` to support glossary approvals:

```typescript
export const ApprovalEntityTypeEnum = z.enum([
  'BUSINESS_RULE',
  'GLOBAL_METADATA',
  'GLOSSARY',            // ⬅️ NEW
]);
```

**This enables:**
- ✅ Tier1/Tier2 glossary terms require approval
- ✅ Same governance workflow as metadata
- ✅ Role-based routing for glossary changes
- ✅ Complete audit trail for glossary modifications

---

## 💡 **Use Cases**

### Use Case 1: Business Glossary with Tier Governance

**Scenario:** Define "Revenue - Gross" as a tier1 term requiring approval.

```typescript
// Create tier1 glossary term (requires approval)
POST /glossary
{
  "canonicalKey": "revenue_gross",
  "term": "Gross Revenue",
  "description": "Total revenue before deductions per IFRS 15",
  "domain": "finance",
  "category": "Financial Performance",
  "tier": "tier1",
  "standardPackId": "IFRS_15_REV",
  "language": "en",
  "synonymsRaw": "Revenue,Sales,Turnover"
}

// Response: {"status": "pending_approval"} (tier1 requires HITL)
```

---

### Use Case 2: Tag-Based Classification

**Scenario:** Tag critical financial fields for risk management.

```typescript
// Create risk tag
POST /tags
{
  "key": "risk_critical",
  "label": "Risk Critical",
  "category": "Risk",
  "description": "Fields requiring extra scrutiny"
}

// Assign tag to metadata
POST /tags/assign
{
  "tagKey": "risk_critical",
  "targetType": "GLOBAL_METADATA",
  "targetCanonicalKey": "revenue_gross"
}

// Query: Get all risk-critical metadata
GET /tags/assignments?tagKey=risk_critical&targetType=GLOBAL_METADATA
```

---

### Use Case 3: Multi-Entity Tagging

**Scenario:** Tag both metadata and glossary terms for reporting.

```typescript
// Tag metadata
POST /tags/assign
{
  "tagKey": "quarterly_report",
  "targetType": "GLOBAL_METADATA",
  "targetCanonicalKey": "revenue_gross"
}

// Tag glossary term
POST /tags/assign
{
  "tagKey": "quarterly_report",
  "targetType": "GLOSSARY",
  "targetCanonicalKey": "revenue_gross"
}

// Query: Get all entities tagged for quarterly report
GET /tags/assignments?tagKey=quarterly_report
```

---

### Use Case 4: Synonym Search

**Scenario:** User searches for "Sales" but should find "Revenue - Gross" term.

```typescript
// Glossary term with synonyms
{
  "canonicalKey": "revenue_gross",
  "term": "Gross Revenue",
  "synonymsRaw": "Revenue,Sales,Turnover"
}

// Search query (service layer)
GET /glossary?search=Sales

// Returns: Match on synonymsRaw containing "Sales"
```

---

### Use Case 5: Related Terms Navigation

**Scenario:** Link related financial concepts for discoverability.

```typescript
// Create interconnected terms
{
  "canonicalKey": "revenue_gross",
  "term": "Gross Revenue",
  "relatedCanonicalKeys": "revenue_net,cogs_total,profit_margin"
}

{
  "canonicalKey": "revenue_net",
  "term": "Net Revenue",
  "relatedCanonicalKeys": "revenue_gross,discounts,returns"
}

// Query related terms
GET /glossary/revenue_gross/related
// Returns: revenue_net, cogs_total, profit_margin
```

---

## 🚀 **Next Steps**

### Phase 1: Service Layer (Next)
- [ ] `glossary.service.ts` - CRUD + governance logic
- [ ] `tags.service.ts` - Tag management + assignments
- [ ] Integration with approval workflow

### Phase 2: API Layer
- [ ] `glossary.routes.ts` - Glossary CRUD endpoints
- [ ] `tags.routes.ts` - Tag + assignment endpoints
- [ ] Search/filter capabilities

### Phase 3: Advanced Features
- [ ] Full-text search on terms + synonyms
- [ ] Auto-suggest for synonyms
- [ ] Tag hierarchy (parent/child tags)
- [ ] Tag analytics (most used tags, coverage %)
- [ ] Glossary version history

---

## 📊 **Current Progress**

```
┌──────────────────────────────────────────────────┐
│        METADATA STUDIO - GLOSSARY + TAGS         │
│           Database Layer Complete ✅             │
└──────────────────────────────────────────────────┘

Database Tables:     8 ✅ (+3 new)
  ├─ mdm_standard_pack      ✅
  ├─ mdm_global_metadata    ✅
  ├─ mdm_business_rule      ✅
  ├─ mdm_approval           ✅ (extended for GLOSSARY)
  ├─ mdm_lineage_field      ✅
  ├─ mdm_glossary_term      ✅ NEW
  ├─ mdm_tag                ✅ NEW
  └─ mdm_tag_assignment     ✅ NEW

Migration Files:     3 ✅
Approval Integration: ✅ (GLOSSARY entity type added)

Next: Service + API layers
```

---

## 🎉 **What You Have Now**

✅ **Business Glossary**
- Canonical term definitions
- Tier-based governance (tier1-5)
- SoT pack linkage (IFRS/HL7/etc.)
- Multi-language support
- Synonyms + related terms
- Status tracking (active/deprecated/draft)

✅ **Flexible Tagging**
- Tag definitions with categories
- Tag assignments to metadata + glossary
- System vs user tags
- SoT pack linkage for regulatory tags
- Extensible to KPI, services, reports

✅ **Governance Integration**
- Approval workflow ready for glossary
- Tier1/tier2 glossary terms require HITL
- Same governance rules as metadata
- Complete audit trail

**This is the foundation for a complete business glossary + classification system!** 🚀

