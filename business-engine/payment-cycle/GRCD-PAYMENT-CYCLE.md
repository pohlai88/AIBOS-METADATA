# 🧾 GRCD — MVP2: Payment Cycle Orchestrator

**Version:** 1.0.0
**Status:** Draft (MVP2 – Ready for Schema & API Design)
**Last Updated:** 2025-12-02
**Owner:** Finance Platform Team, Treasury Team, Internal Controls

> **Purpose of this GRCD**
>
> This GRCD defines the **Payment Cycle Orchestrator** for AI-BOS:
> a governed workflow for **Request → Review → Approve/Reject → Disburse → Upload Slip → Notify**,
> with **full traceability UUID** compatible with Kernel/Audit design, but **no direct ledger logic** yet.

---

## 1. Purpose & Identity

**Component Name:** `payment-cycle`
**Domain:** `ERP > Treasury & Payables > Payment Orchestrator`

### 1.1 Purpose

> The `payment-cycle` component is the **canonical workflow engine** for how money *intends* to move:
>
> * Capture internal payment **requests**
> * Route them through **review & approval**
> * Record **disbursement** facts
> * Attach **supporting documents / slips**
> * Notify all actors
>
> It **MUST** provide a complete, reconstructable story of each payment case via a **trace_id**, without yet touching GL/COA.

### 1.2 Identity & Responsibility

**Responsibilities (In-Scope for MVP2):**

* Core payment case lifecycle:

  * Request creation & submission (`DRAFT` → `SUBMITTED`).
  * Review & decision (`UNDER_REVIEW` → `APPROVED` / `REJECTED`).
  * Disbursement recording (`DISBURSED`).
  * Cancellation (`CANCELLED`) where appropriate.
* Attachments & slips:

  * Link uploaded bank slips / receipts to the **same `trace_id`**.
  * Store `location_ref` (e.g. `"C12"` / UI cell / workflow slot) so you can answer “who picked which slip from where”.
* Metadata:

  * Payment **categories** (e.g. `OPEX`, `CAPEX`, `PAYROLL`, `VENDOR_INVOICE`).
  * Optional **tags** (free-form or governed later).
  * Hooks for **treasury account** and **cashflow profile** (stored as references, not enforced relations yet).
* Traceability:

  * Every payment case has one **stable `trace_id`**.
  * All state transitions must emit **audit events** using the same trace model as MVP1.
* Notifications:

  * Notify requester, reviewers, approvers, and finance/treasury at key state changes.

**Boundaries (Out-of-Scope for MVP2):**

* **NO ledger postings** (no GL entries, no double-entry).
* **NO tax logic** (SST/GST/VAT not computed here).
* **NO FX revaluation or FX gain/loss handling.**
* **NO vendor/supplier master** (only lightweight payee fields).
* **NO bank reconciliation engine.**
* **NO OCR / document parsing / autoposting.**
* **NO budgeting or spend analytics dashboards.**

**Non-Responsibility:**

* `MUST NOT` become the Chart of Accounts or sub-ledger.
* `MUST NOT` decide final accounting treatment (expense vs asset capitalisation).
* `MUST NOT` bypass `audit_events` or create its own non-standard audit trail.
* `MUST NOT` manage user/tenant lifecycle (relies on MVP1 identity).

### 1.3 ERP Universe & Boundaries for this Component

* **This component governs:**

  * The **Payment Request Case** (from request to disbursement).
  * The **human approval trail** for outgoing payments.
  * The **evidence set** (slip attachments, comments, decisions) that later supports:

    * AP / Treasury processes,
    * IFRS/MFRS-compliant documentation,
    * Internal controls / audits.

* **This component explicitly does NOT:**

  * Post to `AP`, `Cash`, or `Expenses` ledgers.
  * Manage bank balances or cashflow schedules.
  * Own vendor/staff master data.
  * Replace formal invoice/AP systems in other modules; it orchestrates the **approval & evidence** layer.

---

## 2. Requirements

### 2.1 Functional Requirements

> IDs are scoped to this component: `F-PAY-*`.

