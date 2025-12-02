// business-engine/admin-config/application/ports/outbound/user.repository.port.ts
import type { User } from '../../../domain/entities/user.entity';

/**
 * IUserRepository - Outbound Port for User Persistence
 * 
 * This interface defines the contract for user data access.
 * GRCD Ref: §7.1 Core Entities - users
 */
export interface IUserRepository {
  /**
   * Find a user by their unique ID.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by their email address.
   * Email is globally unique across all tenants.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by their trace ID.
   * GRCD F-TRACE-1: Support lookup by trace_id for audit correlation.
   */
  findByTraceId(traceId: string): Promise<User | null>;

  /**
   * Check if an email is already registered.
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Save a user (insert or update).
   * Returns the saved user with generated ID.
   */
  save(user: User): Promise<User>;

  /**
   * Find users by tenant (via memberships).
   * Returns users who have a membership in the specified tenant.
   */
  findByTenantId(
    tenantId: string,
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<User[]>;

  /**
   * Count users by tenant.
   */
  countByTenantId(tenantId: string, options?: { status?: string }): Promise<number>;

  /**
   * Find users by status (global).
   */
  findByStatus(
    status: string,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<User[]>;

  /**
   * Get password hash for a user (internal use only).
   * This is separated from User entity to ensure password is never accidentally exposed.
   */
  getPasswordHash(userId: string): Promise<string | null>;

  /**
   * Update password hash for a user.
   */
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
}

