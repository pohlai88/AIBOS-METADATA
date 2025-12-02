// business-engine/admin-config/application/use-cases/auth/login.use-case.ts
/**
 * LoginUseCase (v1.1 Hardened)
 * 
 * GRCD F-USER-4: Login (email + password)
 * GRCD F-API-1: /auth/login endpoint
 * 
 * v1.1 Hardening:
 * - Transaction boundary via ITransactionManager
 * - AuthenticationError (doesn't leak user existence)
 * - Audit trail for failed attempts (with internal reason)
 * - Optimistic locking on audit chain via appendEvent
 */

import type { User } from '../../../domain/entities/user.entity';
import type { Tenant } from '../../../domain/entities/tenant.entity';
import type { Membership } from '../../../domain/entities/membership.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import {
  AuthenticationError,
  type AuthFailureReason,
} from '../../../domain/errors/authentication.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { InvariantViolationError } from '../../../domain/errors/invariant.error';
import type {
  ITransactionManager,
  TransactionScope,
} from '../../ports/outbound/transaction.manager.port';
import type { LoginInput, LoginResponse } from '../../../contracts/auth.contract';

/**
 * Dependencies injected by BFF (NOT in TransactionScope)
 * These are stateless crypto functions.
 */
export interface LoginDependencies {
  verifyPassword: (password: string, hash: string) => Promise<boolean>;
  generateAccessToken: (payload: {
    userId: string;
    email: string;
    tenantId?: string;
    role?: string;
  }) => string;
  generateRefreshToken: (userId: string) => string;
}

/**
 * Command input
 */
