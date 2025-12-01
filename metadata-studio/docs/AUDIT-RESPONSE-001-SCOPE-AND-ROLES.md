# 🔍 Audit Response #001: Scope and Roles Alignment

**Audit Date:** December 1, 2025  
**Package:** `@aibos/metadata-studio@0.1.0`  
**Auditor:** AIBOS Platform Team  
**Status:** ⚠️ **PARTIAL COMPLIANCE** - Gaps Identified

---

## Executive Summary

The Metadata Studio package has been audited for scope and role alignment within the AIBOS Platform hexagonal architecture. While the foundational structure is SOLID, **critical integration points with Kernel Finance are NOT yet implemented**.

### Quick Status

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Dual Role: Provider to BFF/Apps | ✅ **COMPLIANT** | MCP tools + HTTP APIs implemented |
| Dual Role: Consumer of Kernel Events | ⚠️ **GAP** | Event handlers exist but not wired to Kernel |
| Boundary: No raw transactional data | ✅ **COMPLIANT** | Only metadata, no transaction ingestion |
| Boundary: No heavy ingestion | ✅ **COMPLIANT** | Light metadata operations only |
| Boundary: Respects Kernel RBAC | ⚠️ **GAP** | No RBAC integration implemented yet |
| Service Hierarchy | ⚠️ **PARTIAL** | Entity/Field exists, Service/Domain needs mapping |

---

## 1. DUAL ROLE CONFIRMATION

### 1.1 ✅ Role A: Provider to BFF/Apps

**Status:** **FULLY IMPLEMENTED**

The Metadata Studio successfully acts as a metadata provider through two adapter layers:

#### Evidence A1: HTTP API Provider (Hono Routes)

**Location:** `metadata-studio/api/*.routes.ts`

```typescript
// 7 HTTP API routes expose metadata to BFF/Apps
metadata-studio/api/
├── metadata.routes.ts   → /metadata/* (CRUD operations)
├── lineage.routes.ts    → /lineage/* (upstream/downstream)
├── impact.routes.ts     → /impact/* (change impact analysis)
├── glossary.routes.ts   → /glossary/* (business terms)
├── tags.routes.ts       → /tags/* (tagging system)
├── quality.routes.ts    → /quality/* (data quality scores)
└── usage.routes.ts      → /usage/* (usage analytics)
```

**Code Pointer:**

```5:40:metadata-studio/api/metadata.routes.ts
import { Hono } from 'hono';
import { metadataService } from '../services/metadata.service';

const metadata = new Hono();

// GET /metadata/:id
metadata.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await metadataService.getById(id);
  return c.json(result);
});

// POST /metadata
metadata.post('/', async (c) => {
  const body = await c.req.json();
  const result = await metadataService.create(body);
  return c.json(result, 201);
});
```

**Integration Points:**
- BFF Layer can call `/metadata/search?query=...`
- Apps can retrieve lineage via `/lineage/:entityId/upstream`
- Impact analysis via `/impact/:entityId`

---

#### Evidence A2: MCP Provider (AI Agent Tools)

**Location:** `metadata-studio/mcp/metadata-studio.mcp.json`

```json
{
  "profile": {
    "name": "metadata-studio",
    "capabilities": {
      "tools": true,
      "resources": true
    }
  },
  "tools": [
    {
      "name": "metadata_get",
      "description": "Retrieve metadata for an entity by ID or FQN"
    },
    {
      "name": "metadata_search",
      "description": "Search metadata entities"
    },
    {
      "name": "lineage_get_upstream",
      "description": "Get upstream lineage for an entity"
    },
    {
      "name": "impact_analyze",
      "description": "Analyze impact of changes to an entity"
    }
    // ... 8 total MCP tools
  ]
}
```

**Code Pointer:**

```6:28:metadata-studio/mcp/tools/metadata.tools.ts
export const metadataTools = {
  async metadata_get(args: { id?: string; fqn?: string }) {
    if (args.id) {
      return await metadataService.getById(args.id);
    }
    if (args.fqn) {
      return await metadataService.getByFQN(args.fqn);
    }
    throw new Error('Either id or fqn must be provided');
  },

  async metadata_search(args: { query: string; filters?: any }) {
    return await metadataService.search(args.query, args.filters);
  }
}
```

**Integration Points:**
- AI Agents can query metadata via MCP protocol
- Orchestra can discover entities and relationships
- Policy Guardian can verify governance compliance

