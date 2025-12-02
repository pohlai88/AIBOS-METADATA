# Admin-Config Business Engine

**Status:** ✅ **v1.1.0 HARDENED**  
**Date:** December 3, 2025

A pure, domain-driven business logic engine for the Admin Configuration subsystem. This module is isolated from infrastructure concerns (HTTP, Database) and enforces strict business rules, immutable audit logs, and atomic transactions.

---

## 🛡️ v1.1 Hardening Highlights

This release introduces critical stability and security features:

1. **Atomic Transactions**: All business operations are wrapped in a `TransactionManager`. A failure in any step (e.g., Audit logging) rolls back the entire operation.

2. **Fork-Proof Audit Log**: Implements **Optimistic Locking** on the Audit Hash Chain. Concurrent writes are detected and rejected to prevent history rewriting.

3. **Strict State Machines**: User lifecycle (Invite → Active → Inactive) is enforced by Domain Value Objects.

4. **Permission Enforcement**: Authorization logic lives inside the Use Cases, not the Controller.

---

## 🏗️ Architecture

### 1. Integration Flow

The engine uses a **Ports & Adapters (Hexagonal)** architecture.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BFF (Composition Root)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Create TransactionManager                                               │
│  2. Create Use Case via Factory                                             │
│  3. Execute Use Case                                                        │
│  4. Handle Domain Errors → HTTP Status                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS ENGINE (Pure Domain)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Use Case                                     │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │           TransactionManager.run(async (scope) => {         │    │    │
│  │  │                                                              │    │    │
│  │  │   A. PERMISSION CHECK (throws UnauthorizedError)             │    │    │
│  │  │   B. LOAD ENTITY (scope.userRepository.findById)             │    │    │
│  │  │   C. DOMAIN LOGIC (entity.deactivate())                      │    │    │
│  │  │   D. PERSIST (scope.userRepository.save)                     │    │    │
│  │  │   E. AUDIT (scope.auditRepository.appendEvent)               │    │    │
│  │  │                                                              │    │    │
│  │  │   // ALL ATOMIC - Commit or Rollback                         │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE (Drizzle/PostgreSQL)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  DrizzleTransactionManager → createRepositoryScope(tx) → SQL Transaction    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. The "Fork-Proof" Audit Chain

Every write operation appends to a cryptographically linked ledger.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         AUDIT HASH CHAIN                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐              │
│   │  GENESIS    │      │  EVENT 2    │      │  EVENT 3    │              │
│   │             │      │             │      │             │              │
│   │ prevHash:   │◄─────│ prevHash:   │◄─────│ prevHash:   │              │
│   │   NULL      │      │   hash1     │      │   hash2     │              │
│   │             │      │             │      │             │              │
│   │ hash: abc.. │      │ hash: def.. │      │ hash: ghi.. │              │
│   └─────────────┘      └─────────────┘      └─────────────┘              │
│                                                                          │
│   FORK PREVENTION:                                                       │
│   ─────────────────                                                      │
│   INSERT INTO audit_events ...                                           │
│   WHERE NOT EXISTS (                                                     │
│     SELECT 1 FROM audit_events                                           │
│     WHERE prev_hash = current_tail.hash  -- Someone already appended!   │
│   )                                                                      │
│                                                                          │
│   If 0 rows inserted → AuditConcurrencyError (Client should retry)       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Route Integration Status

**✅ 100% of WRITE operations are now hardened!**

| Module    | Route                        | Operation       | Status          | Pattern                            |
| --------- | ---------------------------- | --------------- | --------------- | ---------------------------------- |
| **Auth**  | `POST /auth/login`           | Login           | ✅ **Hardened** | Atomic (Update LastLogin + Audit)  |
| **Auth**  | `POST /auth/accept-invite`   | Accept Invite   | ✅ **Hardened** | State Machine (INVITED → ACTIVE)   |
| **Users** | `POST /users/invite`         | Invite User     | ✅ **Hardened** | Two-Phase (Tx Commit → Email Send) |
| **Users** | `PATCH /me`                  | Self Update     | ✅ **Hardened** | Atomic Update                      |
| **Users** | `PATCH /me/password`         | Change Password | ✅ **Hardened** | Security + Atomic Audit            |
| **Users** | `PATCH /users/:id`           | Admin Update    | ✅ **Hardened** | Role-Based Permission Check        |
| **Users** | `POST /users/:id/deactivate` | Deactivate      | ✅ **Hardened** | State Machine Transition           |
| **Users** | `POST /users/:id/reactivate` | Reactivate      | ✅ **Hardened** | State Machine Transition           |
| **Org**   | `PATCH /organization`        | Update Tenant   | ✅ **Hardened** | Permission Check + Atomic Audit    |
| **Read**  | `GET /users/*`               | Read Operations | 🟡 **Legacy**   | Direct Service Calls (Safe)        |
| **Read**  | `GET /organization`          | Get Tenant      | 🟡 **Legacy**   | Direct Service Calls (Safe)        |
| **Auth**  | `POST /auth/forgot-password` | Forgot Password | ⏳ **v2.0**     | Not Implemented                    |
| **Auth**  | `POST /auth/reset-password`  | Reset Password  | ⏳ **v2.0**     | Not Implemented                    |

---

## 🔄 State Machine: UserStatus

```
                    ┌─────────────────────────────────────────┐
                    │           USER STATUS LIFECYCLE         │
                    └─────────────────────────────────────────┘

                              acceptInvite()
                    INVITED ─────────────────────► ACTIVE
                        │                            │ │
                        │                            │ │
                        ✗ (cannot deactivate)        │ │ lock()
                                                     │ │
                                      deactivate()   │ ▼
                                    ◄────────────  LOCKED
                                    │                │
                                    ▼                │ reactivate()
                                 INACTIVE ◄──────────┘
                                    │
                                    │ reactivate()
                                    ▼
                                  ACTIVE


    INVALID TRANSITIONS (throw InvariantViolationError):
    ────────────────────────────────────────────────────
    • INVITED → INACTIVE (must accept invite first)
    • INACTIVE → INACTIVE (already inactive)
    • ACTIVE → ACTIVE (already active)
    • INVITED → ACTIVE via reactivate() (must use acceptInvite())
```

---

## 🧑‍💻 Developer Guide

### How to Write a New Use Case

Every Write Use Case **MUST** follow this pattern to ensure atomicity and auditability.

```typescript
// business-engine/admin-config/application/use-cases/my-action.use-case.ts

import type {
  ITransactionManager,
  TransactionScope,
} from "../ports/outbound/transaction.manager.port";
import { AuditEvent } from "../../domain/entities/audit-event.entity";
import { UnauthorizedError } from "../../domain/errors/unauthorized.error";
import { NotFoundError } from "../../domain/errors/not-found.error";

export interface MyActionCommand {
  targetId: string;
  actor: { userId: string; tenantId: string };
  input: {
    /* ... */
  };
  ipAddress?: string;
  userAgent?: string;
}

export function makeMyActionUseCase(transactionManager: ITransactionManager) {
  return async function myActionUseCase(command: MyActionCommand) {
    // 🔒 TRANSACTION BOUNDARY - Everything inside is atomic
    return transactionManager.run(async (scope: TransactionScope) => {
      const { myRepository, membershipRepository, auditRepository } = scope;

      // ─────────────────────────────────────────────────────────────
      // A. AUTHORIZATION (Inside the Engine, not the Controller)
      // ─────────────────────────────────────────────────────────────
      const actorMembership = await membershipRepository.findByUserAndTenant(
        command.actor.userId,
        command.actor.tenantId
      );

      if (!actorMembership || !actorMembership.role.canPerformAction()) {
        throw new UnauthorizedError("MY_ACTION", "Permission denied");
      }

      // ─────────────────────────────────────────────────────────────
      // B. LOAD ENTITY
      // ─────────────────────────────────────────────────────────────
      const entity = await myRepository.findById(command.targetId);
      if (!entity) {
        throw new NotFoundError("Entity", command.targetId);
      }

      // ─────────────────────────────────────────────────────────────
      // C. DOMAIN LOGIC (Business Rules in Entity/Value Objects)
      // ─────────────────────────────────────────────────────────────
      const beforeState = entity.toSnapshot();
      entity.performAction(command.input); // <-- Throws if invalid
      const afterState = entity.toSnapshot();

      // ─────────────────────────────────────────────────────────────
      // D. PERSIST (Always use 'scope', not constructor-injected repos)
      // ─────────────────────────────────────────────────────────────
      const savedEntity = await myRepository.save(entity);

      // ─────────────────────────────────────────────────────────────
      // E. AUDIT (Mandatory for all writes - Optimistic Locking)
      // ─────────────────────────────────────────────────────────────
      const prevAuditEvent = await auditRepository.getLatestByTraceId(
        savedEntity.traceId.toString()
      );

      const auditEvent = AuditEvent.create({
        traceId: savedEntity.traceId.toString(),
        resourceType: "MY_ENTITY",
        resourceId: savedEntity.id,
        action: "MY_ACTION",
        actorUserId: command.actor.userId,
        metadataDiff: { before: beforeState, after: afterState },
        prevHash: prevAuditEvent?.hash ?? null, // <-- Link to chain
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
      });

      // appendEvent() enforces optimistic locking - throws AuditConcurrencyError on race
      const savedAuditEvent = await auditRepository.appendEvent(auditEvent);

      return { entity: savedEntity, auditEvent: savedAuditEvent };
    });
  };
}
```

### Wiring in the BFF (Composition Root)

```typescript
// apps/bff-admin-config/src/routes/my.routes.ts

import { Hono } from "hono";
import { getDatabase } from "../config/database";
import {
  DrizzleTransactionManager,
  createRepositoryScope,
} from "../infrastructure";
import { makeMyActionUseCase } from "../../../../business-engine/admin-config";
import { handleDomainError } from "../middleware/error-handler.middleware";

const myRoutes = new Hono();

myRoutes.post("/:id/action", async (c) => {
  return handleDomainError(c, async () => {
    // 1. COMPOSITION ROOT - Wire infrastructure to use case
    const db = getDatabase();
    const txManager = new DrizzleTransactionManager(db, createRepositoryScope);
    const myActionUseCase = makeMyActionUseCase(txManager);

    // 2. EXECUTE - Business Engine handles all logic
    const result = await myActionUseCase({
      targetId: c.req.param("id"),
      actor: { userId: c.get("userId"), tenantId: c.get("tenantId") },
      input: await c.req.json(),
      ipAddress: c.req.header("x-forwarded-for"),
      userAgent: c.req.header("user-agent"),
    });

    // 3. RETURN - BFF just formats the response
    return c.json({ message: "Action completed", entity: result.entity });
  });
});
```

---

## ⚠️ Error Handling Taxonomy

The BFF automatically maps these Domain Errors to HTTP Status Codes:

| Error Class               | HTTP Status | When to Use                                                  |
| ------------------------- | ----------- | ------------------------------------------------------------ |
| `ValidationError`         | **400**     | Malformed input (Value Object rejected)                      |
| `InvariantViolationError` | **400**     | Illegal state transition (e.g., Deactivate an inactive user) |
| `AuthenticationError`     | **401**     | Login failed (generic message, no details leaked)            |
| `UnauthorizedError`       | **403**     | Actor lacks permission for this action                       |
| `NotFoundError`           | **404**     | Resource not found                                           |
| `ConflictError`           | **409**     | Duplicate resource (e.g., Email already exists)              |
| `AuditConcurrencyError`   | **409**     | **CRITICAL**: Race condition detected. Client should retry.  |

### Creating Domain Errors

```typescript
import { UnauthorizedError } from "../domain/errors/unauthorized.error";
import { InvariantViolationError } from "../domain/errors/invariant.error";

// Permission denied
throw new UnauthorizedError(
  "DEACTIVATE_USER", // Action name
  "Only administrators can do this", // User-facing message
  { requiredRole: "org_admin" } // Internal details (not exposed)
);

// Business rule violation
throw new InvariantViolationError(
  "INVALID_STATUS_TRANSITION", // Error code
  "Cannot deactivate an invited user", // User-facing message
  { currentStatus: "invited" } // Internal details
);
```

---

## 📂 Directory Structure

```
business-engine/admin-config/
├── index.ts                           # Public API (exports everything)
│
├── application/
│   ├── ports/
│   │   └── outbound/                  # Repository Interfaces
│   │       ├── user.repository.port.ts
│   │       ├── tenant.repository.port.ts
│   │       ├── membership.repository.port.ts
│   │       ├── audit.repository.port.ts
│   │       ├── token.repository.port.ts
│   │       └── transaction.manager.port.ts  # ⭐ Core Abstraction
│   │
│   └── use-cases/                     # The "What" (Business Operations)
│       ├── auth/
│       │   └── login.use-case.ts
│       ├── user/
│       │   ├── invite-user.use-case.ts
│       │   ├── accept-invite.use-case.ts
│       │   ├── update-profile.use-case.ts
│       │   ├── admin-update-user.use-case.ts
│       │   ├── deactivate-user.use-case.ts
│       │   └── reactivate-user.use-case.ts
│       └── tenant/
│           ├── create-tenant.use-case.ts
│           └── update-tenant.use-case.ts
│
├── domain/
│   ├── entities/                      # The "Who" (Business Objects)
│   │   ├── user.entity.ts
│   │   ├── tenant.entity.ts
│   │   ├── membership.entity.ts
│   │   └── audit-event.entity.ts
│   │
│   ├── value-objects/                 # The "Rules" (Immutable Validation)
│   │   ├── email.vo.ts
│   │   ├── user-status.vo.ts          # State Machine
│   │   ├── tenant-status.vo.ts
│   │   ├── tenant-role.vo.ts          # Permission Methods
│   │   ├── tenant-slug.vo.ts
│   │   └── trace-id.vo.ts
│   │
│   ├── errors/                        # The "Why" (Domain Exceptions)
│   │   ├── domain.error.ts            # Base class with ErrorCode
│   │   ├── validation.error.ts
│   │   ├── unauthorized.error.ts
│   │   ├── authentication.error.ts    # No info leak
│   │   ├── not-found.error.ts
│   │   ├── conflict.error.ts
│   │   ├── concurrency.error.ts       # Audit chain protection
│   │   └── invariant.error.ts         # State machine violations
│   │
│   └── events/                        # Future: Domain Events
│       └── index.ts
│
└── contracts/                         # Zod Schemas (Shared with BFF)
    ├── user.contract.ts
    ├── tenant.contract.ts
    ├── membership.contract.ts
    ├── audit.contract.ts
    └── auth.contract.ts
```

---

## 🧪 Testing

### Running the Concurrency Proof

We have a specific integration test that proves the Audit Log cannot be forked.

```bash
# In apps/bff-admin-config
cd apps/bff-admin-config
npm run test:integration
```

**Expected Output:**

```
✓ should allow the first event (genesis) with prevHash = null
✓ should allow appending to the chain with correct prevHash
✓ should REJECT a duplicate genesis (prevHash=null when chain exists)
✓ should REJECT appending to a non-tail event (fork attempt)
✓ should prevent audit chain forks under CONCURRENT load  ← THE BIG ONE
✓ should verify full hash chain integrity

Test Files  1 passed (1)
Tests       6 passed (6)
```

---

## 🚀 Next Steps (v2.0 Roadmap)

- [ ] **Event Bus Integration** - Publish `UserCreated`, `UserDeactivated` to RabbitMQ/Kafka
- [ ] **Read-Model Optimization** - CQRS for `GET` routes (separate read replicas)
- [ ] **Multi-Factor Authentication** - MFA logic in the auth use cases
- [ ] **Soft Delete** - Mark entities as deleted instead of hard delete
- [ ] **Batch Operations** - Bulk invite, bulk deactivate with single audit trail

---

## 📜 Changelog

### v1.1.1 (December 3, 2025) - 100% WRITE COVERAGE

- ✅ `makeChangePasswordUseCase` - Final write operation hardened
- ✅ 10/10 write routes now atomic + audited
- ✅ E2E Onboarding Flow test (6 tests)

### v1.1.0 (December 3, 2025) - HARDENING RELEASE

- ✅ `ITransactionManager` port for atomic operations
- ✅ `TransactionScope` with typed repository access
- ✅ Domain Error taxonomy with `ErrorCode`
- ✅ `AuditConcurrencyError` for optimistic locking
- ✅ `UserStatus` state machine enforcement
- ✅ Permission methods on `TenantRole` value object
- ✅ All write operations hardened (9 use cases)
- ✅ Integration test proving fork-proof audit log

### v1.0.0 (November 2025) - INITIAL RELEASE

- User, Tenant, Membership entities
- Basic CRUD use cases
- Audit event logging (non-atomic)
- Zod contract schemas
