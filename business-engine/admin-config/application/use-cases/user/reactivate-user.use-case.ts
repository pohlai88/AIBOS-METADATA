// business-engine/admin-config/application/use-cases/user/reactivate-user.use-case.ts
/**
 * ReactivateUserUseCase (v1.1 Hardened)
 * 
 * GRCD F-USER-3: System MUST support reactivating users
 * 
 * v1.1 Hardening:
 * - Transaction boundary via ITransactionManager
 * - Permission check (org_admin+ can reactivate)
 * - State machine enforcement via UserStatus VO
 * - Optimistic locking on audit chain via appendEvent
 * 
 * State Machine:
 * - INACTIVE → ACTIVE (valid)
 * - LOCKED → ACTIVE (valid - unlock)
 * - ACTIVE → ACTIVE (invalid - already active)
 * - INVITED → ACTIVE (invalid - must accept invite)
 */

import type { User } from '../../../domain/entities/user.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { InvariantViolationError } from '../../../domain/errors/invariant.error';
import type {
  ITransactionManager,
  TransactionScope,
} from '../../ports/outbound/transaction.manager.port';

/**
 * Command input
 */
export interface ReactivateUserCommand {
  targetUserId: string;
  actor: {
    userId: string;
    tenantId: string;
  };
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Result output
 */
export interface ReactivateUserResult {
  user: User;
  auditEvent: AuditEvent;
}

/**
 * ReactivateUserUseCase Factory
 * 
 * Creates a use case instance with transaction manager.
 * 
 * @example
 * const reactivateUser = makeReactivateUserUseCase(txManager);
 * 
 * const result = await reactivateUser({
 *   targetUserId: 'user-to-reactivate',
 *   actor: { userId: 'admin-id', tenantId: 'tenant-id' },
 *   reason: 'Account review complete',
 * });
 */
export function makeReactivateUserUseCase(
  transactionManager: ITransactionManager,
) {
  return async function reactivateUserUseCase(
    command: ReactivateUserCommand,
  ): Promise<ReactivateUserResult> {
    const { targetUserId, actor, reason, ipAddress, userAgent } = command;

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACTION BOUNDARY
    // All writes happen atomically. If any step fails, everything rolls back.
    // ─────────────────────────────────────────────────────────────────────────
    return transactionManager.run(async (scope: TransactionScope) => {
      const { userRepository, membershipRepository, auditRepository } = scope;

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: PERMISSION CHECK
      // Only org_admin or platform_admin can reactivate users
      // ─────────────────────────────────────────────────────────────────────

      const actorMembership = await membershipRepository.findByUserAndTenant(
        actor.userId,
        actor.tenantId,
      );

      if (!actorMembership || !actorMembership.role.canDeactivateUser()) {
        throw new UnauthorizedError(
          'REACTIVATE_USER',
          'Only administrators can reactivate users',
          { requiredRole: 'org_admin or platform_admin' },
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: LOAD TARGET USER
      // ─────────────────────────────────────────────────────────────────────

      const user = await userRepository.findById(targetUserId);
      if (!user) {
        throw new NotFoundError('User', targetUserId);
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: VERIFY TARGET IS IN SAME TENANT
      // Admins can only reactivate users in their own tenant
      // ─────────────────────────────────────────────────────────────────────

      const targetMembership = await membershipRepository.findByUserAndTenant(
        targetUserId,
        actor.tenantId,
      );

      if (!targetMembership) {
        throw new NotFoundError('User', targetUserId, {
          message: 'User is not a member of this organization',
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: CAPTURE BEFORE STATE
      // ─────────────────────────────────────────────────────────────────────

      const beforeStatus = user.status.toString();

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: DOMAIN LOGIC - STATE MACHINE TRANSITION
      // UserStatus.transitionTo() will throw if transition is invalid:
      // - INACTIVE → ACTIVE: Valid
      // - LOCKED → ACTIVE: Valid
      // - ACTIVE → ACTIVE: Invalid (already active)
      // - INVITED → ACTIVE: Invalid (must accept invite)
      // ─────────────────────────────────────────────────────────────────────

      try {
        user.reactivate();
      } catch (error) {
        // Convert generic error to domain error
        throw new InvariantViolationError(
          'INVALID_STATUS_TRANSITION',
          `Cannot reactivate user: ${error instanceof Error ? error.message : 'Invalid state transition'}`,
          { currentStatus: beforeStatus, targetStatus: 'active' },
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: PERSIST USER
      // ─────────────────────────────────────────────────────────────────────

      const savedUser = await userRepository.save(user);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 7: APPEND AUDIT EVENT (with optimistic locking)
      // ─────────────────────────────────────────────────────────────────────

      const prevAuditEvent = await auditRepository.getLatestByTraceId(
        savedUser.traceId.toString(),
      );

      const auditEvent = AuditEvent.create({
        traceId: savedUser.traceId.toString(),
        resourceType: 'USER',
        resourceId: savedUser.id!,
        action: 'REACTIVATE',
        actorUserId: actor.userId,
        metadataDiff: {
          before: { status: beforeStatus },
          after: { status: savedUser.status.toString() },
          reason: reason ?? 'Admin action',
        },
        ipAddress,
        userAgent,
        prevHash: prevAuditEvent?.hash ?? null,
      });

      // appendEvent enforces optimistic locking
      const savedAuditEvent = await auditRepository.appendEvent(auditEvent);

      return {
        user: savedUser,
        auditEvent: savedAuditEvent,
      };
    });
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY EXPORT (for backward compatibility during migration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use makeReactivateUserUseCase() factory instead.
 */
export { makeReactivateUserUseCase as reactivateUserUseCase };

