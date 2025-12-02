# Metadata Studio - End-to-End Smoke Test Guide

## 🎯 Prerequisites

1. **PostgreSQL Database** (local, Supabase, or Neon)
2. **Environment Variables** configured in `.env`
3. **Dependencies** installed (`npm install`)

## 📋 Setup Checklist

### 1. Database Connection

Update `.env` with your database URL:

```bash
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/metadata_studio

# Supabase
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Neon
DATABASE_URL=postgresql://[user]:[password]@[host].neon.tech/[database]

PORT=8787
NODE_ENV=development
```

### 2. Run Migrations

```bash
cd metadata-studio
npm run db:migrate
```

Expected output:
```
Running metadata-studio migrations...
Metadata-studio migrations completed.
```

### 3. Verify Tables Created

Connect to your database and verify these tables exist:
- ✅ `mdm_standard_pack`
- ✅ `mdm_global_metadata`
- ✅ `mdm_business_rule`
- ✅ `mdm_approval`

---

## 🧪 End-to-End Test Scenarios

### Scenario 1: Health Check

```bash
# Start the server
npm run dev

# In another terminal, test health endpoint
curl http://localhost:8787/healthz
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "metadata-studio"
}
```

---

### Scenario 2: Tier 3 Metadata (Immediate Apply)

**Test Case:** metadata_steward creates tier3 metadata → Should apply immediately

```bash
curl -X POST http://localhost:8787/metadata \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-user-id: jack" \
  -H "x-role: metadata_steward" \
  -d '{
    "canonicalKey": "inventory_raw_material",
    "label": "Inventory – Raw Material",
    "description": "Raw material inventory tracking",
    "domain": "finance",
    "module": "inventory",
    "entityUrn": "service://ERP_CORE/INVENTORY/raw_material",
    "tier": "tier3",
    "dataType": "decimal",
    "format": "currency",
    "ownerId": "cfo",
    "stewardId": "metadata_steward_1",
    "status": "active",
    "isDraft": false
  }'
```

**Expected Response:** HTTP 200
```json
{
  "id": "...",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "canonicalKey": "inventory_raw_material",
  "label": "Inventory – Raw Material",
  "tier": "tier3",
  ...
}
```

**Verify in Database:**
```sql
SELECT * FROM mdm_global_metadata 
WHERE canonical_key = 'inventory_raw_material';
```

---

### Scenario 3: Tier 1 Metadata (Requires Approval)

**Test Case:** business_admin creates tier1 metadata → Should create approval request

```bash
curl -X POST http://localhost:8787/metadata \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-user-id: jack" \
  -H "x-role: business_admin" \
  -d '{
    "canonicalKey": "revenue_gross",
    "label": "Revenue – Gross",
    "description": "Total revenue before deductions",
    "domain": "finance",
    "module": "gl",
    "entityUrn": "service://ERP_CORE/GL/revenue_gross",
    "tier": "tier1",
    "standardPackId": "IFRS_CORE",
    "dataType": "decimal",
    "format": "currency",
    "ownerId": "cfo",
    "stewardId": "metadata_steward_1",
    "status": "active",
    "isDraft": false
  }'
```

**Expected Response:** HTTP 202
```json
{
  "status": "pending_approval"
}
```

**Verify in Database:**
```sql
-- Should NOT be in mdm_global_metadata yet
SELECT * FROM mdm_global_metadata WHERE canonical_key = 'revenue_gross';
-- Returns: 0 rows

-- Should be in mdm_approval
SELECT * FROM mdm_approval WHERE entity_key = 'revenue_gross';
-- Returns: 1 row with status='pending'
```

---

### Scenario 4: List Pending Approvals

**Test Case:** kernel_architect views their approval inbox

```bash
curl http://localhost:8787/approvals/pending \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-role: kernel_architect"
```

**Expected Response:** HTTP 200
```json
[
  {
    "id": "...",
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "entityType": "GLOBAL_METADATA",
    "entityKey": "revenue_gross",
    "tier": "tier1",
    "status": "pending",
    "requiredRole": "kernel_architect",
    "payload": { ... },
    "requestedBy": "jack",
    ...
  }
]
```

---

### Scenario 5: Approve Request

**Test Case:** kernel_architect approves the tier1 metadata

```bash
# Replace {APPROVAL_ID} with actual ID from previous response
curl -X POST http://localhost:8787/approvals/{APPROVAL_ID}/approve \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-user-id: cfo@company.com" \
  -H "x-role: kernel_architect"
```

**Expected Response:** HTTP 200
```json
{
  "status": "approved",
  "id": "..."
}
```

