# @aibos/events

Shared event schemas and types for AIBOS Metadata Platform.

## Installation

```bash
pnpm add @aibos/events
```

## Usage

### Importing Events

```typescript
import {
  EventSchema,
  ProfileDuePayloadSchema,
  type Event,
  type ProfileDuePayload,
} from '@aibos/events';
```

### Creating an Event

```typescript
import { v4 as uuidv4 } from 'uuid';
import type { Event } from '@aibos/events';

const event: Event = {
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
  },
};
```

### Validating an Event

```typescript
import { EventSchema } from '@aibos/events';

try {
  const validated = EventSchema.parse(event);
  console.log('Event is valid:', validated);
} catch (error) {
  console.error('Event validation failed:', error);
}
```

### Type Narrowing

TypeScript automatically narrows the event type based on the `type` field:

```typescript
import type { Event } from '@aibos/events';

function handleEvent(event: Event) {
  if (event.type === 'metadata.profile.due') {
    // TypeScript knows event.payload is ProfileDuePayload
    console.log('Entity to profile:', event.payload.canonicalKey);
    console.log('Priority:', event.payload.priority);
  } else if (event.type === 'metadata.profile.completed') {
    // TypeScript knows event.payload is ProfileCompletedPayload
    console.log('Quality score:', event.payload.qualityScore);
  }
}
```

## Event Types

### Profiler Events
- `metadata.profile.due` - Profile is due (scheduled)
- `metadata.profile.completed` - Profile run completed
- `metadata.profile.failed` - Profile run failed

### Metadata Lifecycle
- `metadata.changed` - Metadata definition changed
- `metadata.approved` - Metadata change approved
- `metadata.deprecated` - Metadata marked as deprecated

### KPI Lifecycle
- `kpi.changed` - KPI definition changed
- `kpi.approved` - KPI change approved

### Data Events
- `data.refreshed` - Data load/refresh completed
- `data.quality.degraded` - Quality score dropped significantly

### Approval Events
- `approval.created` - New approval request
- `approval.approved` - Approval granted
- `approval.rejected` - Approval rejected

## Event Sources

- `kernel.scheduler` - Kernel scheduler
- `metadata-studio.api` - Metadata Studio API
- `metadata-studio.approval` - Approval workflow
- `etl.pipeline` - ETL pipelines
- `finance.service` - Finance service
- `bff.graphql` - BFF GraphQL layer
- `agent.profiler` - AI agent
- `system.migration` - System migrations

## Entity Types

- `METADATA` - Global metadata (mdm_global_metadata)
- `KPI` - KPI definition (mdm_kpi_definition)
- `GLOSSARY` - Glossary term (mdm_glossary_term)
- `BUSINESS_RULE` - Business rule (mdm_business_rule)
- `TAG` - Tag (mdm_tag)
- `LINEAGE` - Lineage field (mdm_lineage_field)

## Architecture

This package follows the **Single Source of Truth (SSOT)** principle:

1. **Event schemas** defined once in `@aibos/events`
2. **All components** import from this package
3. **Type safety** enforced across the entire platform

```
┌─────────────────────────────────────────────────────┐
│             @aibos/events (SSOT)                    │
│  Event types, schemas, validation                  │
└─────────────────────────────────────────────────────┘
                    ▲           ▲           ▲
                    │           │           │
         ┌──────────┘           │           └──────────┐
         │                      │                      │
┌────────▼─────┐    ┌──────────▼──────┐    ┌──────────▼─────┐
│   Kernel     │    │ Metadata Studio │    │  ETL Pipeline  │
│  (Producer)  │    │   (Consumer)    │    │   (Producer)   │
└──────────────┘    └─────────────────┘    └────────────────┘
```

## Building

```bash
pnpm build
```

## License

Proprietary

