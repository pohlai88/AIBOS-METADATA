// business-engine/admin-config/application/ports/outbound/audit.repository.port.ts
import type { AuditEvent } from '../../../domain/entities/audit-event.entity';
import type { AuditResourceType, AuditAction } from '../../../contracts/audit.contract';

/**
 * IAuditRepository - Outbound Port for Audit Event Persistence
 * 
 * This interface defines the contract for audit event data access.
 * GRCD Ref: §7.1 Core Entities - audit_events
 * 
 * IMPORTANT (v1.1): Optimistic Locking on Hash Chain
 * The appendEvent method MUST enforce hash chain integrity.
 * If event.prevHash does not match the latest hash in DB, throw AuditConcurrencyError.
 */
export interface IAuditRepository {
  /**
   * Append an audit event to the hash chain.
   * 
   * OPTIMISTIC LOCKING CONTRACT (v1.1):
   * - Get latest event for traceId in the same transaction
   * - Verify event.prevHash === latest?.hash (or null if first)
   * - Insert with incremented sequence number
   * - On conflict (another write raced ahead), throw AuditConcurrencyError
   * 
   * @param event The audit event to append
   * @throws AuditConcurrencyError if prevHash doesn't match DB's latest
   * @returns The persisted event with generated ID
   * 
   * @example Implementation (SQL)
   * ```sql
   * -- Insert only if our prevHash is still the latest
   * INSERT INTO audit_events (trace_id, sequence, prev_hash, hash, ...)
   * SELECT $1, COALESCE(MAX(sequence), 0) + 1, $2, $3, ...
   * FROM audit_events
   * WHERE trace_id = $1
   * HAVING MAX(hash) = $2 OR (COUNT(*) = 0 AND $2 IS NULL);
   * 
   * -- If rowCount === 0, another write raced ahead → throw AuditConcurrencyError
   * ```
   */
  appendEvent(event: AuditEvent): Promise<AuditEvent>;

  /**
   * @deprecated Use appendEvent() for new code. Kept for backward compatibility.
   * Save an audit event without optimistic locking.
   */
  save(event: AuditEvent): Promise<AuditEvent>;

  /**
   * Get the latest audit event for a trace ID.
   * Used to get prev_hash for hash chain.
   * GRCD F-TRACE-5: Hash chain for tamper-evident trail.
   * 
   * NOTE (v1.1): For concurrency safety, call this INSIDE the same transaction
   * as appendEvent to ensure "read your own writes" consistency.
   */
  getLatestByTraceId(traceId: string): Promise<AuditEvent | null>;

  /**
   * Get full audit timeline for a trace ID.
   * GRCD F-TRACE-6: Reconstruct full lifecycle from audit events.
   */
  getTimelineByTraceId(
    traceId: string,
    options?: {
      fromDate?: Date;
      toDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<AuditEvent[]>;

  /**
   * Get audit events by resource.
   */
  findByResource(
    resourceType: AuditResourceType,
    resourceId: string,
    options?: {
      fromDate?: Date;
      toDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<AuditEvent[]>;

  /**
   * Get audit events by actor.
   */
  findByActor(
    actorUserId: string,
    options?: {
      fromDate?: Date;
      toDate?: Date;
      actions?: AuditAction[];
      limit?: number;
      offset?: number;
    },
  ): Promise<AuditEvent[]>;

  /**
   * Get audit events by action type.
   */
  findByAction(
    action: AuditAction,
    options?: {
      fromDate?: Date;
      toDate?: Date;
      resourceType?: AuditResourceType;
      limit?: number;
      offset?: number;
    },
  ): Promise<AuditEvent[]>;

  /**
   * Verify hash chain integrity for a trace ID.
   * Returns true if all hashes are valid, false if tampered.
   * GRCD F-TRACE-5: Verify hash chain.
   */
  verifyHashChain(traceId: string): Promise<{
    isValid: boolean;
    brokenAt?: string; // auditId where chain broke
  }>;
}
