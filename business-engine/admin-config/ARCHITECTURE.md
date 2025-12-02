# Admin-Config (Identity & Org Admin) - Hexagonal Architecture

**Component:** `identity-org-admin`  
**Domain:** Identity & Tenancy (Core Platform)  
**Version:** 1.0.0  
**Status:** MVP1 Implementation Ready

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ INBOUND ADAPTERS           │        OUTBOUND ADAPTERS               │   │
│  │ (Primary/Driving)          │        (Secondary/Driven)              │   │
│  │                            │                                        │   │
│  │ • HTTP Routes (Hono)       │        • Drizzle Repositories          │   │
│  │ • MCP Tools (AI Agents)    │        • Email Adapter                 │   │
│  │                            │        • JWT/BCrypt Adapters           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ USE CASES                   │        PORTS                          │   │
│  │                             │                                       │   │
│  │ • CreateTenant              │        OUTBOUND (Interfaces):         │   │
│  │ • UpdateTenant              │        • ITenantRepository            │   │
│  │ • InviteUser                │        • IUserRepository              │   │
│  │ • AcceptInvite              │        • IMembershipRepository        │   │
│  │ • UpdateProfile             │        • IAuditRepository             │   │
│  │ • Login                     │        • ITokenRepository             │   │
│  │ • ForgotPassword            │                                       │   │
│  │ • ResetPassword             │                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DOMAIN LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ENTITIES                    │        VALUE OBJECTS                  │   │
│  │                             │                                       │   │
│  │ • Tenant (Aggregate Root)   │        • TraceId                      │   │
│  │ • User (Aggregate Root)     │        • Email                        │   │
│  │ • Membership                │        • TenantRole                   │   │
│  │ • AuditEvent (Immutable)    │        • UserStatus                   │   │
│  │                             │        • TenantStatus                 │   │
│  ├─────────────────────────────┼───────────────────────────────────────┤   │
│  │ DOMAIN EVENTS               │                                       │   │
│  │                             │                                       │   │
│  │ • TenantCreated             │                                       │   │
│  │ • UserInvited               │                                       │   │
│  │ • UserActivated             │                                       │   │
│  │ • RoleChanged               │                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
admin-config/
├── GRCD-ADMIN-AND-USER.md           # SSOT Specification
├── ARCHITECTURE.md                   # This file
├── index.ts                          # Module barrel export
│
├── contracts/                        # 📜 Zod Schemas (API Contracts)
│   ├── tenant.contract.ts
│   ├── user.contract.ts
│   ├── membership.contract.ts
│   ├── audit.contract.ts
│   ├── auth.contract.ts
│   └── index.ts
│
├── domain/                           # 🔵 Pure Domain (NO external deps)
│   ├── value-objects/
│   │   ├── trace-id.vo.ts
│   │   ├── email.vo.ts
│   │   ├── tenant-role.vo.ts
│   │   ├── user-status.vo.ts
│   │   ├── tenant-status.vo.ts
│   │   └── index.ts
│   ├── entities/
│   │   ├── tenant.entity.ts
│   │   ├── user.entity.ts
│   │   ├── membership.entity.ts
│   │   ├── audit-event.entity.ts
│   │   └── index.ts
│   ├── events/
│   │   └── index.ts
│   └── index.ts
│
├── application/                      # 🟢 Application Layer
│   ├── ports/
│   │   └── outbound/
│   │       ├── tenant.repository.port.ts
│   │       ├── user.repository.port.ts
│   │       ├── membership.repository.port.ts
│   │       ├── audit.repository.port.ts
│   │       ├── token.repository.port.ts
│   │       └── index.ts
│   ├── use-cases/
│   │   ├── tenant/
│   │   │   ├── create-tenant.use-case.ts
│   │   │   ├── update-tenant.use-case.ts
│   │   │   └── index.ts
│   │   ├── user/
│   │   │   ├── invite-user.use-case.ts
│   │   │   ├── accept-invite.use-case.ts
│   │   │   ├── update-profile.use-case.ts
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   ├── login.use-case.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
│
└── infrastructure/                   # 🔴 Adapters (External World)
    └── persistence/
        └── drizzle/
            └── schema/
                ├── tenant.schema.ts
                ├── user.schema.ts
                ├── membership.schema.ts
                ├── audit-event.schema.ts
                ├── invite-token.schema.ts
                ├── password-reset-token.schema.ts
                └── index.ts
