// business-engine/admin-config/domain/events/index.ts
/**
 * Domain Events for Identity Module
 * 
 * GRCD F-TRACE-2: Every lifecycle action MUST generate an audit event.
 * These domain events are raised by entities and handled by the application layer.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Base Event Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface DomainEvent {
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly aggregateType: 'TENANT' | 'USER' | 'USER_TENANT_MEMBERSHIP';
  readonly traceId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tenant Events
// ─────────────────────────────────────────────────────────────────────────────

export interface TenantCreatedEvent extends DomainEvent {
  readonly eventType: 'TENANT_CREATED';
  readonly aggregateType: 'TENANT';
  readonly payload: {
    name: string;
    slug: string;
    createdBy: string;
  };
}

export interface TenantUpdatedEvent extends DomainEvent {
  readonly eventType: 'TENANT_UPDATED';
  readonly aggregateType: 'TENANT';
  readonly payload: {
    changes: Record<string, { old: unknown; new: unknown }>;
    updatedBy: string;
  };
}

export interface TenantStatusChangedEvent extends DomainEvent {
  readonly eventType: 'TENANT_STATUS_CHANGED';
  readonly aggregateType: 'TENANT';
  readonly payload: {
    oldStatus: string;
    newStatus: string;
    changedBy: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// User Events
// ─────────────────────────────────────────────────────────────────────────────

export interface UserInvitedEvent extends DomainEvent {
  readonly eventType: 'USER_INVITED';
  readonly aggregateType: 'USER';
  readonly payload: {
    email: string;
    tenantId: string;
    role: string;
    invitedBy: string;
  };
}

export interface UserInviteAcceptedEvent extends DomainEvent {
  readonly eventType: 'USER_INVITE_ACCEPTED';
  readonly aggregateType: 'USER';
  readonly payload: {
    email: string;
    tenantId: string;
  };
}

export interface UserDeactivatedEvent extends DomainEvent {
  readonly eventType: 'USER_DEACTIVATED';
  readonly aggregateType: 'USER';
  readonly payload: {
    deactivatedBy: string;
    reason?: string;
  };
}

export interface UserReactivatedEvent extends DomainEvent {
  readonly eventType: 'USER_REACTIVATED';
  readonly aggregateType: 'USER';
  readonly payload: {
    reactivatedBy: string;
  };
}

export interface UserProfileUpdatedEvent extends DomainEvent {
  readonly eventType: 'USER_PROFILE_UPDATED';
  readonly aggregateType: 'USER';
  readonly payload: {
    changes: Record<string, { old: unknown; new: unknown }>;
  };
}

export interface UserLoggedInEvent extends DomainEvent {
  readonly eventType: 'USER_LOGGED_IN';
  readonly aggregateType: 'USER';
  readonly payload: {
    tenantId: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface UserLoggedOutEvent extends DomainEvent {
  readonly eventType: 'USER_LOGGED_OUT';
  readonly aggregateType: 'USER';
  readonly payload: {
    tenantId: string;
  };
}

export interface UserPasswordResetRequestedEvent extends DomainEvent {
  readonly eventType: 'USER_PASSWORD_RESET_REQUESTED';
  readonly aggregateType: 'USER';
  readonly payload: {
    email: string;
    ipAddress?: string;
  };
}

export interface UserPasswordChangedEvent extends DomainEvent {
  readonly eventType: 'USER_PASSWORD_CHANGED';
  readonly aggregateType: 'USER';
  readonly payload: {
    method: 'RESET' | 'CHANGE';
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Membership Events
// ─────────────────────────────────────────────────────────────────────────────

export interface MembershipCreatedEvent extends DomainEvent {
  readonly eventType: 'MEMBERSHIP_CREATED';
  readonly aggregateType: 'USER_TENANT_MEMBERSHIP';
  readonly payload: {
    userId: string;
    tenantId: string;
    role: string;
    createdBy: string;
  };
}

export interface MembershipRoleChangedEvent extends DomainEvent {
  readonly eventType: 'MEMBERSHIP_ROLE_CHANGED';
  readonly aggregateType: 'USER_TENANT_MEMBERSHIP';
  readonly payload: {
    userId: string;
    tenantId: string;
    oldRole: string;
    newRole: string;
    changedBy: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Union Type for All Events
// ─────────────────────────────────────────────────────────────────────────────

export type IdentityDomainEvent =
  | TenantCreatedEvent
  | TenantUpdatedEvent
  | TenantStatusChangedEvent
  | UserInvitedEvent
  | UserInviteAcceptedEvent
  | UserDeactivatedEvent
  | UserReactivatedEvent
  | UserProfileUpdatedEvent
  | UserLoggedInEvent
  | UserLoggedOutEvent
  | UserPasswordResetRequestedEvent
  | UserPasswordChangedEvent
  | MembershipCreatedEvent
  | MembershipRoleChangedEvent;

// ─────────────────────────────────────────────────────────────────────────────
// Event Factory Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function createDomainEvent<T extends IdentityDomainEvent>(
  params: Omit<T, 'occurredAt'>,
): T {
  return {
    ...params,
    occurredAt: new Date(),
  } as T;
}

