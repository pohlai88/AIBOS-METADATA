# 🧾 GRCD — UX/UI Strategy (Dual-Mode Orchestra)

**Document ID:** GRCD-UX-UI-STRATEGY-v1.1.0  
**Status:** Refined Strategic Baseline (Implementation-Ready)  
**Last Updated:** 2025-11-30  
**Owners:** Head of Design · Chief Product Officer · Frontend Orchestra Lead  
**Linked Specs:** [REF-GRCD-KERNEL] · [REF-AI-ORCHESTRA] · [REF-FRONTEND-ORCHESTRA] · [REF-METADATA-STUDIO]

> **Purpose of this Document**  
> This GRCD defines the **Dual-Mode User Experience Strategy** for AI‑BOS Nexus. It rejects the false choice between a **Traditional ERP UI** and a **Chatbot-Only UI**.
>
> Instead, it mandates a **Unified Interface with Two First-Class Perspectives** over the same Kernel and data:
> 1. **The Ledger (Stability):** A conventional, high‑density, keyboard‑centric grid interface for rapid execution and audit.  
> 2. **The Cockpit (Agility):** An agentic, intent-driven interface for orchestration, planning, and human‑in‑the‑loop decisions.
>
> Humans define intent and verify results. AI proposes plans and executes drudgery. Both are governed by the **Kernel** and **Design Tokens**.

---

## 1. Strategic Context & Reasoning

### 1.1 The “Why” (Reasoning)
We do **not** build Dual‑Mode UX to show off features. We build it because:

1. **Finance requires density and determinism.**  
   - High‑volume finance workflows (GL, AP, AR, bank rec, closing) need dense grids, batch actions, and precise keyboard operations.
   - IFRS/MFRS and Big‑4 audit practices expect **line‑level visibility** and reproducible calculations. [REF-IFRS-LEDGER]

2. **AI requires supervision and evidence.**  
   - Fully autonomous black‑box AI is incompatible with audit, compliance, and public‑market expectations.  
   - Humans must see **“What is AI going to do?”** (Plan), **“What changed?”** (Diff), and **“Why this is allowed?”** (Evidence/Lineage) before approving high‑risk actions. [REF-AI-ORCHESTRA]

3. **Adoption requires familiarity and a safe bridge.**  
   - We cannot erase 30 years of accounting muscle memory: spreadsheets, ERPs, and grids.  
   - For Controllers and clerks, **The Ledger** is home base.  
   - **The Cockpit** is the guided, AI‑powered upgrade path — but it must be optional, explainable, and reversible.

### 1.2 Target Audience & Pain Points

| Audience Segment          | The Pain Point                                               | The Dual‑Mode Solution |
| ------------------------- | ------------------------------------------------------------ | ---------------------- |
| **Controller / CFO**      | **Black‑Box Anxiety.** Fear of hallucinations, mis‑postings, and hidden compliance risk. | **The Cockpit** exposes plan, diff, evidence, and lineage for every AI‑assisted action. |
| **Data Entry Clerk**      | **Click Fatigue & Latency.** Chatbots are too slow and too vague for high‑volume posting. | **The Ledger** delivers high‑density grids, keyboard shortcuts, and instant, schema‑driven validation. |
| **IT / Admin / Platform** | **UI Drift & Sprawl.** Custom widgets break theme, upgrades, and tests. | **Frontend Orchestra + Design Tokens.** All UI is generated from tokens and metadata, not ad‑hoc code. |
| **Auditor / Regulator**   | **Proving Control.** Need evidence of policies, approvals, and SoT for every number. | **Evidence Locker + Kernel Logs.** Every action, in both modes, is cryptographically logged and explainable. |

### 1.3 Expected ROI & Success Criteria

**Mode Split (Design Intention):**  
- ~80% of *routine transactional* work → **The Ledger**  
- ~100% of *complex, corrective, or strategic* work (closing, migrations, bulk fixes) → **The Cockpit**

**ROI Targets:**

- **Zero Retraining Cost (Ledger).**  
  Accountants can use Ledger with minimal training; it behaves like a modern, safer Excel/ERP grid.

