# 🧾 GRCD — Nexus Metadata Studio (Global Metadata & Lineage Console) — v4.1.0 (MCP‑Governed, OpenMetadata‑Inspired)

**Version:** 4.1.0  
**Status:** Active (MCP‑Governed SSOT)  
**Last Updated:** 2025-11-30  
**Owner:** CID – Central Insight Department (Metadata Stewardship), Platform Engineering, Finance & Compliance

> **Purpose of this GRCD**
>
> This GRCD defines the **constitutional rules** for the **Nexus Metadata Studio** — a “Lite OpenMetadata” embedded directly inside AI‑BOS ERP. It is inspired by OpenMetadata’s proven patterns (services, entities, glossary, tags, ownership, usage, quality, lineage) but **intentionally simplified** and **ERP‑first**.
>
> Nexus Metadata Studio focuses on:
>
> - 🧠 **Business‑first semantics** (IFRS/MFRS, HL7, GS1, HACCP, etc.)
> - 🧾 **Audit‑grade lineage** for financial & regulatory reporting
> - 🧱 **Anti‑drift, MCP‑governed metadata** so AI cannot invent definitions
> - 🧪 **Trust signals:** profiling, usage analytics, governance tiers
> - 🧩 **Service & ownership model** similar to OpenMetadata, but constrained to ERP context

---

## 1. Purpose & Identity

**Component Name:** `metadata-studio` (Nexus Metadata Studio)  
**Domain:** `Data Governance / Metadata / Lineage`  
**Type:** Tier‑1 Platform Service (MCP‑governed, kernel‑adjacent)

### 1.1 Purpose

> Nexus Metadata Studio is the **data constitution console** for AI‑BOS ERP.
>
> It defines **what every field means**, which **standard** it follows (IFRS/MFRS, HL7, GS1, etc.), which **aliases** are acceptable, how **numbers in reports are traced back** to source systems, and who is **accountable** for each asset.
>
> It mirrors OpenMetadata’s philosophy of a **unified metadata graph** but is scoped to:
>
> - ERP‑centric entities (GL, AR/AP, HR, SCM, Manufacturing, Retail, etc.)
> - Embedded finance‑grade governance (IFRS/MFRS SoT packs)
> - Lightweight profiling & quality checks
> - MCP‑exposed tools for AI‑BOS Kernel and agentic orchestras

### 1.2 Identity

* **Role:**  
  `Global Metadata, Glossary, Lineage & Quality Studio for AI‑BOS` — the authoritative registry of fields, entities, services, KPIs, standards, aliases, owners and lineage graphs.

* **Scope (OpenMetadata‑inspired logical areas):**
  - **Services & Connections** (like OpenMetadata’s DatabaseService, DashboardService):
    - ERP core, Data Warehouse, Analytics DB, BI tools (logical only).
  - **Data Assets / Entities:**
    - Tables, views, reports, KPIs, jobs/pipelines (limited subset).
  - **Fields / Columns:**
    - `mdm_global_metadata` = column/field‑level semantics.
  - **Glossary & Tags:**
    - Business glossary, taxonomies, tags, classifications.
  - **Ownership & Stewardship:**
    - Owners, experts, custodians per asset, aligned with roles.
  - **Lineage & Impact:**
    - Asset‑ and field‑level lineage, impact analysis.
  - **Quality & Profiling:**
    - Lightweight profiler & rule‑based data quality checks.
  - **Usage Analytics:**
    - Who used what, how often, for what purpose.

* **Boundaries / Non‑Responsibility:**
  - `MUST NOT` store raw business / transactional data.
  - `MUST NOT` serve as a full data warehouse or OLAP engine.
  - `MUST NOT` run heavy ingestion frameworks (Airflow‑style) inside Studio.
  - `MUST NOT` act as a general chat / discussion system (link out to Jira/Slack).
  - `MUST NOT` bypass Kernel’s policy engine, RBAC or SoT hierarchy.

