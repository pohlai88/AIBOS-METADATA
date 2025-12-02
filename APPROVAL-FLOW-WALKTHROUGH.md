# 🎯 Approval Flow Walkthrough: Tier1 Metadata Change

## Complete End-to-End Scenario

**Scenario:** A metadata steward wants to add a new Tier1 metadata field `revenue_gross` to the IFRS Standard Pack. This requires approval before it goes live.

**Expected Outcome:**
1. ✅ Approval request created (status: `pending`)
2. ✅ Approver approves it
3. ✅ Metadata row created in `mdm_global_metadata`
4. ✅ Events emitted (`metadata.approved`, `metadata.changed`, `metadata.profile.due`)
5. ✅ Profiler runs automatically (because Tier1)
6. ✅ Profile saved to `mdm_profile`
7. ✅ `metadata.profile.completed` event emitted

---

## 📋 Initial State (Before)

### Database Tables

```sql
-- mdm_approval: EMPTY
SELECT * FROM mdm_approval;
-- (0 rows)

-- mdm_global_metadata: No 'revenue_gross'
SELECT * FROM mdm_global_metadata WHERE canonical_key = 'revenue_gross';
-- (0 rows)

-- mdm_profile: No profiles for 'revenue_gross'
SELECT * FROM mdm_profile WHERE entity_urn LIKE '%revenue_gross%';
-- (0 rows)
```

### Event Bus
```
Events captured: []
```

---

## 🚀 Step-by-Step Flow

### Step 1: Create Approval Request

**HTTP Request:**

```bash
POST http://localhost:8787/approvals
Content-Type: application/json
x-tenant-id: 550e8400-e29b-41d4-a716-446655440000
x-user-id: metadata-steward-alice
x-role: metadata_steward
```

**Request Body:**

```json
{
  "entityType": "GLOBAL_METADATA",
  "entityId": null,
  "entityKey": "revenue_gross",
  "tier": "tier1",
  "lane": "governed",
  "payload": {
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "canonicalKey": "revenue_gross",
    "label": "Revenue Gross",
    "description": "Total gross revenue before any deductions (IFRS Core)",
    "domain": "Finance",
    "module": "GL",
    "entityUrn": "urn:aibos:metadata:550e8400-e29b-41d4-a716-446655440000:revenue_gross",
    "tier": "tier1",
    "standardPackId": "IFRS_CORE",
    "dataType": "DECIMAL",
    "format": "18,2",
    "ownerId": "user-cfo",
    "stewardId": "metadata-steward-alice",
    "status": "active",
    "isDraft": false
  },
  "currentState": null,
  "requiredRole": "metadata_steward",
  "requestedBy": "metadata-steward-alice"
}
```

**Expected Response (201 Created):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending",
  "entityType": "GLOBAL_METADATA",
  "entityKey": "revenue_gross",
  "tier": "tier1",
  "requiredRole": "metadata_steward"
}
```

**Database State After Step 1:**

```sql
SELECT 
  id, 
  entity_type, 
  entity_key, 
  tier, 
  status, 
  requested_by, 
  requested_at
FROM mdm_approval
WHERE entity_key = 'revenue_gross';

