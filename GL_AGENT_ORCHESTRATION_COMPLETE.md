# GL Agent Orchestration - Complete ✅

> **Date:** 2025-01-27  
> **Status:** ✅ **Agents can now be "taught" to respect the lawbook**

---

## 🎯 What Was Built

Complete orchestration layer for AI agents to construct IFRS-compliant journal entries using MCP tools and the metadata kernel.

---

## 📦 Files Created

### 1. GL Agent Contract

**File:** `docs/metadata/AGENT-CONTRACT-GL.md`

**Contents:**
- ✅ MCP tool usage patterns (`metadata.lookupConcept`, `metadata.listStandardPacks`)
- ✅ Journal draft model (codes, not IDs)
- ✅ Mandatory pre-posting checks
- ✅ Forbidden behaviors
- ✅ Complete workflow examples
- ✅ Error handling patterns

**Key Principle:** Agents work with **codes** (strings) not **IDs** (UUIDs). Backend resolves codes → IDs.

---

### 2. API Handler with Code Resolution

**File:** `apps/app/api/gl/journals/route.ts`

**Features:**
- ✅ Resolves `soTPackCode` → `so_t_pack_id` (UUID)
- ✅ Resolves `accountCode` → `account_id` (UUID)
- ✅ Runs PostingGuard validation
- ✅ Posts journal with metadata snapshots
- ✅ Returns validation errors clearly

**Endpoints:**
- `POST /api/gl/journals` - Post journal (with code resolution)
- `GET /api/gl/journals?tenantId=...` - List journals

**Request Format:**
```json
{
  "tenantId": "uuid",
  "soTPackCode": "IFRS_CORE",
  "postingDate": "2025-01-31",
  "lines": [
    {
      "accountCode": "4000",
      "debit": 0,
      "credit": 1000,
      "businessTerm": "Revenue"
    }
  ]
}
```

---

### 3. GL Playground Script

**File:** `apps/lib/gl-playground.ts`

**Features:**
- ✅ Lists all Tier 1 finance concepts
- ✅ Shows account-to-concept mappings
- ✅ Tests PostingGuard with sample journals:
  - Valid journal (should pass)
  - Unbalanced journal (should fail)
  - Journal without pack (should fail)

**Usage:**
```bash
cd apps
tsx lib/gl-playground.ts
```

**Output:**
- Tier 1 finance concepts with their standard packs
- Account mappings organized by governance tier
- PostingGuard test results with clear pass/fail indicators

---

### 4. Updated get-tenant-id.ts

**File:** `apps/lib/get-tenant-id.ts`

**Changes:**
- ✅ Now exports `getTenantId()` function (not just CLI script)
- ✅ Can be imported by other modules
- ✅ Still works as CLI script when called directly

---

## 🔄 Agent Workflow

```
User Request
    ↓
Agent Resolves Business Terms
    ├─→ MCP: metadata.lookupConcept("Sales") → "revenue"
    └─→ MCP: metadata.lookupConcept("Inventory") → "inventory_cost"
    ↓
Agent Discovers Standard Packs
    └─→ MCP: metadata.listStandardPacks("FINANCE")
    ↓
Agent Builds Journal Draft
    ├─→ soTPackCode: "IFRS_CORE" (string, not UUID)
    ├─→ accountCode: "4000" (string, not UUID)
    └─→ businessTerm: "Revenue" (for audit)
    ↓
Agent Validates Locally
    └─→ Debits = Credits
    ↓
Agent Calls Backend API
    └─→ POST /api/gl/journals
    ↓
Backend Resolves Codes → IDs
    ├─→ "IFRS_CORE" → UUID
    └─→ "4000" → UUID
    ↓
PostingGuard Validates
    ├─→ Debits = Credits ✅
    ├─→ Pack exists & ACTIVE ✅
    └─→ Tier 1/2 accounts → LAW-level packs ✅
    ↓
Journal Posted
    └─→ With mdm_snapshot per line
```

---

## 📋 MCP Tool Integration

### metadata.lookupConcept

**Purpose:** Resolve business terms to canonical concepts

**Input:**
```json
{ "tenantId": "uuid", "term": "Revenue" }
```

**Output:**
```json
{
  "found": true,
  "concept": {
    "canonical_key": "revenue",
    "governance_tier": 1,
    "standardPack": {
      "code": "IFRS_CORE",
      "authority_level": "LAW"
    }
  }
}
```

**Usage:**
- Agent calls before constructing journal
- Validates Tier 1/2 finance concepts use LAW-level packs
- Warns if concept not found

---

### metadata.listStandardPacks

**Purpose:** Discover available standard packs

**Input:**
```json
{ "domain": "FINANCE" }
```

**Output:**
```json
{
  "packs": [
    { "code": "IFRS_CORE", "authority_level": "LAW", "status": "ACTIVE" },
    { "code": "IAS_21_FX", "authority_level": "LAW", "status": "ACTIVE" }
  ]
}
```

