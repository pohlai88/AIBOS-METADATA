// business-engine/admin-config/domain/value-objects/tenant-role.vo.ts

/**
 * TenantRole Value Object
 * 
 * GRCD F-ROLE-1: System MUST define roles:
 * - platform_admin: Super admin with cross-tenant access
 * - org_admin: Tenant administrator
 * - member: Standard user with write access
 * - viewer: Read-only user
 * 
 * Role Hierarchy (highest to lowest):
 * platform_admin > org_admin > member > viewer
 */

export const TENANT_ROLES = [
  'platform_admin',
  'org_admin',
  'member',
  'viewer',
] as const;

export type TenantRoleValue = (typeof TENANT_ROLES)[number];

/**
 * Role hierarchy levels (higher = more permissions)
 */
const ROLE_HIERARCHY: Record<TenantRoleValue, number> = {
  platform_admin: 100,
  org_admin: 75,
  member: 50,
  viewer: 25,
};

export class TenantRole {
  private readonly value: TenantRoleValue;

  private constructor(value: TenantRoleValue) {
    this.value = value;
  }

  /**
   * Create a TenantRole from a string value.
   */
  static create(value: string): TenantRole {
    if (!TenantRole.isValid(value)) {
      throw new Error(
        `Invalid tenant role: ${value}. Valid roles: ${TENANT_ROLES.join(', ')}`,
      );
    }
    return new TenantRole(value as TenantRoleValue);
  }

  /**
   * Create platform_admin role.
   */
  static platformAdmin(): TenantRole {
    return new TenantRole('platform_admin');
  }

  /**
   * Create org_admin role.
   */
  static orgAdmin(): TenantRole {
    return new TenantRole('org_admin');
  }

  /**
   * Create member role.
   */
  static member(): TenantRole {
    return new TenantRole('member');
  }

  /**
   * Create viewer role.
   */
  static viewer(): TenantRole {
    return new TenantRole('viewer');
  }

  /**
   * Validate if a string is a valid role.
   */
  static isValid(value: string): value is TenantRoleValue {
    return TENANT_ROLES.includes(value as TenantRoleValue);
  }

  /**
   * Get the string value.
   */
  toString(): TenantRoleValue {
    return this.value;
  }

  /**
   * Check if this role is at least as privileged as another.
   * GRCD F-ROLE-2: platform_admin and org_admin can assign roles
   */
  isAtLeast(other: TenantRole): boolean {
    return ROLE_HIERARCHY[this.value] >= ROLE_HIERARCHY[other.value];
  }

  /**
   * Check if this role is more privileged than another.
   */
  isHigherThan(other: TenantRole): boolean {
    return ROLE_HIERARCHY[this.value] > ROLE_HIERARCHY[other.value];
  }

  /**
   * Check if this role can manage users (invite, assign roles).
   * Only platform_admin and org_admin can manage users.
   */
  canManageUsers(): boolean {
    return this.value === 'platform_admin' || this.value === 'org_admin';
  }

  /**
   * Check if this role can assign a specific role.
   * Platform admin can assign any role.
   * Org admin can assign org_admin, member, viewer.
   */
  canAssignRole(targetRole: TenantRole): boolean {
    if (this.value === 'platform_admin') {
      return true;
    }
    if (this.value === 'org_admin') {
      return targetRole.value !== 'platform_admin';
    }
    return false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Permission Methods (v1.1 - Used by Use Cases)
  // Policy codes (F-PERM-*) allow kernel/telemetry to classify failures.
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * F-PERM-INVITE-1: Can this role invite users to the tenant?
   * Requires: platform_admin or org_admin
   */
  canInviteUser(): boolean {
    return this.value === 'platform_admin' || this.value === 'org_admin';
  }

  /**
   * F-PERM-DEACTIVATE-1: Can this role deactivate/reactivate users?
   * Requires: platform_admin or org_admin
   */
  canDeactivateUser(): boolean {
    return this.value === 'platform_admin' || this.value === 'org_admin';
  }

  /**
   * F-PERM-TENANT-1: Can this role update tenant profile?
   * Requires: platform_admin or org_admin
   */
  canUpdateTenantProfile(): boolean {
    return this.value === 'platform_admin' || this.value === 'org_admin';
  }

  /**
   * F-PERM-TENANT-2: Can this role create new tenants?
   * Requires: platform_admin only
   */
  canCreateTenant(): boolean {
    return this.value === 'platform_admin';
  }

  /**
   * F-PERM-AUDIT-1: Can this role view audit logs?
   * Requires: platform_admin or org_admin
   */
  canViewAuditLog(): boolean {
    return this.value === 'platform_admin' || this.value === 'org_admin';
  }

  /**
   * F-PERM-USER-1: Can this role update other users' profiles?
   * Requires: platform_admin or org_admin
   */
  canUpdateOtherUsers(): boolean {
    return this.value === 'platform_admin' || this.value === 'org_admin';
  }

  /**
   * F-PERM-ROLE-1: Can this role change user roles?
   * Requires: platform_admin or org_admin
   */
  canChangeUserRole(): boolean {
    return this.value === 'platform_admin' || this.value === 'org_admin';
  }

  /**
   * Get the policy code prefix for this role's permissions
   */
  getPolicyPrefix(): string {
    return `ROLE_${this.value.toUpperCase()}`;
  }

  /**
   * Check equality with another TenantRole.
   */
  equals(other: TenantRole): boolean {
    return this.value === other.value;
  }

  /**
   * Get raw value for serialization.
   */
  toJSON(): TenantRoleValue {
    return this.value;
  }
}

