# Repo-level README Pack for AI-BOS AI & Data Constitution

This document contains **ready-to-split** repo-level READMEs. Each section is intended to become its own file in your monorepo.

---

```markdown
# docs/AI_CONSTITUTION.md

# AI-BOS AI & Data Constitution

**Status:** Canonical Reference (Do Not Fork)
**Owner:** AI-BOS Kernel Council (Architecture · Data · Compliance · Product)

---

## 1. What This Document Is

This README is the **developer-facing entry point** to the AI-BOS AI & Data Constitution.

It summarises how:

- **AI Orchestras** (DB, UX, API, Infra, Compliance, Business, DevEx) are structured and governed.
- The **Global Metadata Registry & Lineage OS** acts as the shared semantic brain.
- **Autonomy tiers** (Tier 0–3) control what AI is allowed to do.
- The system is rolled out in **phases**, with KPIs and guardrails.

The full Constitution text lives in:

- `/docs/AI_CONSTITUTION_FULL.md` (SSOT – long form)
- Internal knowledge base (Board / GRCD workspace)

This file is the **short, actionable version** for engineers.

---

## 2. Core Concepts

### 2.1 Global Metadata Registry & Lineage OS

The Metadata OS is the **Data Constitution** of AI-BOS.

It provides:

- **Global Field Dictionary** – canonical names, meanings, sensitivity, mappings to standards.
- **Entity Catalog** – registered tables, views, APIs, ERP screens.
- **Lineage Graph** – how data flows between DB, APIs, jobs, BI, and ERP modules.
- **Policy Hooks** – data access checks, change requests, control mappings.

If you are:

- Defining a new table/field,
- Changing an API payload,
- Adding a new ERP screen or report,

then you **must** integrate with the Metadata OS. See: `metadata-os/README.md`.

---

### 2.2 AI Orchestras

An **AI Orchestra** is a governed cluster of agents solving problems in a domain:

- **DB & Data Governance Orchestra** – schema, migrations, performance, data quality.
- **UX/UI & Design System Orchestra** – tokens, layout, accessibility, brand.
- **API & BFF Orchestra** – contracts, versioning, scopes.
- **Backend & Infra Orchestra** – topology, SLOs, cost.
- **Compliance, Risk & Audit Orchestra** – MFRS/IFRS, tax, GDPR/PDPA, SOC2, ISO.
- **Business Domain Orchestras** – Finance, HR, Ops, Tax workflows.
- **DevEx & Quality Orchestra** – ESLint/TS fixes, tests, CI hygiene.

Each orchestra has:

- A **Conductor Agent**
- Several **Specialist Agents**
- A **tool set** (MCP + internal APIs)
- A `*.orchestra.manifest.json` definition

See: `orchestras/README.md`.

---

### 2.3 Autonomy Tiers

We control risk using **4 autonomy tiers**:

- **Tier 0 (Read-Only)** – observe, analyse, report.
- **Tier 1 (Suggest)** – make recommendations; humans implement.
- **Tier 2 (Propose)** – generate concrete changes (SQL, PRs, config patches); humans approve.
- **Tier 3 (Auto-Apply)** – apply low-risk changes under strict guardrails.

Each orchestra and each action within it is assigned a **current tier** and a **target tier per phase**.

---

## 3. How To Work With The Constitution

### 3.1 If You Are Adding a New Service / Module

1. **Register entities & fields** in Metadata OS
   - Create or extend entries in `mdm_entity_catalog` and `mdm_global_metadata`.
   - Map local fields to canonical fields (`mdm_metadata_mapping`).

2. **Declare lineage**
   - Make sure jobs/APIs register lineage nodes and edges.

3. **Hook into relevant orchestra(s)**
   - Example: a new backend service should be visible to **DB**, **API**, and **Infra** Orchestras.

### 3.2 If You Are Adding a New AI Feature / Agent

1. Decide **which orchestra** it belongs to.
2. Extend the relevant `*.orchestra.manifest.json`.
3. Declare tools via MCP in a governed way (no direct secrets or wild access).
4. Set a **Tier 0 or 1** autonomy level initially.
5. Add KPIs and telemetry events.

### 3.3 If You Are Changing Behaviour / Policies

- All changes must be consistent with:
  - Autonomy tiers
  - Metadata OS contracts
  - Compliance policies

If in doubt, escalate to the **Kernel Council**.

---

## 4. Phased Rollout (High Level)

- **Phase 1** – Metadata OS v1, DB + DevEx + UX Orchestras at Tier 0–1.
- **Phase 2** – Proposals/PRs (Tier 2) for DB, UX, API; Business Orchestras online.
- **Phase 3** – Guarded auto-apply (Tier 3) for low-risk changes.
- **Phase 4** – Full ecosystem integration + marketplace.

---

## 5. Folder Map

Recommended structure:

- `docs/AI_CONSTITUTION.md` (this file)
- `docs/AI_CONSTITUTION_FULL.md` (long form, from SSOT)
- `metadata-os/README.md`
- `orchestras/README.md`
- `orchestras/db/README.md` (optional, per-orchestra deep dives)
- `orchestras/compliance/README.md` (optional)

Keep this file **short and actionable**. Push deep details into sub-READMEs.
```