### 1.3 Non‑Negotiables (Constitutional Principles)

* **Single Canonical Definition per Concept per Tenant**  
  One `canonical_key` per semantic concept per tenant (OpenMetadata’s *single source per entity* principle).

* **IFRS/MFRS First for Finance**  
  IFRS/MFRS SoT packs are primary; GAAP/other finance standards are **aliases or secondary packs**.

* **Standard Packs as Law**
  - `MUST` declare a SoT pack before a field is used in Tier 1/2 KPIs.
  - `MUST NOT` create orphan financial definitions without a pack.

* **Alias Discipline**
  - Lexical differences (Apple / APPLE / apples / apple_revenue) are **aliases**, not new fields.
  - Semantic relatives (Revenue vs Income vs Gain) must be **explicitly typed** and tied to standards.

* **HITL for High‑Impact Changes**
  - Any change to Tier 1/Tier 2 fields, SoT packs, composite KPIs, or critical glossary terms `MUST` go through human approval.

* **Lineage Mandatory for Tier 1**
  - Tier 1 finance/reporting fields & KPIs `MUST` have lineage coverage sufficient to trace back to source transactions.

* **No PII/PHI Payloads**
  - Metadata Studio `MUST NOT` store PII/PHI values, only definitions and references.

* **Embedded, Not External**
  - Metadata Studio `MUST` rely on in‑app events/hooks rather than crawling ERP from the outside (OpenMetadata’s ingestion simplified into internal hooks).

---

## 2. Requirements

### 2.1 Functional Requirements (OpenMetadata‑Inspired)