| ID       | Requirement                                                                                                                                                   | Priority | Status | Notes                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | ----------------------------------------------------------- |
| F-PAY-1  | System MUST allow a tenant user to create a **Payment Request** with fields: amount, currency, title, description, payee details, due date, category, tags.   | MUST     | ⚪      | Initial status `DRAFT`.                                     |
| F-PAY-2  | Each Payment Request MUST have a unique `payment_id` and stable `trace_id` for the full life of the case.                                                     | MUST     | ⚪      | `trace_id` reused across all related events & slips.        |
| F-PAY-3  | System MUST support states: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `DISBURSED`, `CANCELLED`.                                           | MUST     | ⚪      | State machine enforced; no illegal jumps.                   |
| F-PAY-4  | System MUST allow the Requester to **submit** a draft for review, locking key fields unless reviewers request changes.                                        | MUST     | ⚪      | Transition: `DRAFT → SUBMITTED`.                            |
| F-PAY-5  | System MUST allow designated Reviewers/Approvers to move a request through `UNDER_REVIEW` to `APPROVED` or `REJECTED`, with mandatory comment on `REJECTED`.  | MUST     | ⚪      | Transition: `SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED`. |
| F-PAY-6  | System MUST allow Finance/Treasury users to record **Disbursement** details (amount, date, method, bank reference, treasury account ref).                     | MUST     | ⚪      | Transition: `APPROVED → DISBURSED`.                         |
| F-PAY-7  | System MUST allow upload of one or more **Payment Slips / bank advices** and link them to the same `trace_id`.                                                | MUST     | ⚪      | Each slip references `payment_request_id` + `trace_id`.     |
| F-PAY-8  | System MUST support a `location_ref` field (e.g. `"C12"` / grid position / workflow slot) per slip upload, for Oracle/SAP-style "who picked what from where". | MUST     | ⚪      | `location_ref` stored in slip + audit.                      |
| F-PAY-9  | System MUST produce an **audit event** for each state change, reviewer decision, disbursement record, and slip upload, using the shared `audit_events` model. | MUST     | ⚪      | Reuses MVP1 audit spec.                                     |
| F-PAY-10 | System MUST expose APIs for Payment Request lifecycle: create, update, submit, review, approve, reject, disburse, upload slip, list, filter by status.        | MUST     | ⚪      | `/payments/*` namespace.                                    |
| F-PAY-11 | System MUST provide UI screens: **Payment List**, **Payment Detail (timeline)**, **New Payment Request** form, and **Slip viewer**.                           | MUST     | ⚪      | `/payments`, `/payments/:id`.                               |
| F-PAY-12 | System MUST support **Categories** for payments (code + label), stored minimally now but designed to connect to Metadata/MDM later.                           | MUST     | ⚪      | E.g. `OPEX_MARKETING`, `CAPEX_EQUIPMENT`.                   |
| F-PAY-13 | System SHOULD support **Tags** (free-form strings or governed list) attached to each payment.                                                                 | SHOULD   | ⚪      | Many-to-many relationship.                                  |
| F-PAY-14 | System MUST provide hooks for **Treasury Account** and **Cashflow Profile** (stored as references/strings, not enforced FKs yet).                             | MUST     | ⚪      | Fields: `treasury_account_ref`, `cashflow_profile_ref`.     |
| F-PAY-15 | System MUST allow querying a **Payment Timeline** that reconstructs the full case history (from request to disbursement) from audit + payment tables.         | MUST     | ⚪      | Timeline = deterministic view.                              |
| F-PAY-16 | System SHOULD allow exporting a payment case (including metadata and audit trail) as a JSON/CSV/Zip bundle for auditors.                                      | SHOULD   | ⚪      | Later phases can surface via MCP tool.                      |
| F-PAY-17 | System MUST respect tenant boundaries (no cross-tenant visibility of payment data).                                                                           | MUST     | ⚪      | Enforced by `tenant_id` and RLS.                            |

### 2.2 Non-Functional Requirements

| ID       | Requirement                                                                                      | Target                             | Status |
| -------- | ------------------------------------------------------------------------------------------------ | ---------------------------------- | ------ |
| NF-PAY-1 | Payment list API should respond within 400ms (95th percentile) for typical filters.              | p95 < 400ms                        | ⚪      |
| NF-PAY-2 | State transition APIs (`approve`, `disburse`, `upload-slip`) must be **idempotent**.             | Idempotency via `idempotency_key`. | ⚪      |
| NF-PAY-3 | Concurrent updates must be prevented (no double disbursement / conflicting approvals).           | Optimistic locking / versioning.   | ⚪      |
| NF-PAY-4 | System must handle at least **10k active payment cases per tenant** without degradation.         | Perf test scenario.                | ⚪      |
| NF-PAY-5 | Audit events for payments must be written synchronously or via durable queue (no loss on crash). | At-least-once delivery.            | ⚪      |