---

```markdown
# metadata-os/README.md

# Global Metadata Registry & Lineage OS

**Status:** Mandatory Infrastructure
**Owner:** Data Architecture Lead · Compliance Lead

---

## 1. Purpose

The Metadata OS is the **shared brain** for all data and AI in AI-BOS.

It ensures that:

- Every entity and field in the ERP has a **clear, globally defined meaning**.
- Data flows are tracked end-to-end via a **lineage graph**.
- Policies (access, privacy, standards) are enforced consistently.
- AI Orchestras cannot operate without going through this layer.

If you are building or changing:

- Tables, views, jobs, APIs, screens, or reports,
- AI workflows that touch data,

then you must integrate with this OS.

---

## 2. Concepts & Tables (Conceptual)

> Note: Actual schema lives in Postgres/Supabase. This section describes concepts, not exact SQL.

### 2.1 Global Metadata

- `mdm_global_metadata`
  - One row per canonical field/attribute.
  - Key columns (examples):
    - `id`
    - `canonical_name`
    - `business_definition`
    - `domain` (Finance / HR / Ops / Tax / Cross-cutting)
    - `data_type`
    - `unit`
    - `sensitivity_level`
    - `ref_standard_id` (MFRS/IFRS/Tax/Privacy standard)
    - `owner_role`

### 2.2 Entity Catalog

- `mdm_entity_catalog`
  - One row per entity (table, view, API payload, ERP screen, report).
  - Key columns:
    - `entity_id`
    - `entity_type` (table / view / api / screen / report)
    - `system` (ERP core, submodule, external)
    - `tenant_scope`
    - `criticality`
    - `lifecycle_status` (draft / active / deprecated)

### 2.3 Mappings

- `mdm_metadata_mapping`
  - Maps local fields to canonical metadata.
  - Key columns:
    - `local_system`
    - `local_entity`
    - `local_field`
    - `canonical_metadata_id`
    - `mapping_source` (manual / AI-suggested)
    - `approval_status`
    - `confidence_score`

### 2.4 Lineage Graph

- `mdm_lineage_nodes`
- `mdm_lineage_edges`

Nodes represent assets (tables, columns, jobs, APIs, reports).
Edges represent relationships (transformations, reads/writes, joins).

### 2.5 Naming Policy

- `mdm_naming_policy`
  - Declares allowed naming patterns and forbidden anti-patterns.

---

## 3. Services & APIs

The Metadata OS exposes services internally (and via MCP where needed):

### 3.1 Metadata Services

- `metadata.fields.search(query, filters)`
- `metadata.fields.describe(id)`
- `metadata.mappings.lookup(local_field)`
- `metadata.mappings.suggest(local_fields[])`

### 3.2 Lineage Services

- `lineage.graphForNode(node_id, depth, direction)`
- `lineage.impactReport(node_id)`
- `lineage.registerNode(node)` / `lineage.registerEdge(edge)`

### 3.3 Policy Services

- `policy.dataAccess.check(actor, resource, intent)`
- `policy.changeRequest.create(entity, proposed_change)`
- `policy.controlStatus.list(standard, scope)`

All orchestras **must** use these instead of talking directly to raw tables.

---

## 4. Integration Rules

1. **No new entities** without registering in `mdm_entity_catalog`.
2. **No new fields** without either:
   - Mapping to an existing canonical metadata row, or
   - Creating a new canonical definition.
3. **No semantic changes** (meaning, units, sensitivity) without a change request.
4. All ETL/jobs/APIs that transform data must **register lineage**.

Violations should be flagged by:

- DB & Data Governance Orchestra
- Compliance Orchestra

---

## 5. Usage Examples

### 5.1 Adding a New Table

1. Create `entity_catalog` entry.
2. Define canonical fields in `global_metadata` (if new).
3. Map local fields via `metadata_mapping`.
4. Register lineage edges from source entities.

### 5.2 Changing a Field Type or Meaning

1. Raise `policy.changeRequest.create`.
2. Run `lineage.impactReport` for affected node.
3. Get approval from Data Owner + Compliance.
4. Apply changes via migration, update mappings.

---

## 6. Testing & Validation

- Unit tests: on services (search, describe, impactReport).
- Integration tests: ensure all critical services register nodes/edges.
- Governance checks: periodic scans for unmapped fields and orphan nodes.

This README is the **implementation guide** for engineers building or integrating with the Metadata OS.
```

