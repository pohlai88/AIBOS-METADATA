# 🔧 Architectural Drift Corrections

**Date**: December 2, 2024  
**Status**: 🚨 **CRITICAL - MUST FIX BEFORE PROCEEDING**

---

## 📋 Summary of Drifts Identified

| # | Drift | Severity | Impact |
|---|-------|----------|--------|
| 1 | **Missing Event-Driven Communication** | 🔴 CRITICAL | Breaks cross-module integration |
| 2 | **No BFF Layer for Business Engines** | 🔴 CRITICAL | Wrong API architecture |
| 3 | **Hardcoded UI Configuration** | 🟡 MODERATE | Maintenance & deployment issues |

---

## 🔴 DRIFT #1: Missing Event-Driven Communication

### ❌ What's Wrong

**metadata-studio pattern** (CORRECT):
```typescript
// After approving metadata
await eventBus.publish({
  type: 'metadata.approved',
  version: '1.0.0',
  tenantId: auth.tenantId,
  source: 'metadata-studio.approval',
  correlationId: approvalId,
  payload: {
    entityId: meta.id,
    canonicalKey: meta.canonicalKey,
    approvedBy: { actorId: auth.userId, actorType: 'HUMAN' },
  },
});
```

**admin-config routes** (INCORRECT - BUILT WITHOUT EVENTS):
```typescript
// apps/api/src/routes/admin-config/users.routes.ts
usersRoutes.post("/invite", async (c) => {
  // ... invite logic ...
  
  return c.json({ message: "Invitation sent successfully" });
  // ❌ NO EVENT EMITTED!
});
```

### ✅ Correct Pattern

**Every operation MUST emit events** for:
- Cross-module communication
- Audit trail
- Workflow triggers
- Async processing

**Event catalog for admin-config**:

| Operation | Event Type | Purpose |
|-----------|-----------|---------|
| User invited | `user.invited` | Trigger email, audit log |
| User accepted invite | `user.activated` | Trigger onboarding |
| User deactivated | `user.deactivated` | Revoke access, cleanup |
| User role changed | `user.role.changed` | Update permissions |
| Tenant created | `tenant.created` | Setup defaults |
| Tenant updated | `tenant.updated` | Propagate changes |
| Login success | `auth.login.success` | Track activity |
| Login failed | `auth.login.failed` | Security monitoring |
| Password changed | `auth.password.changed` | Security audit |

### 📝 Required Changes

#### 1. Create Event Schemas

**File**: `business-engine/admin-config/events/user.events.ts`

```typescript
import { z } from "zod";

export const UserInvitedEventSchema = z.object({
  type: z.literal("user.invited"),
  version: z.literal("1.0.0"),
  tenantId: z.string(),
  source: z.literal("admin-config.user"),
  correlationId: z.string(), // trace ID
  timestamp: z.string().datetime(),
  payload: z.object({
    userId: z.string(),
    email: z.string().email(),
    role: z.enum(["org_admin", "member", "viewer"]),
    invitedBy: z.object({
      actorId: z.string(),
      actorType: z.literal("HUMAN"),
    }),
  }),
});

export const UserDeactivatedEventSchema = z.object({
  type: z.literal("user.deactivated"),
  version: z.literal("1.0.0"),
  tenantId: z.string(),
  source: z.literal("admin-config.user"),
  correlationId: z.string(),
  timestamp: z.string().datetime(),
  payload: z.object({
    userId: z.string(),
    email: z.string(),
    reason: z.string().optional(),
    deactivatedBy: z.object({
      actorId: z.string(),
      actorType: z.literal("HUMAN"),
    }),
  }),
});

// Add more event schemas...
```

#### 2. Integrate Event Bus

**File**: `apps/api/src/config/container.ts`

```typescript
import { eventBus } from "../../../metadata-studio/events"; // Reuse existing event bus

class Container {
  // ... existing code ...
  
  public readonly eventBus = eventBus; // Add event bus to container
}
```

#### 3. Emit Events in Routes

**File**: `apps/api/src/routes/admin-config/users.routes.ts`

