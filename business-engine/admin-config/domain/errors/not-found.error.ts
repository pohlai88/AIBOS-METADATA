// business-engine/admin-config/domain/errors/not-found.error.ts
import { DomainError } from './domain.error';

/**
 * NotFoundError
 * 
 * Thrown when a requested entity does not exist.
 * 
 * @example
 * throw new NotFoundError('User', userId);
 * throw new NotFoundError('Tenant', tenantSlug, { searchField: 'slug' });
 */
export class NotFoundError extends DomainError {
  constructor(
    entityType: string,
    identifier: string,
    details?: Record<string, unknown>,
  ) {
    super(
      `${entityType} not found: ${identifier}`,
      'NOT_FOUND',
      { entityType, identifier, ...details },
    );
  }
}