### 2.3 Compliance Requirements

> These are about **controls**, not yet full IFRS accounting logic.

| ID      | Requirement                                                                                                 | Standard / Control Ref               | Evidence                              | Status |
| ------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------- | ------ |
| C-PAY-1 | All approvals / rejections MUST capture the approver, timestamp, decision, and comment (for `REJECTED`).    | Internal Controls, SOC2              | `payment_approvals` + `audit_events`. | ⚪      |
| C-PAY-2 | Disbursement record MUST be traceable to: original request, approver decision, and slip(s) via `trace_id`.  | MFRS/IFRS documentation expectations | Joined view on `trace_id`.            | ⚪      |
| C-PAY-3 | System MUST support evidence retention for payment cases for configurable retention periods (e.g. 7 years). | Local tax / company law              | Storage/config policy.                | ⚪      |
| C-PAY-4 | Only authorized roles (Finance/Treasury) may record disbursements; all such actions MUST be audited.        | Segregation-of-duties (SoD)          | Role mapping + audit logs.            | ⚪      |
| C-PAY-5 | Completed payment cases MUST be immutable except for explicitly logged corrections (no silent overrides).   | Auditability best practice           | Update guards + correction flows.     | ⚪      |
| C-PAY-6 | Audit trail of payment cycles MUST be queryable by trace_id and exportable for external auditors.           | SOC2, ISO 27001                      | API / export function + tests.        | ⚪      |

---

## 3. Architecture & Design Patterns

### 3.1 Architectural Patterns

* **Patterns:**
  `State Machine`, `Event-Logged Workflow`, `Multi-Tenant SaaS`, `MCP-Orchestrated`, `Kernel-Audited`

* **Justification:**

  * **State Machine:** Payment lifecycle is finite and well-defined; illegal transitions must be prevented.
  * **Event-Logged Workflow:** Every transition becomes an event; the payment “story” is reconstructed from events + current state.
  * **Multi-Tenant SaaS:** All tables carry `tenant_id`; RLS ensures isolation.
  * **MCP-Orchestrated:** Future AI/Automation (e.g. “recommend approver”, “detect suspicious payment”) will be via MCP tools, not hidden cron jobs.
  * **Kernel-Audited:** Reuses the Kernel/MVP1 `audit_events` hash-chain model; `payment-cycle` does not invent new audit primitives.

### 3.2 Component Interaction Diagram (Conceptual)

```mermaid
graph TB
  User[Requester / Approver / Treasury] --> UI[ERP UI / BFF]
  UI --> PaymentAPI[/Payment Cycle API/]
  PaymentAPI --> PaymentDB[(Payment Tables)]
  PaymentAPI --> Audit[Audit Logger\n(audit_events)]
  PaymentAPI --> Notify[Notification Service]
  PaymentAPI --> TreasuryHook[(Treasury / Cashflow Hooks)]
  Notify --> User
```

* Identity (`users`, `tenants`) is read from MVP1.
* All actions emit `audit_events` with shared `trace_id`.
* Treasury / Cashflow hooks are **one-way** references for now.

---

## 4–6. Layout, Dependencies & MCP Profile (Summary)

* **Directory & File Layout:**
  Follows Kernel GRCD v5 conventions:

  * `apps/payment-cycle-bff` – HTTP/API layer
  * `apps/payment-cycle-worker` – async tasks (notifications, exports)
  * `packages/payment-cycle-contracts` – Zod schemas, TypeScript types
  * `packages/payment-cycle-db` – Drizzle ORM schema

* **Dependencies:**

  * Depends on MVP1 `identity-org-admin` for `tenant_id` and `user_id`.
  * Depends on central `audit_events` facility for governance.
  * Optional integration (later): metadata/MDM for categories & tags.

* **MCP Profile (future-ready):**

  * Tools like `create-payment-request`, `approve-payment`, `record-disbursement`, `export-payment-case`.
  * All tools validate input using the same Zod/contract schemas defined below.

---