```typescript
import { container } from "../../config/container";

usersRoutes.post("/invite", async (c) => {
  const { email, role } = c.req.valid("json");
  const tenantId = c.get("tenantId");
  const invitedBy = c.get("userId");

  try {
    // 1. Execute use case
    const result = await inviteUserUseCase({
      input: { email, role, tenantId, invitedBy },
    }, container);

    // 2. Emit event 🔥
    await container.eventBus.publish({
      type: "user.invited",
      version: "1.0.0",
      tenantId,
      source: "admin-config.user",
      correlationId: result.traceId, // From audit event
      timestamp: new Date().toISOString(),
      payload: {
        userId: result.userId,
        email,
        role,
        invitedBy: {
          actorId: invitedBy,
          actorType: "HUMAN",
        },
      },
    });

    return c.json({ message: "Invitation sent successfully", email });
  } catch (error) {
    // Also emit failure event
    await container.eventBus.publish({
      type: "user.invite.failed",
      version: "1.0.0",
      tenantId,
      source: "admin-config.user",
      correlationId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      payload: {
        email,
        error: error.message,
        attemptedBy: {
          actorId: invitedBy,
          actorType: "HUMAN",
        },
      },
    });
    
    return c.json({ error: error.message }, 400);
  }
});
```

---

## 🔴 DRIFT #2: No BFF Layer for Business Engines

### ❌ What's Wrong

**Current implementation** (INCORRECT):
```
Frontend → Direct API Routes → Use Cases → Domain
           (apps/api/src/routes/admin-config/)
```

**Expected architecture** (CORRECT):
```
Frontend → BFF Layer → Business Engine Use Cases → Domain
          (per-module)  (business-engine/admin-config/)
```

### ✅ Correct Pattern

**BFF (Backend for Frontend)** should:
- Live in `apps/bff-admin-config/` (separate per business engine)
- Call business engine use cases
- Handle frontend-specific concerns (data shaping, aggregation)
- Emit events after operations
- Be thin - just orchestration

**Current structure is too monolithic**:
- `apps/api` mixes all business engines in one server
- Should separate into multiple BFFs:
  - `apps/bff-admin-config/` - Admin & user management
  - `apps/bff-payment-cycle/` - Payment workflows
  - `apps/bff-metadata-studio/` - Metadata operations (already exists)

### 📝 Required Changes

#### 1. Restructure API Server

**BEFORE** (Monolithic):
```
apps/api/
├── src/
│   └── routes/
│       ├── admin-config/      ❌ Mixed concerns
│       └── payment-cycle/     ❌ Future drift
```

**AFTER** (BFF per Engine):
```
apps/
├── bff-admin-config/          ✅ Admin BFF
│   ├── src/
│   │   ├── index.ts           # Hono server
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   └── organization.routes.ts
│   │   └── container.ts       # DI for admin-config
│   └── package.json
│
├── bff-payment-cycle/         ✅ Payment BFF (future)
│   └── ... (same structure)
│
└── metadata-studio/           ✅ Metadata BFF (exists)
    └── api/ (already correct)
```

#### 2. BFF Route Pattern

**File**: `apps/bff-admin-config/src/routes/users.routes.ts`

```typescript
import { Hono } from "hono";
import { container } from "../container";

// Import use cases from business engine
import { inviteUserUseCase } from "@aibos/admin-config/application/use-cases";

export const usersRoutes = new Hono();

usersRoutes.post("/invite", async (c) => {
  const { email, role } = c.req.valid("json");
  const auth = c.get("auth");

  // 1. Call business engine use case
  const result = await inviteUserUseCase(
    {
      input: {
        email,
        role,
        tenantId: auth.tenantId,
        invitedBy: auth.userId,
      },
    },
    container // Inject dependencies
  );

  // 2. Emit event (BFF responsibility)
  await container.eventBus.publish({
    type: "user.invited",
    version: "1.0.0",
    tenantId: auth.tenantId,
    source: "admin-config.user",
    correlationId: result.traceId,
    payload: result,
  });

  // 3. Shape response for frontend (BFF responsibility)
  return c.json({
    success: true,
    user: {
      id: result.userId,
      email: result.email,
      role: result.role,
      status: "invited",
      inviteToken: result.inviteToken, // Only if needed by frontend
    },
  });
});
```

#### 3. Frontend API Client Update

**File**: `apps/web/lib/api-client.ts`

```typescript
// Different BFF endpoints per module
const ADMIN_BFF_URL = process.env.NEXT_PUBLIC_ADMIN_BFF_URL || "http://localhost:3001";
const PAYMENT_BFF_URL = process.env.NEXT_PUBLIC_PAYMENT_BFF_URL || "http://localhost:3002";
const METADATA_BFF_URL = process.env.NEXT_PUBLIC_METADATA_BFF_URL || "http://localhost:3003";

export const usersApi = {
  invite: async (email: string, role: string) => {
    return apiRequest<InviteResponse>(`${ADMIN_BFF_URL}/users/invite`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  },
};
```

---

## 🟡 DRIFT #3: Hardcoded UI Configuration

### ❌ What's Wrong

**Hardcoded values found**:

1. **API URLs** hardcoded in `api-client.ts`:
   ```typescript
   const API_BASE_URL = "http://localhost:3001/api/admin"; // ❌
   ```

