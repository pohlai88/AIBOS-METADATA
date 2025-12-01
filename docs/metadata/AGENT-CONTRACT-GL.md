# GL Agent Contract — Metadata-Governed Journals (v1.0.0)

## 1. Purpose

This contract defines how any agent (human or AI) is allowed to:

- Propose General Ledger (GL) journals
- Choose accounts and packs (IFRS, IAS, Tax)
- Call MCP tools and kernel APIs

The goal is to ensure:

- All Tier 1/Tier 2 FINANCE concepts are anchored to LAW-level packs (IFRS/MFRS)
- No journal is posted without traceable metadata
- The ledger cannot "escape IFRS" by accident

---

## 2. Scope

This contract applies to:

- GL journal drafting and posting
- FX revaluation journals
- Inventory and asset journals that hit GL

It does **not** yet cover:

- Consolidation, group FX
- Advanced IFRS 15/16 engines
- Non-finance domains (HR, SCM, etc.)

---

## 3. Required MCP Tools

Agents MUST use these tools:

### 3.1 `metadata.lookupConcept`

**Purpose:** Resolve business terms (e.g. "Sales", "Revenue", "Deferred Revenue") into canonical concepts and standard packs.

**Input:**

```json
{
  "tenantId": "uuid",
  "term": "Revenue"
}
```

**Output (simplified):**

```json
{
  "found": true,
  "concept": {
    "id": "uuid",
    "canonical_key": "revenue",
    "label": "Revenue",
    "domain": "FINANCE",
    "concept_type": "FIELD",
    "governance_tier": 1,
    "standardPack": {
      "id": "uuid",
      "code": "IFRS_CORE",
      "authority_level": "LAW"
    },
    "aliases": [
      { "alias_value": "Sales", "alias_type": "LEXICAL" },
      { "alias_value": "REV", "alias_type": "LEGACY_SYSTEM" }
    ]
  }
}
```

**Usage Pattern:**

```typescript
// Agent resolves business term to concept
const result = await mcpCall("metadata.lookupConcept", {
  tenantId: tenantId,
  term: "Sales", // or 'Revenue', 'Deferred Revenue', etc.
});

if (!result.found) {
  // Concept not found - agent must request human approval
  throw new Error("Concept not in metadata; human approval required.");
}

const concept = result.concept;
// Use concept.canonical_key, concept.standardPack.code, etc.
```

---

### 3.2 `metadata.listStandardPacks`

**Purpose:** Discover valid packs for a journal (e.g. IFRS_CORE, IAS_21_FX).

**Input:**

```json
{
  "domain": "FINANCE"
}
```

**Output:**

```json
{
  "packs": [
    {
      "id": "uuid",
      "code": "IFRS_CORE",
      "authority_level": "LAW",
      "name": "IFRS Core Standards",
      "status": "ACTIVE",
      "version": "2024"
    },
    {
      "id": "uuid",
      "code": "IAS_21_FX",
      "authority_level": "LAW",
      "name": "IAS 21 - Foreign Exchange",
      "status": "ACTIVE",
      "version": "2024"
    },
    {
      "id": "uuid",
      "code": "IAS_2_INV",
      "authority_level": "LAW",
      "name": "IAS 2 - Inventories",
      "status": "ACTIVE",
      "version": "2024"
    }
  ]
}
```

**Usage Pattern:**

```typescript
// Agent discovers available packs
const packsResult = await mcpCall("metadata.listStandardPacks", {
  domain: "FINANCE",
});

// Choose appropriate pack based on transaction type
let soTPackCode: string;
if (transactionType === "fx_revaluation") {
  soTPackCode = "IAS_21_FX";
} else if (transactionType === "inventory_valuation") {
  soTPackCode = "IAS_2_INV";
} else {
  soTPackCode = "IFRS_CORE"; // Default for normal journals
}

const selectedPack = packsResult.packs.find((p) => p.code === soTPackCode);
if (!selectedPack || selectedPack.status !== "ACTIVE") {
  throw new Error(`Pack ${soTPackCode} not available`);
}
```

