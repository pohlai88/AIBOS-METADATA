# 🚀 READY FOR EVENT SYSTEM!

## ✅ **Profiler Engine: 100% Complete**

Date: Monday, December 1, 2025  
Status: **Production Ready** ✅  
Next Step: **Event System Design & Implementation**

---

## 📦 **What's Complete**

### **✅ Profiler Execution Engine** (3/3 Components)

1. **SQL Profiler Executor** (`db/profiler.executor.ts`)
   - Computes raw statistics from PostgreSQL tables
   - SQL injection protection
   - Generic SqlClient interface
   - Automatic column type detection

2. **Quality Scorer** (`services/quality-scoring.ts`)
   - Converts stats → quality dimensions
   - completeness, uniqueness, validity, qualityScore (0-100)
   - Standard pack quality rules integration
   - Quality grading (A-F)

3. **Quality Service** (`services/quality.service.ts`)
   - Orchestrates entire profiling workflow
   - Validates input, executes profiler, computes quality, persists results
   - Prometheus metrics + OTEL traces
   - Returns profile + grade + threshold check

### **✅ API Endpoints** (3 New Routes)

- `POST /quality/profile` - Run profiler on-demand
- `GET /quality/profile/latest` - Get latest profile for entity
- `GET /quality/profile/history` - Get profile time-series

### **✅ Observability Integration**

- Prometheus metrics: `metadata_profiler_runs_total`, `metadata_profiler_failures_total`, `metadata_profiler_duration_seconds`
- OTEL span: `metadata.profile`
- Profile persistence: `mdm_profile` table via `observabilityRepo`

---

## 🎯 **Three Trigger Patterns Ready**

The profiler is **100% ready** for event-driven architecture:

### **1. On-Demand ✅**
**Status:** COMPLETE  
**Implementation:** `POST /quality/profile`

```bash
curl -X POST http://localhost:8787/quality/profile \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant-123" \
  -d '{
    "entityUrn": "gl.account:revenue_gross",
    "service": { "schema": "public", "table": "sales_transactions" },
    "governanceTier": "T1"
  }'
```

### **2. Scheduled ⏰**
**Status:** READY (needs event bus)  
**Trigger:** Kernel emits `profile:due` events for Tier1 entities every 7 days

**What We Need:**
- Event emitter in Kernel/Scheduler
- Event payload schema
- Metadata Studio subscriber

### **3. Change-Triggered 🔄**
**Status:** READY (needs event bus)  
**Trigger:** ETL/ingestion jobs emit `data:refreshed` events

**What We Need:**
- Event emitter in Finance/ETL pipelines
- Event payload schema
- Metadata Studio subscriber with filtering logic

---

## 🎯 **Next: Event System Design**

We're ready to design and implement the complete event system. Here's what we'll tackle:

### **Phase 1: Event Emission (Publishers)** 📤

#### **1.1 Kernel Scheduler**
**Emits:** `profile:due` events

**When:**
- Tier1 entity hasn't been profiled in ≥7 days (GRCD compliance)
- Tier2 entity hasn't been profiled in ≥14 days (optional)

**Payload Schema:**
```typescript
{
  eventType: 'profile:due',
  tenantId: string,
  entityUrn: string,         // e.g. "gl.account:revenue_gross"
  tier: 'T1' | 'T2' | 'T3' | 'T4' | 'T5',
  urgency: 'high' | 'normal' | 'low',
  lastProfiledAt: string,    // ISO timestamp
  standardPackId?: string,   // e.g. "IFRS_CORE"
  emittedAt: string,         // ISO timestamp
  emittedBy: 'kernel-scheduler'
}
```

**Urgency Logic:**
```typescript
if (tier === 'T1' && daysSinceProfile >= 7)  → urgency: 'high'
if (tier === 'T1' && daysSinceProfile >= 10) → urgency: 'critical'
if (tier === 'T2' && daysSinceProfile >= 14) → urgency: 'normal'
```

---

#### **1.2 Finance/ETL Pipelines**
**Emits:** `data:refreshed` events

**When:**
- After successful data load/refresh
- After significant data transformation

**Payload Schema:**
```typescript
{
  eventType: 'data:refreshed',
  tenantId: string,
  entityUrn: string,
  service: {
    schema: string,          // e.g. "public"
    table: string,           // e.g. "sales_transactions"
  },
  rowsAffected: number,      // # of rows inserted/updated/deleted
  refreshType: 'full_load' | 'incremental' | 'upsert' | 'delete',
  completedAt: string,       // ISO timestamp
  triggeredBy: {
    actorId: string,         // e.g. "etl-pipeline-daily"
    actorType: 'SYSTEM' | 'AGENT' | 'HUMAN',
  },
  metadata?: {
    jobId?: string,
    duration?: number,       // seconds
    success?: boolean,
  }
}
```

