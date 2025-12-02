// business-engine/admin-config/domain/errors/concurrency.error.ts
import { DomainError } from './domain.error';

/**
 * AuditConcurrencyError
 * 
 * Thrown when optimistic locking fails on the audit chain.
 * This means two concurrent operations tried to append to the same chain.
 * 
 * The BFF should catch this and either:
 * - Retry the operation, or
 * - Return 409 Conflict to the client
 * 
 * @example
 * throw new AuditConcurrencyError(traceId, attemptedPrevHash);
 */
export class AuditConcurrencyError extends DomainError {
  constructor(
    traceId: string,
    attemptedPrevHash: string | null,
  ) {
    super(
      `Audit chain fork detected for TraceID: ${traceId}. ` +
      `The prevHash '${attemptedPrevHash}' is no longer the head of the chain.`,
      'CONCURRENCY',
      { traceId, attemptedPrevHash },
    );
  }
}

