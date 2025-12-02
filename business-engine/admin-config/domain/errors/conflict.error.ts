// business-engine/admin-config/domain/errors/conflict.error.ts
import { DomainError } from './domain.error';

/**
 * ConflictError
 * 
 * Thrown when an operation conflicts with existing data.
 * Typically: duplicate email, duplicate slug, user already member, etc.
 * 
 * @example
 * throw new ConflictError('TenantSlug', slug, 'Slug already exists');
 * throw new ConflictError('Membership', `${userId}:${tenantId}`, 'User already member');
 */
export class ConflictError extends DomainError {
  constructor(
    entityType: string,
    identifier: string,
    reason: string,
    details?: Record<string, unknown>,
  ) {
    super(
      `Conflict for ${entityType} '${identifier}': ${reason}`,
      'CONFLICT',
      { entityType, identifier, reason, ...details },
    );
  }
}

