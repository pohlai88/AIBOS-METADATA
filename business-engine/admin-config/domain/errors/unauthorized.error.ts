// business-engine/admin-config/domain/errors/unauthorized.error.ts
import { DomainError } from './domain.error';

/**
 * UnauthorizedError
 * 
 * Thrown when an actor lacks permission to perform an action.
 * Permission checks happen INSIDE the use case, not just in BFF.
 * 
 * @example
 * throw new UnauthorizedError('INVITE_USER', 'Actor role cannot invite users');
 * throw new UnauthorizedError('UPDATE_TENANT', 'Only owners can update tenant', {
 *   actorRole: 'member',
 *   requiredRole: 'owner',
 *   policyCode: 'F-PERM-TENANT-1'
 * });
 */
export class UnauthorizedError extends DomainError {
  constructor(
    action: string,
    reason: string,
    details?: Record<string, unknown>,
  ) {
    super(
      `Permission denied for action '${action}': ${reason}`,
      'UNAUTHORIZED',
      { action, reason, ...details },
    );
  }
}