**✅ VERDICT:** Provider role is FULLY FUNCTIONAL with dual protocol support (HTTP + MCP).

---

### 1.2 ⚠️ Role B: Consumer of Kernel Governance/Events via MCP

**Status:** **STRUCTURE EXISTS, NOT WIRED**

The Metadata Studio has event handler infrastructure but is NOT yet consuming Kernel Finance events.

#### Evidence B1: Event Handler Infrastructure EXISTS

**Location:** `metadata-studio/events/`

```typescript
// Event type definitions
metadata-studio/events/event.types.ts
export interface MetadataChangedEvent { ... }
export interface LineageUpdatedEvent { ... }
export interface GovernanceTierChangedEvent { ... }

// Event handlers
metadata-studio/events/handlers/
├── on-metadata-changed.ts
├── on-lineage-updated.ts
└── on-profile-computed.ts
```

**Code Evidence:**

```6:16:metadata-studio/events/handlers/on-metadata-changed.ts
import { MetadataChangedEvent } from '../event.types';

export async function onMetadataChanged(event: MetadataChangedEvent) {
  console.log(`Metadata changed: ${event.entityId} (${event.changeType})`);

  // TODO: Implement handler logic
  // - Update downstream dependencies
  // - Trigger impact analysis if needed
  // - Invalidate caches
  // - Send notifications
}
```

**⚠️ GAP IDENTIFIED:** Event handlers are stubs with TODO comments.

---

#### Evidence B2: Kernel Finance Event Emission

**Location:** `packages/kernel-finance/src/events/finance-events.ts`

The Kernel Finance DOES emit events that Metadata Studio should consume:

```typescript
export type FinanceEventType =
  | "GL.JOURNAL_POSTED"
  | "PERIOD.CLOSED"
  | "FX.REVALUATION_RUN";

export interface JournalPostedEvent extends BaseFinanceEvent {
  type: "GL.JOURNAL_POSTED";
  payload: {
    journalId: Ulid;
    tenantId: TenantId;
    journalDate: ISODate;
    lines: JournalLine[];
  };
}
```

**Kernel Event Publisher Port:**

```typescript
// packages/kernel-finance/src/domain/gl/ports.ts
export interface FinanceEventPublisher {
    publish(event: FinanceEvent): Promise<void>;
}
```

**⚠️ GAP IDENTIFIED:** Metadata Studio does NOT subscribe to Kernel events yet.

---

#### Evidence B3: MISSING Integration Layer

**What Should Exist:**
```
metadata-studio/
├── adapters/
│   └── kernel-event-subscriber.ts   ❌ MISSING
│       └── Subscribes to Kernel FinanceEvents
│       └── Maps to Metadata Studio events
│       └── Triggers metadata updates
```

**Expected Flow (NOT IMPLEMENTED):**
```typescript
// EXPECTED: metadata-studio/adapters/kernel-event-subscriber.ts
import { FinanceEvent } from '@aibos/kernel-finance';
import { onMetadataChanged } from '../events/handlers/on-metadata-changed';

export class KernelEventSubscriber {
  async handleFinanceEvent(event: FinanceEvent) {
    switch (event.type) {
      case 'GL.JOURNAL_POSTED':
        // Extract metadata from journal posting
        // Trigger metadata lineage update
        await this.updateLineageFromJournal(event);
        break;
      
      case 'FX.REVALUATION_RUN':
        // Update metadata for revaluated accounts
        await this.updateMetadataFromFxEvent(event);
        break;
    }
  }
}
```

**⚠️ CRITICAL GAP:** No adapter exists to bridge Kernel events → Metadata Studio.

---

#### Evidence B4: Kernel MetadataBag Hook Points

The Kernel Finance DOES provide metadata integration points:

```typescript
// packages/kernel-finance/src/core/types.ts
export interface OriginCellMeta {
  cellId: string;        // e.g., "kernel.gl.posting"
  originType: string;    // e.g., "POSTING"
}

export type MetadataBag = Record<string, unknown>;
```

**Every Kernel entity has MetadataBag for Studio integration:**
```typescript
// From kernel-finance
export interface JournalEntry {
  id: Ulid;
  // ... other fields
  metadata?: MetadataBag;  // ← Metadata Studio integration point
}
```

**⚠️ GAP:** Metadata Studio doesn't read/write to Kernel's MetadataBag yet.

---

### 🔴 Role B Gap Summary

