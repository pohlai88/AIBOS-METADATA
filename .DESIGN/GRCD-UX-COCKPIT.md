Version: 1.2.0
Status: Draft (Template v5-Aligned)
Last Updated: 2025-11-30
Owner: UX Lead, Kernel Council, Platform Engineering, Compliance

Purpose of this GRCD
This document defines the Cockpit Execution Plane of AI-BOS — the governed, AI-assisted workflow mode that sits above the Ledger and exposes AI orchestration in a human-readable, audit-ready form.

Ledger = dense, deterministic work grid (spreadsheet brain).

Cockpit = orchestrator & narrative layer (story + checkpoints).

This GRCD focuses on:

How Cockpit technically behaves (states, data, APIs, telemetry).

How it integrates with Kernel, BFF, Backend, Metadata Studio, MCP.

How it preserves auditability, reversibility, and Safe Mode behavior.

How Kernel Council governs risk and exceptions.

Narrative design and storytelling patterns are captured in Appendix A.
Governance & risk checklist is captured in Appendix B.

1. Identity & Scope
1.1 Component Identity

Component ID: UX-COCKPIT-PLANE

Layer: UX / Application Orchestration (above BFF, below human)

Modes Covered:

Mode A — Ledger (reference only; governed by GRCD-UX-GRID)

Mode B — Cockpit (this document)

Related GRCDs:

GRCD-KERNEL — Constitutional control plane

GRCD-BFF — Backend-for-Frontend API layer

GRCD-BACKEND-HEXAGONAL — Domain service cells

GRCD-METADATA-STUDIO — Canonical fields, SoT packs, governance tiers

GRCD-MCP-ECOSYSTEM — Servers, tools, MCP governance

GRCD-UX-STRATEGY — High-level UX philosophy and mode definition

1.2 Purpose Statement

Cockpit is the governed AI orchestration surface for business workflows.
It takes user intent (e.g. “Close 2025-Q2 GL”), coordinates Kernel + Backend + AI agents, and presents the work as a small set of critical checkpoints plus a final narrative summary and Evidence Locker bundle.

Cockpit is not a BI dashboard and not a chat toy. It is a trust plane:

Reduces complex AI orchestration into checkpoints humans care about.

Ensures every run is reversible where possible, auditable always.

Allows controllers, CFOs, auditors to sleep tight without reading agent logs.

1.3 Non-Negotiables

Critical Control Points, not Timeline Spam

Cockpit MUST surface only 3–5 critical checkpoints per workflow by default.

Fine-grained agent or step-by-step logs MUST be hidden behind progressive disclosure.

Plan → Diff → Evidence by Contract

No high-impact workflow can complete without:

A Plan (what AI proposes).

A Diff (what will change vs. current state).

An Evidence Locker bundle (proof, lineage, metadata).

HITL on Risky Changes

For Tier 1/Tier 2 governed workflows (per Metadata Studio), at least one human approval step MUST exist in Cockpit before changes are committed.

No Blind Posting

Cockpit MUST never execute backend state changes (GL posting, inventory movement, HR changes) without:

A traceable Cockpit Run ID; and

A stable Evidence Locker ID.

Safe Mode is Explicit, Not Silent

If AI assistance is degraded/unavailable, Cockpit MUST:

Clearly indicate Safe Mode / Limited AI;

Offer a Ledger / manual path;

Still preserve context & evidence where applicable.

Reversal First-Class

For reversible workflows, Cockpit MUST expose a clearly visible reversal mechanism (or state why reversal is not allowed, per compliance rules).

Kernel & Metadata Studio Alignment

Cockpit MUST defer to:

Kernel for policies, roles, risk thresholds.

Metadata Studio for canonical definitions, SoT packs, governance tiers.