- **Error Reduction via Proposal → Verify Loop.**  
  The Cockpit must prevent:  
  - Mis‑codings (wrong GL account, cost center, tax code).  
  - FX mismatches and out‑of‑policy postings.  
  Success metric: ≥ **50–90% reduction** in critical posting errors on flows covered by AI‑assisted Cockpit patterns. [REF-AI-ORCHESTRA]

- **Audit Readiness by Design.**  
  Every Cockpit‑initiated change must:  
  - Have a **Plan** and a **Diff**.  
  - Be linked to a **Lineage graph** and **SoT Pack** (source documents, policies, reference data). [REF-GRCD-KERNEL]  
  - Be reproducible under Big‑4 scrutiny.

### 1.4 Competitor Reference & Positioning

This strategy is informed by analysis of major ERP + AI vendors:

- **SAP S/4HANA + Fiori + Joule**  
  - Strength: Very deep finance functionality; mature grid + form UX; strong role concepts.  
  - AI Approach: Joule acts as an embedded copilot for navigation, insights, and automation inside Fiori apps.  
  - Limitation: AI is layered **inside a single UX mode**; there is no explicitly defined dual‑mode Ledger/Cockpit mental model.

- **Oracle Fusion + Redwood + AI Services**  
  - Strength: Redwood is a powerful design system unifying Fusion’s UI; Oracle is investing heavily in AI‑infused workflows.  
  - AI Approach: Task‑centric, Redwood‑themed experiences with embedded recommendations, conversational patterns, and automation.  
  - Limitation: Governance patterns for AI (like Diff + Evidence Locker) are mostly implicit in marketing, not explicit as GRCD contracts.

- **Microsoft Dynamics 365 (Finance, F&O, BC) + Copilot**  
  - Strength: Deep integration with M365 (Excel, Teams), strong finance breadth; Copilot surfaces insights and automation in familiar environments.  
  - AI Approach: Conversational assistance inside workspace shells (e.g., “Help me create a collection letter”, “Summarize this account”).  
  - Limitation: Copilot is framed as a **companion** overlay, not as an equal “Cockpit mode” governed by explicit Plan → Act → Verify contracts.

- **Oracle NetSuite + SuiteAnalytics / Workbooks**  
  - Strength: Cloud‑native ERP with dashboards and analytics; strong SME focus.  
  - Limitation: Mostly **Ledger‑centric**, with analytics dashboards and saved searches; agentic AI and dual‑mode supervision are nascent.

**AI‑BOS Nexus Position:**

- **Ledger vs Cockpit are first‑class, governed modes**, not just styling variations or optional AI widgets.  
- **Design Tokens are law** across both modes, enforcing coherence and anti‑drift similar to (and more strongly than) Redwood/Fiori.  
- **Agentic AI is supervised via explicit GRCD patterns** (Plan Visualizer, Diff Viewer, Evidence Locker) with Safe Mode and degraded behavior defined by Kernel.

### 1.5 Usage Targets & Telemetry Hooks

To validate this strategy, UX is instrumented from day one:

- **Metric:** `mode_usage_ratio = %_ledger_vs_cockpit` per persona, module, and task type.
- **Initial (Year 1) Targets:**
  - **Clerks / AP / AR Operators:** ~90% Ledger, 10% Cockpit.  
  - **Controllers / CFO / Finance Leads:** ~30% Ledger, 70% Cockpit.  
  - **IT / Compliance / Platform Teams:** ~20% Ledger, 80% Cockpit.

- **Telemetry Requirements:**
  - Every mode switch (Ledger ↔ Cockpit) is logged by **AppTelemetry** with:  
    `persona`, `module`, `task_type`, `reason` (e.g. "error_fix", "kpi_investigation"), and `outcome` (success/fail).  
  - Hybrid Fixer and Drill‑Down flows must emit structured events usable for cohort analysis.

---

## 2. Architecture: One Platform, Two Perspectives

Both modes are **projections of the same reality**:

- Same **Kernel** (governance, audit, policies).  
- Same **design tokens** (L0 color/space/typography/density).  
- Same **metadata schemas** from `Metadata Studio`.  
- Same **AI‑Orchestras and MCP tools**.

They differ only in **perspective and interaction style**.

### 2.1 Mode A: The Ledger (Conventional)

> **Principle:** *Maximum Density, Zero Surprises.*

**Design Philosophy:** Conservative, ergonomic, familiar to ERP and Excel users.

