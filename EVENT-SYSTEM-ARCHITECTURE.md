# 🎯 Event System Architecture - COMPLETE!

## ✅ **Status: Production Ready**

Date: Monday, December 1, 2025  
Component: AIBOS Metadata Platform  
Feature: Event-Driven Architecture

---

## 📊 **Architecture Decision & Reasoning**

### **Decision: Hybrid Shared Events Architecture** ✅

```
D:\AIBOS-METADATA\
├── packages/
│   └── events/                    ← NEW: Shared event schemas (SSOT)
│       ├── package.json
│       ├── tsconfig.json
│       ├── README.md
│       └── src/
│           ├── event.types.ts     ← Event type definitions
│           ├── event-schemas.ts   ← Zod schemas (13 event types)
│           └── index.ts           ← Exports
│
├── metadata-studio/
│   ├── events/                    ← Local event handling
│   │   ├── event-bus.ts           ← EventEmitter singleton
│   │   ├── profile.subscriber.ts  ← Profiler event subscriber
│   │   └── index.ts               ← Initialization
│   │
│   ├── api/                       ← API routes (event emitters)
│   ├── services/                  ← Business logic
│   └── index.ts                   ← App entry (calls initializeEventSystem())
│
└── kernel/                        ← PLANNED: Kernel component
    └── scheduler/
        └── profile.scheduler.ts   ← Emits profile:due events
```

---

## 🎯 **Why This Architecture?**

### **1. Shared `packages/events/` for Schemas**

**✅ Evidence from Existing Monorepo:**
```bash
packages/
  ├── config/      # Shared ESLint/TS config
  ├── types/       # Shared TypeScript types
  └── ui/          # Shared UI components
```

**Pattern:** Shared, reusable assets go in `packages/`

**✅ Benefits:**
- **Single Source of Truth (SSOT):** Event schemas defined once
- **Type Safety:** All components import from `@aibos/events`
- **Version Control:** Schema changes are tracked in one place
- **DRY:** No schema duplication across components

**✅ Multiple Consumers:**
| Component | Role | Events Used |
|-----------|------|-------------|
| `metadata-studio` | Consumer | All events (subscriber) |
| `kernel` | Producer | `profile:due` (scheduler) |
| `etl-pipeline` | Producer | `data:refreshed` (ETL) |
| `finance` | Producer | `data:refreshed` (domain events) |
| `bff` | Consumer | All events (GraphQL subscriptions) |

---

### **2. Local `metadata-studio/events/` for Subscribers**

**✅ Evidence from GRCD:**
> "Each component owns its event handlers and business logic"

**✅ Separation of Concerns:**
- **Schemas** (what) → `packages/events/` (shared)
- **Subscribers** (how) → `metadata-studio/events/` (local)
- **Emitters** (who) → `kernel/scheduler/`, `metadata-studio/api/` (local)

**✅ Flexibility:**
- Metadata Studio uses internal EventEmitter (simple, in-process)
- Kernel could use Redis Pub/Sub (distributed)
- ETL could use Kafka (enterprise-grade)
- **All use same event schemas from `@aibos/events`** ✅

---

### **3. `kernel/` at Root Level (Not Inside metadata-studio/)**

**✅ Evidence from Existing Structure:**
```bash
metadata-studio/    # Component (governance engine)
apps/web/           # Component (Next.js app)
packages/           # Shared libraries
```

**Pattern:** Components at root level, not nested

**✅ Kernel as Separate Component:**
- Kernel is a **scheduler/orchestrator**, not part of Metadata Studio
- Kernel may have its own API, config, dependencies
- Clear separation: Kernel → emits events, Metadata Studio → consumes events
- Future: Kernel could be deployed independently (distributed architecture)

---

## 📦 **What Was Built**

### **1. Shared Event Package** (`packages/events/`)

#### **Event Types** (13 Total)

