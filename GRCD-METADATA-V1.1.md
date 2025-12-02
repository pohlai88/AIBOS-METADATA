# AI-BOS AI & Data Constitution
**Version:** 1.1 (Merged SSOT – AI Orchestra Ecosystem + Global Metadata Registry)
**Status:** Draft for Internal Standardisation
**Owner:** AI-BOS Kernel Council (Architecture, Data, Compliance, Product)

---

## 0. Purpose & Scope

This document defines the **unified AI & Data Constitution** for AI-BOS:

1. The **AI Orchestra Ecosystem** – how AI agents collaborate across domains (DB, UX, API, Infra, Compliance, Business, DevEx).
2. The **Global Metadata Registry & Lineage OS** – the shared semantic brain that all orchestras must use.

It is the **Single Source of Truth (SSOT)** for how AI is allowed to:
- Observe (read),
- Advise (suggest),
- Propose (create change plans), and
- Act (apply changes)

within the AI-BOS platform.

---

## 1. Core Principles

1. **Kernel Sovereignty** – All AI orchestras are subordinate to the AI-BOS Kernel. No agent may bypass Kernel policies, access control, or audit.
2. **Global Metadata First** – The Global Metadata Registry & Lineage OS is the authoritative semantic layer for all data, schemas, entities, and business meanings.
3. **ERP-Native by Design** – All orchestras exist to strengthen governed agility for ERP operations (Finance, HR, Ops, Tax, etc.).
4. **Governed Autonomy** – Each orchestra operates under defined autonomy tiers (read-only → suggest → propose → auto-apply) with risk-based guardrails.
5. **Explicit Audit & Explainability** – Every AI action must be explainable, reproducible, and auditable.
6. **Progressive Hardening** – Orchestras evolve over phases. Higher autonomy is earned via evidence (KPIs, tests, incident history).

---

## 2. Global Metadata Registry & Lineage OS

The Global Metadata Registry & Lineage OS is the **Data Constitution** of AI-BOS.

### 2.1 Responsibilities

- Define **canonical business concepts** (e.g., Revenue, Vendor, Invoice, Journal Entry).
- Maintain a **Global Field Dictionary** (names, aliases, meanings, units, sensitivity, standards mapping).
- Track **entity catalog** (tables, views, events, API payloads, ERP screens).
- Store **lineage graph** (nodes & edges) across DB, API, BI, and ERP modules.
- Provide **impact analysis** (upstream/downstream effects of change).

### 2.2 Core Data Structures (Conceptual)

- `mdm_global_metadata` – Canonical metadata definitions (field_name, canonical_name, business_definition, ref_standard_id, sensitivity_level, data_type, unit, etc.).
- `mdm_entity_catalog` – Registered entities (entity_id, type: table/view/api/screen, system, tenant_scope, lifecycle_status).
- `mdm_metadata_mapping` – Mappings between local fields and global metadata (local_field_name, canonical_metadata_id, confidence_score, mapping_source, approval_status).
- `mdm_lineage_nodes` – Assets in lineage (node_id, type: table/column/job/api/report, system, domain, criticality).
- `mdm_lineage_edges` – Relationships (edge_id, from_node_id, to_node_id, edge_type: transform/read/write, frequency, last_observed_at).
- `mdm_naming_policy` – Naming conventions and allowed alias patterns for entities/fields.

> Implementation detail (DB): Actual schema lives in Postgres/Supabase. Realtime features are used for lineage and metadata-aware UIs. Any additional real-time store (e.g., Firestore) is an optimization layer for collaboration, never the SSOT.

### 2.3 Mandatory Services

The Registry exposes standardised services that all orchestras MUST use:

- **Metadata Services**
  - `metadata.fields.search(query, filters)` – Find canonical fields.
  - `metadata.fields.describe(id)` – Get full definition, sensitivity, owner, rules.
  - `metadata.mappings.lookup(local_field)` – Find canonical mapping for a local field.
  - `metadata.mappings.suggest(local_fields[])` – Suggest canonical mappings.
