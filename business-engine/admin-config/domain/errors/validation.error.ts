// business-engine/admin-config/domain/errors/validation.error.ts
import { DomainError } from './domain.error';

/**
 * ValidationError
 * 
 * Thrown when a value object or entity receives invalid data.
 * This is the domain's "last line of defense" even if BFF validation passes.
 * 
 * @example
 * throw new ValidationError('TenantSlug', 'Must be 3-50 characters');
 * throw new ValidationError('Email', 'Invalid email format', { value: input });
 */
export class ValidationError extends DomainError {
  constructor(
    field: string,
    constraint: string,
    details?: Record<string, unknown>,
  ) {
    super(
      `Validation failed for '${field}': ${constraint}`,
      'VALIDATION_ERROR',
      { field, constraint, ...details },
    );
  }
}

