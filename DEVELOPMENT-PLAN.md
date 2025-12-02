# AIBOS Metadata Development Plan
**Version:** 1.0
**Aligned with:** GRCD-METADATA-V1.1 (AI & Data Constitution)
**Status:** Active Development

---

## 1. Current State Assessment

### ✅ Foundation Complete
| Component | Status | Location |
|-----------|--------|----------|
| Global Metadata Registry | ✅ Built | `metadata-studio/` |
| Field Dictionary (mdm_global_metadata) | ✅ Built | `db/schema/metadata.tables.ts` |
| Entity Catalog | ✅ Built | `db/schema/*.tables.ts` |
| Lineage Graph (nodes & edges) | ✅ Built | `db/schema/lineage.tables.ts` |
| Naming Policy | ✅ Built | `naming/name-resolver.ts` |
| Approval Workflow (HITL) | ✅ Built | `services/approval.service.ts` |
| Governance Tiers | ✅ Built | `schemas/business-rule.schema.ts` |
| Event System | ✅ Built | `events/event-bus.ts` |
| Observability | ✅ Built | `observability/` |

### 🔧 Integration Points
| Service | Status | Notes |
|---------|--------|-------|
| Metadata Services | ✅ API Ready | `/metadata/*` routes |
| Lineage Services | ✅ API Ready | `/lineage/*` routes |
| Policy & Governance | ✅ API Ready | `/rules/*`, `/approvals/*` routes |
| Impact Analysis | ✅ API Ready | `/impact/*` routes |
| Quality Scoring | ✅ API Ready | `/quality/*` routes |

---

## 2. GRCD-Aligned Development Phases

### Phase 1: Foundation & Read-Heavy Orchestration (Current)
**GRCD Reference:** Section 8 - Phase 1

#### 2.1 Global Metadata Registry v1 ✅
```
metadata-studio/
├── db/schema/           # Drizzle schema definitions
│   ├── metadata.tables.ts      # mdm_global_metadata
│   ├── lineage.tables.ts       # mdm_lineage_field
│   ├── alias.tables.ts         # mdm_alias
│   ├── naming-variant.tables.ts # mdm_naming_variant
│   └── standard-pack.tables.ts  # mdm_standard_pack
├── schemas/             # Zod validation schemas (SSOT)
├── services/            # Business logic layer
└── api/                 # Hono HTTP routes
```

#### 2.2 Mandatory Services Implementation
**GRCD Reference:** Section 2.3

| Service | Method | Status | Route |
|---------|--------|--------|-------|
| `metadata.fields.search` | GET | ✅ | `/metadata?canonicalKey=&domain=&module=` |
| `metadata.fields.describe` | GET | ✅ | `/metadata/:id` |
| `metadata.mappings.lookup` | GET | 🔜 | `/naming/resolve` |
| `metadata.mappings.suggest` | POST | 🔜 | `/naming/suggest` |
| `lineage.graphForNode` | GET | ✅ | `/lineage/field?canonicalKey=&direction=` |
| `lineage.impactReport` | GET | ✅ | `/impact?canonicalKey=` |
| `lineage.registerNode` | POST | ✅ | `/lineage/field` |
| `policy.dataAccess.check` | POST | 🔜 | `/rules/check` |
| `policy.changeRequest.create` | POST | ✅ | `/approvals` |

#### 2.3 Frontend Integration
**Location:** `apps/web/`

```typescript
// Example: Fetching metadata with type safety
import { MdmGlobalMetadataSchema } from '@aibos/metadata-studio/schemas';

const response = await fetch('/api/metadata?domain=FINANCE');
const data = await response.json();
const validated = data.map(item => MdmGlobalMetadataSchema.parse(item));
```

---

### Phase 2: Proposals & PR Generation (Next)
**GRCD Reference:** Section 8 - Phase 2

#### 2.4 Tier 2 Actions Implementation
**Target:** Enable proposal generation for non-destructive changes

| Orchestra | Action | Tier | Implementation |
|-----------|--------|------|----------------|
| DB Orchestra | Add missing index | Tier 2 | Migration generator |
| UX Orchestra | Copy updates | Tier 2 | PR generator |
| API Orchestra | Add non-breaking fields | Tier 2 | OpenAPI diff |
| DevEx Orchestra | Lint fixes | Tier 2 | Codemod generator |

#### 2.5 Business Domain Orchestras
**Target:** Finance close, AP/AR helpers

```typescript
// Example: Business Rule for Period Close
const closeRule = BusinessRuleSchema.parse({
  ruleKey: 'PERIOD_CLOSE_CHECK',
  domain: 'FINANCE',
  module: 'GL',
  tier: 'tier1',
  evaluationType: 'SQL',
  expression: 'SELECT COUNT(*) FROM unposted_journals WHERE period = :period',
  threshold: { operator: 'eq', value: 0 },
});
```

---

### Phase 3: Guarded Auto-Apply (Future)
**GRCD Reference:** Section 8 - Phase 3

#### 2.6 Tier 3 Implementation
**Target:** Low-risk, high-confidence patterns

