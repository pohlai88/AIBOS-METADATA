// business-engine/admin-config/application/use-cases/tenant/create-tenant.use-case.ts
/**
 * CreateTenantUseCase (v1.1 Hardened)
 * 
 * GRCD F-ORG-1: Allow Platform Admin to create a Tenant/Organization profile.
 * 
 * v1.1 Hardening:
 * - Transaction boundary via ITransactionManager
 * - Permission check: ONLY platform_admin can create tenants
 * - Domain error taxonomy (UnauthorizedError, ConflictError)
 * - TenantSlug value object validation
 * - Optimistic locking on audit chain via appendEvent
 */

import { Tenant } from '../../../domain/entities/tenant.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import { TenantSlug } from '../../../domain/value-objects/tenant-slug.vo';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import type {
  ITransactionManager,
  TransactionScope,
} from '../../ports/outbound/transaction.manager.port';
import type { CreateTenantInput } from '../../../contracts/tenant.contract';

/**
 * Actor context - who is performing this action
 */
export interface CreateTenantActor {
  userId: string;
  // Role checked via membership lookup
}

/**
 * Command input
 */
export interface CreateTenantCommand {
  input: CreateTenantInput;
  actor: CreateTenantActor;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Result output
 */
export interface CreateTenantResult {
  tenant: Tenant;
  auditEvent: AuditEvent;
}

/**
 * CreateTenantUseCase Factory
 * 
 * Creates a use case instance with transaction manager.
 * 
 * @example
 * const createTenant = makeCreateTenantUseCase(txManager);
 * 
 * try {
 *   const result = await createTenant({
 *     input: { name, slug, timezone, locale },
 *     actor: { userId },
 *   });
 * } catch (error) {
 *   if (error instanceof UnauthorizedError) {
 *     // 403 - Only platform_admin can create tenants
 *   }
 *   if (error instanceof ConflictError) {
 *     // 409 - Slug already exists
 *   }
 * }
 */
export function makeCreateTenantUseCase(
  transactionManager: ITransactionManager,
) {
  return async function createTenantUseCase(
    command: CreateTenantCommand,
  ): Promise<CreateTenantResult> {
    const { input, actor, ipAddress, userAgent } = command;

    // ─────────────────────────────────────────────────────────────────────────
    // PRE-TRANSACTION: Validate TenantSlug format
    // This throws ValidationError if format is invalid
    // ─────────────────────────────────────────────────────────────────────────
    const tenantSlug = TenantSlug.create(input.slug);

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACTION BOUNDARY
    // All writes happen atomically. If any step fails, everything rolls back.
    // ─────────────────────────────────────────────────────────────────────────
    return transactionManager.run(async (scope: TransactionScope) => {
      const { tenantRepository, membershipRepository, auditRepository } = scope;

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: PERMISSION CHECK
      // GRCD F-ORG-1: Only platform_admin can create tenants
      // ─────────────────────────────────────────────────────────────────────

      // Check if actor has platform_admin role in ANY tenant
      // (platform_admin is a cross-tenant super admin)
      const actorMemberships = await membershipRepository.findByUserId(actor.userId);
      const isPlatformAdmin = actorMemberships.some(
        (m) => m.role.toString() === 'platform_admin',
      );

      if (!isPlatformAdmin) {
        // Audit the denial
        await auditDeniedAttempt(
          scope,
          actor.userId,
          'CREATE_TENANT',
          input.slug,
          ipAddress,
          userAgent,
        );

        throw new UnauthorizedError(
          'CREATE_TENANT',
          'Only platform_admin can create new tenants',
          {
            actorUserId: actor.userId,
            policyCode: 'F-PERM-TENANT-2',
          },
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: VALIDATE SLUG UNIQUENESS
      // ─────────────────────────────────────────────────────────────────────

      const slugExists = await tenantRepository.existsBySlug(tenantSlug.toString());
      if (slugExists) {
        throw new ConflictError(
          'TenantSlug',
          tenantSlug.toString(),
          'Tenant with this slug already exists',
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: CREATE TENANT ENTITY
      // ─────────────────────────────────────────────────────────────────────

      const tenant = Tenant.create({
        name: input.name,
        slug: tenantSlug.toString(),
        timezone: input.timezone,
        locale: input.locale,
        logoUrl: input.logoUrl,
        domain: input.domain,
        createdBy: actor.userId,
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: PERSIST TENANT
      // ─────────────────────────────────────────────────────────────────────

      const savedTenant = await tenantRepository.save(tenant);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: APPEND AUDIT EVENT (first event in chain)
      // GRCD F-TRACE-2: Every lifecycle action MUST generate an audit event
      // ─────────────────────────────────────────────────────────────────────

      const auditEvent = AuditEvent.create({
        traceId: savedTenant.traceId.toString(),
        resourceType: 'TENANT',
        resourceId: savedTenant.id!,
        action: 'CREATE',
        actorUserId: actor.userId,
        metadataDiff: {
          after: {
            name: savedTenant.name,
            slug: savedTenant.slug,
            status: savedTenant.status.toString(),
            timezone: savedTenant.timezone,
            locale: savedTenant.locale,
          },
        },
        ipAddress,
        userAgent,
        prevHash: null, // First event in chain
      });

      // Use appendEvent for consistency (even though first event)
      const savedAuditEvent = await auditRepository.appendEvent(auditEvent);

      return {
        tenant: savedTenant,
        auditEvent: savedAuditEvent,
      };
    });
  };
}

/**
 * Helper: Audit denied permission attempts
 */
async function auditDeniedAttempt(
  scope: TransactionScope,
  actorUserId: string,
  action: string,
  targetSlug: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    const auditEvent = AuditEvent.create({
      traceId: `denial:${actorUserId}:${Date.now()}`,
      resourceType: 'TENANT',
      resourceId: actorUserId,
      action: 'INVITE_DENIED',
      actorUserId,
      metadataDiff: {
        attemptedAction: action,
        attemptedSlug: targetSlug,
        denialReason: 'NOT_PLATFORM_ADMIN',
      },
      ipAddress,
      userAgent,
      prevHash: null,
    });

    await scope.auditRepository.save(auditEvent);
  } catch {
    console.error('[AUDIT] Failed to record denial event');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY EXPORT (for backward compatibility during migration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use makeCreateTenantUseCase() factory instead.
 */
export { makeCreateTenantUseCase as createTenantUseCase };