## 7. Contracts & Schemas (Payment + Traceability)

> This is the **conceptual schema**; implementation will be via Drizzle ORM + Zod.

### 7.1 Core Tables

#### 7.1.1 `payment_requests`

Represents the **payment case**.

* `id` (UUID, PK) – internal ID.
* `trace_id` (UUID, NOT NULL) – **stable for the case**; used in `audit_events`.
* `tenant_id` (UUID, NOT NULL) – FK → `tenants.id` (MVP1).
* `requestor_user_id` (UUID, NOT NULL) – FK → `users.id` (MVP1).
* `title` (string, NOT NULL).
* `description` (text, nullable).
* `amount` (decimal(18,2), NOT NULL).
* `currency` (string, NOT NULL, e.g. `MYR`, `SGD`).
* `status` (enum: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `DISBURSED`, `CANCELLED`).
* `category_code` (string, nullable) – e.g. `OPEX_MARKETING`.
* `payee_type` (enum: `VENDOR`, `EMPLOYEE`, `OTHER`, …).
* `payee_name` (string).
* `payee_account_ref` (string, nullable) – bank acct / wallet id / mapped vendor id.
* `treasury_account_ref` (string, nullable) – to link to bank/wallet account config later.
* `cashflow_profile_ref` (string, nullable) – to link to cashflow template later.
* `due_date` (date, nullable).
* `submitted_at` (timestamp, nullable).
* `approved_at` (timestamp, nullable).
* `rejected_at` (timestamp, nullable).
* `disbursed_at` (timestamp, nullable).
* `cancelled_at` (timestamp, nullable).
* `created_at`, `updated_at` (timestamp).
* `version` (integer, for optimistic locking).

#### 7.1.2 `payment_approvals`

Each reviewer / approver decision (allows multi-step approval later).

* `id` (UUID, PK).
* `trace_id` (UUID, NOT NULL) – match `payment_requests.trace_id`.
* `payment_request_id` (UUID, FK → `payment_requests.id`).
* `tenant_id` (UUID, NOT NULL).
* `approver_user_id` (UUID, NOT NULL).
* `decision` (enum: `APPROVED`, `REJECTED`).
* `decision_reason` (text, nullable but **required** when `decision = REJECTED`).
* `decided_at` (timestamp, NOT NULL).
* `sequence_order` (integer, NOT NULL, default 1) – for multi-step approvals later.

#### 7.1.3 `payment_disbursements`

Single disbursement record for MVP2 (multi-part can come later).

* `id` (UUID, PK).
* `trace_id` (UUID, NOT NULL).
* `payment_request_id` (UUID, FK → `payment_requests.id`).
* `tenant_id` (UUID, NOT NULL).
* `disburser_user_id` (UUID, NOT NULL).
* `disbursed_amount` (decimal(18,2), NOT NULL).
* `disbursed_currency` (string, NOT NULL).
* `disbursement_date` (date, NOT NULL).
* `method` (enum: `BANK_TRANSFER`, `CASH`, `CHEQUE`, `EWALLET`, `OTHER`).
* `bank_reference` (string, nullable) – transaction reference no.
* `treasury_account_ref` (string, nullable) – copy or refine from request.
* `cashflow_profile_ref` (string, nullable).
* `created_at` (timestamp).

#### 7.1.4 `payment_slips`

Upload records for slips / bank advices.

* `id` (UUID, PK).
* `trace_id` (UUID, NOT NULL).
* `payment_request_id` (UUID, FK → `payment_requests.id`).
* `tenant_id` (UUID, NOT NULL).
* `uploaded_by_user_id` (UUID, NOT NULL).
* `storage_key` (string, NOT NULL) – path / object key for the file.
* `mime_type` (string, nullable).
* `location_ref` (string, nullable) – e.g. `"C12"`, `"PAYMENT_BOARD:row3/col4"`, `"IMPORT_BATCH:2025-01"`.
* `uploaded_at` (timestamp, NOT NULL).

> This is where your **“C12” Oracle/SAP behaviour** lives:
> when a slip is uploaded from a specific grid / matrix / sheet, you store `"C12"` (or similar) here + in `audit_events`.

#### 7.1.5 `payment_tags`

Many-to-many between payment requests and tags.