| ID       | Requirement                                                                                                                | Priority | Status | Notes |
|----------|----------------------------------------------------------------------------------------------------------------------------|----------|--------|-------|
| MS-F-1   | Studio MUST provide a global metadata registry (`mdm_global_metadata`) with canonical keys, labels and descriptions.       | MUST     | ⚪     | Column/field catalog (OpenMetadata Table/Column analog). |
| MS-F-2   | Studio MUST support domain & industry scoping (e.g., FINANCE, HR, SCM; IFRS, HL7, GS1).                                   | MUST     | ⚪     | Domain & industry enums/refs. |
| MS-F-3   | Studio MUST support SoT packs (IFRS/MFRS primary for finance; domain packs for others).                                    | MUST     | ⚪     | `mdm_standard_pack`. |
| MS-F-4   | Studio MUST enforce one canonical definition per concept per tenant (unique `(tenant_id, canonical_key)`).                 | MUST     | ⚪     | Similar to OpenMetadata’s unique fully‑qualified name. |
| MS-F-5   | Studio MUST support alias system (lexical + semantic) for fields, KPIs and glossary terms.                                 | MUST     | ⚪     | Like OpenMetadata’s synonyms + tags but with IFRS semantics. |
| MS-F-6   | Studio MUST expose search APIs to discover assets by name, tag, owner, SoT pack, tier and domain.                          | MUST     | ⚪     | OpenMetadata‑style search facets using Postgres FTS. |
| MS-F-7   | Studio MUST provide a **Business Glossary** module with terms, definitions, relationships and owners.                      | MUST     | ⚪     | OpenMetadata Glossary analog, scoped to ERP. |
| MS-F-8   | Studio MUST support **tags & classifications** (e.g., PII, Financial, Confidential, KPI, Operational).                     | MUST     | ⚪     | Tagging similar to OpenMetadata, but no free‑for‑all. |
| MS-F-9   | Studio MUST provide **ownership & stewardship** per asset (owner, data steward, SME, domain owner).                        | MUST     | ⚪     | OpenMetadata Owner/Expert concept. |
| MS-F-10  | Studio MUST maintain logical data lineage (nodes/edges) for entities & fields.                                             | MUST     | ⚪     | Similar to OpenMetadata Lineage graph. |
| MS-F-11  | Studio MUST provide impact analysis: “what is affected if this metadata/SoT/KPI changes?”.                                 | MUST     | ⚪     | Traversal over lineage + KPI refs. |
| MS-F-12  | Studio MUST classify governance tiers (Tier 1–5) per field/KPI (replacing `is_critical`).                                  | MUST     | ⚪     | Inspired by OpenMetadata Tier system. |
| MS-F-13  | Studio MUST provide basic data profiling (row_count, nulls, distincts, basic ranges) for Tier 1/2 assets.                 | MUST     | ⚪     | OpenMetadata Profiler (Lite). |
| MS-F-14  | Studio MUST support rule‑based data quality checks (e.g., NOT NULL, uniqueness, min/max thresholds) for Tier 1 assets.    | MUST     | ⚪     | Simplified Great Expectations analog. |
| MS-F-15  | Studio MUST log usage events (“who used what?”) for Tier 1 & Tier 2 assets (view, query, export, update).                 | MUST     | ⚪     | OpenMetadata Usage analytics (Lite). |
| MS-F-16  | Studio MUST provide lineage graph API (`/lineage/:urn`) with depth and direction options.                                  | MUST     | ⚪     | Upstream/downstream. |
| MS-F-17  | LineageTracer agent MUST infer lineage for critical jobs/SQL and keep edges up‑to‑date for Tier 1 fields & KPIs.          | MUST     | ⚪     | Agent‑assisted ingestion, not Airflow. |
| MS-F-18  | Studio MUST provide composite KPI modeling (numerator/denominator) with SoT enforcement and governance tier.              | MUST     | ⚪     | KPI entity similar to Metric in OpenMetadata, but IFRS‑aware. |
| MS-F-19  | Studio MUST provide HITL approval workflow for SoT changes, Tier 1/2 metadata, glossary terms and critical KPIs.          | MUST     | ⚪     | OpenMetadata tasks/approvals but minimal. |
| MS-F-20  | Studio SHOULD expose popularity & health signals (profiling + usage) in UI badges (Trusted / Warning / At Risk).          | SHOULD   | ⚪     | Derived from profile + usage. |
| MS-F-21  | Studio SHOULD support soft‑delete + deprecation workflow for assets, with clear warnings in UI & APIs.                    | SHOULD   | ⚪     | OpenMetadata deprecation states. |
| MS-F-22  | Studio SHOULD provide **service catalog** of source systems (ERP core, DWH, BI, etc.) with connection metadata only.      | SHOULD   | ⚪     | Simplified DatabaseService/DashboardService. |
| MS-F-23  | Studio MAY provide change feed / activity stream for metadata changes for observability & audit.                           | MAY      | ⚪     | Not a chat, just a log of changes. |
| MS-F-24  | Studio MAY integrate with external ticketing (e.g., Jira) for metadata issues & remediation workflows.                    | MAY      | ⚪     | Link‑based, not reimplementing a ticketing system. |

### 2.2 Non‑Functional Requirements

| ID       | Requirement                                      | Target                                      | Source / Check                                    | Status |
|----------|--------------------------------------------------|---------------------------------------------|---------------------------------------------------|--------|
| MS-NF-1  | Metadata search latency                          | <150ms p95                                  | `metadata_search_duration_seconds`                | ⚪     |
| MS-NF-2  | Lineage query latency                            | <300ms p95                                  | `metadata_lineage_duration_seconds`               | ⚪     |
| MS-NF-3  | Profiling coverage for Tier 1                    | ≥ 1 run per 7 days                          | `metadata_profiler_runs_total` + recency checks   | ⚪     |
| MS-NF-4  | Availability                                     | ≥ 99.9% for read operations                 | `/healthz`, uptime monitoring                     | ⚪     |
| MS-NF-5  | Search scalability                               | 1M+ fields, 10M+ usage logs per tenant      | Load tests with Postgres FTS                      | ⚪     |
| MS-NF-6  | Multi‑tenant isolation                           | Zero cross‑tenant leaks                     | Isolation tests, schema separation                | ⚪     |
| MS-NF-7  | MCP call latency from Kernel/Engines             | Added overhead <30ms p95                    | MCP wrapper metrics                               | ⚪     |
| MS-NF-8  | UI lineage rendering                             | Graph < 100 nodes renders in <500ms         | Frontend timings                                  | ⚪     |
| MS-NF-9  | Full metadata export/import (backup/restore)     | Complete export/import under 30 minutes     | Backup/restore tests                              | ⚪     |