---

## 4. Journal Draft Model

Agents MUST think in this shape when drafting a GL journal:

```json
{
  "tenantId": "uuid",
  "soTPackCode": "IFRS_CORE", // or IAS_21_FX, IAS_2_INV, etc.
  "postingDate": "2025-01-31",
  "description": "Monthly revenue recognition",
  "lines": [
    {
      "accountCode": "4000",
      "debit": 0,
      "credit": 1000,
      "businessTerm": "Revenue",
      "description": "Product sales revenue"
    },
    {
      "accountCode": "1300",
      "debit": 1000,
      "credit": 0,
      "businessTerm": "Inventory Cost",
      "description": "Inventory reduction"
    }
  ]
}
```

**Key Points:**

- Use `soTPackCode` (string) not `soTPackId` (UUID) - backend resolves it
- Use `accountCode` (string) not `accountId` (UUID) - backend resolves it
- Include `businessTerm` for each line - helps with validation and audit
- Backend will resolve codes → IDs and run PostingGuard

---

## 5. Mandatory Pre-Posting Checks (for agents)

Before calling `POST /api/gl/journals` or any kernel posting API, agents MUST:

### 5.1 Ensure debits = credits

**Action:**

- Sum all debits and credits to 2 decimal places
- Reject any draft where sums differ

**Example:**

```typescript
const totalDebit = lines.reduce((s, l) => s + (l.debit ?? 0), 0);
const totalCredit = lines.reduce((s, l) => s + (l.credit ?? 0), 0);
const roundedDebit = Math.round(totalDebit * 100) / 100;
const roundedCredit = Math.round(totalCredit * 100) / 100;

if (roundedDebit !== roundedCredit) {
  throw new Error(
    `Debits (${roundedDebit}) do not equal credits (${roundedCredit})`
  );
}
```

---

### 5.2 Select a valid standard pack

**Action:**

1. Use `metadata.listStandardPacks({ "domain": "FINANCE" })`
2. Choose an appropriate `soTPackCode`:
   - Normal journals → `IFRS_CORE`
   - FX revaluation → `IAS_21_FX`
   - Inventory valuation → `IAS_2_INV`
   - Tax adjustments → `GLOBAL_TAX`
3. Include `soTPackCode` in the draft

**Example:**

```typescript
const packs = await mcpCall("metadata.listStandardPacks", {
  domain: "FINANCE",
});
const ifrsCorePack = packs.packs.find((p) => p.code === "IFRS_CORE");

if (!ifrsCorePack || ifrsCorePack.status !== "ACTIVE") {
  throw new Error("IFRS_CORE pack not available");
}

journal.soTPackCode = "IFRS_CORE";
```

---

### 5.3 Resolve business terms into concepts

**Action:**
For each line with `businessTerm`:

1. Call `metadata.lookupConcept({ tenantId, term: businessTerm })`
2. If `domain != 'FINANCE'` or `governance_tier > 2`, agent MAY still proceed but must label it
3. If `domain = 'FINANCE'` AND `governance_tier <= 2`:
   - Ensure `standardPack.authority_level == 'LAW'`
   - Use this information in reasoning and justification

**Example:**

```typescript
for (const line of journal.lines) {
  if (line.businessTerm) {
    const conceptResult = await mcpCall("metadata.lookupConcept", {
      tenantId: journal.tenantId,
      term: line.businessTerm,
    });

    if (conceptResult.found) {
      const concept = conceptResult.concept;

      // For Tier 1/2 finance concepts, ensure LAW-level pack
      if (concept.domain === "FINANCE" && concept.governance_tier <= 2) {
        if (concept.standardPack?.authority_level !== "LAW") {
          throw new Error(
            `Tier ${concept.governance_tier} finance concept ${concept.canonical_key} ` +
              `is not anchored to a LAW-level pack`
          );
        }

        // Log for audit
        console.log(
          `Line uses ${concept.canonical_key} (${concept.standardPack.code}) - ` +
            `governed by ${concept.standardPack.name}`
        );
      }
    } else {
      // Concept not found - warn but allow (backend will validate)
      console.warn(`Concept not found for term: ${line.businessTerm}`);
    }
  }
}
```

