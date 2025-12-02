# 🧾 GRCD — MVP1: Organization Admin & Personal User Management

**Version:** 1.0.0
**Status:** Draft (MVP1 – Ready for Schema & API Design)
**Last Updated:** 2025-12-02
**Owner:** Platform Team (Identity & Tenancy), Security Team

> **Purpose of this GRCD**
>
> This document is the **SSOT** for MVP1 (Organization Admin & Personal User Management).
> It defines scope, requirements, responsibilities, and **traceability guarantees** for all tenant and user lifecycle operations.

---

## 1. Purpose & Identity

### 1.1 Component Name & Domain

* **Component Name:** `identity-org-admin`
* **Domain:** `Identity & Tenancy` (Core Platform)

### 1.2 Purpose

> The `identity-org-admin` component is the **canonical authority** for:
>
> * Tenant / organization profile,
> * User accounts,
> * Role assignments, and
> * Personal profile settings.
>
> It **MUST** provide secure, auditable, and traceable user & org lifecycle management for all AI-BOS modules.

### 1.3 Identity

* **Role:**
  `Tenant & User Lifecycle Authority` – defines and enforces:

  * Who can access AI-BOS,
  * Which tenant(s) they belong to,
  * What roles/permissions they hold,
  * How their identity data is stored and changed.

* **Scope (In-Scope for MVP1):**

  * Tenant / organization profile (create, update, basic metadata).
  * User lifecycle:

    * Invite → accept → active,
    * Deactivate / reactivate,
    * Soft delete (if allowed in later phases).
  * Authentication flows:

    * Login,
    * Logout,
    * Forgot password / reset password.
  * “My Profile” / Personal settings:

    * Name, avatar, locale, time zone,
    * Basic notification preferences (if included).
  * **Traceability:**

    * Full audit trail for all tenant & user changes,
    * Traceability UUID for each business object + audit event chain.

* **Boundaries (Explicit Out-of-Scope for MVP1):**

  * **NO** payment, vendor, treasury, cashflow.
  * **NO** payment cycle workflow (request, review, approve, disburse, slip upload).
  * **NO** GL/COA, tax, metadata for finance.
  * **NO** OCR, migration, import wizard.
  * **NO** advanced RBAC policy language (beyond basic roles in this MVP).

* **Non-Responsibility:**

  * MUST NOT manage money, balances or financial postings.
  * MUST NOT expose or manage payment attachments or slips.
  * MUST NOT implement analytics, dashboards, or reporting (only identity views).
  * MUST NOT bypass Kernel / MCP governance rules.

### 1.4 ERP Context (for this component)

* **Suite Name:** `AI-BOS ERP / Nexus ERP Suite`
* **Inspiration:** ZohoONE-style unified suite, but **kernel-governed, metadata-first**.

**ERP Universe Boundaries for MVP1:**

* **This component governs:**

  * Tenants and their canonical profile metadata.
  * Users and their membership in tenants.
  * Role assignment within each tenant (`platform_admin`, `org_admin`, `member`, `viewer`).
  * Identity traceability and login/audit events.

* **This component explicitly does NOT:**

  * Store or manage financial ledgers or payment documents.
  * Manage vendor/customer master data.
  * Handle payment attachments / slips (that will belong to MVP2 Payment Cycle).
  * Execute business workflows beyond identity lifecycle.

---

## 2. Requirements

### 2.1 Functional Requirements (MVP1)

> IDs are specific to this component; they won’t clash with Kernel F-IDs.

