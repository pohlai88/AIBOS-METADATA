This add‑on spec extends the Governed Agility ERP SSOT with a **Global Metadata Registry & Lineage** (a first‑class “Data Constitution / Catalog OS”) to govern field names, schema names, semantic meaning, ownership, and cross‑module data lineage.

---

# 0. Why this module is critical
Your instinct is right: a **global metadata registry** is the missing layer that elevates ERP governance beyond customization safety into **enterprise‑grade data trust**.

It solves problems that Schema Registry alone doesn’t fully cover:
- **Semantic drift**: two teams create “sales_region” vs “region_sales” with different meanings.
- **Cross‑module inconsistency**: Finance uses “posting_date”, Ops uses “transaction_date”, BI can’t reconcile.
- **Lineage blindspots**: auditors ask “where did this number come from?” and nobody can answer.
- **AI confusion**: agents need authoritative metadata to reason correctly.

Think of it as the **ERP Data Constitution** that sits next to the Schema Registry OS.

---

# 1. Relationship to Schema Registry OS
## 1.1 Scope boundary
- **Schema Registry OS** governs *how a tenant extends an entity* (fields + workflows lifecycle).
- **Global Metadata Registry** governs *what fields mean globally* (naming, semantics, standards, lineage).

## 1.2 Integration rule
Every registry‑approved field must map to **one global metadata record**.

**Field creation flow becomes:**
1) Draft field in Schema Registry
2) Auto‑suggest (or select) Global Metadata mapping
3) Approval checks both registries
4) Activation links field_id ↔ metadata_id

---

# 2. Core capabilities
1. **Global Field Dictionary (Semantic SSOT)**
   - canonical name, label, definition, unit, domain, type
   - synonyms + deprecated aliases

2. **Schema & Entity Catalog**
   - canonical entity names
   - cross‑module mappings
   - owner + steward assignment

3. **Lineage Graph (End‑to‑End)**
   - source → transform → target
   - computed fields and AI‑generated logic included

4. **Governed Naming & Standards**
   - enforced conventions (snake_case, prefixes, reserved words)
   - validation on draft fields

5. **Impact Analysis**
   - “If this field changes, what breaks?”
   - highlights P&L/BS/Operational/BI impact

6. **Metadata‑Aware AI**
   - agents use metadata as truth layer
   - reduces hallucinatory mappings

---

# 3. Data model (minimum tables)

## 3.1 mdm_global_metadata (field dictionary)
- `metadata_id`
- `canonical_key` (e.g., sales_region)
- `label`
- `definition`
- `data_type` (string|number|date|enum|ref)
- `domain` (finance|sales|inventory|hr|custom)
- `unit_of_measure`
- `allowed_values_json`
- `synonyms_json` (list of aliases)
- `status` (active|deprecated|proposed)
- `owner_role`
- `steward_user_id`
- `standard_ref` (MFRS, ISO, internal)
- `created_at`, `updated_at`

## 3.2 mdm_entity_catalog
- `entity_id`
- `canonical_entity_type` (journal_entry, item, farm_batch, etc.)
- `description`
- `domain`
- `owner_role`
- `steward_user_id`
- `version`
- `status`

## 3.3 mdm_metadata_mapping (links Schema Registry ↔ Global Metadata)
- `mapping_id`
- `tenant_id`
- `schema_id`
- `field_id`
- `metadata_id`
- `mapping_type` (canonical|alias|override)
- `confidence_score` (if AI‑suggested)
- `approved_by`, `approved_at`

## 3.4 mdm_lineage_nodes
- `node_id`
- `node_type` (table|field|view|job|api|ai_transform)
- `entity_type`
- `metadata_id` (nullable)
- `schema_version` (nullable)
- `tenant_scope` (global|tenant)
- `properties_json`

## 3.5 mdm_lineage_edges
- `edge_id`
- `from_node_id`
- `to_node_id`
- `transform_type` (copy|calc|aggregate|filter|join|ai_infer)
- `transform_ref` (sql|code|workflow_id|agent_id)
- `quality_score`
- `created_at`

## 3.6 mdm_naming_policy
- `policy_id`
- `policy_json` (rules, reserved words, patterns)
- `scope` (global|domain|tenant)
- `status`

---

# 4. API surface (minimum)
- `GET  /metadata/fields:search?q=`
- `POST /metadata/fields:propose`
- `POST /metadata/fields/{id}:approve`
- `GET  /metadata/entities/{type}`
- `POST /metadata/mappings:suggest` (AI)
- `POST /metadata/mappings:approve`
- `GET  /lineage/{metadata_id}`
- `GET  /lineage/impact?metadata_id=`

---

# 5. UX modules (what users see)
1. **Metadata Explorer**
   - search fields/entities
   - synonyms + usages
   - owners + standards

2. **Lineage Viewer**
   - interactive graph
   - filter by tenant, domain, schema version

3. **Impact Panel**
   - “Used in: 12 forms, 4 workflows, 3 BI dashboards”
   - risk tier + approvals

4. **Draft Assist in Builder**
   - as user types a new field name:
     - auto‑suggest canonical names
     - warn about duplicates
     - show semantic conflicts

---

# 6. AI Agent upgrades for metadata governance
1. **MetadataSteward Agent**
   - suggests canonical names
   - detects duplicates/semantic collisions
   - recommends merge/deprecate

2. **LineageTracer Agent**
   - auto‑builds lineage from SQL/jobs/workflows/events
   - tags edges with transform_ref

3. **SemanticValidator Agent**
   - checks that tenant overrides don’t violate global meaning
   - flags “shadow definitions”

---

# 7. How it changes your differentiation story
Without this module:
- you sell **governed customization**.

With this module:
- you sell **governed data truth + explainable lineage**.

**New tagline option:**
> “Governed Agility ERP with a Global Data Constitution.”

**CFO/Auditor trust bullets:**
- Every field in the ERP has a canonical definition.
- Every report figure is traceable to source transactions.
- Schema changes are impact‑scored across the whole ecosystem.

---

# 8. Build order add‑on (fits your roadmap)
**Add this in late Phase 2 / early Phase 3**:
1) Field dictionary + mapping table
2) Builder draft‑assist + naming policy checks
3) Lineage nodes/edges auto‑capture from events
4) AI MetadataSteward suggestions
5) Graph viewer + impact heatmap

---

**End of add‑on SSOT.**

This module is the “data governance crown” that makes AI‑BOS feel like an ERP + enterprise catalog + AI audit platform in one.