-- Result:
┌──────────────────────────────────────┬───────────────────┬───────────────┬───────┬─────────┬──────────────────────────┬─────────────────────────┐
│ id                                   │ entity_type       │ entity_key    │ tier  │ status  │ requested_by             │ requested_at            │
├──────────────────────────────────────┼───────────────────┼───────────────┼───────┼─────────┼──────────────────────────┼─────────────────────────┤
│ a1b2c3d4-e5f6-7890-abcd-ef1234567890 │ GLOBAL_METADATA   │ revenue_gross │ tier1 │ pending │ metadata-steward-alice   │ 2025-12-01 10:30:00+00  │
└──────────────────────────────────────┴───────────────────┴───────────────┴───────┴─────────┴──────────────────────────┴─────────────────────────┘
```

**Events Emitted:** None (approval just created, not yet decided)

---

### Step 2: Approve the Request

**HTTP Request:**

```bash
POST http://localhost:8787/approvals/a1b2c3d4-e5f6-7890-abcd-ef1234567890/approve
Content-Type: application/json
x-tenant-id: 550e8400-e29b-41d4-a716-446655440000
x-user-id: kernel-architect-bob
x-role: metadata_steward
```

**Expected Response (200 OK):**

```json
{
  "status": "approved",
  "approvalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "entityType": "GLOBAL_METADATA",
  "entityId": "meta-9876-5432-1000",
  "entityKey": "revenue_gross",
  "tier": "tier1"
}
```

**What Happens Internally:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Load approval from mdm_approval                              │
│    • Validate status = 'pending'                                │
│    • Parse via ApprovalRequestSchema                            │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Apply Change: upsertGlobalMetadata(...)                      │
│    • Insert into mdm_global_metadata                            │
│    • Returns: { id: 'meta-9876-5432-1000', ... }                │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Update Approval Status                                       │
│    • SET status = 'approved'                                    │
│    • SET decided_by = 'kernel-architect-bob'                    │
│    • SET decided_at = NOW()                                     │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Emit Events (in sequence)                                    │
│    • metadata.approved                                          │
│    • metadata.changed                                           │
│    • metadata.profile.due (because Tier1)                       │
│    • approval.approved                                          │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Profile Subscriber Reacts                                    │
│    • Listens to: metadata.profile.due                           │
│    • Triggers: qualityService.runProfiler(...)                  │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Profiler Executes                                            │
│    • Runs SQL profilers (completeness, uniqueness, validity)    │
│    • Saves profile to mdm_profile                               │
│    • Emits: metadata.profile.completed                          │
└─────────────────────────────────────────────────────────────────┘
```

---

### Step 3: Events Emitted (Detailed)

#### Event 1: `metadata.approved`

```json
{
  "id": "evt-001-metadata-approved",
  "type": "metadata.approved",
  "version": "1.0.0",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "source": "metadata-studio.approval",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2025-12-01T10:35:12.345Z",
  "payload": {
    "approvalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "entityId": "meta-9876-5432-1000",
    "canonicalKey": "revenue_gross",
    "tier": "tier1",
    "approvedBy": {
      "actorId": "kernel-architect-bob",
      "actorType": "HUMAN"
    },
    "approvedAt": "2025-12-01T10:35:12.345Z"
  }
}
```

**Purpose:** Audit trail for governance. Records who approved what and when.

---

#### Event 2: `metadata.changed`

```json
{
  "id": "evt-002-metadata-changed",
  "type": "metadata.changed",
  "version": "1.0.0",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "source": "metadata-studio.approval",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2025-12-01T10:35:12.456Z",
  "payload": {
    "entityId": "meta-9876-5432-1000",
    "canonicalKey": "revenue_gross",
    "changeType": "APPROVAL",
    "tier": "tier1",
    "standardPackId": "IFRS_CORE",
    "changedBy": {
      "actorId": "kernel-architect-bob",
      "actorType": "HUMAN"
    }
  }
}
```

**Purpose:** Trigger downstream impact analysis, lineage updates, etc.

**Future Consumers:**
- Lineage service (update dependency graph)
- Impact analysis (which KPIs depend on this metadata?)
- Notification center (alert stakeholders)

---

#### Event 3: `metadata.profile.due`

```json
{
  "id": "evt-003-profile-due",
  "type": "metadata.profile.due",
  "version": "1.0.0",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "source": "metadata-studio.approval",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2025-12-01T10:35:12.567Z",
  "payload": {
    "entityType": "METADATA",
    "entityId": "meta-9876-5432-1000",
    "canonicalKey": "revenue_gross",
    "tier": "tier1",
    "priority": "high",
    "reason": "STRUCTURAL_CHANGE",
    "standardPackId": "IFRS_CORE"
  }
}
```

**Purpose:** Trigger immediate profiling for Tier1/Tier2 metadata after structural changes.

**Consumer:** `profile.subscriber.ts` (runs profiler)

---

#### Event 4: `approval.approved`

```json
{
  "id": "evt-004-approval-approved",
  "type": "approval.approved",
  "version": "1.0.0",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "source": "metadata-studio.approval",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2025-12-01T10:35:12.678Z",
  "payload": {
    "approvalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "entityType": "METADATA",
    "entityId": "meta-9876-5432-1000",
    "entityKey": "revenue_gross",
    "approvedBy": {
      "actorId": "kernel-architect-bob",
      "actorType": "HUMAN"
    },
    "approvedAt": "2025-12-01T10:35:12.678Z"
  }
}
```

**Purpose:** Generic approval event for analytics, notifications, audit logs.

---

### Step 4: Profile Subscriber Reacts

**Subscriber Logic:**