| ID       | Requirement                                                                                               | Priority | Status | Notes                                  |
| -------- | --------------------------------------------------------------------------------------------------------- | -------- | ------ | -------------------------------------- |
| F-ORG-1  | System MUST allow a **Platform Admin** to create and update a Tenant/Organization profile.                | MUST     | ⚪      | `tenants` table is SSOT.               |
| F-ORG-2  | System MUST allow an **Org Admin** to edit their own organization’s profile (name, logo, timezone, etc.). | MUST     | ⚪      | Scoped by `tenant_id`.                 |
| F-USER-1 | System MUST support inviting users via email to a specific tenant with an initial role.                   | MUST     | ⚪      | `invite_token` + expiry.               |
| F-USER-2 | System MUST support user accepting an invite and setting a password.                                      | MUST     | ⚪      | First login is invite acceptance.      |
| F-USER-3 | System MUST support deactivating / reactivating users per tenant.                                         | MUST     | ⚪      | `status` field with `active/inactive`. |
| F-USER-4 | System MUST support login (email + password or SSO later) and logout.                                     | MUST     | ⚪      | JWT/session managed at platform level. |
| F-USER-5 | System MUST support “Forgot password” → secure reset flow with tokens and expiry.                         | MUST     | ⚪      | Token invalid after use / expiry.      |
| F-USER-6 | System MUST provide a **“My Profile”** page for users to view and update their name, avatar, locale, etc. | MUST     | ⚪      | `/settings/profile`.                   |
| F-ROLE-1 | System MUST define roles: `platform_admin`, `org_admin`, `member`, `viewer`.                              | MUST     | ⚪      | Minimum RBAC for MVP1.                 |
| F-ROLE-2 | System MUST allow `platform_admin` and `org_admin` to assign roles within their tenant.                   | MUST     | ⚪      | Role assignments must be auditable.    |
| F-API-1  | System MUST expose APIs: `/auth/login`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`.  | MUST     | ⚪      | Auth BFF or kernel-routed.             |
| F-API-2  | System MUST expose `/admin/organization` for tenant profile CRUD.                                         | MUST     | ⚪      | Org admin scoped.                      |
| F-API-3  | System MUST expose `/admin/users` for listing, inviting, updating, deactivating users per tenant.         | MUST     | ⚪      | Pagination + filters.                  |
| F-API-4  | System MUST expose `/me` for “My Profile” data and PATCH for updates.                                     | MUST     | ⚪      | Per user.                              |
| F-UI-1   | System MUST provide UI pages: `/auth/login`, `/admin/organization`, `/admin/users`, `/settings/profile`.  | MUST     | ⚪      | Tailwind/Design System aligned.        |

#### Traceability & Audit Requirements (core of your SAP/Oracle-like UUID)

| ID        | Requirement                                                                                                                       | Priority | Status | Notes                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | ------------------------------------------ |
| F-TRACE-1 | Every **tenant** and **user** record MUST have a stable `trace_id` (UUID/ULID) used to correlate all related audit events.        | MUST     | ⚪      | Generated on create; never changes.        |
| F-TRACE-2 | Every lifecycle action (invite, accept, login, deactivate, reactivate, profile update, role change) MUST generate an audit event. | MUST     | ⚪      | `audit_events` table.                      |
| F-TRACE-3 | Each audit event MUST include `audit_id`, `trace_id`, `resource_type`, `resource_id`, `actor_user_id`, `action`, `timestamp`.     | MUST     | ⚪      | SAP/Oracle-style document flow.            |
| F-TRACE-4 | Audit events MUST support optional `location_ref` (e.g., “C12”, UI context, or workflow step ID) to trace *where* an action came. | SHOULD   | ⚪      | Allows later link to payment slip context. |
| F-TRACE-5 | Audit events MUST support `prev_hash` and `hash` fields to form an immutable hash chain per `trace_id`.                           | SHOULD   | ⚪      | Aligns with Kernel hash-chain principle.   |
| F-TRACE-6 | System MUST provide an API/endpoint to **reconstruct the full lifecycle** of a user or tenant from audit events.                  | SHOULD   | ⚪      | `/admin/audit/:trace_id` or equivalent.    |

> 🔁 **How this maps to your payment slip example:**
> For MVP2, `payment_slip` will simply be another `resource_type` (e.g., `PAYMENT_SLIP`) with its own `trace_id`. When the slip is uploaded in location `C12`, every “picked/viewed/approved” action will attach to the same `trace_id` + `location_ref`, giving you a **full who-picked-who-did-not** story just like Oracle/SAP.

---

### 2.2 Non-Functional Requirements

| ID       | Requirement                  | Target                                 | Measurement Source                          | Status |
| -------- | ---------------------------- | -------------------------------------- | ------------------------------------------- | ------ |
| NF-ORG-1 | Login latency                | < 300ms (95th percentile)              | API metrics for `/auth/login`               | ⚪      |
| NF-ORG-2 | Profile read latency (`/me`) | < 200ms (95th percentile)              | API metrics                                 | ⚪      |
| NF-ORG-3 | Availability                 | ≥ 99.9% for auth and profile endpoints | Uptime monitoring, health checks            | ⚪      |
| NF-ORG-4 | Consistency                  | Changes to user/org visible within 1s  | Integration tests, eventual consistency SLA | ⚪      |
| NF-ORG-5 | Audit durability             | Audit events MUST NOT be lost          | DB durability, write-ahead logging          | ⚪      |
| NF-ORG-6 | Multi-tenant isolation       | Zero cross-tenant data leakage         | Isolation tests, penetration tests          | ⚪      |
| NF-ORG-7 | Rate limiting                | Per IP & per user limits configurable  | Rate limiter metrics                        | ⚪      |

---

### 2.3 Compliance Requirements

| ID      | Requirement                                                                                                | Standard(s)          | Evidence                                  | Status |
| ------- | ---------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------- | ------ |
| C-ORG-1 | All auth events MUST be auditable and traceable to a user and IP/device fingerprint (where lawful).        | SOC2, ISO 27001      | `audit_events` records + logs             | ⚪      |
| C-ORG-2 | Password reset MUST use secure, expiring tokens and MUST NOT be logged in plaintext.                       | SOC2, OWASP ASVS     | Code review, tests, log scrubbing checks  | ⚪      |
| C-ORG-3 | All changes to personal data (name, email, locale) MUST be logged with `trace_id` and `actor_user_id`.     | GDPR, PDPA (MY/SG…)  | Audit events for profile changes          | ⚪      |
| C-ORG-4 | Data minimization: auth & audit MUST store only necessary personal data.                                   | GDPR Art.5           | Schema review, DPIA documentation         | ⚪      |
| C-ORG-5 | Users MUST be able to view their profile data and basic login history (where legally permitted).           | GDPR Art.15 (Access) | `/me` + optional `/me/security` endpoints | ⚪      |
| C-ORG-6 | Role assignments and deactivations MUST be logged for least-privilege and access review.                   | SOC2, ISO 27001      | Audit trail for role changes              | ⚪      |
| C-ORG-7 | Hash-chain for audit events SHOULD be enabled for tamper-evident trails (aligning with Kernel governance). | SOC2+, Zero-Trust    | Hash chain verification tools / tests     | ⚪      |

---

## 3. Architecture & Design Patterns (MVP1 view)

> This is the “mini” version of Template §3 tuned for identity.

### 3.1 Patterns

* **Patterns:** `BFF for Auth`, `Multi-Tenant SaaS`, `Event-Logged Identity`, `MCP-Governed Audit`
* **Justification:**

  * Identity is shared across all modules → must be central and MCP-governed.
  * Events (audit) make it easy to reconstruct history, debug, and comply.

### 3.2 Key Components (Conceptual)

* `tenants` — tenant profile.
* `users` — global user identity.
* `user_tenant_memberships` — join table (user ↔ tenant, with role).
* `audit_events` — immutable, hash-chained audit log, cross-component.

---

## 7. Contracts & Schemas (Traceability Focus)

### 7.1 Core Entities (Draft)

> This is the **conceptual contract**; implementation will be Drizzle + Zod.

#### `tenants`

* `id` (UUID/ULID, PK)
* `trace_id` (UUID/ULID, **immutable**, used for audit correlation)
* `name`
* `slug`
* `status` (`active`, `suspended`, `trial`, …)
* `timezone`
* `created_at`, `updated_at`
* `created_by_user_id` (FK → `users.id`)

#### `users`

* `id` (UUID/ULID, PK)
* `trace_id` (UUID/ULID, **immutable** per user)
* `email` (unique)
* `password_hash`
* `name`
* `avatar_url`
* `locale`
* `time_zone`
* `status` (`active`, `inactive`, `invited`, `locked`)
* `last_login_at`
* `created_at`, `updated_at`

#### `user_tenant_memberships`

* `id` (UUID/ULID, PK)
* `user_id` (FK → `users.id`)
* `tenant_id` (FK → `tenants.id`)
* `role` (`platform_admin`, `org_admin`, `member`, `viewer`)
* `created_at`, `updated_at`
* `created_by_user_id` (FK → `users.id`)

#### `audit_events` (where traceability lives)

* `audit_id` (UUID/ULID, PK)
* `trace_id` (UUID/ULID, links to **business object**, e.g., user / tenant / later payment)
* `resource_type` (`TENANT`, `USER`, `USER_TENANT_MEMBERSHIP`, later `PAYMENT_REQUEST`, `PAYMENT_SLIP`, …)
* `resource_id` (string/UUID – primary key of the resource)
* `action` (enum: `CREATE`, `UPDATE`, `INVITE`, `ACCEPT_INVITE`, `LOGIN`, `LOGOUT`, `DEACTIVATE`, `REACTIVATE`, `ROLE_CHANGE`, `PROFILE_UPDATE`, `VIEW`, `DOWNLOAD`, etc.)
* `actor_user_id` (FK → `users.id`, nullable for system actions)
* `location_ref` (string, optional – e.g., `"C12"`, UI route, step ID)
* `metadata_diff` (JSON, optional – before/after snapshot or compressed diff)
* `ip_address` (optional, subject to privacy rules)
* `user_agent` (optional, subject to privacy rules)
* `created_at` (timestamp)
* `prev_hash` (string, nullable – hash of previous event for same `trace_id`)
* `hash` (string – hash of this event: e.g., hash(trace_id + data + prev_hash))

> ✅ This gives you the **SAP/Oracle-style document traceability**, but generalized:
>
> * Every business object has a `trace_id`;
> * Every interaction on that object becomes an `audit_event` linked by `trace_id`;
> * For payment slips later, you’ll simply use `resource_type = 'PAYMENT_SLIP'` and add `location_ref = 'C12'`, and the same mechanism works.

---

## 8. Definition of Done (MVP1)

For MVP1 to be considered **Done**, the following MUST be true:

1. **Data Model**

   * `tenants`, `users`, `user_tenant_memberships`, `audit_events` created with **Drizzle ORM** and validated with **Zod** schemas.
   * `trace_id` present and enforced on `tenants`, `users`, and all `audit_events`.

2. **APIs**

   * `/auth/login`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` implemented and tested.
   * `/admin/organization` CRUD for tenant profile, with per-tenant scoping.
   * `/admin/users` for user list, invite, update, deactivate/reactivate.
   * `/me` + `/settings/profile` GET/PATCH for personal profile.