### 2.3 Compliance Requirements

| ID      | Requirement                                                                            | Standard(s)                         | Evidence                                  | Status |
|---------|----------------------------------------------------------------------------------------|-------------------------------------|-------------------------------------------|--------|
| MS-C-1  | Finance metadata MUST anchor to IFRS/MFRS SoT packs (GAAP as secondary / alias).      | IFRS, MFRS, SOX                     | SoT pack mappings, schema checks          | ⚪     |
| MS-C-2  | Lineage for Tier 1 fields MUST support audit trails from report back to source.       | SOX, SOC2, ISO 27001                | Lineage graphs, test cases                | ⚪     |
| MS-C-3  | No PII/PHI values stored, only metadata/definitions.                                  | GDPR, PDPA, HIPAA                   | Schema review, data classification checks | ⚪     |
| MS-C-4  | All metadata changes MUST be audited with actor, timestamp, and context.              | SOC2, ISO 27001                     | `mdm_usage_log`, change history           | ⚪     |
| MS-C-5  | HITL approval required for SoT changes & Tier 1 definitions.                          | EU AI Act, AI Governance frameworks | Approval records, workflow logs           | ⚪     |
| MS-C-6  | Metadata Studio MUST respect legal‑first hierarchy (law > industry > internal).       | Legal / Regulatory                  | Pack definitions & override resolution    | ⚪     |
| MS-C-7  | Ownership and stewardship MUST be assigned for all Tier 1 & Tier 2 assets.            | SOX, Data Governance best practices | Owner fields & role mapping               | ⚪     |

---

## 3. Architecture & Design Patterns

### 3.1 High‑Level Patterns (OpenMetadata‑Inspired)

- **Registry‑centric Architecture**  
  Metadata Studio is a **central registry** with APIs, not a compute engine – mirroring OpenMetadata’s metadata graph.

- **Service → Entity → Field Hierarchy**  
  Inspired by OpenMetadata’s `Service → Database → Schema → Table → Column` tree, Nexus Metadata Studio models:

  ```text
  Service (ERP_CORE, DWH, BI_TOOL)
    → Domain DB / Module (GL, AR, AP, HR, SCM, RETAIL, etc.)
      → Entity (table/view/report)
        → Field (mdm_global_metadata record)
  ```

- **SoT Pack Layer**  
  Standards (IFRS, HL7, etc.) are versioned packs, treated like **code** (JSON/YAML in repo, seeded into DB).

- **Glossary & Tags Layer**  
  Glossary terms and tags provide a **semantic layer** similar to OpenMetadata, but with:
  - Hard binding to SoT packs for finance terms.
  - ERP‑friendly taxonomies (e.g., “Financial Performance”, “Cash Management”, “Inventory Health”).

- **Tiered Governance**  
  As in OpenMetadata, assets are classified into Tiers (1–5) with stricter requirements at higher tiers.

- **MCP‑governed Orchestration**  
  Metadata tools (search, suggest, lineage, impact, quality) are exposed via MCP to Kernel & agents.

### 3.2 Semantic Alias Handling & Enforcement

**Lexical aliases** (capitalization, plurality, case) enable flexible search & display configurations.  
**Semantic aliases** model conceptual relationships (Revenue vs Income vs Gain) anchored in SoT packs.