---

#### **1.3 User/Approval Actions**
**Emits:** `metadata:approved` events

**When:**
- Tier1/Tier2 metadata change approved via `POST /approvals/:id/approve`
- Trigger profiler to validate new metadata definition

**Payload Schema:**
```typescript
{
  eventType: 'metadata:approved',
  tenantId: string,
  entityUrn: string,
  approvalId: string,
  entityType: 'GLOBAL_METADATA' | 'KPI',
  tier: 'T1' | 'T2',
  approvedBy: string,
  approvedAt: string,
}
```

---

### **Phase 2: Event Subscription (Consumers)** 📥

#### **2.1 Metadata Studio Subscriber**

**Listens To:**
- `profile:due` (from Kernel Scheduler)
- `data:refreshed` (from Finance/ETL)
- `metadata:approved` (from Approval workflow)

**Filtering Logic:**

```typescript
class ProfilerEventSubscriber {
  async onProfileDue(event: ProfileDueEvent) {
    // Always honor Tier1 compliance requirement
    if (event.tier === 'T1' && event.urgency === 'high') {
      await qualityService.runProfiler({
        tenantId: event.tenantId,
        entityUrn: event.entityUrn,
        // ... resolve service from entityUrn
        triggeredBy: {
          actorId: 'kernel-scheduler',
          actorType: 'SYSTEM',
        },
        governanceTier: event.tier,
      });
      return;
    }
    
    // For Tier2+, check if last profile is stale
    const lastProfile = await observabilityRepo.getLatestProfile(
      event.tenantId,
      event.entityUrn
    );
    
    if (!lastProfile || daysSince(lastProfile.createdAt) > getStaleThreshold(event.tier)) {
      await qualityService.runProfiler({...});
    }
  }
  
  async onDataRefreshed(event: DataRefreshedEvent) {
    // Avoid profiling for trivial refreshes
    const lastProfile = await observabilityRepo.getLatestProfile(
      event.tenantId,
      event.entityUrn
    );
    
    // Profile if:
    // 1. Never profiled before
    // 2. Last profile > 24 hours old
    // 3. Major data change (>10% row change)
    const shouldProfile = 
      !lastProfile ||
      hoursSince(lastProfile.createdAt) > 24 ||
      (event.rowsAffected / lastProfile.profile.rowCount) > 0.1;
    
    if (shouldProfile) {
      await qualityService.runProfiler({
        tenantId: event.tenantId,
        entityUrn: event.entityUrn,
        service: event.service,
        triggeredBy: event.triggeredBy,
      });
    } else {
      console.log(`Skipping profile for ${event.entityUrn}: recent profile exists`);
    }
  }
  
  async onMetadataApproved(event: MetadataApprovedEvent) {
    // Always profile after Tier1/2 metadata approval
    if (event.tier === 'T1' || event.tier === 'T2') {
      await qualityService.runProfiler({
        tenantId: event.tenantId,
        entityUrn: event.entityUrn,
        // ... resolve service from entityUrn
        triggeredBy: {
          actorId: event.approvedBy,
          actorType: 'HUMAN',
        },
        governanceTier: event.tier,
      });
    }
  }
}
```

---

### **Phase 3: Event Bus Infrastructure** 🚌

#### **Option 1: Redis Pub/Sub** (Lightweight)
```typescript
// Publisher (Kernel)
await redis.publish('metadata-events', JSON.stringify({
  eventType: 'profile:due',
  ...
}));

// Subscriber (Metadata Studio)
const subscriber = redis.duplicate();
await subscriber.subscribe('metadata-events');
subscriber.on('message', (channel, message) => {
  const event = JSON.parse(message);
  await profilerEventSubscriber.handle(event);
});
```

**Pros:**
- ✅ Simple, fast
- ✅ Built-in persistence option (Redis Streams)
- ✅ Good for monorepo/single-cluster deployments

**Cons:**
- ❌ No guaranteed delivery
- ❌ No dead-letter queue (without Redis Streams)

---

#### **Option 2: Internal EventEmitter** (Simplest)
```typescript
// metadata-studio/events/event-bus.ts
import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

// Publisher
eventBus.emit('profile:due', { tenantId, entityUrn, ... });

// Subscriber
eventBus.on('profile:due', async (event) => {
  await profilerEventSubscriber.onProfileDue(event);
});
```