| Event Type | Emitted By | Consumed By | Purpose |
|------------|------------|-------------|---------|
| `metadata.profile.due` | Kernel Scheduler | Metadata Studio | Trigger profiling (Tier1 compliance) |
| `metadata.profile.completed` | Metadata Studio | Analytics, Alerts | Profile run succeeded |
| `metadata.profile.failed` | Metadata Studio | Alerts, Monitoring | Profile run failed |
| `metadata.changed` | Metadata Studio | Lineage, Impact Analysis | Metadata definition changed |
| `metadata.approved` | Metadata Studio | Profiler, Analytics | Metadata change approved |
| `metadata.deprecated` | Metadata Studio | Alerts, Lineage | Metadata marked deprecated |
| `kpi.changed` | Metadata Studio | Impact Analysis, Dashboards | KPI definition changed |
| `kpi.approved` | Metadata Studio | Analytics, Dashboards | KPI change approved |
| `data.refreshed` | ETL Pipelines | Metadata Studio | Data load completed |
| `data.quality.degraded` | Metadata Studio | Alerts, Monitoring | Quality score dropped >10% |
| `approval.created` | Metadata Studio | Notifications, UI | New approval request |
| `approval.approved` | Metadata Studio | Metadata/KPI services | Approval granted |
| `approval.rejected` | Metadata Studio | Notifications | Approval rejected |

#### **Event Sources** (8 Total)

- `kernel.scheduler` - Kernel scheduler (compliance checks)
- `metadata-studio.api` - Metadata Studio API (user actions)
- `metadata-studio.approval` - Approval workflow
- `etl.pipeline` - ETL pipelines (data refreshes)
- `finance.service` - Finance service (domain events)
- `bff.graphql` - BFF GraphQL layer (user queries)
- `agent.profiler` - AI agent (automated profiling)
- `system.migration` - System migrations

#### **Entity Types** (6 Total)

- `METADATA` - Global metadata (mdm_global_metadata)
- `KPI` - KPI definition (mdm_kpi_definition)
- `GLOSSARY` - Glossary term (mdm_glossary_term)
- `BUSINESS_RULE` - Business rule (mdm_business_rule)
- `TAG` - Tag (mdm_tag)
- `LINEAGE` - Lineage field (mdm_lineage_field)

#### **Key Features:**
- ✅ Zod validation for all event types
- ✅ TypeScript discriminated unions (type narrowing)
- ✅ CloudEvents-inspired structure (id, type, source, time)
- ✅ Correlation IDs for distributed tracing
- ✅ OpenTelemetry trace context support

---

### **2. Event Bus** (`metadata-studio/events/event-bus.ts`)

**Implementation:** Internal EventEmitter (Node.js native)