```typescript
// metadata-studio/events/profile.subscriber.ts
eventBus.subscribe('metadata.profile.due', async (event) => {
  const { payload } = event;
  
  // 1. Load metadata with physical binding
  const meta = await metadataRepo.getById(event.tenantId, payload.entityId);
  
  // 2. Cost guard: check if recently profiled
  const latestProfile = await observabilityRepo.getLatestProfile(
    event.tenantId,
    `urn:aibos:metadata:${event.tenantId}:${payload.canonicalKey}`
  );
  
  if (latestProfile && daysBetween(new Date(latestProfile.createdAt), new Date()) < 0.5) {
    console.log('[ProfileSubscriber] Skipping - recently profiled');
    return;
  }
  
  // 3. Run profiler
  const profile = await qualityService.runProfiler({
    tenantId: event.tenantId,
    entityId: payload.entityId,
    service: {
      schema: meta.bindingSchema,  // e.g. 'public'
      table: meta.bindingTable,    // e.g. 'sales_transactions'
    },
    columns: meta.bindingColumns,
    triggeredBy: {
      actorId: 'kernel_scheduler',
      actorType: 'SYSTEM',
    },
  });
  
  // 4. Emit profile.completed
  await eventBus.publish({
    type: 'metadata.profile.completed',
    version: '1.0.0',
    tenantId: event.tenantId,
    source: 'metadata-studio.api',
    correlationId: event.correlationId,
    payload: {
      entityType: 'METADATA',
      entityId: payload.entityId,
      canonicalKey: payload.canonicalKey,
      completeness: profile.completeness,
      uniqueness: profile.uniqueness,
      validity: profile.validity,
      qualityScore: profile.qualityScore,
      qualityGrade: profile.qualityGrade,
      profileId: profile.id,
      rowCount: profile.rowCount,
      duration: profile.duration,
      triggeredBy: {
        actorId: event.source,
        actorType: 'SYSTEM',
      },
    },
  });
});
```

**Profiler Execution:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Profiler Engine (quality.service.ts)                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Build SQL profilers:                                         │
│    • Completeness: COUNT(*) vs COUNT(column)                    │
│    • Uniqueness: COUNT(DISTINCT) vs COUNT(*)                    │
│    • Validity: Pattern matching, range checks                   │
│                                                                  │
│ 2. Execute in parallel:                                         │
│    • Query: SELECT COUNT(*), COUNT(DISTINCT revenue_gross)...   │
│    • Duration: 234ms                                            │
│                                                                  │
│ 3. Compute quality score:                                       │
│    • Completeness: 98.5%                                        │
│    • Uniqueness: 45.2% (expected for revenue field)             │
│    • Validity: 100.0%                                           │
│    • Quality Score: 81.2 (weighted average)                     │
│    • Quality Grade: B                                           │
│                                                                  │
│ 4. Save to mdm_profile:                                         │
│    • INSERT INTO mdm_profile (...)                              │
│    • Returns: { id: 'profile-1234-5678-9000', ... }             │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Event 5: `metadata.profile.completed`

```json
{
  "id": "evt-005-profile-completed",
  "type": "metadata.profile.completed",
  "version": "1.0.0",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "source": "metadata-studio.api",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2025-12-01T10:35:15.123Z",
  "payload": {
    "entityType": "METADATA",
    "entityId": "meta-9876-5432-1000",
    "canonicalKey": "revenue_gross",
    "completeness": 98.5,
    "uniqueness": 45.2,
    "validity": 100.0,
    "qualityScore": 81.2,
    "qualityGrade": "B",
    "profileId": "profile-1234-5678-9000",
    "rowCount": 1250000,
    "duration": 0.234,
    "triggeredBy": {
      "actorId": "metadata-studio.approval",
      "actorType": "SYSTEM"
    }
  }
}
```

**Purpose:** Quality metrics for dashboards, alerts, trend analysis.

**Future Consumers (Option 1):**
- Prometheus (record `metadata_quality_score{tier="tier1"}` = 81.2)
- Grafana (update "Quality Trends" dashboard)
- Alert Manager (no alert - score is above 80% threshold)
- AI-BOS Cockpit (show notification: "New metadata profiled: revenue_gross (B grade)")

---

## 📊 Final State (After)

### Database Tables

#### mdm_approval