| Required Integration | Status | Priority |
|---------------------|--------|----------|
| Subscribe to `GL.JOURNAL_POSTED` | ❌ Not Implemented | HIGH |
| Subscribe to `FX.REVALUATION_RUN` | ❌ Not Implemented | HIGH |
| Subscribe to `PERIOD.CLOSED` | ❌ Not Implemented | MEDIUM |
| Read Kernel MetadataBag | ❌ Not Implemented | HIGH |
| Write to Kernel MetadataBag | ❌ Not Implemented | MEDIUM |
| Event bus/queue adapter | ❌ Not Implemented | HIGH |

**⚠️ VERDICT:** Consumer role is INCOMPLETE. Infrastructure exists but not wired to Kernel.

---

## 2. BOUNDARY VERIFICATION

### 2.1 ✅ No Raw Transactional Data Ingestion

**Status:** **COMPLIANT**

**Evidence:** Schema Analysis

```6:36:metadata-studio/schemas/mdm-global-metadata.schema.ts
export const MetadataEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum([
    'table',
    'view',
    'column',
    'dataset',
    'dashboard',
    'report',
    'metric',
    'kpi'  // ← Only metadata types, NO transaction data
  ]),
  sourceSystem: z.string(),
  fullyQualifiedName: z.string(),
  aliases: z.array(z.string()).default([]),
  // ... governance fields only
});
```

**Verification:**
- ❌ No `InvoiceSchema`
- ❌ No `PaymentSchema`
- ❌ No `JournalEntrySchema` (that's Kernel's job)
- ✅ Only metadata about entities (names, lineage, quality, tags)

**✅ VERDICT:** Studio correctly operates on metadata ABOUT data, not the data itself.

---

### 2.2 ✅ No Heavy Ingestion Workloads

**Status:** **COMPLIANT**

**Evidence:** Service Layer Analysis

```9:39:metadata-studio/services/metadata.service.ts
export const metadataService = {
  async getById(id: string): Promise<MetadataEntity | null> {
    return await metadataRepo.findById(id);
  },

  async create(data: unknown): Promise<MetadataEntity> {
    const validated = MetadataEntitySchema.parse(data);
    return await metadataRepo.create(validated);
  },
  
  // CRUD operations only - no heavy ingestion
}
```

**Verification:**
- ✅ Operations are lightweight CRUD
- ✅ No bulk import/export of transactional data
- ✅ No ETL pipelines
- ✅ No data warehousing logic

**Data Profiling (Observability) is Read-Only:**

```typescript
// quality.service.ts
async runProfiler(config: unknown): Promise<DataProfile> {
  // TODO: Implement profiler logic
  // This would integrate with data sources to compute statistics
  throw new Error('Not implemented');
}
```

**Note:** Profiler will READ source data to compute stats, but NOT ingest/store raw data.

**✅ VERDICT:** No heavy ingestion. Studio is metadata-only.

---

### 2.3 ⚠️ Respects Kernel RBAC/Policy

**Status:** **GAP IDENTIFIED**

**Evidence:** No RBAC enforcement found

**Current API Routes (NO RBAC):**

```12:23:metadata-studio/api/metadata.routes.ts
metadata.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await metadataService.getById(id);
  return c.json(result);
  // ⚠️ NO RBAC CHECK
  // ⚠️ NO user context validation
  // ⚠️ NO policy enforcement
});

metadata.post('/', async (c) => {
  const body = await c.req.json();
  const result = await metadataService.create(body);
  return c.json(result, 201);
  // ⚠️ NO authorization check
});
```

**⚠️ GAP:** No integration with Kernel's RBAC system.

**Expected Integration (MISSING):**
```typescript
// EXPECTED: metadata-studio/middleware/rbac.middleware.ts
import { KernelRBACService } from '@aibos/kernel-finance'; // ❌ Would violate LEGO

// Better approach: RBAC should be enforced at BFF layer
// Studio should receive pre-validated requests with user context
```

**🔴 CRITICAL DECISION NEEDED:**

**Option A (Recommended):** RBAC at BFF Layer
```
User → BFF (RBAC enforcement) → Metadata Studio
      ↑
   Kernel RBAC service
```

**Option B:** RBAC in Studio (requires Kernel dependency - violates LEGO)
```
User → Metadata Studio (direct RBAC call) → Kernel RBAC
                                             ↑
                                      Creates coupling
```

