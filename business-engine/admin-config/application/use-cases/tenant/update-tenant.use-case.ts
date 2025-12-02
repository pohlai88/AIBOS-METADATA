// business-engine/admin-config/application/use-cases/tenant/update-tenant.use-case.ts
/**
 * UpdateTenantUseCase (v1.1 Hardened)
 * 
 * GRCD F-ORG-2: Allow Org Admin to edit their organization's profile.
 * 
 * v1.1 Hardening:
 * - Transaction boundary via ITransactionManager
 * - Permission check: platform_admin OR org_admin of the tenant
 * - Domain error taxonomy (UnauthorizedError, NotFoundError)
 * - Optimistic locking on audit chain via appendEvent
 */

import type { Tenant } from '../../../domain/entities/tenant.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import type {
  ITransactionManager,
  TransactionScope,
} from '../../ports/outbound/transaction.manager.port';
import type { UpdateTenantInput } from '../../../contracts/tenant.contract';

/**
 * Actor context - who is performing this action
 */
export interface UpdateTenantActor {
  userId: string;
  tenantId: string; // The tenant they're trying to update
}

/**
 * Command input
 */
export interface UpdateTenantCommand {
  tenantId: string;
  input: UpdateTenantInput;
  actor: UpdateTenantActor;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Result output
 */
export interface UpdateTenantResult {
  tenant: Tenant;
  auditEvent: AuditEvent;
}

/**
 * UpdateTenantUseCase Factory
 * 
 * Creates a use case instance with transaction manager.
 * 
 * @example
 * const updateTenant = makeUpdateTenantUseCase(txManager);
 * 
 * try {
 *   const result = await updateTenant({
 *     tenantId,
 *     input: { name, timezone, locale },
 *     actor: { userId, tenantId },
 *   });
 * } catch (error) {
 *   if (error instanceof UnauthorizedError) {
 *     // 403 - Not admin of this tenant
 *   }
 *   if (error instanceof NotFoundError) {
 *     // 404 - Tenant not found
 *   }
 * }
 */
export function makeUpdateTenantUseCase(
  transactionManager: ITransactionManager,
) {
  return async function updateTenantUseCase(
    command: UpdateTenantCommand,
  ): Promise<UpdateTenantResult> {
    const { tenantId, input, actor, ipAddress, userAgent } = command;

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACTION BOUNDARY
    // All writes happen atomically. If any step fails, everything rolls back.
    // ─────────────────────────────────────────────────────────────────────────
    return transactionManager.run(async (scope: TransactionScope) => {
      const { tenantRepository, membershipRepository, auditRepository } = scope;

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: LOAD TENANT
      // ─────────────────────────────────────────────────────────────────────

      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new NotFoundError('Tenant', tenantId);
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: PERMISSION CHECK
      // GRCD F-ORG-2: platform_admin OR org_admin of THIS tenant
      // ─────────────────────────────────────────────────────────────────────

      const actorMembership = await membershipRepository.findByUserAndTenant(
        actor.userId,
        tenantId,
      );

      // Check if platform_admin (cross-tenant) or org_admin of this tenant
      const canUpdate =
        actorMembership?.role.canUpdateTenantProfile() ||
        (await isPlatformAdmin(scope, actor.userId));

      if (!canUpdate) {
        // Audit the denial
        await auditDeniedAttempt(
          scope,
          actor.userId,
          tenantId,
          ipAddress,
          userAgent,
        );

        throw new UnauthorizedError(
          'UPDATE_TENANT',
          'Only platform_admin or org_admin can update tenant profile',
          {
            actorUserId: actor.userId,
            targetTenantId: tenantId,
            actorRole: actorMembership?.role.toString() ?? 'none',
            policyCode: 'F-PERM-TENANT-1',
          },
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: CAPTURE BEFORE STATE FOR AUDIT
      // ─────────────────────────────────────────────────────────────────────

      const beforeState = {
        name: tenant.name,
        timezone: tenant.timezone,
        locale: tenant.locale,
        logoUrl: tenant.logoUrl,
        domain: tenant.domain,
      };

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: APPLY UPDATES
      // ─────────────────────────────────────────────────────────────────────

      tenant.updateProfile({
        name: input.name,
        timezone: input.timezone,
        locale: input.locale,
        logoUrl: input.logoUrl,
        domain: input.domain,
        updatedBy: actor.userId,
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: PERSIST TENANT
      // ─────────────────────────────────────────────────────────────────────

      const savedTenant = await tenantRepository.save(tenant);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: APPEND AUDIT EVENT (with optimistic locking)
      // ─────────────────────────────────────────────────────────────────────

      const prevAuditEvent = await auditRepository.getLatestByTraceId(
        savedTenant.traceId.toString(),
      );

      const afterState = {
        name: savedTenant.name,
        timezone: savedTenant.timezone,
        locale: savedTenant.locale,
        logoUrl: savedTenant.logoUrl,
        domain: savedTenant.domain,
      };

      const auditEvent = AuditEvent.create({
        traceId: savedTenant.traceId.toString(),
        resourceType: 'TENANT',
        resourceId: savedTenant.id!,
        action: 'UPDATE',
        actorUserId: actor.userId,
        metadataDiff: {
          before: beforeState,
          after: afterState,
        },
        ipAddress,
        userAgent,
        prevHash: prevAuditEvent?.hash ?? null,
      });

      // appendEvent enforces optimistic locking
      const savedAuditEvent = await auditRepository.appendEvent(auditEvent);

      return {
        tenant: savedTenant,
        auditEvent: savedAuditEvent,
      };
    });
  };
}

/**
 * Helper: Check if user is platform_admin in ANY tenant
 */
async function isPlatformAdmin(
  scope: TransactionScope,
  userId: string,
): Promise<boolean> {
  const memberships = await scope.membershipRepository.findByUserId(userId);
  return memberships.some((m) => m.role.toString() === 'platform_admin');
}

/**
 * Helper: Audit denied permission attempts
 */
async function auditDeniedAttempt(
  scope: TransactionScope,
  actorUserId: string,
  targetTenantId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    const auditEvent = AuditEvent.create({
      traceId: `denial:${actorUserId}:${Date.now()}`,
      resourceType: 'TENANT',
      resourceId: targetTenantId,
      action: 'INVITE_DENIED',
      actorUserId,
      metadataDiff: {
        attemptedAction: 'UPDATE_TENANT',
        targetTenantId,
        denialReason: 'INSUFFICIENT_ROLE',
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
 * @deprecated Use makeUpdateTenantUseCase() factory instead.
 */
export { makeUpdateTenantUseCase as updateTenantUseCase };