```sql
SELECT 
  id, 
  status, 
  decided_by, 
  decided_at
FROM mdm_approval
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Result:
┌──────────────────────────────────────┬──────────┬──────────────────────┬─────────────────────────┐
│ id                                   │ status   │ decided_by           │ decided_at              │
├──────────────────────────────────────┼──────────┼──────────────────────┼─────────────────────────┤
│ a1b2c3d4-e5f6-7890-abcd-ef1234567890 │ approved │ kernel-architect-bob │ 2025-12-01 10:35:12+00  │
└──────────────────────────────────────┴──────────┴──────────────────────┴─────────────────────────┘
```

#### mdm_global_metadata

```sql
SELECT 
  id,
  canonical_key,
  label,
  tier,
  standard_pack_id,
  status,
  created_by
FROM mdm_global_metadata
WHERE canonical_key = 'revenue_gross';

-- Result:
┌──────────────────────┬───────────────┬───────────────┬───────┬──────────────────┬────────┬──────────────────────┐
│ id                   │ canonical_key │ label         │ tier  │ standard_pack_id │ status │ created_by           │
├──────────────────────┼───────────────┼───────────────┼───────┼──────────────────┼────────┼──────────────────────┤
│ meta-9876-5432-1000  │ revenue_gross │ Revenue Gross │ tier1 │ IFRS_CORE        │ active │ kernel-architect-bob │
└──────────────────────┴───────────────┴───────────────┴───────┴──────────────────┴────────┴──────────────────────┘
```

#### mdm_profile

```sql
SELECT 
  id,
  entity_urn,
  completeness,
  uniqueness,
  validity,
  quality_score,
  quality_grade,
  row_count,
  created_at
FROM mdm_profile
WHERE entity_urn = 'urn:aibos:metadata:550e8400-e29b-41d4-a716-446655440000:revenue_gross'
ORDER BY created_at DESC
LIMIT 1;

-- Result:
┌──────────────────────┬──────────────────────────────────────────────────────────────────┬──────────────┬────────────┬──────────┬───────────────┬───────────────┬───────────┬─────────────────────────┐
│ id                   │ entity_urn                                                       │ completeness │ uniqueness │ validity │ quality_score │ quality_grade │ row_count │ created_at              │
├──────────────────────┼──────────────────────────────────────────────────────────────────┼──────────────┼────────────┼──────────┼───────────────┼───────────────┼───────────┼─────────────────────────┤
│ profile-1234-5678... │ urn:aibos:metadata:550e8400-e29b-41d4-a716-446655440000:revenue_ │ 98.5         │ 45.2       │ 100.0    │ 81.2          │ B             │ 1250000   │ 2025-12-01 10:35:15+00  │
└──────────────────────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────┴──────────┴───────────────┴───────────────┴───────────┴─────────────────────────┘
```

### Event Bus

```
Events captured (in order):
1. metadata.approved       (10:35:12.345)
2. metadata.changed        (10:35:12.456)
3. metadata.profile.due    (10:35:12.567)
4. approval.approved       (10:35:12.678)
5. metadata.profile.completed (10:35:15.123)
```

**Total Duration:** ~2.8 seconds (from approval to profile completion)

---

## 🧪 How to Test This Flow

### 1. Start the Server

```bash
# Terminal 1: Start metadata-studio with event system
pnpm dev
```

**Expected output:**

```
[EventSystem] Initializing event system...
[EventSystem] Initializing event bus: local
[EventSystem] Event bus initialized (local) ✅
[ProfileSubscriber] Registered subscriber for metadata.profile.due
[EventSystem] Event system initialized ✅
metadata-studio listening on http://localhost:8787
```

### 2. Create Approval Request

```bash
# Terminal 2: Create approval
curl -X POST http://localhost:8787/approvals \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "x-user-id: metadata-steward-alice" \
  -H "x-role: metadata_steward" \
  -d '{
    "entityType": "GLOBAL_METADATA",
    "entityKey": "revenue_gross",
    "tier": "tier1",
    "lane": "governed",
    "payload": {
      "tenantId": "550e8400-e29b-41d4-a716-446655440000",
      "canonicalKey": "revenue_gross",
      "label": "Revenue Gross",
      "description": "Total gross revenue (IFRS Core)",
      "domain": "Finance",
      "module": "GL",
      "entityUrn": "urn:aibos:metadata:550e8400-e29b-41d4-a716-446655440000:revenue_gross",
      "tier": "tier1",
      "standardPackId": "IFRS_CORE",
      "dataType": "DECIMAL",
      "format": "18,2",
      "ownerId": "user-cfo",
      "stewardId": "metadata-steward-alice",
      "status": "active"
    },
    "requiredRole": "metadata_steward",
    "requestedBy": "metadata-steward-alice"
  }'
```

