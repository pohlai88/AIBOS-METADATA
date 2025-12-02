// business-engine/admin-config/domain/entities/tenant.entity.ts
import { TraceId } from '../value-objects/trace-id.vo';
import { TenantStatus } from '../value-objects/tenant-status.vo';

/**
 * Tenant Entity (Aggregate Root)
 * 
 * GRCD Ref: §7.1 Core Entities - tenants
 * 
 * The Tenant entity represents an organization/tenant in the multi-tenant
 * AI-BOS platform. It is the aggregate root for tenant-related operations.
 */

export interface TenantProps {
  id?: string;
  traceId: TraceId;
  name: string;
  slug: string;
  status: TenantStatus;
  timezone: string;
  locale: string;
  logoUrl?: string;
  domain?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export class Tenant {
  private props: TenantProps;

  private constructor(props: TenantProps) {
    this.props = props;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Factory Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new Tenant (for initial creation).
   * Generates a new traceId automatically.
   */
  static create(params: {
    name: string;
    slug: string;
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    domain?: string;
    createdBy: string;
  }): Tenant {
    return new Tenant({
      traceId: TraceId.generate(),
      name: params.name,
      slug: params.slug,
      status: TenantStatus.pendingSetup(),
      timezone: params.timezone ?? 'UTC',
      locale: params.locale ?? 'en',
      logoUrl: params.logoUrl,
      domain: params.domain,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: params.createdBy,
      updatedBy: params.createdBy,
    });
  }

  /**
   * Reconstitute a Tenant from persistence.
   */
  static fromPersistence(params: {
    id: string;
    traceId: string;
    name: string;
    slug: string;
    status: string;
    timezone: string;
    locale: string;
    logoUrl?: string;
    domain?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  }): Tenant {
    return new Tenant({
      id: params.id,
      traceId: TraceId.create(params.traceId),
      name: params.name,
      slug: params.slug,
      status: TenantStatus.create(params.status),
      timezone: params.timezone,
      locale: params.locale,
      logoUrl: params.logoUrl,
      domain: params.domain,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
      createdBy: params.createdBy,
      updatedBy: params.updatedBy,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────────────────────────────────

  get id(): string | undefined {
    return this.props.id;
  }

  get traceId(): TraceId {
    return this.props.traceId;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get status(): TenantStatus {
    return this.props.status;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  get locale(): string {
    return this.props.locale;
  }

  get logoUrl(): string | undefined {
    return this.props.logoUrl;
  }

  get domain(): string | undefined {
    return this.props.domain;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get createdBy(): string | undefined {
    return this.props.createdBy;
  }

  get updatedBy(): string | undefined {
    return this.props.updatedBy;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Business Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Update tenant profile.
   * GRCD F-ORG-2: Allow org admin to edit organization profile.
   */
  updateProfile(params: {
    name?: string;
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    domain?: string;
    updatedBy: string;
  }): void {
    if (params.name !== undefined) {
      this.props.name = params.name;
    }
    if (params.timezone !== undefined) {
      this.props.timezone = params.timezone;
    }
    if (params.locale !== undefined) {
      this.props.locale = params.locale;
    }
    if (params.logoUrl !== undefined) {
      this.props.logoUrl = params.logoUrl;
    }
    if (params.domain !== undefined) {
      this.props.domain = params.domain;
    }
    this.props.updatedAt = new Date();
    this.props.updatedBy = params.updatedBy;
  }

  /**
   * Activate the tenant (complete setup or reactivate from suspended).
   */
  activate(updatedBy: string): void {
    const targetStatus = TenantStatus.active();
    this.props.status = this.props.status.transitionTo(targetStatus);
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  /**
   * Start trial period.
   */
  startTrial(updatedBy: string): void {
    const targetStatus = TenantStatus.trial();
    this.props.status = this.props.status.transitionTo(targetStatus);
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  /**
   * Suspend the tenant.
   */
  suspend(updatedBy: string): void {
    const targetStatus = TenantStatus.suspended();
    this.props.status = this.props.status.transitionTo(targetStatus);
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  /**
   * Check if tenant is accessible (users can log in).
   */
  isAccessible(): boolean {
    return this.props.status.isAccessible();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Serialization
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Convert to plain object for persistence.
   */
  toPersistence(): Record<string, unknown> {
    return {
      id: this.props.id,
      traceId: this.props.traceId.toString(),
      name: this.props.name,
      slug: this.props.slug,
      status: this.props.status.toString(),
      timezone: this.props.timezone,
      locale: this.props.locale,
      logoUrl: this.props.logoUrl,
      domain: this.props.domain,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      createdBy: this.props.createdBy,
      updatedBy: this.props.updatedBy,
    };
  }
}

