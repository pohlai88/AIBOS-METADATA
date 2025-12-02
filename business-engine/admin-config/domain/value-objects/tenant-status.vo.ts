// business-engine/admin-config/domain/value-objects/tenant-status.vo.ts

/**
 * TenantStatus Value Object
 * 
 * GRCD Ref: §7.1 tenants.status
 * 
 * Status Lifecycle:
 * - pending_setup: Tenant created but not fully configured
 * - trial: Tenant is in trial period
 * - active: Tenant is fully active
 * - suspended: Tenant is suspended (e.g., payment issues, violations)
 */

export const TENANT_STATUSES = [
  'pending_setup',
  'trial',
  'active',
  'suspended',
] as const;

export type TenantStatusValue = (typeof TENANT_STATUSES)[number];

/**
 * Valid status transitions
 */
const VALID_TRANSITIONS: Record<TenantStatusValue, TenantStatusValue[]> = {
  pending_setup: ['trial', 'active'], // Complete setup
  trial: ['active', 'suspended'], // Convert or suspend
  active: ['suspended'], // Suspend active tenant
  suspended: ['active'], // Reinstate suspended tenant
};

export class TenantStatus {
  private readonly value: TenantStatusValue;

  private constructor(value: TenantStatusValue) {
    this.value = value;
  }

  /**
   * Create a TenantStatus from a string value.
   */
  static create(value: string): TenantStatus {
    if (!TenantStatus.isValid(value)) {
      throw new Error(
        `Invalid tenant status: ${value}. Valid statuses: ${TENANT_STATUSES.join(', ')}`,
      );
    }
    return new TenantStatus(value as TenantStatusValue);
  }

  /**
   * Create pending_setup status (default for new tenants).
   */
  static pendingSetup(): TenantStatus {
    return new TenantStatus('pending_setup');
  }

  /**
   * Create trial status.
   */
  static trial(): TenantStatus {
    return new TenantStatus('trial');
  }

  /**
   * Create active status.
   */
  static active(): TenantStatus {
    return new TenantStatus('active');
  }

  /**
   * Create suspended status.
   */
  static suspended(): TenantStatus {
    return new TenantStatus('suspended');
  }

  /**
   * Validate if a string is a valid status.
   */
  static isValid(value: string): value is TenantStatusValue {
    return TENANT_STATUSES.includes(value as TenantStatusValue);
  }

  /**
   * Get the string value.
   */
  toString(): TenantStatusValue {
    return this.value;
  }

  /**
   * Check if tenant is accessible (users can log in).
   */
  isAccessible(): boolean {
    return this.value === 'active' || this.value === 'trial';
  }

  /**
   * Check if tenant is in initial setup phase.
   */
  isPendingSetup(): boolean {
    return this.value === 'pending_setup';
  }

  /**
   * Check if tenant is suspended.
   */
  isSuspended(): boolean {
    return this.value === 'suspended';
  }

  /**
   * Check if transition to target status is valid.
   */
  canTransitionTo(target: TenantStatus): boolean {
    return VALID_TRANSITIONS[this.value].includes(target.value);
  }

  /**
   * Attempt to transition to a new status.
   * Throws if transition is invalid.
   */
  transitionTo(target: TenantStatus): TenantStatus {
    if (!this.canTransitionTo(target)) {
      throw new Error(
        `Invalid status transition: ${this.value} → ${target.value}. ` +
          `Valid transitions from ${this.value}: ${VALID_TRANSITIONS[this.value].join(', ')}`,
      );
    }
    return target;
  }

  /**
   * Check equality with another TenantStatus.
   */
  equals(other: TenantStatus): boolean {
    return this.value === other.value;
  }

  /**
   * Get raw value for serialization.
   */
  toJSON(): TenantStatusValue {
    return this.value;
  }
}