**Key Capabilities:**

- **Smart Grids**  
  - Virtualized scrolling; server‑side pagination for large journals.  
  - Inline editing with per‑cell validation.  
  - Column definitions derived from `Metadata Studio` field specs and SoT (not hardcoded in UI code). [REF-METADATA-STUDIO]

- **Schema‑Driven Forms**  
  - Label/Input pairs generated from metadata and Hexagonal backend ports.  
  - Validation rules (required, range, regex, reference constraints) enforced by `SchemaGuardian`. [REF-SCHEMA-GUARDIAN]

- **Status Indicators & Badges**  
  - Simple, deterministic states: Draft, Posted, Reversed, Locked, Error, Pending Approval.

**Agent Interaction: Passive by Default**

- Background agents: `SchemaGuardian`, `ComplianceAdvisor`, `A11yGuard`, `PerformanceTuner` monitor the Ledger silently.  
- They surface issues as:
  - **Soft cues:** field highlights, unobtrusive toasts, inline hints.  
  - **Hard blocks:** modal or inline error when legal/compliance constraints are violated.

Ledger **never surprises** users with unsolicited AI actions: changes require explicit human intent.

### 2.2 Mode B: The Cockpit (Orchestrator)

> **Principle:** *Intent‑Driven, Visualized Thought.*

**Design Philosophy:** Conversational, card‑based, timeline‑centric, optimized for decision‑making.

**Key Components:**

- **Intent Bar**  
  - Single entry point: “What do you want to achieve?”  
  - Accepts natural language, structured templates, or quick actions (e.g., "Close period", "Fix FX mismatches", "Explain this variance").

- **Plan Visualizer**  
  - Renders AI’s proposed steps as a timeline: `Plan → Act → Verify`.  
  - Each step has: description, scope, preconditions, expected impact.

- **Diff Viewer**  
  - Side‑by‑side “Before vs After” for all proposed changes (journal lines, balances, classifications).  
  - Supports grouping by entity, account, cost center, period.  
  - Designed for HITL approvals and Big‑4 style review.

- **Evidence Locker**  
  - Panel bundling all **inputs and justifications** used by AI:  
    - Source documents, policies, configuration snapshots.  
    - Lineage graph nodes and edges.  
    - Simulation / test results from Live Simulator. [REF-LIVE-SIMULATOR]

**Agent Interaction: Active and Governed**

- The `frontend-orchestrator` constructs Cockpit views based on **task type** and **intent**.  
- For each Cockpit session, AI agents must:
  - Produce a **Plan**.  
  - Produce a **Diff** (if changes are proposed).  
  - Populate the **Evidence Locker**.  
  - Wait for HITL approval before committing write actions to the database.

---

## 3. Bridge Strategy: From Manual to Orchestrated Power

The **competitive advantage** of AI‑BOS is *not* just having both modes. It is **how users move between them**.

We standardize this through named UX patterns so agents and humans behave predictably.

### 3.1 Pattern: Hybrid Fixer

**ID:** `PATTERN-BRIDGE-HYBRID-FIXER-001`  
**Goal:** Turn a painful error in the Ledger into a guided, safe correction in the Cockpit.

**Trigger Types:**
- Data inconsistencies (e.g., mismatched currencies, out‑of‑policy tax codes).  
- Compliance breaches (e.g., posting to blocked account, crossing approval threshold).  
- Reconciliation anomalies (e.g., unmatched transactions, residual balances).

**Entry Point:**
- From a Ledger grid row, cell, or validation banner.

**UX Contract:**

1. The Ledger surfaces a **non‑blocking CTA**: `Orchestrate Fix ✨`.  
2. Clicking opens a **Cockpit Drawer** (not full‑screen) to preserve context.  
3. The Cockpit Drawer must show **exactly three sections**:
   - **Problem Summary:** Plain language explanation of what is wrong and why it matters.  
   - **Proposed Plan:** Step list of what AI intends to do (e.g., "Reclass lines 8–12 to account 4100 using FX rate XYZ").  
   - **Diff Preview:** Minimal diff summary with option to open full Diff Viewer.
4. The user chooses: **Apply**, **Modify**, or **Reject**.
5. On **Apply**:
   - Cockpit triggers AI‑Orchestra workflow.  
   - Ledger view refreshes to reflect applied changes.  
   - Evidence Locker and Kernel logs record the action with full Plan + Diff.