2. Functional Requirements
2.1 Core Functions
ID	Requirement	Priority	Notes
CX-F-1	Cockpit MUST accept structured intent (workflow type + scope + options) and open a new Cockpit Run.	MUST	E.g. GL_CLOSE, FX_FIX, AR_RECON with period/tenant/scope.
CX-F-2	Cockpit MUST represent a workflow as N checkpoint cards (3–5 by default).	MUST	Checkpoints = human decision/control points.
CX-F-3	Each checkpoint MUST support states: PENDING, AUTO_OK, REQUIRES_REVIEW, APPROVED, REJECTED, SKIPPED.	MUST	Explicit state machine; no implicit completion.
CX-F-4	Cockpit MUST support progressive disclosure: summary view + drill-down into Plan, Diff, Evidence.	MUST	Summary first; technical details on demand.
CX-F-5	Cockpit MUST generate a Narrative Summary at the end of a run.	MUST	Plain language, human-readable storyline.
CX-F-6	Cockpit MUST produce an Evidence Locker bundle with a stable ID per run.	MUST	Used for audit & export; see §3.3.
CX-F-7	Cockpit MUST integrate HITL approvals for Tier 1/2 workflows.	MUST	At least one approval step.
CX-F-8	Cockpit MUST log all critical actions to the audit log via Kernel.	MUST	Start, checkpoint decisions, finalization, reversal.
CX-F-9	Cockpit MUST expose a Safe Mode when AI components are degraded.	MUST	Behaviour defined in §5.
CX-F-10	Cockpit SHOULD support Simulation Mode for high-impact runs (no state changes).	SHOULD	E.g. simulate GL close or reclass before posting.
CX-F-11	Cockpit MAY offer shortcuts back to Ledger for detailed manual work.	MAY	E.g. “Open these lines in Ledger”.
2.2 States & Lifecycle

Cockpit Run High-Level States:

NEW → IN_PROGRESS → AWAITING_APPROVAL → COMPLETED

Error/alternative paths:

ABORTED_BY_USER

FAILED_TECHNICAL

SAFE_MODE_DEGRADED (sub-state of in-progress flows)

State transitions MUST be recorded as events with timestamps, actor (HUMAN / AI / SYSTEM_JOB) and reasons (where applicable).

3. Data Contracts & Models
3.1 Cockpit Run Model
type CockpitRunId = string; // UUID

type CockpitRunStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "AWAITING_APPROVAL"
  | "COMPLETED"
  | "ABORTED_BY_USER"
  | "FAILED_TECHNICAL"
  | "SAFE_MODE_DEGRADED";