3. **UI**

   * Fully working pages:

     * `/auth/login`,
     * `/admin/organization`,
     * `/admin/users`,
     * `/settings/profile`.
   * All actions from UI generate corresponding `audit_events`.

4. **Traceability**

   * For any given `trace_id` (user or tenant), you can query an endpoint (or SQL view) to reconstruct full lifecycle.
   * Hash chain logic implemented for `audit_events` (or at minimum prepared with fields + TODO for v1.1).
   * At least one automated test verifying that:

     * Invite → accept → login → profile update → deactivate generates a **consistent chain** of audit events for the same `trace_id`.

5. **Security & Compliance**

   * Password reset tokens are one-time use + expiring.
   * Sensitive fields are never logged in plaintext.
   * Basic rate limiting in place for auth endpoints.
   * Role changes and deactivations appear in audit log.

---

### How this answers your Oracle/SAP traceability concern

* Oracle / SAP: **document flow / change documents** = one “document id” + full history of who touched it, where, when.
* AI-BOS:

  * `trace_id` = your **document id / flow id**.
  * `audit_events` with `trace_id` = **event log of that document’s life**.
  * `location_ref` = your “C12” (spreadsheet cell, UI position, step ID).
  * Hash chain = tamper-evident guarantee.

So when we build **MVP2 – Payment Cycle PRD**, we’ll:

* Reuse exactly this pattern,
* Define `payment_request`, `payment_slip`, etc. with `trace_id`,
* And your “who picked and who didn’t” story is just **filter audit_events by trace_id**.