```

---

## 🎯 Vocabulary-Controlled Naming Conventions

### Database Tables (PostgreSQL)

| Table Name | Prefix | Purpose |
|------------|--------|---------|
| `iam_tenant` | `iam_` | Tenant/Organization profile |
| `iam_user` | `iam_` | Global user identity |
| `iam_user_tenant_membership` | `iam_` | User-Tenant join with role |
| `iam_audit_event` | `iam_` | Immutable audit trail |
| `iam_invite_token` | `iam_` | User invitation tokens |
| `iam_password_reset_token` | `iam_` | Password reset tokens |

### Status Enums (Vocabulary Controlled)

| Entity | Status Values |
|--------|---------------|
| **Tenant** | `pending_setup` \| `trial` \| `active` \| `suspended` |
| **User** | `invited` \| `active` \| `inactive` \| `locked` |
| **Roles** | `platform_admin` \| `org_admin` \| `member` \| `viewer` |

### Audit Actions (GRCD F-TRACE-3)

```typescript
type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE'
  | 'INVITE' | 'ACCEPT_INVITE' | 'DEACTIVATE' | 'REACTIVATE'
  | 'ROLE_CHANGE' | 'PROFILE_UPDATE'
  | 'LOGIN' | 'LOGOUT' | 'PASSWORD_RESET_REQUEST' | 'PASSWORD_RESET_COMPLETE'
  | 'VIEW' | 'DOWNLOAD'
  // MVP2 Payment Cycle
  | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'DISBURSE' | 'UPLOAD_SLIP' | 'CANCEL';
```

---

## 🔗 Alignment with Metadata-Studio Conventions

| Convention | Metadata-Studio | Admin-Config |
|------------|-----------------|--------------|
| **Table Prefix** | `mdm_` | `iam_` |
| **Schema Files** | `*.tables.ts` | `*.schema.ts` |
| **Service Pattern** | Object with methods | Use-case functions |
| **Zod Schemas** | `*.schema.ts` | `*.contract.ts` |
| **Audit Trail** | `createdBy`, `updatedBy` | `createdBy`, `updatedBy` + `trace_id` + `hash` |
| **Multi-tenant** | `tenantId` column | `tenantId` column |
| **Timestamps** | `createdAt`, `updatedAt` | `createdAt`, `updatedAt` |

---

## 🏗️ Key Design Decisions

### 1. Hexagonal Architecture
- **Domain is pure** - No framework dependencies, just TypeScript
- **Ports define contracts** - Interfaces for external dependencies
- **Adapters are swappable** - Easy to test, easy to change

### 2. Traceability First (GRCD F-TRACE-*)
- Every entity has a `traceId` (immutable UUID)
- All actions generate audit events linked by `traceId`
- Hash chain (`prevHash` + `hash`) for tamper detection
- `locationRef` for Oracle/SAP-style "C12" tracking

### 3. Security by Design
- Password hashes NEVER in User entity (separate repository method)
- Tokens stored as hashes, not plaintext
- Audit events capture IP/user agent for compliance

---

## 📊 GRCD Requirement Mapping

| GRCD ID | Requirement | Implementation |
|---------|-------------|----------------|
| F-ORG-1 | Create Tenant | `createTenantUseCase` |
| F-ORG-2 | Update Tenant | `updateTenantUseCase` |
| F-USER-1 | Invite User | `inviteUserUseCase` |
| F-USER-2 | Accept Invite | `acceptInviteUseCase` |
| F-USER-3 | Deactivate/Reactivate | `UserStatus` transitions |
| F-USER-4 | Login | `loginUseCase` |
| F-USER-5 | Password Reset | `ITokenRepository` |
| F-USER-6 | My Profile | `updateProfileUseCase` |
| F-ROLE-1 | Define Roles | `TenantRoleEnum` |
| F-ROLE-2 | Assign Roles | `TenantRole.canAssignRole()` |
| F-TRACE-1 | trace_id per entity | `TraceId` value object |
| F-TRACE-2 | Audit every action | `AuditEvent` entity |
| F-TRACE-5 | Hash chain | `AuditEvent.hash`, `prevHash` |

---

## 🚀 Next Steps

1. **Create Repository Implementations** - Drizzle adapters in `infrastructure/persistence/drizzle/repositories/`
2. **Create HTTP Routes** - Hono routes in `infrastructure/inbound/http/`
3. **Add Remaining Use-Cases** - Deactivate, Reactivate, ForgotPassword, ResetPassword
4. **Add MCP Tools** - AI agent interface for identity operations
5. **Integration Tests** - Test full user lifecycle flow

---

## 📈 Statistics

| Metric | Count |
|--------|-------|
| **Contracts (Zod)** | 5 files |
| **Value Objects** | 5 classes |
| **Entities** | 4 classes |
| **DB Schemas** | 6 tables |
| **Repository Ports** | 5 interfaces |
| **Use Cases** | 6 functions |
| **Total Files** | ~35 TypeScript files |

---

**This module follows hexagonal architecture with vocabulary-controlled naming aligned to metadata-studio conventions, ensuring seamless integration and avoiding debugging hell.**