* `id` (UUID, PK).
* `payment_request_id` (UUID, FK → `payment_requests.id`).
* `tenant_id` (UUID, NOT NULL).
* `tag_value` (string, NOT NULL) – can later be constrained to metadata aliases.

### 7.2 Shared `audit_events` Usage (From MVP1)

MVP2 **does not** redefine `audit_events`; it **reuses** it:

* For each payment action, create an `audit_events` row with:

  * `trace_id` = `payment_requests.trace_id`
  * `resource_type` in {`PAYMENT_REQUEST`, `PAYMENT_APPROVAL`, `PAYMENT_DISBURSEMENT`, `PAYMENT_SLIP`}
  * `resource_id` = the corresponding table `id`
  * `action` = `CREATE`, `SUBMIT`, `APPROVE`, `REJECT`, `DISBURSE`, `UPLOAD_SLIP`, `CANCEL`, etc.
  * `actor_user_id` = performing user
  * `location_ref` = if relevant (especially for slips)
  * `metadata_diff` = JSON describing before/after snapshot for updates
  * `prev_hash` / `hash` = as per Kernel design

This gives you **SAP/Oracle-style document flow** across both MVP1 (Identity) and MVP2 (Payment Cycle) using a **single audit standard**.

---

## 8. Error Handling & Recovery

* Invalid transitions:

  * Reject any state change that doesn’t follow the allowed state machine.
  * Example: `DRAFT → DISBURSED` = ❌ 422 error.
* Concurrency protection:

  * Use `version` (or `updated_at`) for optimistic locking; if stale, return 409 Conflict with clear message.
* Idempotency:

  * For disbursement and slip upload, accept an `idempotency_key`; replays return the same result.
* Partial failures:

  * If payment state update succeeds but audit write fails, treat as a **failed transaction** and roll back using DB transaction.
* Recovery:

  * Provide admin-only tools to:

    * Mark a payment case as **corrected** with a new audit event.
    * Rebuild a payment timeline from `audit_events` in case of view corruption.

---

## 9. Observability (Summary)

Key metrics:

* Number of payment requests by status (open vs closed).
* Time from **SUBMITTED → APPROVED**, **APPROVED → DISBURSED**.
* Rejection rate by category / tag.
* Average number of approvals per payment.
* Audit completeness checks:

  * Number of payments without disbursement event (aged items).
  * Payments with disbursement but missing slip.

Logs:

* All state transition calls (endpoint + status + actor).
* Validation errors (e.g. “invalid state transition”, “missing required fields”).
* Integration errors with notification / storage subsystems.

---

## 10. Security, 11. Tenancy, 12. Config & DR, 13. Testing, 14. Tiering

**Security & Roles**

* Request creation: `member`, `org_admin`, `platform_admin` (within tenant).
* Review/approve: configurable role mapping; default `org_admin` and `finance_approver`.
* Disbursement: `treasury_role` / `finance_disburser` only.
* All sensitive views (slips, bank references) limited to appropriate roles.

**Tenancy**

* Every table includes `tenant_id`.
* RLS ensures: `tenant_id` = current session tenant.
* No cross-tenant joins exposed from this component.

**Config & DR**

* Configurable:

  * Required number of approvals.
  * Max attachment size.
  * Retention policies for slips.
* DR:

  * DB backups for payment tables.
  * Object storage lifecycle rules for slips.
  * Ability to rehydrate timelines from backups + `audit_events`.

**Testing**

* Unit tests for state machine transitions.
* Integration tests for full flow:

  * `DRAFT → SUBMITTED → APPROVED → DISBURSED → SLIP UPLOADED`.
* Tests that verify audit events are created for each step.
* Performance tests for large tenants (e.g. 10k cases).

**Tiering (Example)**

| Feature Group          | Basic                        | Advanced                            | Premium                                                |
| ---------------------- | ---------------------------- | ----------------------------------- | ------------------------------------------------------ |
| Approvals              | Single approver              | Multi-step approvals                | Dynamic routing rules (by amount, category, BU)        |
| Traceability           | Full audit trail per payment | + Export bundle (JSON/CSV)          | + External auditor workspace / read-only link          |
| Treasury Hooks         | Text references only         | Linked to treasury accounts catalog | Integrated cashflow forecasts & dashboards             |
| AI Assistance (future) | N/A                          | Suggest categories / approvers      | Anomaly detection, policy suggestions, AI risk scoring |

---

