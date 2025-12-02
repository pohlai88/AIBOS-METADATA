// business-engine/admin-config/domain/errors/invariant.error.ts
import { DomainError } from './domain.error';

/**
 * InvariantViolationError
 * 
 * Thrown when a business rule / domain invariant is violated.
 * Different from ValidationError (input) - this is about state transitions.
 * 
 * @example
 * throw new InvariantViolationError('User', 'Cannot login with status: inactive');
 * throw new InvariantViolationError('Tenant', 'Cannot transition from pending to suspended');
 */
export class InvariantViolationError extends DomainError {
  constructor(
    entityType: string,
    violation: string,
    details?: Record<string, unknown>,
  ) {
    super(
      `Invariant violation in ${entityType}: ${violation}`,
      'INVARIANT_VIOLATION',
      { entityType, violation, ...details },
    );
  }
}