- **Lineage Services**
  - `lineage.graphForNode(node_id, depth, direction)`.
  - `lineage.impactReport(node_id)` – Upstream/downstream impact summary.
  - `lineage.registerNode(node)` / `lineage.registerEdge(edge)` – For ETL jobs, APIs, ERP modules.
- **Policy & Governance Services**
  - `policy.dataAccess.check(actor, resource, intent)`.
  - `policy.changeRequest.create(entity, proposed_change)`.
  - `policy.controlStatus.list(standard, scope)` – MFRS/IFRS, GDPR/PDPA, SOC2, ISO, etc.

All orchestras treat these services as **non-optional** dependencies.

---

## 3. AI Orchestras – Shared Pattern

Each AI Orchestra follows a common pattern:

- **Domain** – the primary scope (DB, UX, API, Infra, Compliance, Business, DevEx).
- **Conductor Agent** – orchestrates tools, specialists, and human approvals.
- **Specialist Agents** – focused roles (SchemaGuardian, DesignGuardian, TaxGuardian, etc.).
- **Tool Set** – MCP tools and internal services (DB, metadata, telemetry, CI, etc.).
- **Autonomy Tier** – allowed level of action (see Section 4).
- **KPIs** – metrics that justify and control autonomy.

Each orchestra is defined by a `*.orchestra.manifest.json` describing:

- Agents and roles
- Tools and permissions
- Input/output contracts
- Applicable policies
- Telemetry events

---

## 4. Autonomy & Risk Tiers

Each orchestra operates under a **risk-based autonomy tier**:

- **Tier 0 – Read-Only Analysis**
  - Can read data, logs, metadata, and produce reports.
  - No change proposals or code generation.

- **Tier 1 – Suggest**
  - Can suggest changes (schema, configs, UI tweaks, policies) as recommendations.
  - Changes must be manually implemented by humans.

- **Tier 2 – Propose**
  - Can generate concrete change artefacts (SQL migrations, PRs, config patches) but cannot auto-apply.
  - Requires human approval via change management (e.g., PR review, change ticket).

- **Tier 3 – Auto-Apply (Guarded)**
  - Can auto-apply low-risk, well-bounded changes under explicit guardrails.
  - Example: add missing non-breaking index, fix copy typos, re-run failed-but-idempotent jobs.
  - All actions logged with full diff and rationale.

Each orchestra and each type of action within it has a **current autonomy tier** and **target tier per phase**.

---

## 5. Orchestras Overview & KPIs

### 5.1 Database & Data Governance Orchestra

**Domain:** Schema design, normalization, migrations, performance, and data quality.

**Key Agents:**
- `SchemaGuardian` – checks 1NF/2NF/3NF, naming, keys, constraints.
- `MigrationPlanner` – designs safe schema migration plans.
- `PerformanceProfiler` – detects slow queries, missing indexes, hot partitions.
- `DataQualitySentinel` – monitors null rates, anomalies, referential integrity.

**Core Tools:**
- DB inspection (Postgres/Supabase).
- `metadata.fields.*`, `lineage.*` services.
- Query stats & telemetry (p95, locks, errors).

**Autonomy Target (Phase 1):**
- Tier 1 globally.
- Selected Tier 2 for non-destructive proposals (adding indexes, new tables).

**Example KPIs:**
- Reduction in **schema drift incidents** per quarter.
- Reduction in **p95 query latency** for key workloads.
- % of schema changes that pass AI review before deployment.

---

### 5.2 UX/UI & Design System Orchestra

**Domain:** Design tokens, layout, components, accessibility, and brand consistency.

**Key Agents:**
- `DesignGuardian` – checks token usage, spacing, color, typography against design system.
- `AccessibilityGuardian` – WCAG checks (contrast, focus, keyboard, ARIA).
- `CopySensei` – microcopy clarity, tone, and localisation hints.

**Core Tools:**
- Repo scanner (UI package, Tailwind config, tokens).
- Storybook/visual snapshots.
- `metadata.fields.describe` for field labels and tooltips.