export interface LoginCommand {
  input: LoginInput;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Tenant context resolved during login
 */
interface TenantContext {
  tenant: Tenant;
  membership: Membership;
}

/**
 * Result output
 */
export interface LoginResult {
  response: LoginResponse;
  user: User;
  auditEvent: AuditEvent;
}

/**
 * LoginUseCase Factory
 * 
 * Creates a use case instance with transaction manager and dependencies.
 * 
 * @example
 * const login = makeLoginUseCase(txManager, {
 *   verifyPassword: bcrypt.compare,
 *   generateAccessToken: (payload) => jwt.sign(payload, secret),
 *   generateRefreshToken: (userId) => crypto.randomBytes(32).toString('hex'),
 * });
 * 
 * try {
 *   const result = await login({ input: { email, password, tenantSlug } });
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     // 401 - generic auth failure (don't reveal details)
 *   }
 * }
 */
export function makeLoginUseCase(
  transactionManager: ITransactionManager,
  deps: LoginDependencies,
) {
  return async function loginUseCase(
    command: LoginCommand,
  ): Promise<LoginResult> {
    const { input, ipAddress, userAgent } = command;
    const { verifyPassword, generateAccessToken, generateRefreshToken } = deps;

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACTION BOUNDARY
    // All writes happen atomically. If any step fails, everything rolls back.
    // ─────────────────────────────────────────────────────────────────────────
    return transactionManager.run(async (scope: TransactionScope) => {
      const { userRepository, auditRepository, membershipRepository, tenantRepository } = scope;

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: FIND USER BY EMAIL
      // SECURITY: Don't reveal if user exists or not
      // ─────────────────────────────────────────────────────────────────────

      const user = await userRepository.findByEmail(input.email);
      if (!user) {
        await auditFailedLogin(
          scope,
          input.email,
          'USER_NOT_FOUND',
          ipAddress,
          userAgent,
        );
        throw new AuthenticationError('Invalid email or password', {
          internalReason: 'USER_NOT_FOUND',
          email: input.email,
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: CHECK USER CAN LOGIN (Status check)
      // ─────────────────────────────────────────────────────────────────────

      if (!user.canLogin()) {
        const reason: AuthFailureReason =
          user.status.toString() === 'locked' ? 'ACCOUNT_LOCKED' : 'ACCOUNT_INACTIVE';

        await auditFailedLogin(
          scope,
          input.email,
          reason,
          ipAddress,
          userAgent,
          user.id,
          user.traceId.toString(),
        );

        // Generic error - don't reveal account status to potential attackers
        throw new AuthenticationError('Invalid email or password', {
          internalReason: reason,
          userId: user.id,
          status: user.status.toString(),
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: VERIFY PASSWORD
      // SECURITY: Constant-time comparison in BFF's verifyPassword
      // ─────────────────────────────────────────────────────────────────────

      const passwordHash = await userRepository.getPasswordHash(user.id!);
      if (!passwordHash) {
        // User exists but has no password (invited but not accepted)
        await auditFailedLogin(
          scope,
          input.email,
          'INVALID_PASSWORD',
          ipAddress,
          userAgent,
          user.id,
          user.traceId.toString(),
        );
        throw new AuthenticationError('Invalid email or password', {
          internalReason: 'NO_PASSWORD_SET',
          userId: user.id,
        });
      }

      const isValid = await verifyPassword(input.password, passwordHash);
      if (!isValid) {
        await auditFailedLogin(
          scope,
          input.email,
          'INVALID_PASSWORD',
          ipAddress,
          userAgent,
          user.id,
          user.traceId.toString(),
        );
        throw new AuthenticationError('Invalid email or password', {
          internalReason: 'INVALID_PASSWORD',
          userId: user.id,
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: RESOLVE TENANT CONTEXT
      // If tenantSlug provided, use it. Otherwise, auto-select first tenant.
      // ─────────────────────────────────────────────────────────────────────

      let tenantContext: Awaited<ReturnType<typeof resolveTenantContext>> | null = null;

      if (input.tenantSlug) {
        // Use specified tenant
        tenantContext = await resolveTenantContext(
          scope,
          user,
          input.tenantSlug,
          input.email,
          ipAddress,
          userAgent,
        );
      } else {
        // Auto-select first tenant membership
        const memberships = await membershipRepository.findByUserId(user.id!);
        if (memberships.length > 0) {
          const firstMembership = memberships[0];
          const tenant = await tenantRepository.findById(firstMembership.tenantId);
          if (tenant) {
            tenantContext = { tenant, membership: firstMembership };
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: RECORD SUCCESSFUL LOGIN
      // ─────────────────────────────────────────────────────────────────────

      user.recordLogin();
      const savedUser = await userRepository.save(user);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: GENERATE TOKENS
      // ─────────────────────────────────────────────────────────────────────

      const accessToken = generateAccessToken({
        userId: savedUser.id!,
        email: savedUser.email.toString(),
        tenantId: tenantContext?.tenant.id,
        role: tenantContext?.membership.role.toString(),
      });
      const refreshToken = generateRefreshToken(savedUser.id!);

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
        action: 'LOGIN',
        actorUserId: savedUser.id!,
        metadataDiff: {
          tenantId: tenantContext?.tenant.id,
          tenantSlug: tenantContext?.tenant.slug,
          loginAt: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
        prevHash: prevAuditEvent?.hash ?? null,
      });

      // appendEvent enforces optimistic locking
      const savedAuditEvent = await auditRepository.appendEvent(auditEvent);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 8: BUILD RESPONSE
      // ─────────────────────────────────────────────────────────────────────

      const response: LoginResponse = {
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
        tokenType: 'Bearer',
        user: {
          id: savedUser.id!,
          email: savedUser.email.toString(),
          name: savedUser.name,
          avatarUrl: savedUser.avatarUrl,
        },
        tenant: tenantContext
          ? {
            id: tenantContext.tenant.id!,
            name: tenantContext.tenant.name,
            slug: tenantContext.tenant.slug,
          }
          : undefined,
      };

      return {
        response,
        user: savedUser,
        auditEvent: savedAuditEvent,
      };
    });
  };
}

/**
 * Helper: Resolve tenant context for login
 * 
 * Validates tenant exists, is accessible, and user is a member.
 * Throws appropriate errors for each failure case.
 */
async function resolveTenantContext(
  scope: TransactionScope,
  user: User,
  tenantSlug: string,
  email: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<TenantContext> {
  const { tenantRepository, membershipRepository } = scope;

  // Find tenant by slug
  const tenant = await tenantRepository.findBySlug(tenantSlug);
  if (!tenant) {
    await auditFailedLogin(
      scope,
      email,
      'TENANT_NOT_FOUND',
      ipAddress,
      userAgent,
      user.id,
      user.traceId.toString(),
    );
    throw new NotFoundError('Tenant', tenantSlug, {
      userId: user.id,
    });
  }

  // Check tenant is accessible
  if (!tenant.isAccessible()) {
    await auditFailedLogin(
      scope,
      email,
      'TENANT_INACCESSIBLE',
      ipAddress,
      userAgent,
      user.id,
      user.traceId.toString(),
    );
    throw new InvariantViolationError(
      'Tenant',
      `Tenant '${tenantSlug}' is ${tenant.status.toString()}`,
      { tenantId: tenant.id, status: tenant.status.toString() },
    );
  }

  // Check user is a member
  const membership = await membershipRepository.findByUserAndTenant(
    user.id!,
    tenant.id!,
  );
  if (!membership) {
    await auditFailedLogin(
      scope,
      email,
      'NOT_TENANT_MEMBER',
      ipAddress,
      userAgent,
      user.id,
      user.traceId.toString(),
    );
    // Use AuthenticationError to not reveal membership status
    throw new AuthenticationError('Invalid email or password', {
      internalReason: 'NOT_TENANT_MEMBER',
      userId: user.id,
      tenantId: tenant.id,
    });
  }

  return { tenant, membership };
}

/**
 * Helper: Audit failed login attempts
 * 
 * SECURITY: This creates a trail of failed attempts for:
 * - Detecting brute force attacks
 * - Security incident investigation
 * - Rate limiting decisions
 * 
 * The audit event contains the internal reason (not shown to user).
 */
async function auditFailedLogin(
  scope: TransactionScope,
  email: string,
  reason: AuthFailureReason,
  ipAddress?: string,
  userAgent?: string,
  userId?: string,
  traceId?: string,
): Promise<void> {
  try {
    const auditEvent = AuditEvent.create({
      // Use user's trace if known, otherwise synthetic trace for unknown users
      traceId: traceId ?? `auth-failure:${Date.now()}`,
      resourceType: 'USER',
      resourceId: userId ?? 'UNKNOWN',
      action: 'LOGIN_FAILED',
      actorUserId: userId ?? null,
      metadataDiff: {
        attemptedEmail: email,
        failureReason: reason,
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
      prevHash: null, // Failed login events don't chain (could be attackers)
    });

    // Use save() not appendEvent() for failure events (no chain to append to)
    await scope.auditRepository.save(auditEvent);
  } catch {
    // Don't let audit failure block the auth flow
    console.error('[AUDIT] Failed to record login failure:', reason);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY EXPORT (for backward compatibility during migration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use makeLoginUseCase() factory instead.
 * This export maintains backward compatibility with v1.0 code.
 */
export { makeLoginUseCase as loginUseCase };
