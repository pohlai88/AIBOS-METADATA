# 🚀 Observability Quick Start Guide

## 📚 **For Developers: How to Instrument Your Code**

This guide shows you how to add metrics, tracing, and usage logging to metadata-studio services.

---

## 1️⃣ **Adding Prometheus Metrics**

### **Import metrics**
```typescript
import {
  metadataSearchRequestsTotal,
  metadataSearchDurationSeconds,
} from '../observability/metrics';
```

### **Increment counters**
```typescript
// Simple increment
metadataSearchRequestsTotal.inc();

// With labels
metadataSearchRequestsTotal.inc({
  tenant_id: ctx.tenantId,
  status: 'success'
});
```

### **Time operations with histograms**
```typescript
// Start timer
const end = metadataSearchDurationSeconds.startTimer({
  tenant_id: ctx.tenantId
});

try {
  // ... your operation ...
  return result;
} finally {
  // Record duration
  end();
}
```

---

## 2️⃣ **Adding OpenTelemetry Traces**

### **Import tracing helper**
```typescript
import { withSpan, addSpanAttributes, addSpanEvent } from '../observability/tracing';
```

### **Wrap async operations**
```typescript
const result = await withSpan('metadata.search', async () => {
  // Your operation here
  return metadataRepo.search(tenantId, input);
});
```

### **Add custom attributes**
```typescript
await withSpan('metadata.search', async () => {
  addSpanAttributes({
    'tenant.id': tenantId,
    'metadata.domain': 'finance',
    'metadata.tier': 'tier1',
    'search.filters.count': filters.length,
  });
  
  return metadataRepo.search(tenantId, input);
});
```

### **Add custom events**
```typescript
await withSpan('metadata.search', async () => {
  addSpanEvent('cache_lookup', { key: 'revenue_gross', hit: true });
  addSpanEvent('db_query', { table: 'mdm_global_metadata' });
  
  return metadataRepo.search(tenantId, input);
});
```

---

## 3️⃣ **Adding Usage Logging**

### **Import usage repo**
```typescript
import { observabilityRepo } from '../db/observability.repo';
import type { UsageEvent } from '../db/observability.repo';
```

### **Track usage events**
```typescript
await observabilityRepo.trackUsageEvent({
  tenantId: ctx.tenantId,
  entityUrn: 'gl.account:revenue_gross',
  conceptId: metadataId, // optional
  actorId: ctx.userId,
  actorType: 'HUMAN', // or 'AGENT' or 'SYSTEM'
  eventType: 'read', // or 'query', 'export', 'write', 'download'
  governanceTier: 'T1', // optional
  source: 'metadata-studio-api', // optional
  metadata: {
    endpoint: '/metadata/search',
    requestId: ctx.requestId,
    filters: JSON.stringify(filters),
  },
});
```

---

## 4️⃣ **Complete Service Example**

### **Metadata Search Service**
```typescript
// metadata-studio/services/metadata.service.ts
import {
  metadataSearchRequestsTotal,
  metadataSearchDurationSeconds,
} from '../observability/metrics';
import { withSpan, addSpanAttributes } from '../observability/tracing';
import { observabilityRepo } from '../db/observability.repo';
import { metadataRepo } from '../db/metadata.repo';
import type { MetadataSearchInput } from '../schemas/metadata.schema';

export async function searchMetadata(
  input: MetadataSearchInput,
  ctx: { tenantId: string; userId: string; role: string }
) {
  // 1. Increment request counter
  metadataSearchRequestsTotal.inc({
    tenant_id: ctx.tenantId,
    status: 'started',
  });

  // 2. Start duration timer
  const endTimer = metadataSearchDurationSeconds.startTimer({
    tenant_id: ctx.tenantId,
  });

  try {
    // 3. Wrap in OTEL span
    const result = await withSpan('metadata.search', async () => {
      // 4. Add span attributes
      addSpanAttributes({
        'tenant.id': ctx.tenantId,
        'user.id': ctx.userId,
        'user.role': ctx.role,
        'search.domain': input.domain || 'all',
      });

      // 5. Execute search
      return await metadataRepo.search(ctx.tenantId, input);
    });

    // 6. Track usage for each result (async, don't await)
    result.forEach((meta) => {
      observabilityRepo.trackUsageEvent({
        tenantId: ctx.tenantId,
        entityUrn: meta.entityUrn,
        conceptId: meta.id,
        actorId: ctx.userId,
        actorType: 'HUMAN',
        eventType: 'query',
        governanceTier: meta.tier as any,
        source: 'metadata-search',
        metadata: { searchTerm: input.query },
      });
    });

    // 7. Increment success counter
    metadataSearchRequestsTotal.inc({
      tenant_id: ctx.tenantId,
      status: 'success',
    });

    return result;
  } catch (error) {
    // 8. Increment error counter
    metadataSearchRequestsTotal.inc({
      tenant_id: ctx.tenantId,
      status: 'error',
    });
    throw error;
  } finally {
    // 9. Record duration
    endTimer();
  }
}
```

