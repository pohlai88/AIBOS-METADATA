// business-engine/admin-config/application/use-cases/user/change-password.use-case.ts
/**
 * ChangePasswordUseCase (v1.1 Hardened)
 *
 * GRCD F-USER-7: Allow users to change their own password.
 *
 * v1.1 Hardening:
 * - Transaction boundary via ITransactionManager
 * - Security: Verify current password before allowing change
 * - Domain error taxonomy (AuthenticationError for invalid credentials)
 * - Optimistic locking on audit chain via appendEvent
 * - Password NOT logged in audit metadata (GRCD C-ORG-2)
 */

import type { User } from '../../../domain/entities/user.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import { AuthenticationError } from '../../../domain/errors/authentication.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import type {
  ITransactionManager,
  TransactionScope,
} from '../../ports/outbound/transaction.manager.port';

/**
 * Dependencies injected by BFF (NOT in TransactionScope)
 * These are stateless crypto functions.
 */
export interface ChangePasswordDependencies {
  verifyPassword: (plaintext: string, hash: string) => Promise<boolean>;
  hashPassword: (plaintext: string) => Promise<string>;
}

/**
 * Command input
 */
export interface ChangePasswordCommand {
  userId: string; // From authenticated JWT (NOT from user input)
  currentPassword: string;
  newPassword: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Result output
 */
export interface ChangePasswordResult {
  user: User;
  auditEvent: AuditEvent;
}

/**
 * ChangePasswordUseCase Factory
 *
 * Creates a use case instance with transaction manager and dependencies.
 *
 * @example
 * const changePassword = makeChangePasswordUseCase(txManager, {
 *   verifyPassword: (pwd, hash) => bcrypt.compare(pwd, hash),
 *   hashPassword: (pwd) => bcrypt.hash(pwd, 12),
 * });
 *
 * try {
 *   const result = await changePassword({
 *     userId,
 *     currentPassword: 'oldpass',
 *     newPassword: 'newpass123',
 *   });
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     // 401 - Current password is wrong
 *   }
 * }
 */
export function makeChangePasswordUseCase(
  transactionManager: ITransactionManager,
  deps: ChangePasswordDependencies,
) {
  return async function changePasswordUseCase(
    command: ChangePasswordCommand,
  ): Promise<ChangePasswordResult> {
    const { userId, currentPassword, newPassword, ipAddress, userAgent } = command;
    const { verifyPassword, hashPassword } = deps;

    // ─────────────────────────────────────────────────────────────────────────
    // VALIDATION (Before Transaction)
    // ─────────────────────────────────────────────────────────────────────────

    // Basic validation - more sophisticated rules can be added
    if (newPassword.length < 8) {
      throw new ValidationError('newPassword', 'Password must be at least 8 characters');
    }

    if (currentPassword === newPassword) {
      throw new ValidationError('newPassword', 'New password must be different from current password');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACTION BOUNDARY
    // All writes happen atomically. If any step fails, everything rolls back.
    // ─────────────────────────────────────────────────────────────────────────
    return transactionManager.run(async (scope: TransactionScope) => {
      const { userRepository, auditRepository } = scope;

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: LOAD USER
      // ─────────────────────────────────────────────────────────────────────

      const user = await userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User', userId);
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: VERIFY CURRENT PASSWORD (Security Critical)
      // GRCD C-ORG-2: Never log passwords
      // ─────────────────────────────────────────────────────────────────────

      const currentHash = await userRepository.getPasswordHash(userId);
      if (!currentHash) {
        // User has no password set (e.g., OAuth-only account)
        throw new AuthenticationError('Cannot change password', {
          internalReason: 'NO_PASSWORD_SET',
        });
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword, currentHash);
      if (!isCurrentPasswordValid) {
        // Audit failed attempt (but don't chain it - security event)
        await auditFailedPasswordChange(
          scope,
          userId,
          user.traceId.toString(),
          ipAddress,
          userAgent,
        );

        throw new AuthenticationError('Current password is incorrect', {
          internalReason: 'INVALID_PASSWORD',
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: HASH NEW PASSWORD (Expensive operation)
      // ─────────────────────────────────────────────────────────────────────

      const newHash = await hashPassword(newPassword);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: UPDATE USER PASSWORD
      // ─────────────────────────────────────────────────────────────────────

      // Domain logic: Change password (updates hash + updatedAt timestamp)
      user.changePassword(newHash);

      // Persist the updated user (including new password hash)
      const savedUser = await userRepository.save(user);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: APPEND AUDIT EVENT (with optimistic locking)
      // GRCD F-TRACE-2: Every lifecycle action MUST generate an audit event
      // GRCD C-ORG-2: Password NOT logged in metadata
      // ─────────────────────────────────────────────────────────────────────

      const prevAuditEvent = await auditRepository.getLatestByTraceId(
        savedUser.traceId.toString(),
      );

      const auditEvent = AuditEvent.create({
        traceId: savedUser.traceId.toString(),
        resourceType: 'USER',
        resourceId: savedUser.id!,
        action: 'PASSWORD_CHANGE',
        actorUserId: savedUser.id!, // Self-action
        metadataDiff: {
          // NEVER log password values - just record the event happened
          passwordChanged: true,
          timestamp: new Date().toISOString(),
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

/**
 * Helper: Audit failed password change attempts
 *
 * SECURITY: Creates a trail of failed attempts for:
 * - Detecting credential stuffing
 * - Security incident investigation
 */
async function auditFailedPasswordChange(
  scope: TransactionScope,
  userId: string,
  traceId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    const auditEvent = AuditEvent.create({
      traceId: `pwd-fail:${userId}:${Date.now()}`, // Separate trace for failures
      resourceType: 'USER',
      resourceId: userId,
      action: 'PASSWORD_CHANGE', // Same action, but metadata shows failure
      actorUserId: userId,
      metadataDiff: {
        success: false,
        reason: 'INVALID_CURRENT_PASSWORD',
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
      prevHash: null, // Failed events don't chain (could be attackers)
    });

    // Use save() not appendEvent() for failure events
    await scope.auditRepository.save(auditEvent);
  } catch {
    // Don't let audit failure block the auth flow
    console.error('[AUDIT] Failed to record password change failure');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY EXPORT (for backward compatibility during migration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use makeChangePasswordUseCase() factory instead.
 */
export { makeChangePasswordUseCase as changePasswordUseCase };