**Enforcement:**

- UI **MUST**:
  - Show canonical term + badges (e.g., `IFRS Primary`, `Alias`, `Deprecated`).
  - Provide a “Semantic Map” panel:
    > “Revenue (IFRS) — Semantic relatives: Income (broader), Gains (component).”

- AI Agents **MUST**:
  - Prefer canonical terms from SoT packs when generating prompts/reports.
  - Explain mappings on request (OpenMetadata‑style *description first* principle).

- Validation **MUST fail** when:
  - A semantic alias is incorrectly promoted to canonical in a Tier 1 context.
  - A composite KPI uses ambiguous concepts without SoT mapping.

### 3.3 Composite KPI Governance

Each KPI is defined formally as:

```text
KPI = (Numerator Field/Expression) / (Denominator Field/Expression)
```

- Numerator and denominator `MUST` each:
  - Map to specific SoT packs (`standard_pack_id_primary`).
  - Declare governance tier (Tier 1–5).

- For **Tier 1 KPIs**:
  - Both numerator & denominator `MUST` have lineage coverage to source.
  - Changes `MUST` trigger impact analysis + HITL approval.
  - KPI `MUST` have owner and steward assigned.

### 3.4 Performance & Caching Strategy

- **Indexing:**
  - `mdm_global_metadata`: index by `(tenant_id, canonical_key)`, FTS on label/description.
  - Glossary: FTS on term name + synonyms.
  - Lineage: composite indexes on `(tenant_id, source_urn)`, `(tenant_id, target_urn)`.

- **Caching:**
  - Hot metadata and glossary terms in memory cache keyed by tenant/domain.
  - Hot lineage paths (Tier 1 KPIs) in Redis TTL cache.

- **Pre‑computed Views:**
  - Materialized views or transitive closure tables for deep lineage.

- **Graceful Degradation:**
  - If lineage query >300ms: return partial graph + schedule asynchronous completion; surface that status in UI.

### 3.5 SoT Pack Versioning & Migration

- **Versioning:**
  - Packs use SemVer (`IFRS_15@1.0.0`, `IFRS_17@1.0.0`).
  - `is_deprecated` flag per pack/version.

- **Migration:**
  - New critical pack versions require:
    - Impact analysis for referencing fields, KPIs, glossary terms.
    - Dual running (old + new) allowed during transition.
    - Reports **must declare** SoT version used.
  - Decommissioning requires steward & compliance officer approval.

---

## 4. Directory & File Layout (Anti‑Drift)