**⚠️ VERDICT:** RBAC not implemented. **Recommend BFF-layer enforcement to preserve LEGO architecture.**

---

## 3. SERVICE HIERARCHY VERIFICATION

### 3.1 Expected Hierarchy

```
Service
  └── Domain/Module
       └── Entity
            └── Field
```

### 3.2 Current Implementation Analysis

#### ✅ Entity → Field (COMPLIANT)

**Evidence:**

```8:62:metadata-studio/schemas/mdm-global-metadata.schema.ts
export const MetadataEntitySchema = z.object({
  id: z.string().uuid(),                    // ← ENTITY
  name: z.string().min(1),                  // ← FIELD
  displayName: z.string().optional(),       // ← FIELD
  type: z.enum([...]),                      // ← FIELD
  // ... more fields
});

export const ColumnMetadataSchema = z.object({
  id: z.string().uuid(),                    // ← ENTITY
  name: z.string(),                         // ← FIELD
  dataType: z.string(),                     // ← FIELD
  // ... more fields
});

export const TableMetadataSchema = MetadataEntitySchema.extend({
  type: z.literal('table'),                 // ← ENTITY TYPE
  columns: z.array(ColumnMetadataSchema),   // ← CHILD ENTITIES
  // ...
});
```

**Hierarchy:**
```
TableMetadata (Entity)
  ├── id (Field)
  ├── name (Field)
  ├── type (Field)
  └── columns (Array<ColumnMetadata>)
       └── ColumnMetadata (Child Entity)
            ├── id (Field)
            ├── name (Field)
            └── dataType (Field)
```

**✅ COMPLIANT:** Entity/Field structure is solid.

---

#### ⚠️ Service → Domain/Module (NEEDS ENHANCEMENT)

**Current Structure:**

```
metadata-studio/
├── services/
│   ├── metadata.service.ts      → Generic metadata operations
│   ├── lineage.service.ts       → Lineage domain
│   ├── glossary.service.ts      → Glossary domain
│   ├── quality.service.ts       → Quality domain
│   ├── tags.service.ts          → Tagging domain
│   └── usage.service.ts         → Usage domain
```

**Problem:** Services are flat, not organized by domain hierarchy.

**Expected Enhancement:**

```
metadata-studio/
├── services/
│   ├── core-metadata/
│   │   ├── metadata.service.ts
│   │   └── entity-registry.service.ts
│   ├── governance/
│   │   ├── glossary.service.ts
│   │   ├── quality.service.ts
│   │   └── tags.service.ts
│   ├── observability/
│   │   ├── lineage.service.ts
│   │   ├── impact-analysis.service.ts
│   │   └── usage.service.ts
│   └── index.ts  → Service registry/factory
```

**⚠️ RECOMMENDATION:** Reorganize services into domain modules for clarity.

---

#### ⚠️ Service Registration/Discovery (MISSING)

**Expected:**
```typescript
// metadata-studio/services/index.ts
export const MetadataStudioServices = {
  coreMetadata: {
    metadata: metadataService,
    entityRegistry: entityRegistryService,
  },
  governance: {
    glossary: glossaryService,
    quality: qualityService,
    tags: tagsService,
  },
  observability: {
    lineage: lineageService,
    impact: impactAnalysisService,
    usage: usageService,
  },
};
```

**⚠️ GAP:** No formal service registry or factory pattern.

---

## 4. EVIDENCE: ARCHITECTURE DIAGRAM