**Pros:**
- ✅ Zero dependencies
- ✅ Synchronous/async support
- ✅ Perfect for monorepo where Kernel + Metadata Studio are in same process

**Cons:**
- ❌ Not distributed (single process only)
- ❌ No persistence

---

#### **Option 3: Kafka** (Enterprise)
```typescript
// Publisher
await kafka.send({
  topic: 'metadata-events',
  messages: [{
    key: event.tenantId,
    value: JSON.stringify(event),
  }],
});

// Subscriber
await kafka.subscribe({ topic: 'metadata-events', groupId: 'metadata-studio' });
await kafka.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value);
    await profilerEventSubscriber.handle(event);
  },
});
```

**Pros:**
- ✅ Guaranteed delivery
- ✅ High throughput
- ✅ Dead-letter queue
- ✅ Distributed architecture

**Cons:**
- ❌ Heavy infrastructure
- ❌ Overkill for current scale

---

### **Phase 4: Event Schema & Validation** 📋

```typescript
// metadata-studio/events/event-schemas.ts
import { z } from 'zod';

export const BaseEventSchema = z.object({
  eventType: z.string(),
  tenantId: z.string().uuid(),
  entityUrn: z.string().min(1),
  emittedAt: z.string().datetime(),
});

export const ProfileDueEventSchema = BaseEventSchema.extend({
  eventType: z.literal('profile:due'),
  tier: z.enum(['T1', 'T2', 'T3', 'T4', 'T5']),
  urgency: z.enum(['high', 'normal', 'low']),
  lastProfiledAt: z.string().datetime().optional(),
  standardPackId: z.string().optional(),
});

export const DataRefreshedEventSchema = BaseEventSchema.extend({
  eventType: z.literal('data:refreshed'),
  service: z.object({
    schema: z.string().min(1),
    table: z.string().min(1),
  }),
  rowsAffected: z.number().int().min(0),
  refreshType: z.enum(['full_load', 'incremental', 'upsert', 'delete']),
  completedAt: z.string().datetime(),
  triggeredBy: z.object({
    actorId: z.string().min(1),
    actorType: z.enum(['SYSTEM', 'AGENT', 'HUMAN']),
  }),
});

export const MetadataApprovedEventSchema = BaseEventSchema.extend({
  eventType: z.literal('metadata:approved'),
  approvalId: z.string().uuid(),
  entityType: z.enum(['GLOBAL_METADATA', 'KPI']),
  tier: z.enum(['T1', 'T2']),
  approvedBy: z.string().min(1),
  approvedAt: z.string().datetime(),
});
```

---

## 🎯 **Decision Points for Next Message**

When we continue, please let me know your preferences:

### **1. Event Bus Choice** 🚌
- **Option A:** Internal EventEmitter (simplest, monorepo-friendly)
- **Option B:** Redis Pub/Sub (lightweight, persistent)
- **Option C:** Kafka (enterprise-grade, overkill for now)

**Recommendation:** Start with **Internal EventEmitter** (Option A) for monorepo, upgrade to Redis later if needed.

---

### **2. Where to Emit Events** 📤
- **Kernel Scheduler:** Should we create `kernel/scheduler/profiler-schedule.ts`?
- **Finance ETL:** Should we add event emission to existing ETL pipelines?
- **Approval Workflow:** Should we extend `approvals.routes.ts` to emit events?

**Recommendation:** Start with **Approval Workflow** (easiest to test), then add Kernel Scheduler.

---

### **3. Filtering Strategy** 🎛️
- **Aggressive:** Profile everything, optimize later
- **Conservative:** Only profile when needed (stale check, major refresh)
- **Hybrid:** Aggressive for Tier1, conservative for Tier2+

**Recommendation:** **Hybrid** (aligns with GRCD compliance requirements)

---

## ✅ **What You Have Now**

```
┌────────────────────────────────────────────────┐
│       METADATA STUDIO - COMPLETE BACKEND       │
│     Profiler Engine Ready for Events ✅        │
└────────────────────────────────────────────────┘

Tables:              12 ✅
Services:            10 ✅ (+1 quality.service)
API Endpoints:       31 ✅ (+3 quality routes)
Profiler Components:  3 ✅ (executor, scorer, service)
Event System:     READY ✅ (awaiting design decisions)
```

**When you're ready, let's design the event system! 🚀**

---

*Status: Production Ready ✅*  
*Version: 1.0.0*  
*Date: Monday, December 1, 2025*