2. **Token keys** hardcoded:
   ```typescript
   localStorage.getItem("auth_token"); // ❌ Should be configurable
   ```

3. **Routes** hardcoded in login page:
   ```typescript
   fetch("/api/auth/login"); // ❌ Should use api-client
   ```

4. **No environment validation**

### ✅ Correct Pattern

#### 1. Configuration File

**File**: `apps/web/lib/config.ts`

```typescript
import { z } from "zod";

const ConfigSchema = z.object({
  api: z.object({
    adminBff: z.string().url(),
    paymentBff: z.string().url(),
    metadataBff: z.string().url(),
  }),
  auth: z.object({
    tokenKey: z.string(),
    refreshTokenKey: z.string(),
    sessionDuration: z.number(),
  }),
  features: z.object({
    demoMode: z.boolean(),
    analytics: z.boolean(),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

function loadConfig(): Config {
  const config = {
    api: {
      adminBff: process.env.NEXT_PUBLIC_ADMIN_BFF_URL!,
      paymentBff: process.env.NEXT_PUBLIC_PAYMENT_BFF_URL!,
      metadataBff: process.env.NEXT_PUBLIC_METADATA_BFF_URL!,
    },
    auth: {
      tokenKey: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "aibos_auth_token",
      refreshTokenKey: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || "aibos_refresh_token",
      sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    features: {
      demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
      analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
    },
  };

  // Validate config
  return ConfigSchema.parse(config);
}

export const config = loadConfig();
```

#### 2. Updated API Client

**File**: `apps/web/lib/api-client.ts`

```typescript
import { config } from "./config";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(config.auth.tokenKey); // ✅ From config
}

export const usersApi = {
  invite: async (email: string, role: string) => {
    return apiRequest<InviteResponse>(
      `${config.api.adminBff}/users/invite`, // ✅ From config
      {
        method: "POST",
        body: JSON.stringify({ email, role }),
      }
    );
  },
};
```

#### 3. Environment Variables

**File**: `apps/web/.env.example`

```env
# BFF Endpoints
NEXT_PUBLIC_ADMIN_BFF_URL=http://localhost:3001
NEXT_PUBLIC_PAYMENT_BFF_URL=http://localhost:3002
NEXT_PUBLIC_METADATA_BFF_URL=http://localhost:3003

# Auth Configuration
NEXT_PUBLIC_AUTH_TOKEN_KEY=aibos_auth_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=aibos_refresh_token

# Feature Flags
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

---

## 📋 Implementation Checklist

### Phase 1: Events (2-3 hours)
- [ ] Create `business-engine/admin-config/events/` folder
- [ ] Define event schemas for all operations
- [ ] Add eventBus to container
- [ ] Emit events in all API routes
- [ ] Test event emission

### Phase 2: BFF Refactor (4-5 hours)
- [ ] Create `apps/bff-admin-config/` package
- [ ] Move routes from `apps/api` to BFF
- [ ] Wire BFF to business engine use cases
- [ ] Update frontend API client with BFF URLs
- [ ] Test BFF endpoints

### Phase 3: Configuration (1-2 hours)
- [ ] Create `apps/web/lib/config.ts`
- [ ] Validate environment variables
- [ ] Replace hardcoded values
- [ ] Update `.env.example`
- [ ] Test configuration loading

### Phase 4: Testing (2-3 hours)
- [ ] Test event flow end-to-end
- [ ] Test BFF → Use Case → Event flow
- [ ] Test frontend → BFF → Backend flow
- [ ] Verify no hardcoded values remain

**Total Estimated Time**: ~10-13 hours

---

## 🎯 Priority

**DO NOT PROCEED** with frontend integration until these drifts are corrected.

**Why?**
- Events enable cross-module communication (payment-cycle will need to listen to user events)
- BFF architecture is the foundation for scalability
- Hardcoded config blocks production deployment

**Recommendation**:
1. Fix events FIRST (blocks everything)
2. Fix BFF SECOND (architectural foundation)
3. Fix config LAST (quality improvement)

---

## 📚 Reference

### Event-Driven Pattern (metadata-studio)
- `metadata-studio/events/event-bus.ts` - Event bus implementation
- `metadata-studio/api/approvals.routes.ts` - Event emission examples
- `metadata-studio/events/profile.subscriber.ts` - Event subscription examples

### BFF Pattern (to be created)
- `apps/bff-admin-config/` - New package
- Pattern: Frontend → BFF → Business Engine → Domain

### Configuration Pattern
- `apps/web/lib/config.ts` - New configuration module
- Environment validation with Zod

---

**Status**: 🔴 **BLOCKED - FIX REQUIRED**  
**Next Step**: Implement Phase 1 (Events)

