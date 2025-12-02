// business-engine/admin-config/application/ports/outbound/membership.repository.port.ts
import type { Membership } from '../../../domain/entities/membership.entity';

/**
 * IMembershipRepository - Outbound Port for User-Tenant Membership Persistence
 * 
 * This interface defines the contract for membership data access.
 * GRCD Ref: §7.1 Core Entities - user_tenant_memberships
 */
export interface IMembershipRepository {
  /**
   * Find a membership by its unique ID.
   */
  findById(id: string): Promise<Membership | null>;

  /**
   * Find a membership by user and tenant.
   */
  findByUserAndTenant(userId: string, tenantId: string): Promise<Membership | null>;

  /**
   * Check if a user has a membership in a tenant.
   */
  exists(userId: string, tenantId: string): Promise<boolean>;

  /**
   * Save a membership (insert or update).
   * Returns the saved membership with generated ID.
   */
  save(membership: Membership): Promise<Membership>;

  /**
   * Delete a membership.
   */
  delete(id: string): Promise<void>;

  /**
   * Find all memberships for a user.
   */
  findByUserId(userId: string): Promise<Membership[]>;

  /**
   * Find all memberships for a tenant.
   */
  findByTenantId(
    tenantId: string,
    options?: {
      role?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<Membership[]>;

  /**
   * Count memberships for a tenant.
   */
  countByTenantId(tenantId: string, options?: { role?: string }): Promise<number>;

  /**
   * Find all users with a specific role in a tenant.
   */
  findByTenantAndRole(tenantId: string, role: string): Promise<Membership[]>;
}