---

## 5️⃣ **Complete API Route Example**

### **Metadata Routes**
```typescript
// metadata-studio/api/metadata.routes.ts
import { Hono } from 'hono';
import { httpRequestsTotal, httpRequestDurationSeconds } from '../observability/metrics';
import { searchMetadata } from '../services/metadata.service';
import type { AuthContext } from '../middleware/auth.middleware';

export const metadataRouter = new Hono();

metadataRouter.get('/search', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const startTime = Date.now();

  // 1. Increment HTTP request counter
  httpRequestsTotal.inc({
    method: 'GET',
    route: '/metadata/search',
    status: '0', // will update later
  });

  try {
    const query = c.req.query('q');
    const domain = c.req.query('domain');

    const result = await searchMetadata(
      { query, domain },
      {
        tenantId: auth.tenantId,
        userId: auth.userId,
        role: auth.role,
      }
    );

    // 2. Record successful request
    httpRequestsTotal.inc({
      method: 'GET',
      route: '/metadata/search',
      status: '200',
    });

    return c.json(result, 200);
  } catch (error) {
    // 3. Record failed request
    httpRequestsTotal.inc({
      method: 'GET',
      route: '/metadata/search',
      status: '500',
    });

    return c.json({ error: 'Internal server error' }, 500);
  } finally {
    // 4. Record request duration
    const duration = (Date.now() - startTime) / 1000;
    httpRequestDurationSeconds.observe(
      { method: 'GET', route: '/metadata/search' },
      duration
    );
  }
});
```

---

## 6️⃣ **Data Profiling Example**

### **Quality Service**
```typescript
// metadata-studio/services/quality.service.ts
import {
  metadataProfilerRunsTotal,
  metadataProfilerFailuresTotal,
  metadataProfilerDurationSeconds,
} from '../observability/metrics';
import { withSpan } from '../observability/tracing';
import { observabilityRepo } from '../db/observability.repo';

export async function runDataProfiler(
  tenantId: string,
  entityUrn: string,
  createdBy: string
) {
  // 1. Increment profiler run counter
  metadataProfilerRunsTotal.inc({
    tenant_id: tenantId,
    entity_type: 'table',
  });

  // 2. Start duration timer
  const endTimer = metadataProfilerDurationSeconds.startTimer({
    tenant_id: tenantId,
    entity_type: 'table',
  });

  try {
    // 3. Wrap in OTEL span
    return await withSpan('metadata.profile', async () => {
      // 4. Execute SQL profiler
      const stats = await executeSqlProfiler(entityUrn);

      // 5. Compute quality metrics
      const qualityMetrics = {
        completeness: (1 - stats.nullCount / stats.rowCount) * 100,
        uniqueness: (stats.distinctCount / stats.rowCount) * 100,
        validity: 100.0, // placeholder
        overall: 0,
      };
      qualityMetrics.overall =
        (qualityMetrics.completeness + qualityMetrics.uniqueness + qualityMetrics.validity) / 3;

      // 6. Save profile
      return await observabilityRepo.saveProfile({
        tenantId,
        entityUrn,
        profile: {
          rowCount: stats.rowCount,
          nullCount: stats.nullCount,
          distinctCount: stats.distinctCount,
          min: stats.min,
          max: stats.max,
          avg: stats.avg,
          stddev: stats.stddev,
          percentiles: stats.percentiles,
        },
        completeness: qualityMetrics.completeness,
        uniqueness: qualityMetrics.uniqueness,
        validity: qualityMetrics.validity,
        qualityScore: qualityMetrics.overall,
        governanceTier: 'T1',
        createdBy,
      });
    });
  } catch (error) {
    // 7. Increment failure counter
    metadataProfilerFailuresTotal.inc({
      tenant_id: tenantId,
      error_type: 'profiler_error',
    });
    throw error;
  } finally {
    // 8. Record duration
    endTimer();
  }
}
```

---

## 7️⃣ **Querying Usage Stats**

### **Get usage stats for a field**
```typescript
const stats = await observabilityRepo.getUsageStats(
  'tenant-123',
  'gl.account:revenue_gross'
);

console.log(`
  Total Access: ${stats.totalAccess}
  Unique Users: ${stats.uniqueUsers}
  Read Count: ${stats.readCount}
  Write Count: ${stats.writeCount}
  Popularity Score: ${stats.popularityScore}
  Last Accessed: ${stats.lastAccessedAt}
