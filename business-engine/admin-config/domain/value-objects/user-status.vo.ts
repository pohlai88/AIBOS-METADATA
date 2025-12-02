// business-engine/admin-config/domain/value-objects/user-status.vo.ts

/**
 * UserStatus Value Object
 * 
 * GRCD F-USER-3: System MUST support deactivating/reactivating users
 * 
 * Status Lifecycle:
 * - invited: User has been invited but hasn't accepted yet
 * - active: User has accepted invite and is active
 * - inactive: User has been deactivated (can be reactivated)
 * - locked: User account is locked (security measure)
 */

export const USER_STATUSES = [
  'invited',
  'active',
  'inactive',
  'locked',
] as const;

export type UserStatusValue = (typeof USER_STATUSES)[number];

/**
 * Valid status transitions
 */
const VALID_TRANSITIONS: Record<UserStatusValue, UserStatusValue[]> = {
  invited: ['active'], // Accept invite
  active: ['inactive', 'locked'], // Deactivate or lock
  inactive: ['active'], // Reactivate
  locked: ['active', 'inactive'], // Unlock to active or inactive
};

export class UserStatus {
  private readonly value: UserStatusValue;

  private constructor(value: UserStatusValue) {
    this.value = value;
  }

  /**
   * Create a UserStatus from a string value.
   */
  static create(value: string): UserStatus {
    if (!UserStatus.isValid(value)) {
      throw new Error(
        `Invalid user status: ${value}. Valid statuses: ${USER_STATUSES.join(', ')}`,
      );
    }
    return new UserStatus(value as UserStatusValue);
  }

  /**
   * Create invited status (default for new users).
   */
  static invited(): UserStatus {
    return new UserStatus('invited');
  }

  /**
   * Create active status.
   */
  static active(): UserStatus {
    return new UserStatus('active');
  }

  /**
   * Create inactive status.
   */
  static inactive(): UserStatus {
    return new UserStatus('inactive');
  }

  /**
   * Create locked status.
   */
  static locked(): UserStatus {
    return new UserStatus('locked');
  }

  /**
   * Validate if a string is a valid status.
   */
  static isValid(value: string): value is UserStatusValue {
    return USER_STATUSES.includes(value as UserStatusValue);
  }

  /**
   * Get the string value.
   */
  toString(): UserStatusValue {
    return this.value;
  }

  /**
   * Check if user can log in with this status.
   */
  canLogin(): boolean {
    return this.value === 'active';
  }

  /**
   * Check if user is in pending invite state.
   */
  isPendingInvite(): boolean {
    return this.value === 'invited';
  }

  /**
   * Check if transition to target status is valid.
   */
  canTransitionTo(target: UserStatus): boolean {
    return VALID_TRANSITIONS[this.value].includes(target.value);
  }

  /**
   * Attempt to transition to a new status.
   * Throws if transition is invalid.
   */
  transitionTo(target: UserStatus): UserStatus {
    if (!this.canTransitionTo(target)) {
      throw new Error(
        `Invalid status transition: ${this.value} → ${target.value}. ` +
          `Valid transitions from ${this.value}: ${VALID_TRANSITIONS[this.value].join(', ')}`,
      );
    }
    return target;
  }

  /**
   * Check equality with another UserStatus.
   */
  equals(other: UserStatus): boolean {
    return this.value === other.value;
  }

  /**
   * Get raw value for serialization.
   */
  toJSON(): UserStatusValue {
    return this.value;
  }
}

