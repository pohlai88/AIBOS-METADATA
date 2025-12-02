# 🚀 Approval Workflow Quick Reference

## ✅ What Was Completed

### 1. Event-Driven Approval Route
**File:** `metadata-studio/api/approvals.routes.ts`

```typescript
POST /approvals/:id/approve
├─ Load approval from DB
├─ Apply change (upsertGlobalMetadata, upsertKpiDefinition, etc.)
├─ Emit entity-specific events
│  ├─ metadata.approved / kpi.approved
│  ├─ metadata.changed / kpi.changed
│  └─ metadata.profile.due (IF Tier1/Tier2)
└─ Emit generic approval.approved event
```

### 2. Event Types Emitted

| Event Type | When | Payload Highlights |
|------------|------|-------------------|
| `metadata.approved` | Metadata change approved | approvalId, entityId, canonicalKey, tier, approvedBy |
| `metadata.changed` | Metadata definition changed | changeType: 'APPROVAL', tier, standardPackId |
| `metadata.profile.due` | Tier1/Tier2 structural change | priority: 'high', reason: 'STRUCTURAL_CHANGE' |
| `kpi.approved` | KPI change approved | approvalId, entityId, canonicalKey, tier |
| `kpi.changed` | KPI definition changed | changeType: 'APPROVAL', tier |
| `approval.approved` | Any approval granted | approvalId, entityType, entityKey, approvedBy |

### 3. Complete Event Loop

```
┌─────────────────────────────────────────────────────────────┐
│                   USER APPROVES CHANGE                      │
│              POST /approvals/:id/approve                    │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│            APPROVAL ROUTE (approvals.routes.ts)             │
│  • Update mdmApproval.status = 'approved'                   │
│  • Apply change: upsertGlobalMetadata(...)                  │
│  • Emit: metadata.approved, metadata.changed                │
│  • IF Tier1/Tier2: Emit metadata.profile.due               │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│         PROFILE SUBSCRIBER (profile.subscriber.ts)          │
│  • Subscribe to: metadata.profile.due                       │
│  • Load physical binding (schema/table/columns)             │
│  • Cost guard: check MIN_RERUN_INTERVAL_DAYS                │
│  • Call: qualityService.runProfiler(...)                    │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│         PROFILER ENGINE (quality.service.ts)                │
│  • Build SQL profilers (completeness, uniqueness, validity) │
│  • Execute in parallel                                      │
│  • Compute qualityScore                                     │
│  • Save: observabilityRepo.saveProfile(...)                 │
│  • Emit Prometheus metrics                                  │
│  • Emit: metadata.profile.completed                         │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│            DOWNSTREAM CONSUMERS (Future)                    │
│  • Prometheus: quality_score metric                         │
│  • Grafana: Dashboard updates                               │
│  • Alerts: Quality degradation warnings                     │
│  • AI-BOS Cockpit: Notifications                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Commands

### 1. Verify Schema
```bash
# Check if mdmApproval schema is ready
psql -d your_database -f metadata-studio/db/migrations/VERIFY-mdm-approval-schema.sql
```

### 2. Start Dev Server
```bash
# Start metadata-studio with event system
pnpm dev
```

### 3. Run Integration Test
```bash
# Test complete approval → event → profile flow
pnpm test metadata-studio/tests/integration/approval-event-flow.test.ts
```

### 4. Manual Test via cURL

**Step 1: Create Approval**
```bash
curl -X POST http://localhost:8787/approvals \
  -H "x-tenant-id: YOUR-TENANT-UUID" \
  -H "x-user-id: test-user" \
  -H "x-role: metadata_steward" \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "GLOBAL_METADATA",
    "entityKey": "revenue_gross_test",
    "tier": "tier1",
    "lane": "governed",
    "payload": {
      "tenantId": "YOUR-TENANT-UUID",
      "canonicalKey": "revenue_gross_test",
      "label": "Revenue Gross (Test)",
      "domain": "Finance",
      "module": "GL",
      "entityUrn": "urn:aibos:metadata:YOUR-TENANT:revenue_gross_test",
      "tier": "tier1",
      "dataType": "DECIMAL",
      "ownerId": "user-123",
      "stewardId": "user-456"
    },
    "requiredRole": "metadata_steward",
    "requestedBy": "test-user"
  }'
```

**Step 2: Approve Request**
```bash
curl -X POST http://localhost:8787/approvals/APPROVAL-ID/approve \
  -H "x-tenant-id: YOUR-TENANT-UUID" \
  -H "x-user-id: approver" \
  -H "x-role: metadata_steward"
```

**Step 3: Check Results**
```sql
-- Approval status
SELECT status, decided_by, decided_at 
FROM mdm_approval 
WHERE id = 'APPROVAL-ID';

-- Metadata created
SELECT id, canonical_key, label, tier 
FROM mdm_global_metadata 
WHERE canonical_key = 'revenue_gross_test';