---

### 5.4 Do NOT invent new Tier 1/Tier 2 finance concepts

**Action:**
If `metadata.lookupConcept` does not find a finance concept and the agent believes it is Tier 1/2:

- Create a human-facing message: "Concept not in metadata; human approval required."
- Do NOT call posting APIs
- Request human to add concept to metadata first

**Example:**

```typescript
const conceptResult = await mcpCall("metadata.lookupConcept", {
  tenantId: tenantId,
  term: "Critical Finance Term",
});

if (!conceptResult.found) {
  // Check if this is likely a Tier 1/2 finance concept
  const isFinanceTerm = ["Revenue", "COGS", "Tax", "Inventory"].includes(term);

  if (isFinanceTerm) {
    throw new Error(
      `Concept "${term}" not found in metadata. ` +
        `Tier 1/2 finance concepts must be added to metadata before posting. ` +
        `Please contact administrator to add this concept.`
    );
  }
}
```

---

## 6. Forbidden Behaviors

Agents are NOT allowed to:

1. ❌ **Post a journal without `soTPackCode`**

   - Every journal must state which law governs it

2. ❌ **Use aliases as canonical keys** in any database schema or API payloads

   - Always use `concept.canonical_key`, not aliases

3. ❌ **Create new `mdm_concept` entries** for FINANCE Tier 1/2 concepts

   - These must be added by administrators through proper governance

4. ❌ **Bypass GL posting APIs** and write directly to `journal_entries` / `journal_lines`

   - All journals must go through PostingGuard validation

5. ❌ **Use non-LAW packs** for Tier 1/2 finance accounts
   - Tier 1/2 finance must use IFRS/MFRS (LAW-level packs)

---

## 7. Example Compliant Workflow (Narrative)

### Scenario: "Book a RM1,000 sale of fresh vegetables."

**Step 1: Agent receives request**

```
User: "Book a RM1,000 sale of fresh vegetables."
```

**Step 2: Agent resolves business terms**

```typescript
// Lookup "Sales" concept
const salesConcept = await mcpCall("metadata.lookupConcept", {
  tenantId: tenantId,
  term: "Sales",
});
// → mapped to canonical 'revenue' (IFRS 15)

// Lookup "Inventory Cost" concept
const inventoryConcept = await mcpCall("metadata.lookupConcept", {
  tenantId: tenantId,
  term: "Inventory Cost",
});
// → mapped to canonical 'inventory_cost' (IAS 2)
```

**Step 3: Agent discovers standard packs**

```typescript
const packs = await mcpCall("metadata.listStandardPacks", {
  domain: "FINANCE",
});
// → finds IFRS_CORE, IAS_21_FX, IAS_2_INV, etc.

// Choose IFRS_CORE for normal revenue journal
const ifrsCorePack = packs.packs.find((p) => p.code === "IFRS_CORE");
```

**Step 4: Agent builds draft journal**

```typescript
const journalDraft = {
  tenantId: tenantId,
  soTPackCode: "IFRS_CORE",
  postingDate: "2025-01-31",
  description: "Sale of fresh vegetables",
  lines: [
    {
      accountCode: "4000", // Revenue account
      debit: 0,
      credit: 1000,
      businessTerm: "Revenue",
      description: "Product sales revenue",
    },
    {
      accountCode: "1300", // Inventory account
      debit: 1000,
      credit: 0,
      businessTerm: "Inventory Cost",
      description: "Inventory reduction",
    },
  ],
};

// Validate debits = credits
const totalDebit = journalDraft.lines.reduce((s, l) => s + l.debit, 0);
const totalCredit = journalDraft.lines.reduce((s, l) => s + l.credit, 0);
if (totalDebit !== totalCredit) {
  throw new Error("Journal is unbalanced");
}
```

