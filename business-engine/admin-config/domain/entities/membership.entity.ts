// business-engine/admin-config/domain/entities/membership.entity.ts
import { TenantRole } from '../value-objects/tenant-role.vo';

/**
 * UserTenantMembership Entity
 * 
 * GRCD Ref: §7.1 Core Entities - user_tenant_memberships
 * 
 * Represents the many-to-many relationship between users and tenants,
 * with role assignment per tenant.
 */

export interface MembershipProps {
  id?: string;
  userId: string;
  tenantId: string;
  role: TenantRole;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export class Membership {
  private props: MembershipProps;

  private constructor(props: MembershipProps) {
    this.props = props;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Factory Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new membership.
   */
  static create(params: {
    userId: string;
    tenantId: string;
    role: string;
    createdBy: string;
  }): Membership {
    return new Membership({
      userId: params.userId,
      tenantId: params.tenantId,
      role: TenantRole.create(params.role),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: params.createdBy,
      updatedBy: params.createdBy,
    });
  }

  /**
   * Helper to create a TenantRole from string (for use case permission checks)
   */
  static createRole(role: string): TenantRole {
    return TenantRole.create(role);
  }

  /**
   * Reconstitute a Membership from persistence.
   */
  static fromPersistence(params: {
    id: string;
    userId: string;
    tenantId: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  }): Membership {
    return new Membership({
      id: params.id,
      userId: params.userId,
      tenantId: params.tenantId,
      role: TenantRole.create(params.role),
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
      createdBy: params.createdBy,
      updatedBy: params.updatedBy,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────────────────────────────────

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get role(): TenantRole {
    return this.props.role;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get createdBy(): string | undefined {
    return this.props.createdBy;
  }

  get updatedBy(): string | undefined {
    return this.props.updatedBy;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Business Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Change the user's role in this tenant.
   * GRCD F-ROLE-2: Allow platform_admin and org_admin to assign roles
   * 
   * @param newRole The new role to assign
   * @param actorRole The role of the user making the change (for authorization)
   * @param updatedBy The user ID making the change
   */
  changeRole(newRole: string, actorRole: TenantRole, updatedBy: string): void {
    const targetRole = TenantRole.create(newRole);

    // Validate that the actor can assign this role
    if (!actorRole.canAssignRole(targetRole)) {
      throw new Error(
        `Role ${actorRole.toString()} cannot assign role ${targetRole.toString()}`,
      );
    }

    // Prevent self-demotion for platform_admin (safety)
    if (
      this.props.role.toString() === 'platform_admin' &&
      targetRole.toString() !== 'platform_admin'
    ) {
      // This should be handled at the use-case level with additional checks
    }

    this.props.role = targetRole;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  /**
   * Check if user can manage other users in this membership context.
   */
  canManageUsers(): boolean {
    return this.props.role.canManageUsers();
  }

  /**
   * Check if user has at least the specified role level.
   */
  hasAtLeastRole(role: TenantRole): boolean {
    return this.props.role.isAtLeast(role);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Serialization
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Convert to plain object for persistence.
   */
  toPersistence(): Record<string, unknown> {
    return {
      id: this.props.id,
      userId: this.props.userId,
      tenantId: this.props.tenantId,
      role: this.props.role.toString(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      createdBy: this.props.createdBy,
      updatedBy: this.props.updatedBy,
    };
  }
}