**Autonomy Target (Phase 1):**
- Tier 1 across layout & tokens.
- Tier 2 for generating PRs with non-breaking improvements (copy updates, spacing).

**Example KPIs:**
- **Token Drift Incidents** per release.
- % of screens passing **WCAG AA** checks.
- Time-to-fix visual inconsistencies caught by the orchestra.

---

### 5.3 API & BFF Orchestra

**Domain:** API contracts, BFF layers, versioning, scopes, and backwards compatibility.

**Key Agents:**
- `APIContractAgent` – validates OpenAPI/GraphQL contracts against metadata and domain rules.
- `VersioningAgent` – enforces versioning strategy and deprecation policies.
- `ScopeGuardian` – validates auth scopes, least-privilege access.

**Core Tools:**
- OpenAPI/GraphQL schema scanners.
- `metadata.fields.mappings` for payload semantics.
- Auth config, scope registry.

**Autonomy Target (Phase 1):**
- Tier 1 for analysis.
- Tier 2 for PRs that add non-breaking fields with proper versioning.

**Example KPIs:**
- # of **breaking changes** prevented.
- % of APIs mapped to canonical metadata.
- Time-to-identify API regressions.

---

### 5.4 Backend & Infra Orchestra

**Domain:** Service topology, performance, reliability, cost, security posture.

**Key Agents:**
- `InfraTopologyAgent` – maps services, dependencies, and blast radius.
- `SLOGuardian` – monitors SLOs/SLIs and error budgets.
- `CostSentinel` – flags cost anomalies.

**Core Tools:**
- Observability stack (logs, metrics, traces).
- Infra-as-code scanner.

**Autonomy Target (Phase 1):**
- Tier 1 analysis only.
- Select Tier 2 proposals for infra-as-code patches.

**Example KPIs:**
- MTTR improvement for incidents.
- # of cost anomalies caught before billing cycle.
- % of services with defined SLOs.

---

### 5.5 Compliance, Risk & Audit Orchestra

**Domain:** Financial reporting (MFRS/IFRS), tax rules, data protection (GDPR/PDPA), SOC2/ISO controls, AI usage policies.

**Key Agents:**
- `FinanceStandardAgent` – maps ledger and COA to MFRS/IFRS requirements.
- `TaxGuardian` – validates tax logic.
- `PrivacyGuardian` – checks PII flows versus consents and policies.
- `ControlMonitor` – continuous control verification.

**Core Tools:**
- Global Metadata & Lineage OS.
- Policy registry (controls, mappings to systems).
- ERP transaction streams.

**Autonomy Target (Phase 1):**
- Tier 0–1 only (read + suggest).
- High-risk domain; proposals must be reviewed by humans.

**Example KPIs:**
- Time-to-produce audit-ready **evidence packs**.
- # of policy violations detected before release.
- Coverage: % of critical entities mapped to standards.

---

### 5.6 Business Domain Orchestras (Finance / HR / Ops / Tax)

**Domain:** ERP-native workflows – AP/AR, GL close, payroll, inventory, projects, etc.

**Key Agents (examples):
- `CloseProcessAgent` – orchestrates period-close checklist.
- `CashflowAgent` – forecasts cash and flags risk.
- `HeadcountAgent` – reconciles payroll vs HR vs GL.

**Core Tools:**
- ERP data models (journals, invoices, vendors, employees).
- Global Metadata & Lineage OS.
- BI/Reporting layer.

**Autonomy Target (Phase 1):**
- Tier 0–1 (dashboards, suggestions).
- Selected Tier 2 for checklists, task generation, and scenario plans.

**Example KPIs:**
- Reduction in **close cycle days**.
- Reduction in **manual reconciliations**.
- % of business processes with AI-assisted playbooks.

---

### 5.7 DevEx & Quality Orchestra

**Domain:** Developer productivity, code quality, tests, CI/CD hygiene.

**Key Agents:**
- `SurgicalFixer` – targeted fixes for ESLint/TS errors.
- `HybridFixer` – batch auto-fix with preview and rollback.
- `TestGuardian` – ensures coverage and regression checks.