**Post‑Conditions:**

- All Hybrid Fixer executions are logged as structured events:  
  `event_type=hybrid_fixer`, `source_mode=ledger`, `task_type`, `result`, `time_to_fix`.

### 3.2 Pattern: Drill‑Down from Cockpit to Ledger

**ID:** `PATTERN-BRIDGE-DRILLDOWN-002`  
**Goal:** Turn an aggregate number or anomaly in Cockpit into a precise, filtered Ledger view.

**Trigger Types:**
- KPI cards, anomaly alerts, narrative insights (“Q3 revenue variance is +12% vs last year”).

**Entry Point:**
- Click or tap on a number, chart segment, or anomaly badge in Cockpit.

**UX Contract:**

1. Cockpit passes a **filter contract** to Ledger:  
   e.g., `entity=DLBB-001`, `account=4100`, `period=2025-Q3`, `scenario=ACTUAL`.
2. Ledger opens in a **focused view**, applying filter chips and clearly indicating context from Cockpit.  
3. Optional overlay shows **Lineage Graph** for that KPI: which journal entries, adjustments, and allocations contributed.
4. User can refine filters or export to Excel/CSV if needed.

**Post‑Conditions:**

- Drill‑down events are logged as: `event_type=drilldown`, `source_mode=cockpit`, `metric_id`, `ledger_rows_returned`.

---

## 4. Governance, Anti‑Drift & Safety

Without strict governance, Dual‑Mode UX degenerates into a zoo of custom pages. This section hard‑codes **non‑negotiable rules**.

### 4.1 Tokens Are Law

- Both **Ledger** and **Cockpit** MUST consume the same **L0 Design Tokens**: color, spacing, typography, elevation, density. [REF-DESIGN-TOKENS]
- **Ledger**:  
  - Uses `density.compact` and grids optimized for information density and keyboard ergonomics.  
- **Cockpit**:  
  - Uses `density.comfortable` and larger typography for cognitive clarity.
- Agents and human developers are **forbidden** from hardcoding colors, spacing, or visual constants. All style changes go through tokens.

### 4.2 Component Stewardship & RACI

We split ownership between Ledger and Cockpit components, but keep them under one Orchestra.

**Ledger Components (Grids, Forms, Filters)**

- **Responsible:** `Lynx.FrontendImplementor`  
- **Accountable:** Head of Product – Finance  
- **Consulted:** `SchemaGuardian`, `ComplianceAdvisor`, `PerformanceTuner`  
- **Informed:** AI‑Orchestra Team, AppTelemetry

**Cockpit Components (Cards, Timelines, Diff, Evidence Locker)**

- **Responsible:** `Lynx.UIUXEngineer`  
- **Accountable:** Head of Design  
- **Consulted:** AI‑Orchestra Team, `SecurityGuard`, `AppTelemetry`  
- **Informed:** CFO Council, Compliance Committee

**Design System & Documentation**

- **Responsible:** `Lynx.StorybookAgent`  
- **Accountable:** Head of Design Systems  
- **Consulted:** Frontend Orchestra, Kernel Team  
- **Informed:** All product squads building UI.

### 4.3 Safe Mode / Degraded Mode

AI and Cockpit capabilities must fail **gracefully**.

**Conditions for Safe Mode:**

- AI‑Orchestra health checks fail (latency, error rate, or policy violation).  
- MCP endpoints for critical tools (e.g., supabase, git, shell) are unavailable or in quarantine.  
- Kernel switches system to `mode=DEGRADED`.

**Safe Mode Behavior:**

- **Cockpit:**
  - Enters **Read‑Only Safe Mode**: no write actions or structural changes allowed.  
  - Hybrid Fixer buttons degrade to: "Open Support Ticket with Pre‑Filled Context" or "Export Issue Bundle".  
  - Plan Visualizer may still explain problems, but cannot execute fixes.

- **Ledger:**
  - Remains fully functional with **standard validation** (Schema + business rules).  
  - No AI‑generated auto‑fixes; only deterministic, human‑driven changes allowed.

- **Logging:**
  - All degraded events tagged with `mode=DEGRADED` and `reason` in Kernel logs and Evidence Locker.

