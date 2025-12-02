// business-engine/admin-config/domain/entities/audit-event.entity.ts
import { TraceId } from '../value-objects/trace-id.vo';
import type {
  AuditResourceType,
  AuditAction,
} from '../../contracts/audit.contract';

/**
 * AuditEvent Entity
 * 
 * GRCD Ref: §7.1 Core Entities - audit_events
 * 
 * Immutable audit event for SAP/Oracle-style document traceability.
 * Once created, audit events cannot be modified.
 */

export interface AuditEventProps {
  auditId?: string;
  traceId: TraceId;
  resourceType: AuditResourceType;
  resourceId: string;
  action: AuditAction;
  actorUserId: string | null;
  locationRef?: string;
  metadataDiff?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  prevHash: string | null;
  hash: string;
}

export class AuditEvent {
  private readonly props: AuditEventProps;

  private constructor(props: AuditEventProps) {
    // Freeze to ensure immutability
    this.props = Object.freeze(props);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Factory Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new AuditEvent.
   * GRCD F-TRACE-2: Every lifecycle action MUST generate an audit event.
   */
  static create(params: {
    traceId: string;
    resourceType: AuditResourceType;
    resourceId: string;
    action: AuditAction;
    actorUserId: string | null;
    locationRef?: string;
    metadataDiff?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    prevHash: string | null;
  }): AuditEvent {
    const createdAt = new Date();

    // Generate hash for this event
    // GRCD F-TRACE-5: Hash chain for tamper-evident trail
    const hash = AuditEvent.computeHash({
      traceId: params.traceId,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      action: params.action,
      actorUserId: params.actorUserId,
      createdAt: createdAt.toISOString(),
      prevHash: params.prevHash,
    });

    return new AuditEvent({
      traceId: TraceId.create(params.traceId),
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      action: params.action,
      actorUserId: params.actorUserId,
      locationRef: params.locationRef,
      metadataDiff: params.metadataDiff,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      createdAt,
      prevHash: params.prevHash,
      hash,
    });
  }

  /**
   * Reconstitute an AuditEvent from persistence.
   */
  static fromPersistence(params: {
    auditId: string;
    traceId: string;
    resourceType: AuditResourceType;
    resourceId: string;
    action: AuditAction;
    actorUserId: string | null;
    locationRef?: string;
    metadataDiff?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    prevHash: string | null;
    hash: string;
  }): AuditEvent {
    return new AuditEvent({
      auditId: params.auditId,
      traceId: TraceId.create(params.traceId),
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      action: params.action,
      actorUserId: params.actorUserId,
      locationRef: params.locationRef,
      metadataDiff: params.metadataDiff,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      createdAt: params.createdAt,
      prevHash: params.prevHash,
      hash: params.hash,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Hash Computation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Compute hash for audit event.
   * GRCD F-TRACE-5: hash = hash(trace_id + data + prev_hash)
   * 
   * Note: In production, use a proper crypto library (e.g., Web Crypto API).
   * This is a simplified implementation for illustration.
   */
  private static computeHash(data: {
    traceId: string;
    resourceType: string;
    resourceId: string;
    action: string;
    actorUserId: string | null;
    createdAt: string;
    prevHash: string | null;
  }): string {
    const payload = JSON.stringify(data);
    // Simple hash for demo - in production use crypto.subtle.digest('SHA-256', ...)
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `sha256:${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  /**
   * Verify the hash chain integrity.
   * GRCD F-TRACE-5: Verify hash chain is valid.
   */
  verifyHash(): boolean {
    const expectedHash = AuditEvent.computeHash({
      traceId: this.props.traceId.toString(),
      resourceType: this.props.resourceType,
      resourceId: this.props.resourceId,
      action: this.props.action,
      actorUserId: this.props.actorUserId,
      createdAt: this.props.createdAt.toISOString(),
      prevHash: this.props.prevHash,
    });
    return this.props.hash === expectedHash;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters (Immutable - no setters)
  // ─────────────────────────────────────────────────────────────────────────

  get auditId(): string | undefined {
    return this.props.auditId;
  }

  get traceId(): TraceId {
    return this.props.traceId;
  }

  get resourceType(): AuditResourceType {
    return this.props.resourceType;
  }

  get resourceId(): string {
    return this.props.resourceId;
  }

  get action(): AuditAction {
    return this.props.action;
  }

  get actorUserId(): string | null {
    return this.props.actorUserId;
  }

  get locationRef(): string | undefined {
    return this.props.locationRef;
  }

  get metadataDiff(): Record<string, unknown> | undefined {
    return this.props.metadataDiff;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get prevHash(): string | null {
    return this.props.prevHash;
  }

  get hash(): string {
    return this.props.hash;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Serialization
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Convert to plain object for persistence.
   */
  toPersistence(): Record<string, unknown> {
    return {
      auditId: this.props.auditId,
      traceId: this.props.traceId.toString(),
      resourceType: this.props.resourceType,
      resourceId: this.props.resourceId,
      action: this.props.action,
      actorUserId: this.props.actorUserId,
      locationRef: this.props.locationRef,
      metadataDiff: this.props.metadataDiff,
      ipAddress: this.props.ipAddress,
      userAgent: this.props.userAgent,
      createdAt: this.props.createdAt,
      prevHash: this.props.prevHash,
      hash: this.props.hash,
    };
  }

  /**
   * Convert to JSON (for API responses).
   */
  toJSON(): Record<string, unknown> {
    return {
      auditId: this.props.auditId,
      traceId: this.props.traceId.toString(),
      resourceType: this.props.resourceType,
      resourceId: this.props.resourceId,
      action: this.props.action,
      actorUserId: this.props.actorUserId,
      locationRef: this.props.locationRef,
      metadataDiff: this.props.metadataDiff,
      // Note: ipAddress and userAgent may be privacy-sensitive
      createdAt: this.props.createdAt.toISOString(),
      prevHash: this.props.prevHash,
      hash: this.props.hash,
    };
  }
}