```text
/AIBOS-PLATFORM/
  ├── metadata-studio/                     # Nexus Metadata Studio package
  │   ├── api/                             # Hono routes
  │   │   ├── metadata.routes.ts           # /metadata/*
  │   │   ├── lineage.routes.ts            # /lineage/*
  │   │   ├── impact.routes.ts             # /impact/*
  │   │   ├── glossary.routes.ts           # /glossary/*
  │   │   ├── tags.routes.ts               # /tags/*
  │   │   ├── quality.routes.ts            # /quality/*
  │   │   └── usage.routes.ts              # /usage/*
  │   ├── schemas/                         # Zod schemas (SSOT)
  │   │   ├── mdm-global-metadata.schema.ts
  │   │   ├── observability.schema.ts      # Governance + profiler + usage
  │   │   ├── standard-pack.schema.ts
  │   │   ├── lineage.schema.ts
  │   │   ├── glossary.schema.ts
  │   │   ├── tags.schema.ts
  │   │   └── kpi.schema.ts
  │   ├── services/                        # Business logic
  │   │   ├── metadata.service.ts
  │   │   ├── lineage.service.ts
  │   │   ├── impact-analysis.service.ts
  │   │   ├── glossary.service.ts
  │   │   ├── tags.service.ts
  │   │   ├── quality.service.ts
  │   │   └── usage.service.ts
  │   ├── mcp/                             # MCP tools & manifest
  │   │   ├── metadata-studio.mcp.json     # MCP profile for this component
  │   │   └── tools/                       # MCP tools exposed to Kernel/agents
  │   │       ├── metadata.tools.ts
  │   │       ├── lineage.tools.ts
  │   │       ├── impact.tools.ts
  │   │       ├── glossary.tools.ts
  │   │       ├── quality.tools.ts
  │   │       └── usage.tools.ts
  │   ├── db/                              # DB integration
  │   │   ├── metadata.repo.ts
  │   │   ├── lineage.repo.ts
  │   │   ├── observability.repo.ts        # profiler + usage
  │   │   └── standard-pack.repo.ts
  │   ├── bootstrap/
  │   │   ├── index.ts
  │   │   ├── 01-load-standard-packs.ts
  │   │   ├── 02-load-glossary.ts
  │   │   └── 03-verify-governance-tiers.ts
  │   ├── events/                          # Internal events
  │   │   ├── handlers/
  │   │   │   ├── on-metadata-changed.ts
  │   │   │   ├── on-lineage-updated.ts
  │   │   │   └── on-profile-computed.ts
  │   │   └── event.types.ts
  │   ├── tests/
  │   │   ├── unit/
  │   │   ├── integration/
  │   │   │   ├── lineage-coverage.test.ts
  │   │   │   ├── alias-resolution.test.ts
  │   │   │   └── sot-pack-conformance.test.ts
  │   │   └── conformance/
  │   │       ├── tier1-audit-readiness.test.ts
  │   │       └── profiling-coverage.test.ts
  │   ├── index.ts
  │   └── package.json
  └── docs/
      └── GRCD-METADATA-STUDIO-v4.1.0.md
```

**AI Agent Rules:**

1. Create code only under `metadata-studio/` following this tree.
2. Zod schemas go in `schemas/`, repos in `db/`, business logic in `services/`, routes in `api/`.
3. MCP tools for agents go in `mcp/tools/` and must wrap existing services.
4. Tests must be added into `tests/` subfolders with clear naming.

---

## 5. Dependencies & Compatibility Matrix

* **Lockfile:** `pnpm-lock.yaml` at repo root.  
* **Source of Truth:** `/metadata-studio/package.json`, `/pnpm-lock.yaml`.  
* **Policy:** Same as Kernel – changes via PR + matrix review.

| Library                     | Allowed Range | Purpose                         | Notes / Alignment                         |
|----------------------------|--------------|---------------------------------|-------------------------------------------|
| `hono`                     | ^4.x         | HTTP routing                    | Align with Kernel versions.               |
| `@hono/node-server`        | ^1.x         | HTTP server                     |                                           |
| `zod`                      | ^3.x         | Schema validation               | Aligned with Drizzle + Kernel.            |
| `drizzle-orm`              | ^0.x         | DB access                       | Optional; must stay Zod 3‑compatible.     |
| `pg` or `@supabase/supabase-js` | ^8.x / ^2.x | PostgreSQL client           | Same as Kernel.                           |
| `ioredis`                  | ^5.x         | Cache for hot metadata/lineage  | Optional but recommended.                 |
| `prom-client`              | ^15.x        | Prometheus metrics              |                                           |
| `@opentelemetry/api`       | ^1.x         | Tracing                         | Optional but recommended.                 |
| `typescript`               | ^5.x         | Type checking                   |                                           |
| `vitest`/`jest`            | ^1.x/^29.x   | Testing                         | Consistent with platform choice.          |

**Normative Rules:**

- `MS-DEP-1` — No new dependencies without GRCD + matrix update.
- `MS-DEP-2` — `zod@4` is **blocked** until whole platform is ready.
- `MS-DEP-3` — Metadata Studio must not introduce search infra beyond Postgres (no Elasticsearch).

---

## 6. MCP Profile (metadata-studio.mcp.json)

