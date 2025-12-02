// business-engine/admin-config/application/use-cases/auth/reset-password.use-case.ts
/**
 * ResetPasswordUseCase (v2.0)
 * 
 * GRCD F-USER-5: Password reset flow - Step 2 (Execute)
 * 
 * Security Features:
 * - Validates token before allowing password change
 * - Token is single-use (marked as used after success)
 * - All active reset tokens for user are invalidated on success
 * - Password is hashed before storage
 * - Full audit trail
 */

import type { User } from '../../../domain/entities/user.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import { ValidationError } from '../../../domain/errors/validation.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { InvariantViolationError } from '../../../domain/errors/invariant.error';
import type {
  ITransactionManager,
  TransactionScope,
} from '../../ports/outbound/transaction.manager.port';

/**
 * Dependencies injected by BFF (NOT in TransactionScope)
 * These are stateless crypto functions.
 */
export interface ResetPasswordDependencies {
  /** Hash the token for lookup (must match forgot-password hash method) */
  hashToken: (token: string) => string;
  /** Hash the new password for storage (e.g., bcrypt with cost factor 12) */
  hashPassword: (password: string) => Promise<string>;
}

/**
 * Command input
 */
export interface ResetPasswordCommand {
  input: {
    /** The raw reset token from the email link */
    token: string;
    /** The new password (already validated by BFF schema) */
    password: string;
  };
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Result output
 */
export interface ResetPasswordResult {
  /** The updated user entity */
  user: User;
  /** The audit event created */
  auditEvent: AuditEvent;
  /** Success message */
  message: string;
}

/**
 * ResetPasswordUseCase Factory
 * 
 * Creates a use case instance with transaction manager and dependencies.
 * 
 * @example
 * const resetPassword = makeResetPasswordUseCase(txManager, {
 *   hashToken: (token) => crypto.createHash('sha256').update(token).digest('hex'),
 *   hashPassword: async (password) => bcrypt.hash(password, 12),
 * });
 * 
 * try {
 *   const result = await resetPassword({
 *     input: { token: 'abc123...', password: 'NewSecure123!' },
 *     ipAddress,
 *     userAgent,
 *   });
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     // 400 - Invalid or expired token
 *   }
 * }
 */
export function makeResetPasswordUseCase(
  transactionManager: ITransactionManager,
  deps: ResetPasswordDependencies,
) {
  return async function resetPasswordUseCase(
    command: ResetPasswordCommand,
  ): Promise<ResetPasswordResult> {
    const { input, ipAddress, userAgent } = command;
    const { hashToken, hashPassword } = deps;

    // Hash token and password BEFORE transaction (stateless operations)
    const tokenHash = hashToken(input.token);
    const passwordHash = await hashPassword(input.password);

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACTION BOUNDARY
    // All writes happen atomically. If any step fails, everything rolls back.
    // ─────────────────────────────────────────────────────────────────────────
    return transactionManager.run(async (scope: TransactionScope) => {
      const { userRepository, tokenRepository, auditRepository } = scope;

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: FIND AND VALIDATE TOKEN
      // ─────────────────────────────────────────────────────────────────────

      const resetToken = await tokenRepository.findPasswordResetTokenByHash(tokenHash);

      if (!resetToken) {
        throw new ValidationError('token', 'Invalid or expired reset token', {
          hint: 'Token may be malformed, expired, or already used',
        });
      }

      if (resetToken.isUsed) {
        throw new ValidationError('token', 'Reset token has already been used', {
          tokenId: resetToken.id,
          usedAt: resetToken.usedAt?.toISOString(),
        });
      }

      if (resetToken.expiresAt < new Date()) {
        throw new ValidationError('token', 'Reset token has expired', {
          tokenId: resetToken.id,
          expiredAt: resetToken.expiresAt.toISOString(),
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: LOAD USER
      // ─────────────────────────────────────────────────────────────────────

      const user = await userRepository.findById(resetToken.userId);
      if (!user) {
        throw new NotFoundError('User', resetToken.userId, {
          context: 'User referenced by reset token not found',
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: VALIDATE USER CAN RESET PASSWORD
      // ─────────────────────────────────────────────────────────────────────

      if (!user.canResetPassword()) {
        throw new InvariantViolationError(
          'User',
          `Cannot reset password: user status is '${user.status.toString()}'`,
          {
            userId: user.id,
            currentStatus: user.status.toString(),
          },
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: UPDATE PASSWORD
      // ─────────────────────────────────────────────────────────────────────

      user.setPassword(passwordHash);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: PERSIST USER
      // ─────────────────────────────────────────────────────────────────────

      const savedUser = await userRepository.save(user);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: INVALIDATE ALL RESET TOKENS FOR USER
      // GRCD F-USER-5: Token invalid after use + all other tokens invalidated
      // ─────────────────────────────────────────────────────────────────────

      await tokenRepository.invalidateAllPasswordResetTokensForUser(user.id!);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 7: APPEND AUDIT EVENT (with optimistic locking)
      // GRCD F-TRACE-2: Every lifecycle action MUST generate an audit event
      // ─────────────────────────────────────────────────────────────────────

      const prevAuditEvent = await auditRepository.getLatestByTraceId(
        savedUser.traceId.toString(),
      );

      const auditEvent = AuditEvent.create({
        traceId: savedUser.traceId.toString(),
        resourceType: 'USER',
        resourceId: savedUser.id!,
        action: 'PASSWORD_RESET',
        actorUserId: savedUser.id!, // Self-action
        metadataDiff: {
          resetTokenId: resetToken.id,
          requestedAt: resetToken.createdAt.toISOString(),
          // Note: We NEVER log passwords, even hashed
        },
        ipAddress,
        userAgent,
        prevHash: prevAuditEvent?.hash ?? null,
      });

      // appendEvent enforces optimistic locking
      const savedAuditEvent = await auditRepository.appendEvent(auditEvent);

      // ─────────────────────────────────────────────────────────────────────
      // RETURN RESULT
      // ─────────────────────────────────────────────────────────────────────

      return {
        user: savedUser,
        auditEvent: savedAuditEvent,
        message: 'Password has been reset successfully',
      };
    });
  };
}


