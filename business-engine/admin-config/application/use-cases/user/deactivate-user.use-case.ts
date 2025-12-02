// business-engine/admin-config/application/use-cases/user/deactivate-user.use-case.ts
/**
 * DeactivateUserUseCase (v1.1 Hardened)
 * 
 * GRCD F-USER-3: System MUST support deactivating users
 * 
 * v1.1 Hardening:
 * - Transaction boundary via ITransactionManager
 * - Permission check (org_admin+ can deactivate)
 * - State machine enforcement via UserStatus VO
 * - Optimistic locking on audit chain via appendEvent
 * - Cannot deactivate yourself
 * 
 * State Machine:
 * - ACTIVE → INACTIVE (valid)
 * - INVITED → INACTIVE (invalid - must accept first)
 * - INACTIVE → INACTIVE (invalid - already inactive)
 * - LOCKED → INACTIVE (valid - unlock and deactivate)
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
export interface DeactivateUserCommand {
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
export interface DeactivateUserResult {
  user: User;
  auditEvent: AuditEvent;
}

/**
 * DeactivateUserUseCase Factory
 * 
 * Creates a use case instance with transaction manager.
 * 
 * @example
 * const deactivateUser = makeDeactivateUserUseCase(txManager);
 * 
 * const result = await deactivateUser({
 *   targetUserId: 'user-to-deactivate',
 *   actor: { userId: 'admin-id', tenantId: 'tenant-id' },
 *   reason: 'Account review',
 * });
 */
export function makeDeactivateUserUseCase(
  transactionManager: ITransactionManager,
) {
  return async function deactivateUserUseCase(
    command: DeactivateUserCommand,
  ): Promise<DeactivateUserResult> {
    const { targetUserId, actor, reason, ipAddress, userAgent } = command;

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACTION BOUNDARY
    // All writes happen atomically. If any step fails, everything rolls back.
    // ─────────────────────────────────────────────────────────────────────────
    return transactionManager.run(async (scope: TransactionScope) => {
      const { userRepository, membershipRepository, auditRepository } = scope;

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: PERMISSION CHECK
      // Only org_admin or platform_admin can deactivate users
      // ─────────────────────────────────────────────────────────────────────

      const actorMembership = await membershipRepository.findByUserAndTenant(
        actor.userId,
        actor.tenantId,
      );

      if (!actorMembership || !actorMembership.role.canDeactivateUser()) {
        throw new UnauthorizedError(
          'DEACTIVATE_USER',
          'Only administrators can deactivate users',
          { requiredRole: 'org_admin or platform_admin' },
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: SAFETY CHECK - Cannot deactivate yourself
      // ─────────────────────────────────────────────────────────────────────

      if (targetUserId === actor.userId) {
        throw new InvariantViolationError(
          'SELF_DEACTIVATION',
          'You cannot deactivate your own account',
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: LOAD TARGET USER
      // ─────────────────────────────────────────────────────────────────────

      const user = await userRepository.findById(targetUserId);
      if (!user) {
        throw new NotFoundError('User', targetUserId);
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: VERIFY TARGET IS IN SAME TENANT
      // Admins can only deactivate users in their own tenant
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
      // STEP 5: CAPTURE BEFORE STATE
      // ─────────────────────────────────────────────────────────────────────

      const beforeStatus = user.status.toString();

      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: DOMAIN LOGIC - STATE MACHINE TRANSITION
      // UserStatus.transitionTo() will throw if transition is invalid:
      // - INVITED → INACTIVE: Invalid (must accept invite first)
      // - INACTIVE → INACTIVE: Invalid (already inactive)
      // - ACTIVE → INACTIVE: Valid
      // - LOCKED → INACTIVE: Valid
      // ─────────────────────────────────────────────────────────────────────

      try {
        user.deactivate();
      } catch (error) {
        // Convert generic error to domain error
        throw new InvariantViolationError(
          'INVALID_STATUS_TRANSITION',
          `Cannot deactivate user: ${error instanceof Error ? error.message : 'Invalid state transition'}`,
          { currentStatus: beforeStatus, targetStatus: 'inactive' },
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 7: PERSIST USER
      // ─────────────────────────────────────────────────────────────────────

      const savedUser = await userRepository.save(user);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 8: APPEND AUDIT EVENT (with optimistic locking)
      // ─────────────────────────────────────────────────────────────────────

      const prevAuditEvent = await auditRepository.getLatestByTraceId(
        savedUser.traceId.toString(),
      );

      const auditEvent = AuditEvent.create({
        traceId: savedUser.traceId.toString(),
        resourceType: 'USER',
        resourceId: savedUser.id!,
        action: 'DEACTIVATE',
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
 * @deprecated Use makeDeactivateUserUseCase() factory instead.
 */
export { makeDeactivateUserUseCase as deactivateUserUseCase };

