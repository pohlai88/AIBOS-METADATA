// business-engine/admin-config/application/ports/outbound/tenant.repository.port.ts
import type { Tenant } from '../../../domain/entities/tenant.entity';

/**
 * ITenantRepository - Outbound Port for Tenant Persistence
 * 
 * This interface defines the contract for tenant data access.
 * The domain/application layer depends on this interface, not the implementation.
 * 
 * Following Hexagonal Architecture:
 * - Domain depends on this port (interface)
 * - Infrastructure implements this port (adapter)
 */
export interface ITenantRepository {
  /**
   * Find a tenant by its unique ID.
   */
  findById(id: string): Promise<Tenant | null>;

  /**
   * Find a tenant by its slug.
   */
  findBySlug(slug: string): Promise<Tenant | null>;

  /**
   * Find a tenant by its trace ID.
   * GRCD F-TRACE-1: Support lookup by trace_id for audit correlation.
   */
  findByTraceId(traceId: string): Promise<Tenant | null>;

  /**
   * Check if a slug is already taken.
   */
  existsBySlug(slug: string): Promise<boolean>;

  /**
   * Save a tenant (insert or update).
   * Returns the saved tenant with generated ID.
   */
  save(tenant: Tenant): Promise<Tenant>;

  /**
   * List all tenants with optional filtering.
   */
  findAll(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Tenant[]>;

  /**
   * Count tenants with optional filtering.
   */
  count(options?: { status?: string }): Promise<number>;
}

