// business-engine/admin-config/application/ports/outbound/audit.repository.port.ts
import type { AuditEvent } from '../../../domain/entities/audit-event.entity';
import type { AuditResourceType, AuditAction } from '../../../contracts/audit.contract';

/**
 * IAuditRepository - Outbound Port for Audit Event Persistence
 * 
 * This interface defines the contract for audit event data access.
 * GRCD Ref: §7.1 Core Entities - audit_events
 */
export interface IAuditRepository {
  /**
   * Save an audit event.
   * Audit events are immutable - only insert, never update.
   */
  save(event: AuditEvent): Promise<AuditEvent>;

  /**
   * Get the latest audit event for a trace ID.
   * Used to get prev_hash for hash chain.
   * GRCD F-TRACE-5: Hash chain for tamper-evident trail.
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