**Step 5: Agent calls backend API**

```typescript
const response = await fetch("/api/gl/journals", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(journalDraft),
});

const result = await response.json();
if (result.status === "posted") {
  console.log("✅ Journal posted successfully");
} else {
  console.error("❌ Posting failed:", result.errors);
}
```

**Step 6: Backend processing**

1. Resolves `soTPackCode='IFRS_CORE'` → `so_t_pack_id` (UUID)
2. Resolves `accountCode='4000'` → `account_id` (UUID)
3. Loads account's `mdm_concept_id` and `governance_tier`
4. Runs PostingGuard:
   - ✅ Debits = credits
   - ✅ Pack is ACTIVE + LAW-level
   - ✅ Tier 1 accounts have concepts anchored to LAW-level packs
5. Writes journals and `mdm_snapshot` per line

**Result:** The journal is now permanently attached to IFRS metadata and cannot silently drift.

---

## 8. Backend API Contract

### 8.1 POST /api/gl/journals

**Request Body:**

```json
{
  "tenantId": "uuid",
  "soTPackCode": "IFRS_CORE",
  "postingDate": "2025-01-31",
  "description": "Optional description",
  "lines": [
    {
      "accountCode": "4000",
      "debit": 0,
      "credit": 1000,
      "businessTerm": "Revenue",
      "description": "Optional line description"
    }
  ]
}
```

**Response (Success):**

```json
{
  "status": "posted",
  "journalId": "uuid",
  "postedAt": "2025-01-31T10:00:00Z"
}
```

**Response (Validation Error):**

```json
{
  "status": "rejected",
  "journalId": null,
  "errors": [
    "PostingGuard: so_t_pack_id is required for all journal entries.",
    "PostingGuard: Debits (1000) do not equal credits (999.99)"
  ]
}
```

---

## 9. Error Handling

### 9.1 Concept Not Found

**When:** `metadata.lookupConcept` returns `found: false`

**Action:**

- If likely Tier 1/2 finance concept → Request human approval
- If other concept → Warn but allow (backend will validate)

### 9.2 Pack Not Available

**When:** `metadata.listStandardPacks` doesn't include required pack

**Action:**

- Use fallback pack (IFRS_CORE) if appropriate
- Otherwise, request human approval

### 9.3 Validation Errors

**When:** Backend returns `status: "rejected"`

**Action:**

- Parse `errors` array
- Fix journal draft
- Retry posting

---

## 10. Summary

**Agent Workflow:**

```
User Request
    ↓
Resolve Business Terms (MCP: metadata.lookupConcept)
    ↓
Discover Standard Packs (MCP: metadata.listStandardPacks)
    ↓
Build Journal Draft (with soTPackCode, accountCode, businessTerm)
    ↓
Validate Locally (debits = credits)
    ↓
Call Backend API (POST /api/gl/journals)
    ↓
Backend Resolves Codes → IDs
    ↓
PostingGuard Validates (IFRS compliance)
    ↓
Journal Posted (with mdm_snapshot)
```

**Key Principles:**

- ✅ Always use MCP tools to resolve business terms
- ✅ Always specify `soTPackCode` in journal drafts
- ✅ Always validate debits = credits before posting
- ✅ Never bypass PostingGuard
- ✅ Never create Tier 1/2 finance concepts

---

## 📚 Related Documentation

- [GL Contract](./GL-CONTRACT.md) - Technical implementation details
- [PostingGuard Implementation](../../apps/lib/postingGuard.ts) - Validation logic
- [GL Posting Service](../../apps/lib/accounting-kernel/gl-posting-service.ts) - Service API
- [Account Mapping Guide](../../apps/lib/seed-account-concept-mapping.ts) - Account-to-concept mapping

---

## 📝 Version History

- **1.0.0** (2025-01-27): Initial contract definition with MCP tool integration

---

**Status:** ✅ **Active Contract**  
**Enforcement:** PostingGuard runtime validation + MCP tool requirements  
**Compliance:** Required for all journal entries
