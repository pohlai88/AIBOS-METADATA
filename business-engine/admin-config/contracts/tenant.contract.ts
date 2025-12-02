// business-engine/admin-config/contracts/tenant.contract.ts
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS (Vocabulary Controlled)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tenant status lifecycle.
 * Vocabulary: active | suspended | trial | pending_setup
 */
export const TenantStatusEnum = z.enum([
  'active',
  'suspended',
  'trial',
  'pending_setup',
]);
export type TenantStatus = z.infer<typeof TenantStatusEnum>;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * IAM Tenant (Organization) Schema
 * 
 * Maps to: iam_tenant table
 * GRCD Ref: §1.1 Component Name: identity-org-admin
 */
export const IamTenantSchema = z.object({
  id: z.string().uuid().optional(),

  // Traceability UUID - immutable, for audit correlation
  // GRCD F-TRACE-1: Every tenant MUST have a stable trace_id
  traceId: z.string().uuid(),

  // Tenant identity
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),

  // Status & lifecycle
  status: TenantStatusEnum.default('pending_setup'),

  // Configuration
  timezone: z.string().default('UTC'),
  locale: z.string().default('en'),

  // Optional metadata
  logoUrl: z.string().url().optional(),
  domain: z.string().optional(), // Custom domain if any

  // Audit trail
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  createdBy: z.string().min(1).optional(),
  updatedBy: z.string().min(1).optional(),
});

export type IamTenant = z.infer<typeof IamTenantSchema>;

/**
 * Create Tenant Input Schema (subset for creation)
 */
export const CreateTenantInputSchema = IamTenantSchema.pick({
  name: true,
  slug: true,
  timezone: true,
  locale: true,
  logoUrl: true,
  domain: true,
}).extend({
  // traceId is auto-generated on create
});

export type CreateTenantInput = z.infer<typeof CreateTenantInputSchema>;

/**
 * Update Tenant Input Schema
 */
export const UpdateTenantInputSchema = IamTenantSchema.pick({
  name: true,
  timezone: true,
  locale: true,
  logoUrl: true,
  domain: true,
}).partial();

export type UpdateTenantInput = z.infer<typeof UpdateTenantInputSchema>;

