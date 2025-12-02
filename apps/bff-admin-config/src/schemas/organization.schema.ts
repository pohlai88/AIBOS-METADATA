import { z } from "zod";

/**
 * Organization Schemas - Zod definitions for OpenAPI auto-generation
 */

// ============================================
// ENUMS
// ============================================

export const TenantStatusEnum = z.enum(["active", "suspended", "trial"]);

// ============================================
// REQUEST SCHEMAS
// ============================================

export const UpdateOrganizationRequestSchema = z.object({
  name: z.string().min(2).optional().describe("Organization name"),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional().describe("URL-safe identifier"),
  contactEmail: z.string().email().optional().describe("Contact email"),
  website: z.string().url().optional().describe("Website URL"),
  address: z.string().optional().describe("Physical address"),
  logoUrl: z.string().nullable().optional().describe("Logo URL"),
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const OrganizationResponseSchema = z.object({
  id: z.string().describe("Tenant UUID"),
  name: z.string().describe("Organization name"),
  slug: z.string().describe("URL-safe identifier"),
  contactEmail: z.string().email().nullable().describe("Contact email"),
  website: z.string().url().nullable().describe("Website"),
  address: z.string().nullable().describe("Address"),
  logoUrl: z.string().nullable().describe("Logo URL"),
  status: TenantStatusEnum.describe("Tenant status"),
  createdAt: z.string().datetime().describe("Created timestamp"),
  updatedAt: z.string().datetime().describe("Updated timestamp"),
  updatedBy: z.object({
    name: z.string(),
    email: z.string().email(),
  }).describe("Last updated by"),
});

export const UpdateOrganizationResponseSchema = z.object({
  message: z.string().describe("Success message"),
  updatedFields: z.array(z.string()).describe("Fields that were updated"),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type Organization = z.infer<typeof OrganizationResponseSchema>;
export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationRequestSchema>;