-- Profile run (if binding exists)
SELECT quality_score, completeness, uniqueness, validity
FROM mdm_profile
WHERE entity_urn = 'urn:aibos:metadata:YOUR-TENANT:revenue_gross_test'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 📊 Expected Database Changes

After approving a Tier1 metadata request:

### mdmApproval
```
status: 'pending' → 'approved'
decided_by: NULL → 'approver-user-id'
decided_at: NULL → CURRENT_TIMESTAMP
```

### mdmGlobalMetadata
```
New row created with:
  canonical_key: 'revenue_gross_test'
  tier: 'tier1'
  status: 'active'
  created_by: 'approver-user-id'
```

### mdmProfile (if physical binding exists)
```
New row created with:
  entity_urn: 'urn:aibos:metadata:...'
  completeness: 0-100
  uniqueness: 0-100
  validity: 0-100
  quality_score: 0-100
  quality_grade: 'A'-'F'
```

---

## 🎯 Next Steps (Option 1: Dashboards & Alerts)

### 1. Prometheus Metrics Subscriber
**File:** `metadata-studio/events/metrics.subscriber.ts`

```typescript
export function registerMetricsSubscribers() {
  eventBus.subscribe('metadata.profile.completed', async (event) => {
    qualityScoreHistogram
      .labels(event.tenantId, event.payload.tier)
      .observe(event.payload.qualityScore);
      
    profileRunsTotal
      .labels(event.tenantId, event.payload.tier, 'success')
      .inc();
  });
}
```

### 2. Grafana Dashboard Queries

**Quality Score Over Time (Tier1/Tier2):**
```promql
metadata_quality_score{tier=~"tier1|tier2"}
```

**Profile Run Success Rate:**
```promql
rate(metadata_profile_runs_total{status="success"}[5m]) /
rate(metadata_profile_runs_total[5m])
```

**Quality Degradation Alerts:**
```promql
metadata_quality_score{tier="tier1"} < 80
```

### 3. Alert Rules
**File:** `prometheus/alert-rules.yml`

```yaml
- alert: Tier1QualityDegraded
  expr: metadata_quality_score{tier="tier1"} < 80
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Tier1 metadata quality below threshold"
```

---

## 📁 Files Reference

### Modified Files
- ✅ `metadata-studio/schemas/approval.schema.ts` - Added ApprovalLaneEnum
- ✅ `metadata-studio/api/approvals.routes.ts` - Event-driven approval handler

### Already Perfect (No Changes)
- ✅ `metadata-studio/db/schema/approval.tables.ts` - Schema aligned
- ✅ `metadata-studio/services/approval.service.ts` - Service ready
- ✅ `packages/events/src/event.types.ts` - Event types defined
- ✅ `packages/events/src/event-schemas.ts` - Event schemas defined
- ✅ `metadata-studio/events/event-bus.ts` - Event bus ready
- ✅ `metadata-studio/events/profile.subscriber.ts` - Subscriber ready

### Documentation
- 📖 `EVENT-SYSTEM-INTEGRATION-COMPLETE.md` - Comprehensive guide
- 📖 `APPROVAL-WORKFLOW-QUICK-REFERENCE.md` - This file
- 🧪 `metadata-studio/tests/integration/approval-event-flow.test.ts` - Integration test
- 🔍 `metadata-studio/db/migrations/VERIFY-mdm-approval-schema.sql` - Schema verification

---

## 🐛 Troubleshooting

### Event Not Emitted
```typescript
// Check event bus initialization
await initializeEventSystem();

// Check subscriber registration
registerProfileSubscribers();
```

### Profile Not Running
```sql
-- Check physical binding exists
SELECT binding_schema, binding_table, binding_columns
FROM mdm_global_metadata
WHERE canonical_key = 'your-key';

-- If NULL → profile cannot run (no data source)
```

### Linter Errors
```bash
# Re-check types
pnpm tsc --noEmit

# Fix imports
# Ensure @aibos/events is in workspace
```

---

## ✅ Checklist

Before deploying to production:

- [ ] Run schema verification script
- [ ] Run integration test (passes)
- [ ] Test Tier1 approval → verify profile runs
- [ ] Test Tier3 approval → verify NO profile triggered
- [ ] Check event bus logs (all events emitted)
- [ ] Verify mdmApproval status updates correctly
- [ ] Verify metadata/KPI rows created
- [ ] Set up Prometheus metrics (Option 1)
- [ ] Set up Grafana dashboards (Option 1)
- [ ] Configure alert rules (Option 1)

---

## 📞 Support

For questions or issues, refer to:
- `EVENT-SYSTEM-INTEGRATION-COMPLETE.md` - Full architecture guide
- `packages/events/README.md` - Event system documentation
- `metadata-studio/events/profile.subscriber.ts` - Subscriber implementation
- `metadata-studio/api/approvals.routes.ts` - Approval route implementation