**Verify in Database:**
```sql
-- Should now exist in mdm_global_metadata
SELECT * FROM mdm_global_metadata WHERE canonical_key = 'revenue_gross';
-- Returns: 1 row

-- Approval should be marked approved
SELECT status, decided_by FROM mdm_approval WHERE entity_key = 'revenue_gross';
-- Returns: status='approved', decided_by='cfo@company.com'
```

---

### Scenario 6: Tier 1 Metadata Missing standardPackId (GRCD Violation)

**Test Case:** Attempt to create tier1 metadata without standardPackId → Should fail

```bash
curl -X POST http://localhost:8787/metadata \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-user-id: jack" \
  -H "x-role: metadata_steward" \
  -d '{
    "canonicalKey": "invalid_tier1",
    "label": "Invalid Tier 1",
    "domain": "finance",
    "module": "gl",
    "entityUrn": "service://test",
    "tier": "tier1",
    "dataType": "decimal",
    "ownerId": "cfo",
    "stewardId": "steward"
  }'
```

**Expected Response:** HTTP 500 (Error)
```json
{
  "error": "Tier1/Tier2 metadata MUST declare standardPackId (SoT pack)"
}
```

---

### Scenario 7: Business Rule - Immediate Apply

**Test Case:** business_admin creates tier3 business rule → Should apply immediately

```bash
curl -X POST http://localhost:8787/rules \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-user-id: jack" \
  -H "x-role: business_admin" \
  -d '{
    "ruleType": "FINANCE_APPROVAL",
    "key": "expense_auto_approval",
    "name": "Expense Auto Approval",
    "description": "Auto-approval rules for expenses under $2000",
    "tier": "tier3",
    "lane": "governed",
    "environment": "live",
    "configuration": {
      "threshold_amount": 2000,
      "requires_approval": true,
      "approver_role": "Manager",
      "gl_codes": []
    },
    "isActive": true,
    "isDraft": false
  }'
```

**Expected Response:** HTTP 200
```json
{
  "id": "...",
  "ruleType": "FINANCE_APPROVAL",
  "key": "expense_auto_approval",
  ...
}
```

---

### Scenario 8: Reject Approval

**Test Case:** Reject a pending approval with reason

```bash
curl -X POST http://localhost:8787/approvals/{APPROVAL_ID}/reject \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-user-id: cfo@company.com" \
  -H "x-role: kernel_architect" \
  -d '{
    "reason": "Requires further review - missing business justification"
  }'
```

**Expected Response:** HTTP 200
```json
{
  "id": "...",
  "status": "rejected",
  "decisionReason": "Requires further review - missing business justification",
  ...
}
```

---

## 📊 Governance Matrix Verification

Test these combinations to verify governance logic:

| Entity | Tier | Role | Expected Behavior |
|--------|------|------|-------------------|
| Metadata | tier1 | any | ⏸️ Approval Required |
| Metadata | tier2 | any | ⏸️ Approval Required |
| Metadata | tier3 | metadata_steward | ✅ Immediate Apply |
| Metadata | tier3 | kernel_architect | ✅ Immediate Apply |
| Metadata | tier3 | business_admin | ⏸️ Approval Required |
| Rule | tier1 | any | ⏸️ Approval Required |
| Rule | tier3 | business_admin (governed) | ✅ Immediate Apply |
| Rule | tier3 | user | ⏸️ Approval Required |

---

## 🔍 Database Verification Queries

### Check All Tables
```sql
-- Standard packs
SELECT * FROM mdm_standard_pack;

-- Global metadata
SELECT 
  canonical_key, 
  label, 
  tier, 
  standard_pack_id, 
  status 
FROM mdm_global_metadata
ORDER BY tier, canonical_key;

-- Business rules
SELECT 
  rule_type, 
  key, 
  tier, 
  lane, 
  environment, 
  is_active 
FROM mdm_business_rule
ORDER BY tier, key;

-- Pending approvals
SELECT 
  entity_type, 
  entity_key, 
  tier, 
  status, 
  required_role, 
  requested_by,
  requested_at
FROM mdm_approval
WHERE status = 'pending'
ORDER BY requested_at DESC;

-- Approval history
SELECT 
  entity_type,
  entity_key,
  status,
  decided_by,
  decided_at,
  decision_reason
FROM mdm_approval
WHERE status IN ('approved', 'rejected')
ORDER BY decided_at DESC;
```

---

## 🎯 Success Criteria

✅ **All 4 tables created** in database  
✅ **Health check** returns 200  
✅ **Tier 3 metadata** applies immediately for metadata_steward  
✅ **Tier 1 metadata** creates approval request  
✅ **Approval inbox** shows pending items filtered by role  
✅ **Approve action** applies change to target table  
✅ **Reject action** marks approval as rejected  
✅ **GRCD validation** blocks tier1/2 without standardPackId  
✅ **Business rules** follow tier+lane+role governance  

---