| Pattern | Risk Level | Auto-Apply Criteria |
|---------|------------|---------------------|
| Add missing index | Low | No breaking changes |
| Safe refactors | Low | Test coverage > 95% |
| Copy fixes | Low | No logic changes |
| Idempotent job reruns | Low | Failure recovery |

---

## 3. Architecture Alignment

### 3.1 Kernel Sovereignty
**GRCD Reference:** Section 1 - Core Principle 1

All AI orchestras subordinate to Kernel:
```
kernel/
├── scheduler/           # Central scheduler
│   ├── index.ts         # Kernel entry point
│   └── profile.scheduler.ts  # Profile job scheduler
└── ... future orchestras
```

### 3.2 Global Metadata First
**GRCD Reference:** Section 1 - Core Principle 2

```typescript
// SSOT: All schemas defined in metadata-studio
import { 
  MdmGlobalMetadataSchema,
  GovernanceTierEnum,
  MdmLineageFieldSchema 
} from '@aibos/metadata-studio/schemas';

// Events use shared types
import { GovernanceTier, EntityType } from '@aibos/events';
```

### 3.3 Governed Autonomy
**GRCD Reference:** Section 4 - Autonomy & Risk Tiers

```typescript
// middleware/auth.middleware.ts
export type Role = 
  | 'kernel_architect'   // Tier 3 access
  | 'metadata_steward'   // Tier 2 access
  | 'business_admin'     // Tier 1 access
  | 'user';              // Tier 0 access

// Tier-based approval logic
function canApplyImmediately(tier: GovernanceTier, role: Role): boolean {
  if (tier === 'tier1' || tier === 'tier2') return false;
  return role === 'kernel_architect' || role === 'metadata_steward';
}
```

---

## 4. Implementation Checklist

### 4.1 Phase 1 Remaining Tasks
- [ ] Complete `metadata.mappings.lookup` API
- [ ] Complete `metadata.mappings.suggest` API  
- [ ] Complete `policy.dataAccess.check` API
- [ ] Wire orchestras to observability telemetry
- [ ] Add KPI dashboards for schema drift incidents

### 4.2 Phase 2 Tasks
- [ ] Implement migration generator (DB Orchestra)
- [ ] Implement PR generator (UX Orchestra)
- [ ] Add Finance close process agent
- [ ] Add AP/AR helper agents
- [ ] Enable Tier 2 for selected actions

### 4.3 Phase 3 Tasks
- [ ] Define blast radius guardrails
- [ ] Implement auto-apply with rollback
- [ ] Add continuous control monitoring
- [ ] Tighten KPIs for Tier 3 promotion

---

## 5. Key Code References

### 5.1 Metadata Schema (SSOT)
```typescript
// metadata-studio/schemas/mdm-global-metadata.schema.ts
export const MdmGlobalMetadataSchema = z.object({
  tenantId: z.string().uuid(),
  canonicalKey: z.string().min(1),
  label: z.string().min(1),
  domain: z.string().min(1),
  module: z.string().min(1),
  tier: GovernanceTierEnum,
  standardPackId: z.string().min(1).optional(),  // Required for Tier1/2
  // ... other fields
});
```

### 5.2 Approval Workflow
```typescript
// metadata-studio/services/metadata.service.ts
export async function applyMetadataChange(req: MetadataChangeRequest) {
  const base = MdmGlobalMetadataSchema.parse(req.body);
  enforceMetadataBusinessRules(base);  // GRCD validation
  
  if (canApplyMetadataImmediately(base, req.actorRole)) {
    return await upsertGlobalMetadata(base, req.actorId);
  }
  
  // Queue for approval (HITL)
  await approvalService.createRequest({ ... });
  return { status: 'pending_approval' };
}
```

### 5.3 Lineage Impact Analysis
```typescript
// metadata-studio/services/impact.service.ts
export async function getFullKpiImpactForMetadata(
  tenantId: string,
  canonicalKey: string
) {
  const direct = await getDirectKpiImpactForMetadata(tenantId, canonicalKey);
  const indirect = await getIndirectKpiImpactViaLineage(tenantId, canonicalKey);
  return {
    directKpis: direct.kpis,
    indirectKpis: indirect.kpis,
    indirectImpactedFields: indirect.impactedFields,
  };
}
```

---

## 6. Development Commands

```bash
# Start metadata-studio dev server
pnpm --filter @aibos/metadata-studio dev

# Start web frontend
pnpm --filter @aibos/web dev

# Run all lints
pnpm run lint

# Run build
pnpm run build

# Seed metadata
pnpm --filter @aibos/metadata-studio db:seed

# Run migrations
pnpm --filter @aibos/metadata-studio db:migrate
```

---

## 7. Success Metrics (KPIs)

**GRCD Reference:** Section 5 - Orchestra KPIs

| Metric | Target | Current |
|--------|--------|---------|
| Schema drift incidents | < 5/quarter | TBD |
| p95 query latency | < 100ms | TBD |
| Schema changes with AI review | > 90% | TBD |
| Tier 1 lineage coverage | 100% | TBD |
| Time to close cycle | Reduce 20% | TBD |

---

**Document maintained by:** AI-BOS Kernel Council
**Last updated:** 2025-12-02