**Usage:**
- Agent calls to discover available packs
- Chooses appropriate pack based on transaction type
- Validates pack is ACTIVE before using

---

## ✅ Validation Rules (Agent Side)

### Before Calling API

1. ✅ **Debits = Credits**
   - Sum all debits and credits
   - Reject if not equal (rounded to 2 decimals)

2. ✅ **Select Valid Standard Pack**
   - Use `metadata.listStandardPacks("FINANCE")`
   - Choose appropriate pack (IFRS_CORE, IAS_21_FX, etc.)
   - Ensure pack is ACTIVE

3. ✅ **Resolve Business Terms**
   - Call `metadata.lookupConcept` for each term
   - For Tier 1/2 finance: ensure LAW-level pack
   - Warn if concept not found

4. ✅ **Do NOT Invent Concepts**
   - If Tier 1/2 finance concept not found → Request human approval
   - Do NOT create concepts in metadata

---

## 🚫 Forbidden Behaviors

Agents are NOT allowed to:

1. ❌ Post journal without `soTPackCode`
2. ❌ Use aliases as canonical keys
3. ❌ Create new `mdm_concept` entries for Tier 1/2 finance
4. ❌ Bypass GL posting APIs (direct DB writes)
5. ❌ Use non-LAW packs for Tier 1/2 finance accounts

---

## 📊 Example: Complete Agent Flow

### Scenario: "Book a RM1,000 sale of fresh vegetables"

**Step 1: Resolve Business Terms**
```typescript
const salesConcept = await mcpCall('metadata.lookupConcept', {
  tenantId: tenantId,
  term: 'Sales'
});
// → { found: true, concept: { canonical_key: 'revenue', ... } }

const inventoryConcept = await mcpCall('metadata.lookupConcept', {
  tenantId: tenantId,
  term: 'Inventory Cost'
});
// → { found: true, concept: { canonical_key: 'inventory_cost', ... } }
```

**Step 2: Discover Standard Packs**
```typescript
const packs = await mcpCall('metadata.listStandardPacks', {
  domain: 'FINANCE'
});
// → { packs: [{ code: 'IFRS_CORE', ... }, ...] }
```

**Step 3: Build Journal Draft**
```typescript
const journalDraft = {
  tenantId: tenantId,
  soTPackCode: 'IFRS_CORE',
  postingDate: '2025-01-31',
  description: 'Sale of fresh vegetables',
  lines: [
    {
      accountCode: '4000',
      debit: 0,
      credit: 1000,
      businessTerm: 'Revenue',
      description: 'Product sales revenue'
    },
    {
      accountCode: '1300',
      debit: 1000,
      credit: 0,
      businessTerm: 'Inventory Cost',
      description: 'Inventory reduction'
    }
  ]
};
```

**Step 4: Validate Locally**
```typescript
const totalDebit = journalDraft.lines.reduce((s, l) => s + l.debit, 0);
const totalCredit = journalDraft.lines.reduce((s, l) => s + l.credit, 0);
if (totalDebit !== totalCredit) {
  throw new Error('Journal is unbalanced');
}
```

**Step 5: Call Backend API**
```typescript
const response = await fetch('/api/gl/journals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(journalDraft)
});

const result = await response.json();
// → { status: 'posted', journalId: 'uuid', ... }
```

**Step 6: Backend Processing**
1. Resolves `soTPackCode='IFRS_CORE'` → UUID
2. Resolves `accountCode='4000'` → UUID
3. Runs PostingGuard validation
4. Posts journal with `mdm_snapshot` per line

---

## 🧪 Testing with Playground

Run the playground script to see the rules in action:

```bash
cd apps
tsx lib/gl-playground.ts
```

**Output:**
- Lists all Tier 1 finance concepts
- Shows account-to-concept mappings
- Tests PostingGuard with valid/invalid journals
- Demonstrates validation rules

---

## 📚 Related Documentation

- **Agent Contract:** `docs/metadata/AGENT-CONTRACT-GL.md`
- **GL Contract:** `docs/metadata/GL-CONTRACT.md`
- **PostingGuard:** `apps/lib/postingGuard.ts`
- **API Handler:** `apps/app/api/gl/journals/route.ts`
- **Playground:** `apps/lib/gl-playground.ts`

---

## ✅ Summary

**The orchestration is complete:**

- ✅ Agents have clear contract (AGENT-CONTRACT-GL.md)
- ✅ MCP tools integrated (lookupConcept, listStandardPacks)
- ✅ Backend resolves codes → IDs automatically
- ✅ PostingGuard enforces IFRS compliance
- ✅ Playground demonstrates rules visually

**Agents can now:**
- Use MCP tools to resolve business terms
- Build journal drafts with codes (not IDs)
- Call backend API for posting
- Get clear validation errors

**The ledger cannot escape IFRS.** 🎯

---

**Status:** ✅ **Ready for Agent Orchestration**