- Location: `/metadata-studio/mcp/metadata-studio.mcp.json`
- Purpose: Guardrails for AI agents & Kernel when using Metadata Studio tools.

**Core Intent:**

- Enforce:
  - SoT pack usage for finance.
  - Tiering rules (Tier 1 stricter than Tier 3–5).
  - Alias discipline (no duplicate canonicals).
  - No PII/PHI payloads.
  - No bypass of HITL for high‑impact changes.

**Key Constraints (examples):**

- `MUST` use `mdm-global-metadata.schema.ts` as SSOT for field definitions.
- `MUST NOT` create Tier 1 fields without a `standard_pack_id_primary`.
- `MUST` call `metadata.lookup` before `metadata.create` to avoid duplicates.
- `MUST NOT` add new governance tiers beyond Tier 1–5.
- `MUST` log all Tier 1/2 writes via `usage.tools.ts`.

---

## 7. Contracts & Schemas (Excerpt)

- **`mdm-global-metadata.schema.ts`** — main field/column definition with:
  - `canonical_key`, `label`, `description`.
  - domain, module, entity_urn.
  - governance_tier (Tier 1–5).
  - SoT references and alias structures.
  - flags for profiling and quality rules.

- **`observability.schema.ts`** — governance + profiler + usage (as drafted before):
  - `GovernanceTierEnum`.
  - `profilerStatsSchema`.
  - `usageLogSchema`.

- **`lineage.schema.ts`** — nodes, edges, URNs.
- **`kpi.schema.ts`** — numerator/denominator, SoT, tier, owner.

Schemas are SSOT; OpenAPI & DB migrations are generated from them.

---

## 8. Error Handling & Recovery (Summary)

Error classes (aligned with Kernel):

- `MetadataError` — invalid or conflicting definitions.
- `AliasError` — illegal alias promotion / conflict.
- `SoTError` — invalid or missing SoT mappings.
- `LineageError` — inconsistent or cyclic lineage definitions.
- `QualityError` — failed quality rule evaluation for Tier 1/2.

Retry & recovery for DB/caching same pattern as Kernel; lineage & profiling jobs can be re‑queued.

---

## 9. Observability (Summary)

Key metrics:

- `metadata_search_requests_total`, `metadata_search_duration_seconds`.
- `metadata_lineage_requests_total`, `metadata_lineage_duration_seconds`.
- `metadata_profiler_runs_total`, `metadata_profiler_failures_total`.
- `metadata_usage_events_total`.

Traces:

- `metadata.search`, `metadata.lineage`, `metadata.profile`, `metadata.impact`.

Logs:

- Structured logs for all Tier 1/2 changes, SoT updates, KPI modifications.

---

## 10–14. Security, Tenancy, Config & DR, Testing, Tiering

For these sections, Metadata Studio **inherits** platform‑wide principles from GRCD‑KERNEL and AI‑BOS Platform GRCD:

- **Security:** RBAC/ABAC via Kernel, deny‑by‑default, no raw data; SoT packs & glossary terms treated as configuration assets.
- **Tenancy:** Strong tenant boundaries; no cross‑tenant metadata or lineage.
- **Config & DR:** Backup/restore for metadata, SoT packs, glossary, lineage; export/import endpoints with strict access control.
- **Testing:**
  - Lineage coverage tests for Tier 1.
  - Alias resolution tests.
  - SoT pack conformance tests.
  - Profiling coverage for Tier 1/2.
- **Tiering (Product Bundles):**
  - Lite: basic registry, glossary, tags, Tier 3–5.
  - Pro: adds Tier 1–2, profiling, lineage, impact, HITL.
  - Enterprise: adds multi‑tenant packs, cross‑entity KPIs, advanced impact analytics.

This document is the **SSOT** for Nexus Metadata Studio’s design and implementation. All future code, schema changes, and MCP tools **must conform** to this GRCD or explicitly version it forward.