### 4.4 Accessibility & Cognitive Load

**Accessibility Requirements (both modes):**

- Minimum **WCAG 2.1 AA** compliance.  
- Full keyboard navigation (grid cells, forms, cards, filters).  
- Screen‑reader‑friendly structure and ARIA labels for key patterns (Hybrid Fixer, Drill‑Down, Diff Viewer).  
- Respect OS‑level **reduced‑motion** settings.

**Ledger‑Specific:**

- Targeted for 11"–27" displays; responsive but optimized for desktop.  
- Consistent focus management; column reordering and resizing must remain accessible.  
- Use compact density tokens and high‑contrast themes for long work sessions.

**Cockpit‑Specific:**

- Designed for decision‑heavy tasks: fewer elements, clearer hierarchy.  
- Timeline and Diff Viewer must avoid tiny click targets and micro‑interactions that increase cognitive load.  
- AI explanations must start with a **≤120 character summary line**, with “Show More” expansion.

---

## 5. Implementation Roadmap (Phased, Risk‑Controlled)

We prioritize **one golden module** and **a small set of patterns**, then expand.

### Phase 1 — Ledger Baseline (Golden Module)

**Scope:** General Ledger (GL) and Journal Entry only.

**Deliverables:**

- Smart Grid and Form implementations for GL Journals, fully driven by `Metadata Studio` and `SchemaGuardian`.  
- Keyboard‑first UX: tabbing, row duplication, copy/paste, quick filters.  
- Status and posting lifecycle: Draft → Posted → Reversed → Locked.

**Definition of Done (Phase 1):**

- GL Ledger is **faster than Excel** for core users (target grid load < 300ms for 10k rows on reference hardware).  
- All fields validated by SchemaGuardian; no “loose” inputs.  
- AppTelemetry shows ≥80% of GL CRUD happening in Ledger vs side channels.

### Phase 2 — Cockpit (Read‑Only Intelligence)

**Scope:** Read‑only Cockpit with 2–3 flagship cards.

**Flagship Cards:**

1. **Period Close Status Card** — status checklist, blockers, and owner per step.  
2. **Cash Position & Variance Card** — multi‑entity cash summary with variance vs budget/prior period.  
3. **Anomaly Watchlist Card** — top anomalies (e.g., unusual postings, spikes, threshold breaches).

Each card must:

- Support **Drill‑Down Pattern** to Ledger via `PATTERN-BRIDGE-DRILLDOWN-002`.  
- Render a clear Plan/Explanation for flagged anomalies.

**Definition of Done (Phase 2):**

- CFOs and finance leads can perform **review tasks** (no structural changes) primarily in Cockpit.  
- Telemetry shows frequent drill‑downs from Cockpit cards to Ledger, validating the bridge.

### Phase 3 — Bridge & Active Orchestration

**Scope:** Limited, high‑value write flows from Cockpit.

**Initial Hybrid Fixer Flows:**

1. **FX Mismatch Fix** — detect and correct currency inconsistencies using reference rates.  
2. **Mis‑posted Account Reclassification** — move lines between GL accounts with full diff and lineage.

**Requirements:**

- Every Hybrid Fixer flow uses `PATTERN-BRIDGE-HYBRID-FIXER-001`.  
- Every change produces a **Diff** and an **Evidence Locker** entry.  
- At least one flow supports **Undo/Reversal** (e.g., auto‑create reversal entries if a Cockpit fix is later rejected).

**Definition of Done (Phase 3):**

- ≥50% of targeted error resolutions (for FX mismatch / reclass flows) are executed via Cockpit’s Hybrid Fixer patterns instead of manual Ledger edits.  
- No critical incidents (unapproved high‑risk changes) traced back to Cockpit actions.

---

## 6. Competitor Landscape & Strategic Scoring (Internal)

> **Note:** This section is for **internal strategy** only. It documents why AI‑BOS chose this Dual‑Mode direction and how it compares conceptually to major vendors.

### 6.1 Scoring Dimensions

We qualitatively benchmark along 5 axes:

1. **Human–AI Collaboration Model** (dual‑mode clarity, HITL rigor).  
2. **Design System & Anti‑Drift Discipline.**  
3. **Finance Depth & Ledger Maturity.**  
4. **AI Explainability & CFO Trust.**  
5. **Execution Risk / Complexity** (higher = safer/easier to deliver).

