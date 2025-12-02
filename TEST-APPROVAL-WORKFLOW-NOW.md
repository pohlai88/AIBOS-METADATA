# 🧪 Test Your Approval Workflow NOW!

## ✅ Server Status

Your metadata-studio server should now be running on:
- **URL:** http://localhost:8787
- **Health Check:** http://localhost:8787/healthz

---

## 🚀 Quick Test Commands

###  1: Test Health Endpoint

```powershell
curl http://localhost:8787/healthz
```

**Expected response:**
```json
{"status":"ok","service":"metadata-studio"}
```

---

### Step 2: Create an Approval Request

```powershell
$body = @'
{
  "entityType": "GLOBAL_METADATA",
  "entityKey": "revenue_gross_test",
  "tier": "tier1",
  "lane": "governed",
  "payload": {
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "canonicalKey": "revenue_gross_test",
    "label": "Revenue Gross (Test)",
    "description": "Testing approval workflow",
    "domain": "Finance",
    "module": "GL",
    "entityUrn": "urn:aibos:metadata:550e8400-e29b-41d4-a716-446655440000:revenue_gross_test",
    "tier": "tier1",
    "standardPackId": "IFRS_CORE",
    "dataType": "DECIMAL",
    "format": "18,2",
    "ownerId": "user-cfo",
    "stewardId": "user-alice",
    "status": "active"
  },
  "requiredRole": "metadata_steward",
  "requestedBy": "user-alice"
}
'@

curl -X POST http://localhost:8787/approvals `
  -H "Content-Type: application/json" `
  -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000" `
  -H "x-user-id: user-alice" `
  -H "x-role: metadata_steward" `
  -d $body
```

**Save the returned approval ID!**

---

### Step 3: Approve the Request

```powershell
# Replace APPROVAL-ID with the ID from step 2
curl -X POST http://localhost:8787/approvals/APPROVAL-ID/approve `
  -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000" `
  -H "x-user-id: user-bob" `
  -H "x-role: metadata_steward"
```

**Watch the server logs for events being emitted!**

---

### Step 4: Verify in Supabase

Go to your Supabase project:
https://supabase.com/dashboard/project/cnlutbuzjqtuicngldak/editor

**Check the `mdm_approval` table:**
```sql
SELECT status, decided_by, decided_at 
FROM mdm_approval 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 📊 Expected Flow

```
1. POST /approvals
   └─ Creates approval (status: pending)

2. POST /approvals/:id/approve
   ├─ Updates approval (status: approved)
   ├─ Creates metadata row
   ├─ Emits events:
   │  ├─ metadata.approved
   │  ├─ metadata.changed
   │  ├─ metadata.profile.due (Tier1/Tier2)
   │  └─ approval.approved
   └─ Profile subscriber reacts (if binding exists)
```

---

## 🔍 Check Server Logs

Watch for these log messages:

```
[EventSystem] Initializing event system...
[EventSystem] Event bus initialized (local) ✅
[ProfileSubscriber] Registered subscriber for metadata.profile.due
metadata-studio listening on http://localhost:8787

[EventBus] Publishing event: metadata.approved
[EventBus] Publishing event: metadata.changed
[EventBus] Publishing event: metadata.profile.due
[EventBus] Publishing event: approval.approved
```

---

## 🎯 Success Criteria

After approving, you should see:

✅ Approval status = 'approved' in database  
✅ 4 events emitted (see server logs)  
✅ All events have same correlationId  
✅ Response JSON shows approved status

---

## 📖 Full Walkthrough

For the complete end-to-end scenario with explanations, see:
- **APPROVAL-FLOW-WALKTHROUGH.md**

For schema verification:
- **SCHEMA-ALIGNMENT-COMPLETE.md**

For architecture overview:
- **EVENT-SYSTEM-INTEGRATION-COMPLETE.md**

---

**🚀 Your event-driven approval workflow is ready to test!**

