// business-engine/admin-config/domain/entities/user.entity.ts
import { TraceId } from '../value-objects/trace-id.vo';
import { Email } from '../value-objects/email.vo';
import { UserStatus } from '../value-objects/user-status.vo';

/**
 * User Entity (Aggregate Root)
 * 
 * GRCD Ref: §7.1 Core Entities - users
 * 
 * The User entity represents a global user identity in AI-BOS.
 * Users can belong to multiple tenants via memberships.
 */

export interface UserProps {
  id?: string;
  traceId: TraceId;
  email: Email;
  name: string;
  passwordHash?: string; // Internal only, never exposed
  avatarUrl?: string;
  locale: string;
  timezone: string;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Factory Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new invited User.
   * GRCD F-USER-1: Invite users via email
   */
  static createInvited(params: {
    email: string;
    name: string;
    locale?: string;
    timezone?: string;
  }): User {
    return new User({
      traceId: TraceId.generate(),
      email: Email.create(params.email),
      name: params.name,
      status: UserStatus.invited(),
      locale: params.locale ?? 'en',
      timezone: params.timezone ?? 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstitute a User from persistence.
   */
  static fromPersistence(params: {
    id: string;
    traceId: string;
    email: string;
    name: string;
    passwordHash?: string;
    avatarUrl?: string;
    locale: string;
    timezone: string;
    status: string;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: params.id,
      traceId: TraceId.create(params.traceId),
      email: Email.create(params.email),
      name: params.name,
      passwordHash: params.passwordHash,
      avatarUrl: params.avatarUrl,
      locale: params.locale,
      timezone: params.timezone,
      status: UserStatus.create(params.status),
      lastLoginAt: params.lastLoginAt,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────────────────────────────────

  get id(): string | undefined {
    return this.props.id;
  }

  get traceId(): TraceId {
    return this.props.traceId;
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get locale(): string {
    return this.props.locale;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  /**
   * Check if user has a password set (for validation, NOT exposed publicly).
   */
  hasPassword(): boolean {
    return !!this.props.passwordHash;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Business Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Accept invite and set password.
   * GRCD F-USER-2: Accept invite and set password
   */
  acceptInvite(passwordHash: string, name?: string): void {
    if (!this.props.status.isPendingInvite()) {
      throw new Error('User is not in invited status');
    }

    this.props.passwordHash = passwordHash;
    if (name) {
      this.props.name = name;
    }
    this.props.status = this.props.status.transitionTo(UserStatus.active());
    this.props.updatedAt = new Date();
  }

  /**
   * Update user profile.
   * GRCD F-USER-6: "My Profile" page
   */
  updateProfile(params: {
    name?: string;
    avatarUrl?: string;
    locale?: string;
    timezone?: string;
  }): void {
    if (params.name !== undefined) {
      this.props.name = params.name;
    }
    if (params.avatarUrl !== undefined) {
      this.props.avatarUrl = params.avatarUrl;
    }
    if (params.locale !== undefined) {
      this.props.locale = params.locale;
    }
    if (params.timezone !== undefined) {
      this.props.timezone = params.timezone;
    }
    this.props.updatedAt = new Date();
  }

  /**
   * Deactivate the user.
   * GRCD F-USER-3: Deactivate users
   */
  deactivate(): void {
    this.props.status = this.props.status.transitionTo(UserStatus.inactive());
    this.props.updatedAt = new Date();
  }

  /**
   * Reactivate the user.
   * GRCD F-USER-3: Reactivate users
   */
  reactivate(): void {
    this.props.status = this.props.status.transitionTo(UserStatus.active());
    this.props.updatedAt = new Date();
  }

  /**
   * Lock the user account (security measure).
   */
  lock(): void {
    this.props.status = this.props.status.transitionTo(UserStatus.locked());
    this.props.updatedAt = new Date();
  }

  /**
   * Record successful login.
   * GRCD F-USER-4: Login
   */
  recordLogin(): void {
    if (!this.props.status.canLogin()) {
      throw new Error(`User cannot login with status: ${this.props.status.toString()}`);
    }
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Change password.
   * GRCD F-USER-5: Reset password
   */
  changePassword(newPasswordHash: string): void {
    this.props.passwordHash = newPasswordHash;
    this.props.updatedAt = new Date();
  }

  /**
   * Check if user can log in.
   */
  canLogin(): boolean {
    return this.props.status.canLogin();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Serialization
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Convert to plain object for persistence.
   * NOTE: passwordHash is included for internal persistence only.
   */
  toPersistence(): Record<string, unknown> {
    return {
      id: this.props.id,
      traceId: this.props.traceId.toString(),
      email: this.props.email.toString(),
      name: this.props.name,
      passwordHash: this.props.passwordHash,
      avatarUrl: this.props.avatarUrl,
      locale: this.props.locale,
      timezone: this.props.timezone,
      status: this.props.status.toString(),
      lastLoginAt: this.props.lastLoginAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  /**
   * Convert to public DTO (no sensitive data).
   */
  toPublicDTO(): Record<string, unknown> {
    return {
      id: this.props.id,
      traceId: this.props.traceId.toString(),
      email: this.props.email.toString(),
      name: this.props.name,
      avatarUrl: this.props.avatarUrl,
      locale: this.props.locale,
      timezone: this.props.timezone,
      status: this.props.status.toString(),
      lastLoginAt: this.props.lastLoginAt?.toISOString(),
      createdAt: this.props.createdAt?.toISOString(),
      updatedAt: this.props.updatedAt?.toISOString(),
    };
  }
}