**Save the returned `id` for next step!**

### 3. Approve the Request

```bash
# Replace <APPROVAL-ID> with the ID from step 2
curl -X POST http://localhost:8787/approvals/<APPROVAL-ID>/approve \
  -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "x-user-id: kernel-architect-bob" \
  -H "x-role: metadata_steward"
```

**Watch the Terminal 1 logs for:**

```
[EventBus] Publishing event: metadata.approved
[EventBus] Publishing event: metadata.changed
[EventBus] Publishing event: metadata.profile.due
[ProfileSubscriber] Received metadata.profile.due for revenue_gross
[QualityService] Starting profiler for meta-9876-5432-1000
[QualityService] Profile completed: quality_score=81.2, grade=B
[EventBus] Publishing event: metadata.profile.completed
```

### 4. Verify Database

```bash
# Check approval status
psql -d your_db -c "
  SELECT status, decided_by, decided_at 
  FROM mdm_approval 
  WHERE entity_key = 'revenue_gross';
"

# Check metadata created
psql -d your_db -c "
  SELECT id, canonical_key, label, tier, status
  FROM mdm_global_metadata
  WHERE canonical_key = 'revenue_gross';
"

# Check profile saved
psql -d your_db -c "
  SELECT quality_score, quality_grade, completeness, uniqueness, validity
  FROM mdm_profile
  WHERE entity_urn LIKE '%revenue_gross%'
  ORDER BY created_at DESC
  LIMIT 1;
"
```

---

## ✅ Success Criteria

After running this flow, you should see:

- [x] **Approval status = 'approved'**
- [x] **Metadata row created** (canonical_key = 'revenue_gross', tier = 'tier1')
- [x] **Profile row created** (quality_score between 0-100, quality_grade A-F)
- [x] **5 events emitted** (in correct order)
- [x] **All events have correlationId** (matching approval ID)
- [x] **Total duration < 5 seconds** (from approve to profile complete)

---

## 🎯 What Happens for Tier3 vs Tier1?

### Tier3 Metadata (No Auto-Profile)

```json
{
  "tier": "tier3",  // ← Changed to Tier3
  "lane": "governed",
  // ... rest same
}
```

**Events Emitted:**

1. ✅ `metadata.approved`
2. ✅ `metadata.changed`
3. ❌ `metadata.profile.due` ← **NOT emitted** (only Tier1/Tier2)
4. ✅ `approval.approved`

**Result:** Metadata created, but **no automatic profiling** (cost optimization).

### Tier2 Metadata (Auto-Profile with Normal Priority)

```json
{
  "tier": "tier2",  // ← Tier2
  "lane": "governed",
  // ... rest same
}
```

**Events Emitted:**

1. ✅ `metadata.approved`
2. ✅ `metadata.changed`
3. ✅ `metadata.profile.due` (priority: **'normal'** instead of 'high')
4. ✅ `approval.approved`
5. ✅ `metadata.profile.completed` (after profiler runs)

---

## 🚀 Next Steps

Once you've verified this flow works:

1. **Option 1: Dashboards & Alerts**
   - Subscribe to `metadata.profile.completed` in Prometheus metrics subscriber
   - Create Grafana dashboard for quality trends
   - Set up alert rules for quality degradation

2. **Option 2: Lineage & KPI Impact**
   - Subscribe to `metadata.changed` in lineage subscriber
   - Trigger impact analysis for dependent KPIs
   - Emit `kpi.impact.changed` events

3. **Production Hardening**
   - Enable Redis event bus for multi-pod
   - Add event replay mechanism
   - Implement dead-letter queue for failed events

---

## 📁 Files Reference

- `metadata-studio/api/approvals.routes.ts` - Approval handler (emits events)
- `metadata-studio/events/profile.subscriber.ts` - Profile subscriber (runs profiler)
- `metadata-studio/services/quality.service.ts` - Profiler engine
- `metadata-studio/db/schema/approval.tables.ts` - Approval schema
- `packages/events/src/event-schemas.ts` - Event schemas

---

**🎉 You now have a complete understanding of the approval → event → profiler flow!**

Next: Try it yourself with the curl commands above, then we can move to **Option 1: Dashboards & Alerts** 📊