---

```markdown
# orchestras/README.md

# AI Orchestras – Developer Guide

**Status:** Core Runtime Pattern
**Owner:** Architecture Lead · AI Orchestration Lead

---

## 1. Purpose

This README explains how to **define, implement, and operate** AI Orchestras in AI-BOS.

An Orchestra is a governed cluster of agents that:

- Use tools via MCP and internal APIs
- Respect Metadata OS and policies
- Operate within autonomy tiers (0–3)
- Emit telemetry and KPIs

---

## 2. Orchestra Manifest

Each orchestra is described by a manifest file:

- Location: `orchestras/<name>/<name>.orchestra.manifest.json`

### 2.1 Example Manifest (Simplified)

```json
{
  "name": "db-governance-orchestra",
  "domain": "database",
  "description": "Schema, migrations, performance and data quality guardian",
  "conductor": {
    "id": "db-conductor",
    "model": "gpt-5.1",
    "role": "coordinate agents, enforce policies, escalate to humans"
  },
  "agents": [
    {
      "id": "schema-guardian",
      "role": "check normalization, keys, constraints, naming",
      "tools": ["db.inspect", "metadata.fields.search", "lineage.impactReport"],
      "max_autonomy_tier": 1
    },
    {
      "id": "migration-planner",
      "role": "propose safe schema migration plans",
      "tools": ["db.diff", "db.planMigration", "lineage.impactReport"],
      "max_autonomy_tier": 2
    }
  ],
  "policies": {
    "required_metadata": true,
    "require_change_request_for_destructive": true
  },
  "telemetry": {
    "events": [
      "orchestra.db.plan_generated",
      "orchestra.db.issue_detected",
      "orchestra.db.migration_proposed"
    ]
  }
}
```

---

## 3. Autonomy Tiers (Quick Reference)

- **Tier 0 – Read-Only**
  - Allowed: analysis, diagnostics, reports.
  - Forbidden: code changes, PRs, DB writes.

- **Tier 1 – Suggest**
  - Allowed: recommendations in comments, markdown, tickets.
  - Forbidden: generating executable artefacts without human review.

- **Tier 2 – Propose**
  - Allowed: generating SQL migrations, PRs, config patches.
  - Forbidden: auto-commit; requires human approval.

- **Tier 3 – Auto-Apply (Guarded)**
  - Allowed: applying pre-approved classes of changes.
  - Always requires logs, diffs, and rollback plans.

Each agent in the manifest declares a **max_autonomy_tier**.

---

## 4. Adding a New Orchestra

1. **Choose Domain**
   - DB / UX / API / Infra / Compliance / Business / DevEx.

2. **Design Agents**
   - Define Conductor + Specialist agents.
   - For each agent, define responsibilities and tool list.

3. **Declare Tools via MCP**
   - Ensure tools are safe, scoped, and audited.

4. **Write Manifest**
   - Place in `orchestras/<name>/<name>.orchestra.manifest.json`.

5. **Wire Into Runtime**
   - Use LangGraph (or equivalent) to materialise the orchestra.

6. **Set KPIs**
   - Define what success looks like (e.g. fewer incidents, faster closes).

---

## 5. Working With Existing Orchestras

### 5.1 Common Tasks

- Add/remove tools from agents.
- Adjust autonomy levels.
- Refine prompts, system messages, and decision logic.
- Add new telemetry events.

### 5.2 Safety Requirements

- Changes to autonomy tiers must be **reviewed by Kernel Council**.
- New tools must pass **security and data governance review**.
- Breaking changes should go through a **feature flag** rollout.

---

## 6. Testing & Observability

For each orchestra:

- **Unit tests** – tool wrappers, decision logic.
- **Scenario tests** – end-to-end flows (e.g. schema change, API version bump).
- **Shadow mode** – run agents in observation mode before enabling proposals.
- **Metrics** – per-orchestra KPIs (see AI Constitution).

Telemetry events should be emitted to a central observability stack for:

- Success/failure counts
- Time-to-decision
- Human approval/override rates

---

## 7. When To Create vs Extend an Orchestra

- **Create new** when:
  - Domain is clearly distinct.
  - KPIs and stakeholders are different.

- **Extend existing** when:
  - New capability is tightly related (e.g. new DB check).
  - Same owners and KPIs.

If in doubt, consult the Architecture / AI Orchestration lead.
```

---

> You can split each ```markdown``` block into its own file:
>
> - `docs/AI_CONSTITUTION.md`
> - `metadata-os/README.md`
> - `orchestras/README.md`
>
> Additional per-orchestra READMEs (e.g. `orchestras/db/README.md`) can be cloned from the patterns above.