**Core Tools:**
- Repo scanner, linter, type checker.
- CI/CD logs.

**Autonomy Target (Phase 1):**
- Tier 2 (PR generation with human approval).
- Gradual Tier 3 for trivial, repeatable fixes.

**Example KPIs:**
- Reduction in **build failures**.
- Time-to-fix common error classes.
- % of PRs touching only AI-suggested changes.

---

## 6. Cross-Orchestra Dependencies on Metadata OS

All orchestras have a **hard dependency** on the Global Metadata Registry & Lineage OS:

- **DB Orchestra** uses it to validate schema naming, domain mapping, and impact of schema changes.
- **UX Orchestra** pulls field definitions, labels, sensitivity, and help text for tooltips and UI states.
- **API Orchestra** uses field mappings to ensure payloads match canonical meanings and privacy rules.
- **Compliance Orchestra** retrieves control mappings and lineage to build evidence packs.
- **Business Orchestras** use canonical concepts (Revenue, Vendor, Employee) to ensure analytics and decisions are consistent.

No orchestra may:
- Introduce new entities/fields without **registering** them with the Metadata OS.
- Change semantics that contradict canonical metadata without explicit change requests and approvals.

---

## 7. Implementation Stack (Reference)

This Constitution is **runtime-agnostic**, but the reference implementation is expected to use:

- **LangGraph** (or equivalent) for graph-based agent workflows, stateful orchestration, and human-in-the-loop.
- **MCP (Model Context Protocol)** for tool integration (DB, metadata, Git, CI, ERP APIs).
- **Postgres/Supabase** as the primary data store for ERP and Metadata OS, with Realtime for change events.
- **Next.js/React** frontends, with AI-augmented sidebars and wizards driven by orchestras.

Actual implementation details live in engineering READMEs and repo-specific GRCD documents.

---

## 8. Phased Rollout

### Phase 1 – Foundation & Read-Heavy Orchestration

- Implement Global Metadata Registry & Lineage OS v1.
- Enable DB, DevEx, and UX Orchestras at Tier 0–1.
- Wire orchestras to observability and metadata telemetry.

### Phase 2 – Proposals & PR Generation

- Elevate selected actions in DB, UX, API, and DevEx Orchestras to Tier 2.
- Introduce Business Domain Orchestras (Finance close, AP/AR helpers).
- Start generating PRs/migration scripts/config patches for human approval.

### Phase 3 – Guarded Auto-Apply

- Enable Tier 3 for low-risk, high-confidence patterns (indexes, safe refactors, copy fixes).
- Introduce Compliance & Risk Orchestra for continuous control monitoring (still Tier 0–1).
- Tighten KPIs and blast radius guardrails.

### Phase 4 – Full Ecosystem Integration

- Unified dashboard for AI-mediated changes and incidents.
- Marketplace for new orchestras and tenant-specific agents.
- External integrations (partners, auditors) via governed APIs.

---

## 9. Competitive Positioning (Appendix)

**Frameworks (LangGraph, CrewAI, etc.)**
- Strength: powerful graph/multi-agent orchestration.
- Limitation: no built-in ERP domain, metadata registry, or governance constitution. AI-BOS uses them as execution engines, not as its brain.

**Platforms (Palantir AIP, Fabrix.ai, etc.)**
- Strength: enterprise AI platforms integrating data, models, and workflows.
- Limitation: closed, heavy, and not tailored to MFRS/IFRS ERP governance. AI-BOS focuses on mid-market ERP + governance-first AI.

**AI-BOS Position:**
- **ERP-Native AI Orchestration** – designed around COA, journals, tax, HR, and ops.
- **Global Data Constitution** – Metadata & Lineage OS as mandatory brain.
- **Governed Autonomy** – risk-tiered orchestras, progressive hardening, full audit trail.

This document governs how AI is allowed to participate in building, running, and evolving AI-BOS. All future designs, tools, and orchestrations must align with this Constitution.