type CockpitRun = {
  runId: CockpitRunId;
  tenantId: string;
  workflowType: string; // e.g. "GL_CLOSE", "FX_FIX", "AR_RECON"
  scope: {
    entityId: string;
    period: string; // e.g. "2025-Q2"
    extra?: Record<string, unknown>;
  };
  status: CockpitRunStatus;
  checkpoints: CockpitCheckpoint[];
  narrativeSummary?: string;
  evidenceLockerId?: string;
  riskTier: "TIER_1" | "TIER_2" | "TIER_3";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

3.2 Checkpoint Model
type CheckpointStatus =
  | "PENDING"
  | "AUTO_OK"
  | "REQUIRES_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SKIPPED";

type Checkpoint = {
  checkpointId: string;
  label: string; // human title, e.g. "Detect anomalies in GL"
  summary: string; // short description (≤ ~160 chars)
  status: CheckpointStatus;
  requiresApproval: boolean;
  order: number;
  actions: {
    primary?: string;  // label for main action, e.g. "Review details"
    secondary?: string;
  };
  links?: {
    evidenceSection?: string; // anchor inside Evidence Locker
    ledgerDeepLink?: string;  // e.g. /ledger/gl?filter=...
  };
  // Raw + technical detail refs (not all rendered by default)
  technicalContextId?: string; // points to plan/diff/etc in backend
};

3.3 Evidence Locker Model (Reference)

Evidence Locker is defined in more depth in a separate GRCD, but Cockpit MUST at least provide:

type EvidenceLockerId = string;

type EvidenceLockerSummary = {
  evidenceLockerId: EvidenceLockerId;
  runId: CockpitRunId;
  tenantId: string;
  workflowType: string;
  scope: {
    entityId: string;
    period: string;
  };
  artifacts: Array<{
    type: "PLAN" | "DIFF" | "LINEAGE" | "SOURCE_DOC" | "SIMULATION" | "APPROVAL";
    link: string;
    description?: string;
  }>;
};

3.4 Integration with Metadata Studio

Every Cockpit run MUST be able to reference:

SoT pack IDs (e.g. IFRS/MFRS version).

Governance tiers for impacted fields/KPIs.

Minimum metadata to link:

standardPackId

affectedCanonicalKeys: string[]

governanceTier: "TIER_1_CRITICAL" | ...

4. Architecture & Integration
4.1 Position in the Stack

Call chain (happy path):

UI Cockpit → BFF → Kernel Policies → Backend Cells → DB + AI Orchestration → Evidence Locker + Telemetry

Cockpit UI only talks to BFF.

BFF enforces:

Tenant context

Actor identity

Basic validation

Kernel enforces:

RBAC/ABAC, risk bands, HITL requirements

Event routing

MCP tool policies

Backend cells do:

Domain use-cases (posting, adjustments, etc.)

Domain events

Evidence Locker + Telemetry:

Persist full trace for audit & analytics.

4.2 Required Integration Points

BFF Contracts:

POST /cockpit/runs — create/run Cockpit workflow.

GET /cockpit/runs/:id — fetch run state + checkpoints + narrative.

POST /cockpit/runs/:id/checkpoints/:cid/decision — approve/reject/skip.

POST /cockpit/runs/:id/finalize — commit or simulate.

Kernel Hooks:

Policy evaluation for:

Who can start which workflow type.

Who can approve which checkpoint.

Risk tier mapping (via Metadata Studio).

Backend Hooks:

Use-cases triggered by checkpoint decisions (e.g. apply reclass, post entries).

Simulation variants for non-committing runs.

Metadata Studio:

Resolve canonical definitions and SoT packs for KPIs/fields touched by the run.

5. Safe Mode & Degraded Behavior
5.1 Triggers

Cockpit MUST enter Safe Mode for the workflow when:

LLM / AI orchestration layer is unavailable or failing consistently.

MCP tool contracts for the workflow are invalid or mismatched.

Kernel policies or SoT checks mark data as untrusted (e.g. failing quality rules).

Critical dependencies (Metadata Studio, Evidence Locker, DB) are in degraded state.

5.2 Behavior in Safe Mode

Cockpit banner displays a clear message, e.g.:

AI Assistance Limited
Automated steps are partially/fully unavailable. You can still review data, export anomalies, and continue in Ledger Mode.

Checkpoint cards change role:

Informational cards still show what would normally be done.

Primary actions become:

Open in Ledger

Export list

Create manual task / ticket

No automatic posting or bulk state changes are allowed in Safe Mode for Tier 1/2 workflows.

All Safe Mode triggers MUST be logged as events and surfaced to Kernel Council dashboards.

6. Telemetry, Metrics & Audit
6.1 Events & Logs

Cockpit MUST emit structured events (via Kernel telemetry) for:

Run lifecycle:

COCKPIT_RUN_STARTED

COCKPIT_RUN_COMPLETED

COCKPIT_RUN_ABORTED

COCKPIT_RUN_SAFE_MODE_ENTERED

Checkpoint lifecycle:

CHECKPOINT_STATE_CHANGED (with old/new state, actor)

CHECKPOINT_DECISION_MADE (APPROVED/REJECTED/SKIPPED)

Trust signals:

AI_PLAN_REJECTED (reason codes)

EVIDENCE_LOCKER_EXPORTED (type: PDF/JSON, who, when)

6.2 Quantitative Metrics

Cockpit telemetry SHOULD provide:

Usage:

runs per workflow type / tenant.

Ledger vs Cockpit usage ratio per module.

Time spent per run, per role.

Trust:

AI plan rejection rate, by reason.

% of runs finalized without manual override vs with manual override.

Safe Mode incidents count & rate.

Quality:

Evidence Locker export rate (how many runs are “audit-consumed”).

Error/failure rate by workflow.

These metrics feed into Kernel Council risk review (see Appendix B).

7. Error Handling & Reversal
7.1 Error Classes

CockpitConfigError — misconfiguration of workflows/checkpoints.

CockpitPolicyError — user not allowed to perform certain action.

CockpitRuntimeError — backend/AI/services failure.

CockpitSafeModeError — operation blocked due to Safe Mode conditions.

Errors MUST be:

Mapped to user-friendly messages in UI.

Logged with full context for developers and auditors.

7.2 Reversal

For reversible workflows:

Reversal patterns MUST be defined per workflow type.

Reverse operations MUST:

Generate their own Cockpit Run ID or dedicated reversal ID.

Attach new Evidence Locker artifacts documenting reversal.

UI MUST present reversal actions clearly (not hidden deep in menus).

8. Performance & UX Constraints

Cockpit run status fetch (GET /cockpit/runs/:id) SHOULD return within < 300ms p95 under normal load.

UI should render initial checkpoint stack in < 500ms after data arrival.

Checkpoint interaction (approve/decline) should feel “instant”:

optimistic UI updates + server confirmation.

9. Implementation Phasing

Phase 1 — MVP Cockpit for One Golden Workflow

Target workflow: GL Close or FX Fix in Accounting.

Implement:

Cockpit Run model, checkpoint stack, narrative summary.

Evidence Locker stub integration.

Basic Safe Mode handling.

Phase 2 — Telemetry & Kernel Council Connect

Wire events into Kernel telemetry.

Build basic dashboard for:

AI plan rejection rate.

Safe Mode events.

Evidence Locker export usage.

Phase 3 — Multi-Workflow & Simulation

Add 2–3 more workflows (AR recon, inventory valuation).

Add Simulation Mode for at least one high-impact workflow.

Phase 4 — Compliance-Ready

Harden Evidence Locker integration & Compliance Pack export.

Integrate fully with Metadata Studio SoT packs for impacted KPIs.

Phase 5 — Optimization & Narrative Refinement

Use telemetry & feedback to adjust checkpoint design, narrative tone, and default flows.

10. Governance & Kernel Council Hooks (Summary)

All GRCD deviations related to Cockpit are tracked as GRCD Exceptions with:

Reason, owner, risk, intended duration, mitigation plan.

Kernel Council meets at least weekly to:

Review exceptions.

Review key Cockpit metrics & Safe Mode incidents.

Approve/reject permanent changes to Cockpit behavior.

(Operational checklist is in Appendix B.)

📎 Appendix A — Human-Readable Cockpit Narrative (Storyboard Spec)

Note: This appendix is UX narrative guidance, not normative implementation. It exists so designers / MCP UI agents can produce consistent Cockpit experiences.

A.1 Narrative Model

Each Cockpit run MUST be able to generate a narrative of the form:

“We scanned [scope] for [anomalies], found [N issues], proposed [fix strategy], you [approved/rejected] them, and we [posted/simulated] changes. Evidence Locker [ID] now contains the full details.”

Key elements:

Scope: entity, period, dataset.

Problem: what was checked/fixed.

Action: what the system proposed and did.

Human role: where decisions were made.

Result: final state and impact.

Evidence: where to go for proof.

A.2 Screen-Level Storyboard (Summary)

Screen 1 — Intent & Context

Intent bar describing the workflow (e.g. “Close Period 2025-Q2 for DLBB Group”).

Status pill (DRAFT / IN REVIEW / COMPLETED / SAFE MODE).

Screen 2 — Critical Path Cockpit

Vertical stack of 3–5 checkpoint cards:

“Detect anomalies”

“Propose fixes”

“Assess downstream impact”

“Confirm & apply”

Each card:

Short title, one-line summary, status chip, main action.

Screen 3 — Final Summary

Banner: “Workflow completed. Audit-ready.”

Storyline card describing what happened.

Actions: “Open Evidence Locker”, “Export Compliance Pack”, “View updated reports”.

Screen 4 — Safe Mode Variant

Clear banner: “AI Assistance Limited”.

Checkpoints become informational.

Actions route to Ledger / exports / manual tasks.

📎 Appendix B — Kernel Council Risk Mitigation Checklist (Cockpit)

This appendix is operational: a checklist for Kernel Council to run regularly.
The items below are not code but governance guardrails.

B.1 Governance & Exceptions

Maintain a GRCD Exception Register for Cockpit behaviour deviations.

Enforce SLA: all exceptions are reviewed within a defined time (e.g. 5 business days).

Define who can:

Approve cockpit behavioural changes.

Apply emergency overrides in production.

B.2 Telemetry & Trust

Track:

Ledger vs Cockpit usage ratio per module.

AI plan rejection rate and reasons.

Safe Mode triggers & frequency.

Time spent reviewing Diff/Evidence.

Review data monthly/quarterly to:

Adjust UX flows.

Adjust Kernel policies & risk bands.

Identify modules where Cockpit is not yet trusted.

B.3 Reversal & Evidence

Ensure all reversible workflows have:

Visible reversal entry points in Cockpit.

Reversal entries in Evidence Locker with linkage to original runs.

Compliance Packs:

Confirm one-click export is working for priority workflows.

Test with internal or external auditors at least annually.

B.4 Safe Mode Governance

Catalog all Safe Mode triggers by type.

For each trigger, define:

Expected Cockpit behaviour.

UX messaging (what, why, what now).

Review recurring Safe Mode incidents and prioritize fixes in Kernel/Backend/AI layers.