### 6.2 Conceptual Scores (0–10, Strategy‑level)

| Dimension                               | AI‑BOS Dual‑Mode Strategy | SAP + Joule | Oracle + Redwood | D365 + Copilot | NetSuite + Analytics |
| --------------------------------------- | ------------------------- | ----------- | ---------------- | -------------- | -------------------- |
| **1. Human–AI Collaboration Model**     | **9/10**                  | 7.5/10      | 7/10             | 8/10           | 5/10                 |
| **2. Design System & Anti‑Drift**       | **8.5/10**                | 7/10        | **9/10**         | 7.5/10         | 6.5/10               |
| **3. Finance Depth & Ledger Maturity**  | 7.5/10 (strategy)         | **10/10**   | 9.5/10           | 9/10           | 8.5/10               |
| **4. AI Explainability & CFO Trust**    | **9/10**                  | 7/10        | 7/10             | 7.5/10         | 5/10                 |
| **5. Execution Risk / Complexity**      | 6.5/10                    | 9/10        | 8.5/10           | 8.5/10         | 8/10                 |

**Interpretation:**

- AI‑BOS **outperforms** on vision for dual‑mode collaboration, governance, and explainability.  
- SAP/Oracle/Microsoft retain advantage on **shipped finance breadth and operational maturity**.  
- AI‑BOS’s risk is **complexity**: combining Dual‑Mode, GRCD, Design Tokens, Orchestras, and MCP demands disciplined, phased delivery.

### 6.3 Strategic Response

- Focus initial delivery on:  
  - **One golden module (GL)** for Ledger.  
  - **2–3 flagship Cockpit cards.**  
  - **2 Hybrid Fixer flows.**  
- Use Telemetry and GRCD to **prove** superiority in **auditability and explainability** even before full functional parity with big vendors.  
- Position AI‑BOS as the **Sovereign Kernel & Cockpit Layer** that can sit above/alongside these ERPs where needed, not only as a competitor.

---

## 7. References & Single Sources of Truth (SSOT)

This UX strategy is governed and supported by the following SoT documents and specs:

- **[REF-GRCD-KERNEL] – GRCD‑KERNEL v4.0.0**  
  Defines the Kernel’s governance model, audit logging, SoT Packs, and compliance framework.

- **[REF-AI-ORCHESTRA] – AI‑ORCHESTRA v1.0.0**  
  Describes the orchestras, agents, MCP tools, and Plan → Act → Verify contracts, including Hybrid Fixer and Live Simulator integration.

- **[REF-FRONTEND-ORCHESTRA] – GRCD‑FRONTEND‑ORCHESTRA v1.0.0**  
  Specifies frontend agent responsibilities, quality gates (lint, a11y, tests), and allowed directories/dependencies.

- **[REF-METADATA-STUDIO] – Nexus Metadata Studio Spec**  
  Source of truth for business and technical metadata (domains, entities, fields, validation rules, alias naming), consumed by Ledger and Cockpit.

- **[REF-SCHEMA-GUARDIAN] – SchemaGuardian Agent Spec**  
  Governs schema integrity, normalization rules (1NF/2NF/3NF), and validates UI forms against backend contracts.

- **[REF-LIVE-SIMULATOR] – Live Simulator & Preview Engine**  
  Defines how AI‑assisted changes are simulated, stress‑tested, and visualized before being committed.

- **[REF-DESIGN-TOKENS] – L0 Design Tokens & Theming Spec**  
  Single source of truth for colors, spacing, typography, radius, density, elevation, and theme variants (Safe Mode, High‑Contrast, etc.).

- **[REF-IFRS-LEDGER] – IFRS/MFRS Finance & Disclosure SoT Pack**  
  Canonical mapping between finance concepts (Revenue/Income/Gain, assets/liabilities/equity) and supported ERP structures.

---

> **Final Note (Governance):**  
> Any material deviation from this Dual‑Mode strategy (e.g., introducing a third primary mode, bypassing tokens, or allowing AI to write without Plan/Diff/Evidence) must be explicitly logged as a **GRCD Exception** and reviewed by the Kernel Council. This document is the **SSOT** for how humans and AI share the UI surface of AI‑BOS Nexus.

