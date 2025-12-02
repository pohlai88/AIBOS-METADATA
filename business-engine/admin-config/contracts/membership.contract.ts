// business-engine/admin-config/contracts/membership.contract.ts
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS (Vocabulary Controlled)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * User roles within a tenant.
 * Vocabulary: platform_admin | org_admin | member | viewer
 * GRCD Ref: F-ROLE-1
 * 
 * Role hierarchy:
 * - platform_admin: Super admin (cross-tenant access)
 * - org_admin: Tenant administrator
 * - member: Standard user with write access
 * - viewer: Read-only user
 */
export const TenantRoleEnum = z.enum([
  'platform_admin',
  'org_admin',
  'member',
  'viewer',
]);
export type TenantRole = z.infer<typeof TenantRoleEnum>;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * IAM User-Tenant Membership Schema
 * 
 * Maps to: iam_user_tenant_membership table
 * GRCD Ref: §7.1 Core Entities - user_tenant_memberships
 * 
 * Represents the many-to-many relationship between users and tenants,
 * with role assignment per tenant.
 */
export const IamMembershipSchema = z.object({
  id: z.string().uuid().optional(),

  // Foreign keys
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Role within this tenant
  // GRCD F-ROLE-1: platform_admin, org_admin, member, viewer
  role: TenantRoleEnum,

  // Audit trail
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  createdBy: z.string().min(1).optional(),
  updatedBy: z.string().min(1).optional(),
});

export type IamMembership = z.infer<typeof IamMembershipSchema>;

/**
 * Assign Role Input Schema
 * GRCD F-ROLE-2: Allow platform_admin and org_admin to assign roles
 */
export const AssignRoleInputSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  role: TenantRoleEnum,
});

export type AssignRoleInput = z.infer<typeof AssignRoleInputSchema>;

/**
 * Change Role Input Schema (for existing membership)
 */
export const ChangeRoleInputSchema = z.object({
  membershipId: z.string().uuid(),
  newRole: TenantRoleEnum,
});

export type ChangeRoleInput = z.infer<typeof ChangeRoleInputSchema>;

