# AIBOS Metadata Platform

A GRCD-compliant metadata management platform built with Next.js 16, Hono, Drizzle ORM, and PostgreSQL.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Backend: Metadata Studio](#backend-metadata-studio)
  - [GRCD Compliance](#grcd-compliance)
  - [Core Tables](#core-tables)
  - [API Endpoints](#api-endpoints)
  - [Services](#services)
  - [Autonomy Tiers](#autonomy-tiers)
- [Frontend: Web Application](#frontend-web-application)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Scripts Reference](#scripts-reference)

---

## Overview

The AIBOS Metadata Platform is a **single source of truth (SSOT)** for enterprise metadata governance. It implements the **GRCD (Governance, Risk, Compliance & Data)** specification with:

- **Global Metadata Registry** - Canonical field definitions with business context
- **Lineage Graph** - Field-level data lineage tracking
- **Naming Policy Enforcement** - Automated naming convention validation
- **Autonomy Tiers** - AI agent governance from read-only to auto-apply
- **Multi-tenant Isolation** - Complete tenant data separation

---

## Architecture

```
aibos-metadata/
├── apps/
│   └── web/                    # Next.js 16 frontend application
├── metadata-studio/            # GRCD-compliant backend (Hono + Drizzle)
│   ├── api/                    # API route handlers
│   ├── db/schema/              # Drizzle table definitions
│   ├── services/               # Business logic services
│   ├── schemas/                # Zod validation schemas (SSOT)
│   ├── agents/                 # AI agent implementations
│   ├── events/                 # Event bus system
│   └── observability/          # Prometheus metrics & tracing
├── packages/
│   ├── config/                 # Shared ESLint configurations
│   ├── events/                 # Event type definitions
│   ├── registry/               # Service registry
│   └── ui/                     # Shared UI components
└── docs/                       # Additional documentation
```

### Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Frontend   | Next.js 16, React 19, Tailwind CSS   |
| Backend    | Hono (TypeScript), Drizzle ORM       |
| Database   | PostgreSQL (Supabase or local)       |
| Validation | Zod schemas (single source of truth) |
| Events     | Redis-based event bus                |
| Metrics    | Prometheus (prom-client)             |
| Monorepo   | pnpm workspaces + Turborepo          |

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- PostgreSQL 15+ (or Supabase account)

### 1. Install Dependencies

```powershell
pnpm install
```

### 2. Configure Environment

Create `.env` file in `metadata-studio/`:

```bash
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/metadata_studio

# OR Supabase
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 3. Run Database Migrations

```powershell
cd metadata-studio
pnpm db:migrate
```

### 4. Start Development

```powershell
# From root - starts both frontend and backend
pnpm dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3100

---

## Backend: Metadata Studio

### GRCD Compliance

The backend fully implements **GRCD-METADATA-REPO-V1.0** specification:

| GRCD Section      | Implementation                     | Status |
| ----------------- | ---------------------------------- | ------ |
| Global Metadata   | `mdm_global_metadata` table        | ✅     |
| Entity Catalog    | `entityUrn` + `tier` fields        | ✅     |
| Metadata Mappings | `mdm_alias` + `mapping.service.ts` | ✅     |
| Lineage Graph     | `mdm_lineage_field` table          | ✅     |
| Naming Policy     | `mdm_naming_policy` table          | ✅     |
| Autonomy Tiers    | Tier 0-3 enforcement               | ✅     |

### Core Tables

#### `mdm_global_metadata`

Canonical metadata registry per tenant:

```sql
id                UUID PRIMARY KEY
tenant_id         UUID NOT NULL
canonical_key     TEXT NOT NULL UNIQUE (per tenant)
label             TEXT NOT NULL
description       TEXT           -- Business definition
domain            TEXT NOT NULL  -- e.g., 'finance', 'inventory'
module            TEXT NOT NULL  -- e.g., 'gl', 'ar', 'ap'
entity_urn        TEXT NOT NULL  -- Entity reference
tier              TEXT NOT NULL  -- 'tier1' to 'tier5'
data_type         TEXT NOT NULL
standard_pack_id  TEXT           -- IFRS/MFRS/HL7/GS1 reference
owner_id          TEXT NOT NULL
steward_id        TEXT NOT NULL
```

#### `mdm_lineage_field`

Field-level lineage graph:

```sql
source_metadata_id    UUID REFERENCES mdm_global_metadata
target_metadata_id    UUID REFERENCES mdm_global_metadata
relationship_type     TEXT -- 'direct' | 'derived' | 'aggregated' | 'lookup'
transformation_type   TEXT -- 'aggregation' | 'fx_translation' | 'allocation'
transformation_expression TEXT -- e.g., "SUM(sales.amount)"
confidence_score      INTEGER DEFAULT 100
```

#### `mdm_naming_policy`

Naming convention enforcement:

```sql
policy_key        TEXT NOT NULL
applies_to        TEXT -- 'canonical_key' | 'db_column' | 'typescript' | 'api_path'
rules             JSONB -- { pattern, reservedWords, caseStyle, forbiddenPatterns }
enforcement_level TEXT -- 'strict' | 'advisory' | 'none'
```

#### Additional Tables

- `mdm_standard_pack` - Global standards (IFRS, MFRS, HL7, GS1)
- `mdm_business_rule` - Soft-configuration engine
- `mdm_approval` - Approval workflow requests
- `mdm_glossary_term` - Business glossary
- `mdm_alias` - Field name aliases and mappings
- `mdm_kpi` - KPI definitions
- `mdm_change_history` - Audit trail for rollbacks
- `mdm_agent_proposal` - AI agent proposals
- `mdm_compliance_check` - Compliance monitoring results

### API Endpoints

All routes mounted at `http://localhost:3100`:

| Route              | Purpose                      |
| ------------------ | ---------------------------- |
| `/metadata`        | Global metadata CRUD         |
| `/lineage`         | Lineage graph queries        |
| `/mapping`         | Field mapping lookup/suggest |
| `/glossary`        | Business glossary            |
| `/tags`            | Tag management               |
| `/kpi`             | KPI definitions & dashboard  |
| `/impact`          | Impact analysis              |
| `/quality`         | Data quality metrics         |
| `/naming`          | Name resolution              |
| `/naming-policy`   | Naming policy CRUD           |
| `/policy`          | Access control checks        |
| `/rules`           | Business rules               |
| `/approvals`       | Approval workflow            |
| `/agent-proposals` | AI agent proposals           |
| `/auto-apply`      | Guarded auto-apply           |
| `/metrics`         | Prometheus metrics           |
| `/healthz`         | Health check                 |

### Services

#### Metadata Services (GRCD §3.1)

```typescript
// metadata.fields.search(query, filters)
GET /metadata?domain=finance&module=gl

// metadata.fields.describe(id)
GET /metadata?canonicalKey=revenue_total

// metadata.mappings.lookup(local_field)
POST /mapping/lookup
{ "localFieldName": "rev_amt", "context": "FINANCIAL_REPORTING" }

// metadata.mappings.suggest(local_fields[])
POST /mapping/suggest
{ "localFieldNames": ["rev_amt", "cust_id"], "context": "FINANCIAL_REPORTING" }
```

#### Lineage Services (GRCD §3.2)

```typescript
// lineage.graphForNode(node_id, depth, direction)
GET /lineage/graph/:canonicalKey?direction=upstream

// lineage.impactReport(node_id)
GET /impact/full/:canonicalKey

// lineage.registerEdge()
POST /lineage/declare
```

#### Policy Services (GRCD §3.3)

```typescript
// policy.dataAccess.check(actor, resource, intent)
POST /policy/access/check
{ "actorRole": "analyst", "resourceId": "...", "intent": "read" }

// policy.changeRequest.create(entity, proposed_change)
POST /approvals
{ "entityType": "GLOBAL_METADATA", "entityId": "...", "payload": {...} }

// policy.controlStatus.list(standard, scope)
GET /policy/controls?standard=SOX
```

### Autonomy Tiers

The platform implements GRCD's 4-tier autonomy model:

| Tier | Name       | Description                          | Implementation                          |
| ---- | ---------- | ------------------------------------ | --------------------------------------- |
| 0    | Read-Only  | Observe, analyse, report             | All services support read operations    |
| 1    | Suggest    | Make recommendations; humans decide  | `DataQualitySentinel` agent             |
| 2    | Propose    | Generate changes; humans approve     | `agent-proposal.service.ts`             |
| 3    | Auto-Apply | Apply low-risk changes automatically | `auto-apply.service.ts` with guardrails |

**Guardrails for Tier 3:**

- Minimum confidence score: 95%
- Maximum risk level: `minimal`
- Allowed tiers: `tier4`, `tier5` only
- Rate limits: Per-hour and per-day caps
- Agent health checks: `consecutiveErrors < 3`

---

## Frontend: Web Application

Located in `apps/web/`, the Next.js 16 frontend provides:

- **Metadata Browser** - Search and view canonical metadata
- **Glossary** - Business term definitions
- **Lineage Viewer** - Visual lineage graph
- **SDK Documentation** - API usage examples
- **Agent Proposals** - Review and approve AI-generated changes

### Key Pages

| Route                 | Purpose               |
| --------------------- | --------------------- |
| `/`                   | Landing page          |
| `/metadata`           | Metadata browser      |
| `/metadata/glossary`  | Business glossary     |
| `/metadata/lineage`   | Lineage visualization |
| `/metadata/sdk`       | SDK documentation     |
| `/metadata/proposals` | Agent proposal review |

---

## Development

### Adding a New Service

1. Create schema in `metadata-studio/db/schema/`
2. Create Zod validation in `metadata-studio/schemas/`
3. Create service in `metadata-studio/services/`
4. Create routes in `metadata-studio/api/`
5. Register route in `metadata-studio/index.ts`

### Running Tests

```powershell
# All tests
pnpm test

# Specific package
pnpm --filter @aibos/metadata-studio test
```

### Database Operations

```powershell
cd metadata-studio

# Generate migrations from schema changes
pnpm db:generate

# Run pending migrations
pnpm db:migrate

# Open Drizzle Studio (GUI)
pnpm db:studio
```

---

## Environment Variables

### `metadata-studio/.env`

```bash
# Required
DATABASE_URL=postgresql://...

# Optional
NODE_ENV=development
PORT=3100
REDIS_URL=redis://localhost:6379
```

### `apps/web/.env.local`

```bash
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:3100
```

---

## Scripts Reference

### Root (Monorepo)

```powershell
pnpm dev          # Start all apps in development
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm type-check   # TypeScript validation
pnpm clean        # Clean build artifacts
```

### Metadata Studio

```powershell
cd metadata-studio
pnpm dev          # Start backend server
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
pnpm test         # Run tests
```

### Web App

```powershell
cd apps/web
pnpm dev          # Start Next.js dev server
pnpm build        # Production build
pnpm start        # Start production server
```

---

## Reference Documents

- [`GRCD-METADATA-REPO-V1.0.md`](./GRCD-METADATA-REPO-V1.0.md) - Core specification
- [`GRCD-METADATA-V1.1.md`](./GRCD-METADATA-V1.1.md) - Extended specification
- [`DEVELOPMENT-PLAN.md`](./DEVELOPMENT-PLAN.md) - Phase implementation plan
- [`GRCD-AUDIT-REPORT.md`](./GRCD-AUDIT-REPORT.md) - Compliance audit evidence

---

## License

PROPRIETARY - AIBOS Team