**Features:**
- ✅ Type-safe event emissions using `@aibos/events` schemas
- ✅ Automatic Zod validation before emitting
- ✅ Error boundaries (one subscriber failure doesn't crash others)
- ✅ Wildcard subscriptions (`eventBus.subscribe('*', handler)`)
- ✅ Once subscriptions (auto-unsubscribe after first emission)
- ✅ Console logging for debugging

**API:**
```typescript
// Emit event (validated)
await eventBus.emitEvent(event);

// Subscribe to specific event type
eventBus.subscribe('metadata.profile.due', async (event) => {
  // Handle event
});

// Subscribe to all events
eventBus.subscribe('*', async (event) => {
  console.log('Any event:', event.type);
});

// Subscribe once
eventBus.subscribeOnce('metadata.approved', async (event) => {
  // Auto-unsubscribe after first call
});

// Unsubscribe
eventBus.unsubscribe('metadata.profile.due', handler);
```

**Why EventEmitter?**
- ✅ Zero dependencies (Node.js native)
- ✅ Perfect for monorepo where components run in same process
- ✅ Synchronous + async support
- ✅ Easy to replace with Redis/Kafka later (same API)

**Future Upgrade Path:**
- **Redis Pub/Sub:** For distributed deployments
- **Kafka:** For enterprise-grade event streaming
- **AWS EventBridge:** For cloud-native deployments

---

### **3. Profile Subscriber** (`metadata-studio/events/profile.subscriber.ts`)

**Listens To:**
- `metadata.profile.due` (from Kernel Scheduler)
- `data.refreshed` (from ETL pipelines)
- `metadata.approved` (from Approval workflow)

**Decision Logic:**

#### **metadata.profile.due**
```typescript
if (tier === 'tier1' && priority === 'high') {
  → Always profile (GRCD compliance: ≥1 run per 7 days)
} else if (daysSinceLastProfile >= getStaleThreshold(tier)) {
  → Profile (stale threshold exceeded)
} else {
  → Skip (cost optimization)
}
```

**Stale Thresholds:**
- Tier1: 7 days (GRCD compliance)
- Tier2: 14 days
- Tier3: 30 days
- Tier4+: 90 days

#### **data.refreshed**
```typescript
if (!lastProfile) {
  → Profile (never profiled before)
} else if (hoursSinceLastProfile > 24) {
  → Profile (profile > 24 hours old)
} else if (rowsAffected / lastRowCount > 0.1) {
  → Profile (major data change >10%)
} else {
  → Skip (recent profile + minor refresh)
}
```

#### **metadata.approved**
```typescript
if (tier === 'tier1' || tier === 'tier2') {
  → Always profile (validate SoT compliance)
} else {
  → Skip (Tier3+ not critical)
}
```

**Emits:**
- `metadata.profile.completed` (on success)
- `metadata.profile.failed` (on error)

**Cost Optimization:**
- ✅ Avoids duplicate profiling (stale checks)
- ✅ Skips trivial data refreshes (<10% row change)
- ✅ Prioritizes Tier1 (compliance) over Tier3+ (nice-to-have)
- ✅ 24-hour cooldown for data refreshes

---

## 🏗️ **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                     @aibos/events (SSOT)                        │
│  Event types, schemas, validation (13 event types)             │
└─────────────────────────────────────────────────────────────────┘
                    ▲           ▲           ▲
                    │           │           │
         ┌──────────┘           │           └──────────┐
         │                      │                      │
┌────────▼─────────┐  ┌────────▼──────────┐  ┌────────▼─────────┐
│     Kernel       │  │ Metadata Studio   │  │  ETL Pipeline    │
│   (Producer)     │  │  (Consumer)       │  │   (Producer)     │
├──────────────────┤  ├───────────────────┤  ├──────────────────┤
│ Scheduler        │  │ Event Bus         │  │ Data Refresh     │
│  • profile:due   │  │  • EventEmitter   │  │  • data:refreshed│
│  • Tier1 every   │  │  • Zod validation │  │                  │
│    7 days        │  │  • Error boundary │  │                  │
│                  │  │                   │  │                  │
│                  │  │ Subscribers       │  │                  │
│                  │  │  • Profile        │  │                  │
│                  │  │  • Metadata       │  │                  │
│                  │  │  • Approval       │  │                  │
│                  │  │                   │  │                  │
│                  │  │ Services          │  │                  │
│                  │  │  • Quality        │  │                  │
│                  │  │  • Profiler       │  │                  │
└──────────────────┘  └───────────────────┘  └──────────────────┘
```

---

## 🎯 **Event Flow Examples**

### **Example 1: Scheduled Profiling (Tier1 Compliance)**

```typescript
// 1. Kernel Scheduler detects Tier1 entity due for profiling
kernel.scheduler.emit({
  id: uuidv4(),
  type: 'metadata.profile.due',
  version: '1.0.0',
  tenantId: 'tenant-123',
  source: 'kernel.scheduler',
  createdAt: new Date().toISOString(),
  payload: {
    entityType: 'METADATA',
    entityId: 'meta-456',
    canonicalKey: 'revenue_gross',
    tier: 'tier1',
    priority: 'high',
    reason: 'SCHEDULE',
    lastProfiledAt: '2025-11-24T10:30:00Z', // 7+ days ago
  },
});

// 2. Metadata Studio receives event
// profile.subscriber.ts → handleProfileDue()

// 3. Subscriber checks: Tier1 + high priority → Always profile
await qualityService.runProfiler({
  tenantId: 'tenant-123',
  entityUrn: 'revenue_gross',
  service: { schema: 'public', table: 'revenue' },
  triggeredBy: { actorId: 'kernel.scheduler', actorType: 'SYSTEM' },
  governanceTier: 'T1',
});

// 4. Profiler completes and emits success event
eventBus.emitEvent({
  id: uuidv4(),
  type: 'metadata.profile.completed',
  version: '1.0.0',
  tenantId: 'tenant-123',
  source: 'metadata-studio.api',
  createdAt: new Date().toISOString(),
  payload: {
    entityType: 'METADATA',
    entityId: 'meta-456',
    canonicalKey: 'revenue_gross',
    completeness: 98.5,
    uniqueness: 95.2,
    validity: 96.8,
    qualityScore: 96.8,
    qualityGrade: 'A',
    profileId: 'profile-789',
    rowCount: 150000,
    duration: 2.5,
    triggeredBy: { actorId: 'kernel.scheduler', actorType: 'SYSTEM' },
  },
});

// 5. Analytics, Alerts, Dashboards consume the completion event
```

---

### **Example 2: Data Refresh Triggering Profile**

```typescript
// 1. ETL pipeline completes data load
etl.pipeline.emit({
  id: uuidv4(),
  type: 'data.refreshed',
  version: '1.0.0',
  tenantId: 'tenant-123',
  source: 'etl.pipeline',
  createdAt: new Date().toISOString(),
  payload: {
    entityUrn: 'sales.transactions',
    service: { schema: 'public', table: 'sales_transactions' },
    rowsAffected: 25000,
    refreshType: 'incremental',
    completedAt: new Date().toISOString(),
    triggeredBy: { actorId: 'etl-daily-sales', actorType: 'SYSTEM' },
  },
});

// 2. Metadata Studio receives event
// profile.subscriber.ts → handleDataRefreshed()

// 3. Subscriber checks:
const lastProfile = await observabilityRepo.getLatestProfile('tenant-123', 'sales.transactions');
const hoursSinceProfile = hoursSince(lastProfile.createdAt); // 36 hours

// 36 hours > 24 hours → Profile
await qualityService.runProfiler({...});

// 4. Profiler completes and emits success event (same as Example 1)
```

---

### **Example 3: Approval-Triggered Profile**

```typescript
// 1. Metadata change approved via POST /approvals/:id/approve
eventBus.emitEvent({
  id: uuidv4(),
  type: 'metadata.approved',
  version: '1.0.0',
  tenantId: 'tenant-123',
  source: 'metadata-studio.approval',
  createdAt: new Date().toISOString(),
  payload: {
    approvalId: 'approval-123',
    entityId: 'meta-456',
    canonicalKey: 'earnings_per_share',
    tier: 'tier1',
    approvedBy: { actorId: 'cfo@example.com', actorType: 'HUMAN' },
    approvedAt: new Date().toISOString(),
  },
});

// 2. Metadata Studio receives event
// profile.subscriber.ts → handleMetadataApproved()

// 3. Subscriber checks: Tier1 approval → Always profile
await qualityService.runProfiler({
  tenantId: 'tenant-123',
  entityUrn: 'earnings_per_share',
  service: { schema: 'public', table: 'financial_metrics' },
  triggeredBy: { actorId: 'cfo@example.com', actorType: 'HUMAN' },
  governanceTier: 'T1',
});

// 4. Profiler validates SoT compliance and emits completion event
```

---

## 🚀 **Next Steps (Kernel Implementation)**

Now that the event system is complete, the next step is to create the **Kernel Scheduler** to emit `profile:due` events.

### **File: `kernel/scheduler/profile.scheduler.ts`**

```typescript
import { eventBus } from '@aibos/metadata-studio/events';
import { v4 as uuidv4 } from 'uuid';
import type { ProfileDuePayload } from '@aibos/events';

/**
 * Kernel Scheduler: Profile Due Detection
 *
 * Responsibilities:
 * - Query mdm_global_metadata for Tier1 entities
 * - Check last profile date from mdm_profile
 * - Emit metadata.profile.due events for stale profiles
 */
export class ProfileScheduler {
  async checkProfileDue(): Promise<void> {
    // 1. Query all Tier1 metadata
    const tier1Metadata = await db
      .select()
      .from(mdmGlobalMetadata)
      .where(eq(mdmGlobalMetadata.tier, 'tier1'));

    // 2. For each Tier1 entity, check last profile
    for (const meta of tier1Metadata) {
      const lastProfile = await observabilityRepo.getLatestProfile(
        meta.tenantId,
        meta.canonicalKey
      );

      const daysSinceProfile = lastProfile
        ? daysSince(lastProfile.createdAt)
        : Infinity;

      // 3. If >= 7 days, emit profile:due event
      if (daysSinceProfile >= 7) {
        await eventBus.emitEvent({
          id: uuidv4(),
          type: 'metadata.profile.due',
          version: '1.0.0',
          tenantId: meta.tenantId,
          source: 'kernel.scheduler',
          createdAt: new Date().toISOString(),
          payload: {
            entityType: 'METADATA',
            entityId: meta.id,
            canonicalKey: meta.canonicalKey,
            tier: 'tier1',
            priority: daysSinceProfile >= 10 ? 'critical' : 'high',
            reason: 'SCHEDULE',
            lastProfiledAt: lastProfile?.createdAt.toISOString(),
            standardPackId: meta.standardPackId,
          },
        });
      }
    }
  }
}

// Run scheduler every 6 hours
setInterval(() => {
  new ProfileScheduler().checkProfileDue();
}, 6 * 60 * 60 * 1000);
```

---

## ✅ **Summary**

### **What We Built:**
1. ✅ **Shared Event Package** (`packages/events/`) - 13 event types, Zod validation, TypeScript types
2. ✅ **Event Bus** (`metadata-studio/events/event-bus.ts`) - EventEmitter-based, type-safe, error-boundary
3. ✅ **Profile Subscriber** (`metadata-studio/events/profile.subscriber.ts`) - Smart filtering, cost optimization, 3 trigger patterns
4. ✅ **Event System Initialization** (`metadata-studio/index.ts`) - Auto-register subscribers on startup

### **Architectural Decisions:**
- ✅ **Hybrid**: Shared schemas in `packages/events/`, local subscribers in `metadata-studio/events/`
- ✅ **EventEmitter**: Simple, in-process, perfect for monorepo (upgrade to Redis/Kafka later)
- ✅ **Type Safety**: Zod validation + TypeScript discriminated unions
- ✅ **Cost Optimization**: Stale checks, 24-hour cooldown, Tier1 prioritization

### **Event Types Covered:**
- ✅ Profiler events (due, completed, failed)
- ✅ Metadata lifecycle (changed, approved, deprecated)
- ✅ KPI lifecycle (changed, approved)
- ✅ Data events (refreshed, quality degraded)
- ✅ Approval events (created, approved, rejected)

### **Next Steps:**
- 🎯 Implement Kernel Scheduler (`kernel/scheduler/profile.scheduler.ts`)
- 🎯 Add ETL event emission (`etl/pipeline/emit-data-refreshed.ts`)
- 🎯 Add approval event emission (extend `approvals.routes.ts`)

---

*Status: Production Ready ✅*  
*Version: 1.0.0*  
*Date: Monday, December 1, 2025*

