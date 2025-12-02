// business-engine/admin-config/application/use-cases/auth/forgot-password.use-case.ts
/**
 * ForgotPasswordUseCase (v2.0)
 * 
 * GRCD F-USER-5: Password reset flow - Step 1 (Request)
 * 
 * Security Features:
 * - ALWAYS returns success (doesn't leak user existence)
 * - Rate limiting should be handled at BFF/API Gateway level
 * - Token is hashed before storage (never stored in plaintext)
 * - Invalidates any existing reset tokens for the user
 * - Audit trail for security monitoring
 */

import type { User } from '../../../domain/entities/user.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import type {
  ITransactionManager,
  TransactionScope,
} from '../../ports/outbound/transaction.manager.port';

/**
 * Dependencies injected by BFF (NOT in TransactionScope)
 * These are stateless crypto functions.
 */
export interface ForgotPasswordDependencies {
  /** Generate a cryptographically secure random token */
  generateToken: () => string;
  /** Hash the token for storage (e.g., SHA-256) */
  hashToken: (token: string) => string;
  /** Send the password reset email (returns void, handles errors internally) */
  sendPasswordResetEmail: (params: {
    email: string;
    resetToken: string;
    userName?: string;
    expiresAt: Date;
  }) => Promise<void>;
}

/**
 * Command input
 */
export interface ForgotPasswordCommand {
  input: {
    email: string;
  };
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Result output
 * Note: Always returns success to not leak user existence
 */
export interface ForgotPasswordResult {
  /** Always true - we don't reveal if email exists */
  success: true;
  /** Generic message for the user */
  message: string;
  /** Internal: was a token actually created? (for testing/logging) */
  _internal?: {
    tokenCreated: boolean;
    userId?: string;
  };
}

/** Token expiry duration: 1 hour */
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

/**
 * ForgotPasswordUseCase Factory
 * 
 * Creates a use case instance with transaction manager and dependencies.
 * 
 * @example
 * const forgotPassword = makeForgotPasswordUseCase(txManager, {
 *   generateToken: () => crypto.randomBytes(32).toString('hex'),
 *   hashToken: (token) => crypto.createHash('sha256').update(token).digest('hex'),
 *   sendPasswordResetEmail: async (params) => emailService.sendResetEmail(params),
 * });
 * 
 * // SECURITY: Always returns success, even if user doesn't exist
 * const result = await forgotPassword({ input: { email: 'user@example.com' } });
 * // result.success === true (always)
 */
export function makeForgotPasswordUseCase(
  transactionManager: ITransactionManager,
  deps: ForgotPasswordDependencies,
) {
  return async function forgotPasswordUseCase(
    command: ForgotPasswordCommand,
  ): Promise<ForgotPasswordResult> {
    const { input, ipAddress, userAgent } = command;
    const { generateToken, hashToken, sendPasswordResetEmail } = deps;

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACTION BOUNDARY
    // Token creation + audit happens atomically
    // ─────────────────────────────────────────────────────────────────────────
    return transactionManager.run(async (scope: TransactionScope) => {
      const { userRepository, tokenRepository, auditRepository } = scope;

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: FIND USER BY EMAIL
      // SECURITY: Don't reveal if user exists or not
      // ─────────────────────────────────────────────────────────────────────

      const user = await userRepository.findByEmail(input.email);

      // If user doesn't exist, return success anyway (security measure)
      if (!user) {
        // Audit the attempt (for rate limiting / abuse detection)
        await auditForgotPasswordAttempt(
          scope,
          input.email,
          'USER_NOT_FOUND',
          null,
          ipAddress,
          userAgent,
        );

        return {
          success: true,
          message: 'If your email is registered, you will receive a password reset link',
          _internal: { tokenCreated: false },
        };
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: CHECK USER CAN RESET PASSWORD
      // Only active users can reset passwords
      // ─────────────────────────────────────────────────────────────────────

      if (!user.canResetPassword()) {
        await auditForgotPasswordAttempt(
          scope,
          input.email,
          'USER_CANNOT_RESET',
          user,
          ipAddress,
          userAgent,
        );

        // Still return success (don't leak account status)
        return {
          success: true,
          message: 'If your email is registered, you will receive a password reset link',
          _internal: { tokenCreated: false, userId: user.id },
        };
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: INVALIDATE EXISTING TOKENS
      // Ensures only one active reset token per user
      // ─────────────────────────────────────────────────────────────────────

      await tokenRepository.invalidateAllPasswordResetTokensForUser(user.id!);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: GENERATE NEW TOKEN
      // ─────────────────────────────────────────────────────────────────────

      const rawToken = generateToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

      await tokenRepository.savePasswordResetToken({
        tokenHash,
        userId: user.id!,
        expiresAt,
        requestedIp: ipAddress,
        requestedUserAgent: userAgent,
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: APPEND AUDIT EVENT (with optimistic locking)
      // GRCD F-TRACE-2: Every lifecycle action MUST generate an audit event
      // ─────────────────────────────────────────────────────────────────────

      const prevAuditEvent = await auditRepository.getLatestByTraceId(
        user.traceId.toString(),
      );

      const auditEvent = AuditEvent.create({
        traceId: user.traceId.toString(),
        resourceType: 'USER',
        resourceId: user.id!,
        action: 'PASSWORD_RESET_REQUESTED',
        actorUserId: user.id!, // Self-initiated
        metadataDiff: {
          expiresAt: expiresAt.toISOString(),
          // Note: We NEVER log the token, even hashed
        },
        ipAddress,
        userAgent,
        prevHash: prevAuditEvent?.hash ?? null,
      });

      await auditRepository.appendEvent(auditEvent);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: SEND EMAIL (outside transaction - two-phase commit pattern)
      // This happens AFTER transaction commits to ensure token is persisted
      // ─────────────────────────────────────────────────────────────────────

      // Note: We're inside the transaction here, but email sending is
      // fire-and-forget with its own error handling
      try {
        await sendPasswordResetEmail({
          email: user.email.toString(),
          resetToken: rawToken, // Raw token in email, hashed in DB
          userName: user.name ?? undefined,
          expiresAt,
        });
      } catch (emailError) {
        // Log but don't fail - token is still valid if user retries
        console.error('[FORGOT_PASSWORD] Email send failed:', emailError);
      }

      // ─────────────────────────────────────────────────────────────────────
      // RETURN SUCCESS
      // ─────────────────────────────────────────────────────────────────────

      return {
        success: true,
        message: 'If your email is registered, you will receive a password reset link',
        _internal: { tokenCreated: true, userId: user.id },
      };
    });
  };
}

/**
 * Helper: Audit forgot password attempts
 * 
 * Used for security monitoring and rate limiting decisions.
 */
async function auditForgotPasswordAttempt(
  scope: TransactionScope,
  email: string,
  reason: 'USER_NOT_FOUND' | 'USER_CANNOT_RESET',
  user: User | null,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    const auditEvent = AuditEvent.create({
      traceId: user?.traceId.toString() ?? `password-reset-attempt:${Date.now()}`,
      resourceType: 'USER',
      resourceId: user?.id ?? 'UNKNOWN',
      action: 'PASSWORD_RESET_ATTEMPTED',
      actorUserId: user?.id ?? null,
      metadataDiff: {
        attemptedEmail: email,
        reason,
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
      prevHash: null, // Failed attempts don't chain
    });

    // Use save() not appendEvent() for non-chained events
    await scope.auditRepository.save(auditEvent);
  } catch {
    // Don't let audit failure block the flow
    console.error('[AUDIT] Failed to record password reset attempt');
  }
}