### Scenario 9: Declare Field Lineage

**Test Case:** Declare lineage edge for a Tier-1 field

First, ensure you have some metadata created:
```bash
# Create source field (tier3)
curl -X POST http://localhost:8787/metadata \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-user-id: steward" \
  -H "x-role: metadata_steward" \
  -d '{
    "canonicalKey": "sales_invoice_amount",
    "label": "Sales Invoice Amount",
    "domain": "sales",
    "module": "invoicing",
    "entityUrn": "service://ERP/SALES/invoice_amount",
    "tier": "tier3",
    "dataType": "decimal",
    "ownerId": "sales_director",
    "stewardId": "data_steward"
  }'

# Create target field (tier1)
curl -X POST http://localhost:8787/metadata \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-user-id: steward" \
  -H "x-role: metadata_steward" \
  -d '{
    "canonicalKey": "revenue_gross",
    "label": "Gross Revenue",
    "domain": "finance",
    "module": "gl",
    "entityUrn": "service://ERP/FINANCE/revenue_gross",
    "tier": "tier1",
    "standardPackId": "IFRS_CORE",
    "dataType": "decimal",
    "ownerId": "cfo",
    "stewardId": "controller"
  }'
```

Now declare lineage:
```bash
curl -X POST http://localhost:8787/lineage/field \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-user-id: steward" \
  -H "x-role: metadata_steward" \
  -d '{
    "sourceCanonicalKey": "sales_invoice_amount",
    "targetCanonicalKey": "revenue_gross",
    "relationshipType": "aggregated",
    "transformationType": "aggregation",
    "transformationExpression": "SUM(sales_invoice_amount)",
    "isPrimaryPath": true,
    "confidenceScore": 100,
    "verified": true
  }'
```

**Expected Response:** HTTP 200
```json
{
  "id": "...",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "sourceMetadataId": "...",
  "targetMetadataId": "...",
  "relationshipType": "aggregated",
  "transformationExpression": "SUM(sales_invoice_amount)",
  "verified": true,
  ...
}
```

---

### Scenario 10: Query Field Lineage

**Test Case:** Get upstream lineage for revenue_gross

```bash
curl "http://localhost:8787/lineage/field?canonicalKey=revenue_gross&direction=upstream" \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000"
```

**Expected Response:** HTTP 200
```json
{
  "target": {
    "canonicalKey": "revenue_gross",
    "label": "Gross Revenue",
    "tier": "tier1",
    ...
  },
  "upstream": [
    {
      "edge": {
        "relationshipType": "aggregated",
        "transformationExpression": "SUM(sales_invoice_amount)",
        ...
      },
      "source": {
        "canonicalKey": "sales_invoice_amount",
        "label": "Sales Invoice Amount",
        ...
      }
    }
  ],
  "downstream": []
}
```

---

### Scenario 11: Tier-1 Lineage Coverage Audit

**Test Case:** Get governance coverage report

```bash
curl http://localhost:8787/lineage/tier1-coverage \
  -H "x-tenant-id: 123e4567-e89b-12d3-a456-426614174000"
```

**Expected Response:** HTTP 200
```json
{
  "totalTier1": 3,
  "covered": 1,
  "uncovered": 2,
  "uncoveredCanonicalKeys": [
    "earnings_per_share",
    "cash_and_cash_equivalents"
  ]
}
```

**Use Case:** Compliance dashboard showing which Tier-1 fields still need lineage documentation.

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port is already in use
netstat -ano | findstr :8787

# Try a different port
PORT=3100 npm run dev
```

### Database connection fails
```bash
# Verify DATABASE_URL is correct
echo $env:DATABASE_URL

# Test connection directly
psql $env:DATABASE_URL
```

### Migrations fail
```bash
# Drop and recreate tables (DEV ONLY!)
psql $env:DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migrations
npm run db:migrate
```

### Approval not applying
```bash
# Check logs for errors
# Verify approval ID is correct
# Ensure approver role matches requiredRole
```

---

## 📚 Next Steps After Smoke Test

1. **Seed Standard Packs** - Add IFRS, IAS, MFRS standards
2. **Create Retool UI** - Connect to these APIs
3. **Add More Rule Types** - KPI_DEFINITION, WORKFLOW_RULE
4. **Implement Lineage** - Track metadata dependencies
5. **Add Observability** - Metrics, logging, tracing
6. **Production Hardening** - Rate limiting, caching, error handling

---

## 🎉 What You Built

A production-ready metadata governance system with:
- Multi-tenant isolation
- Tiered governance (tier1-5)
- Role-based access control
- Approval workflows
- GRCD compliance enforcement
- Fast frontlines for safe changes
- Complete audit trail
- Type-safe validation
- REST API ready for frontends

**Congratulations!** 🚀