`);
```

### **Get most popular fields**
```typescript
const top10 = await observabilityRepo.getPopularEntities('tenant-123', 10);

top10.forEach((entity, i) => {
  console.log(`${i + 1}. ${entity.entityUrn} - ${entity.totalAccess} accesses`);
});
```

### **Get user activity (audit trail)**
```typescript
const activity = await observabilityRepo.getUserActivity(
  'tenant-123',
  'user-cfo',
  50
);

activity.forEach((log) => {
  console.log(`${log.eventType} ${log.entityUrn} at ${log.usedAt}`);
});
```

---

## 8️⃣ **Querying Profile Data**

### **Get latest profile**
```typescript
const latest = await observabilityRepo.getLatestProfile(
  'tenant-123',
  'gl.account:revenue_gross'
);

if (latest) {
  console.log(`Quality Score: ${latest.qualityScore}%`);
  console.log(`Completeness: ${latest.completeness}%`);
  console.log(`Uniqueness: ${latest.uniqueness}%`);
}
```

### **Get profile history (time series)**
```typescript
const history = await observabilityRepo.getProfileHistory(
  'tenant-123',
  'gl.account:revenue_gross',
  30 // last 30 profiles
);

history.forEach((profile) => {
  console.log(`${profile.createdAt}: quality=${profile.qualityScore}%`);
});
```

---

## 9️⃣ **Prometheus Queries (PromQL)**

### **Metadata search rate (requests per second)**
```promql
rate(metadata_search_requests_total{status="success"}[5m])
```

### **Metadata search latency (p95)**
```promql
histogram_quantile(0.95, 
  rate(metadata_search_duration_seconds_bucket[5m])
)
```

### **Profiler success rate**
```promql
rate(metadata_profiler_runs_total[5m]) 
- rate(metadata_profiler_failures_total[5m])
```

### **API error rate**
```promql
rate(http_requests_total{status=~"5.."}[5m])
/ rate(http_requests_total[5m])
```

---

## 🔟 **Grafana Dashboard Examples**

### **Panel 1: Metadata Search Rate**
```json
{
  "title": "Metadata Search Requests/sec",
  "targets": [{
    "expr": "rate(metadata_search_requests_total{status=\"success\"}[5m])"
  }],
  "type": "graph"
}
```

### **Panel 2: Top 10 Most Accessed Fields**
Query `mdm_usage_log` via Postgres data source:
```sql
SELECT entity_urn, COUNT(*) as access_count
FROM mdm_usage_log
WHERE used_at > NOW() - INTERVAL '7 days'
GROUP BY entity_urn
ORDER BY access_count DESC
LIMIT 10
```

### **Panel 3: Quality Score Trends**
Query `mdm_profile` via Postgres data source:
```sql
SELECT created_at, quality_score::numeric
FROM mdm_profile
WHERE entity_urn = 'gl.account:revenue_gross'
ORDER BY created_at DESC
LIMIT 30
```

---

## 📝 **Best Practices**

### ✅ **DO**
- Always use labels for multi-tenant metrics
- Time every significant operation with histograms
- Track usage for Tier1/2 fields
- Add span attributes for debugging
- Use async usage tracking (don't block requests)

### ❌ **DON'T**
- Don't create unbounded label values (causes memory issues)
- Don't track PII in metrics/traces
- Don't await usage tracking (fire and forget)
- Don't forget to end timers in finally blocks
- Don't create duplicate metric names

---

## 🚀 **Quick Reference**

### **Metric Types**
- **Counter**: Monotonically increasing (requests, events)
- **Histogram**: Distribution of values (latency, sizes)
- **Gauge**: Current value (queue depth, connections)

### **Span Names**
- `metadata.search` - Metadata search operations
- `metadata.lineage` - Lineage queries
- `metadata.profile` - Data quality profiling
- `metadata.impact` - Impact analysis

### **Usage Event Types**
- `read` - View metadata
- `query` - Search metadata
- `export` - Export metadata
- `write` - Update metadata
- `download` - Download data

### **Actor Types**
- `HUMAN` - User via UI
- `AGENT` - AI agent
- `SYSTEM` - Background job

---

**That's it! You're now ready to instrument metadata-studio services.** 🎉

For more examples, see:
- `OBSERVABILITY-COMPLETE.md` - Full implementation details
- `COMPLETE-SYSTEM-STATUS.md` - System overview
- `services/*.service.ts` - Real service examples