### 4.1 Layered Flow: Kernel → Studio → BFF → Apps

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AIBOS Platform                               │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Applications Layer                         │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐       │   │
│  │  │  ERP UI │  │ Reports │  │Analytics│  │AI Agents │       │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬─────┘       │   │
│  └───────┼────────────┼────────────┼────────────┼─────────────┘   │
│          │            │            │            │                   │
│          └────────────┴────────────┴────────────┘                   │
│                       │                                              │
│  ┌────────────────────┼──────────────────────────────────────┐     │
│  │                    ▼           BFF Layer                   │     │
│  │           ┌────────────────┐                               │     │
│  │           │  API Gateway   │  ← RBAC Enforcement Here      │     │
│  │           │  (Hono/Next)   │  ← User Context Validation    │     │
│  │           └────────┬───────┘                               │     │
│  └────────────────────┼───────────────────────────────────────┘     │
│                       │                                              │
│           ┌───────────┴───────────┐                                 │
│           ▼                       ▼                                 │
│  ┌────────────────────┐  ┌────────────────────┐                    │
│  │ Metadata Studio    │  │   Event Bus        │                    │
│  │  (This Package)    │  │   (MCP/Queues)     │                    │
│  │                    │  │                    │                    │
│  │  Provider:         │  │  ┌──────────────┐ │                    │
│  │  ✅ HTTP API      │  │  │  Pub/Sub     │ │                    │
│  │  ✅ MCP Tools     │  │  │  Topics:     │ │                    │
│  │                    │  │  │  - finance/* │ │                    │
│  │  Consumer:         │  │  │  - metadata/*│ │                    │
│  │  ⚠️ Events (TODO) │◄─┼──┤  - lineage/* │ │                    │
│  │                    │  │  └──────────────┘ │                    │
│  └──────┬─────────────┘  └────────▲───────────┘                    │
│         │                          │                                │
│         │ Query                    │ Emit                           │
│         │ MetadataBag              │ FinanceEvents                  │
│         ▼                          │                                │
│  ┌────────────────────────────────┴────────┐                       │
│  │       Kernel Finance (IFRS Engine)      │                       │
│  │                                          │                       │
│  │  Domains:                                │                       │
│  │  ├── GL (Posting, COA)                  │                       │
│  │  ├── FX (Revaluation, Rates)           │                       │
│  │  ├── Assets (Depreciation, Disposal)   │                       │
│  │  ├── Inventory (Valuation, Movements)  │                       │
│  │  └── Subledger (AP/AR, Aging)          │                       │
│  │                                          │                       │
│  │  Emits:                                  │                       │
│  │  ✅ GL.JOURNAL_POSTED                   │                       │
│  │  ✅ FX.REVALUATION_RUN                  │                       │
│  │  ✅ PERIOD.CLOSED                       │                       │
│  │                                          │                       │
│  │  MetadataBag Integration:               │                       │
│  │  ⚠️ Ready but not used by Studio       │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                       │
│  Legend:                                                             │
│  ✅ Implemented   ⚠️ Gap/TODO   ❌ Not Started                      │
└───────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Data Flow Sequence

**Scenario: Journal Posting Triggers Metadata Update**

```
1. User creates journal entry via ERP UI
   │
   ├─► BFF validates user permissions (RBAC)
   │
   └─► Kernel Finance: PostingService.postJournal()
        │
        ├─► Validates double-entry, period status
        ├─► Persists JournalEntry
        ├─► Publishes event: GL.JOURNAL_POSTED
        │    {
        │      type: "GL.JOURNAL_POSTED",
        │      payload: {
        │        journalId: "01JKXXX...",
        │        tenantId: "tenant-a",
        │        journalDate: "2025-12-01",
        │        lines: [...]
        │      }
        │    }
        │
        └─► Event Bus receives event
             │
             ├─► ⚠️ Metadata Studio SHOULD subscribe here
             │    (NOT IMPLEMENTED YET)
             │
             └─► Expected: KernelEventSubscriber
                  │
                  ├─► Maps FinanceEvent → MetadataEvent
                  ├─► Updates lineage graph
                  │    - Source: GL Accounts
                  │    - Target: JournalEntry
                  │    - Type: "direct" lineage
                  │
                  ├─► Increments usage stats
                  │    - Entity: account IDs
                  │    - EventType: "write"
                  │
                  └─► Emits: metadata.changed event
                       │
                       └─► Apps/Dashboards refresh metadata views
```

**🔴 CRITICAL GAP:** Steps after "Event Bus receives event" are NOT IMPLEMENTED.

---

## 5. CONFIG: RBAC/ABAC INTEGRATION POINTS

### 5.1 Current State: ❌ NO RBAC ENFORCEMENT

**Middleware Stack (Expected but MISSING):**

```typescript
// EXPECTED: metadata-studio/middleware/auth.middleware.ts
import { Context, Next } from 'hono';

export async function authMiddleware(c: Context, next: Next) {
  // Extract user from token/session
  const user = await extractUser(c);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  c.set('user', user);
  await next();
}

export async function rbacMiddleware(c: Context, next: Next) {
  const user = c.get('user');
  const resource = c.req.param('id');
  const action = getActionFromMethod(c.req.method);
  
  // ⚠️ Should this call Kernel RBAC? Would violate LEGO.
  // ✅ Better: BFF already validated, just check headers
  const authorized = await checkAuthorization(user, resource, action);
  
  if (!authorized) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  await next();
}
```

**⚠️ GAP:** This middleware layer does NOT exist.

---

### 5.2 Recommended RBAC Architecture (Deny-by-Default)

**Option A: BFF-Layer RBAC (RECOMMENDED)**

```
┌─────────────────────────────────────────┐
│  BFF/API Gateway (Next.js/Hono)         │
│                                          │
│  1. Authentication                       │
│     └─► Verify JWT/Session               │
│                                          │
│  2. Authorization (RBAC)                 │
│     ├─► Kernel RBAC Service              │
│     │    - Check user roles               │
│     │    - Check resource policies        │
│     │    - Apply ABAC rules               │
│     └─► Deny by default                   │
│                                          │
│  3. Forward to Metadata Studio           │
│     └─► Include user context in headers  │
│          (X-User-Id, X-Tenant-Id, etc.)  │
└────────────┬─────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Metadata Studio                         │
│                                          │
│  ✅ Trusts BFF validation                │
│  ✅ Logs user context                    │
│  ✅ Enforces tenant isolation            │
│  ❌ Does NOT call Kernel RBAC            │
│      (preserves LEGO architecture)       │
└──────────────────────────────────────────┘
```

**Pros:**
- ✅ Preserves Studio's LEGO independence
- ✅ Centralized RBAC enforcement
- ✅ No Kernel dependency in Studio

**Cons:**
- ⚠️ Studio must trust BFF (require mTLS/API keys)

---

**Option B: Studio-Layer RBAC (NOT RECOMMENDED)**

```
┌─────────────────────────────────────────┐
│  Metadata Studio                         │
│                                          │
│  ❌ Direct dependency on Kernel RBAC    │
│  ❌ Violates LEGO architecture          │
│  ❌ Tightly coupled to Kernel            │
└──────────────────────────────────────────┘
```

**Verdict:** ❌ Avoid this to maintain true LEGO modularity.

---

### 5.3 Recommended Implementation

**Step 1: Add user context schema**

```typescript
// metadata-studio/schemas/user-context.schema.ts
import { z } from 'zod';

export const UserContextSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  sessionId: z.string().optional(),
});

export type UserContext = z.infer<typeof UserContextSchema>;
```

**Step 2: Add context middleware**

```typescript
// metadata-studio/middleware/context.middleware.ts
export async function contextMiddleware(c: Context, next: Next) {
  const userContext = extractUserContext(c.req.headers);
  
  if (!userContext) {
    return c.json({ error: 'Missing user context' }, 401);
  }
  
  c.set('userContext', userContext);
  await next();
}
```

**Step 3: Update services to accept context**

```typescript
// metadata-studio/services/metadata.service.ts
export const metadataService = {
  async getById(
    id: string, 
    context: UserContext  // ← Add context parameter
  ): Promise<MetadataEntity | null> {
    // Enforce tenant isolation
    return await metadataRepo.findById(id, context.tenantId);
  }
}
```

**🔴 CRITICAL:** This is NOT implemented yet.

---

## 6. CODE POINTERS SUMMARY

### 6.1 ✅ Where Studio Exposes APIs (Provider Role)

| Component | Location | Purpose |
|-----------|----------|---------|
| HTTP Routes | `metadata-studio/api/*.routes.ts` | REST API for BFF/Apps |
| MCP Tools | `metadata-studio/mcp/tools/*.tools.ts` | AI Agent integration |
| MCP Manifest | `metadata-studio/mcp/metadata-studio.mcp.json` | Tool registry |
| Service Layer | `metadata-studio/services/*.service.ts` | Business logic |
| Schemas | `metadata-studio/schemas/*.schema.ts` | Data contracts |

---

### 6.2 ⚠️ Where Studio SHOULD Consume Kernel Events (Consumer Role)

| Required Component | Expected Location | Status |
|-------------------|------------------|--------|
| Event Subscriber | `metadata-studio/adapters/kernel-event-subscriber.ts` | ❌ NOT EXISTS |
| Event Mapping | `metadata-studio/adapters/event-mapper.ts` | ❌ NOT EXISTS |
| MetadataBag Reader | `metadata-studio/adapters/kernel-metadata-reader.ts` | ❌ NOT EXISTS |
| Queue Consumer | `metadata-studio/adapters/event-queue-consumer.ts` | ❌ NOT EXISTS |

**🔴 CRITICAL:** Consumer infrastructure is MISSING.

---

### 6.3 ✅ Where Kernel Emits Events (Source)

| Component | Location | Events Emitted |
|-----------|----------|----------------|
| Finance Events | `packages/kernel-finance/src/events/finance-events.ts` | `GL.JOURNAL_POSTED`, `FX.REVALUATION_RUN`, `PERIOD.CLOSED` |
| Event Publisher Port | `packages/kernel-finance/src/domain/gl/ports.ts` | `FinanceEventPublisher` interface |
| PostingService | `packages/kernel-finance/src/domain/gl/posting.service.impl.ts` | Emits on journal post |
| MetadataBag Hook | `packages/kernel-finance/src/core/types.ts` | Available on all entities |

---

## 7. AUDIT FINDINGS & RECOMMENDATIONS

### 7.1 Findings Summary

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| F1 | Provider role fully implemented (HTTP + MCP) | ✅ OK | PASS |
| F2 | Consumer role infrastructure exists but not wired to Kernel | ⚠️ HIGH | FAIL |
| F3 | No raw transactional data ingestion | ✅ OK | PASS |
| F4 | No heavy ingestion workloads | ✅ OK | PASS |
| F5 | RBAC/ABAC not implemented | 🔴 CRITICAL | FAIL |
| F6 | Service hierarchy partially implemented | ⚠️ MEDIUM | PARTIAL |
| F7 | Kernel event subscription missing | 🔴 CRITICAL | FAIL |
| F8 | MetadataBag integration missing | ⚠️ HIGH | FAIL |

---

### 7.2 Recommendations

#### 🔴 Priority 1: Critical (Block Production)

1. **Implement Kernel Event Subscription**
   - Create `adapters/kernel-event-subscriber.ts`
   - Subscribe to `GL.JOURNAL_POSTED`, `FX.REVALUATION_RUN`
   - Map Finance events → Metadata updates
   - **Impact:** Studio cannot track lineage without this

2. **Implement RBAC/ABAC at BFF Layer**
   - Add user context middleware
   - Enforce tenant isolation
   - Add deny-by-default authorization
   - **Impact:** Security vulnerability without this

3. **Add MetadataBag Integration**
   - Read Kernel entity metadata
   - Write governance tags back to Kernel
   - **Impact:** Breaks governance loop

---

#### ⚠️ Priority 2: High (Should Have)

4. **Reorganize Services by Domain**
   - Group services into modules
   - Add service registry pattern
   - **Impact:** Code maintainability

5. **Add Integration Tests**
   - Test Kernel event consumption
   - Test RBAC enforcement
   - Test lineage accuracy
   - **Impact:** Quality assurance

---

#### 📝 Priority 3: Medium (Nice to Have)

6. **Enhanced Observability**
   - Add distributed tracing
   - Add event audit log
   - **Impact:** Debugging ease

7. **API Documentation**
   - OpenAPI spec for HTTP routes
   - MCP tool documentation
   - **Impact:** Developer experience

---

## 8. CONCLUSION

### 8.1 Audit Verdict

**OVERALL STATUS:** ⚠️ **CONDITIONAL APPROVAL WITH CRITICAL GAPS**

The Metadata Studio package demonstrates:
- ✅ **Solid hexagonal architecture**
- ✅ **Clean LEGO-style isolation**
- ✅ **Excellent provider role implementation**
- ⚠️ **Missing consumer role wiring**
- 🔴 **No RBAC enforcement**

### 8.2 Production Readiness

**Current State:** 🔴 **NOT PRODUCTION READY**

**Required for Production:**
1. ✅ Implement Kernel event subscription (F7)
2. ✅ Implement RBAC enforcement (F5)
3. ✅ Implement MetadataBag integration (F8)
4. ✅ Add comprehensive integration tests
5. ✅ Add monitoring/alerting

**Timeline Estimate:** 2-3 weeks of focused development

### 8.3 Next Audit Focus

Once critical gaps are addressed, next audit should cover:
- **Audit #002:** Data Quality & Profiling Strategy
- **Audit #003:** Lineage Accuracy & Coverage
- **Audit #004:** Performance & Scalability
- **Audit #005:** Security & Compliance (GDPR, SOX)

---

**Audit Completed By:** Next.js Validation Agent  
**Date:** December 1, 2025  
**Next Review:** After critical gaps are remediated  
**Audit ID:** METADATA-STUDIO-AUDIT-001

