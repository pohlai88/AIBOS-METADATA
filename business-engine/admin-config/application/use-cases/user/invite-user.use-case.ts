// business-engine/admin-config/application/use-cases/user/invite-user.use-case.ts
/**
 * InviteUserUseCase (v1.1 Hardened)
 * 
 * GRCD F-USER-1: Invite users via email to a specific tenant with an initial role.
 * 
 * v1.1 Hardening:
 * - Transaction boundary via ITransactionManager
 * - Permission checks inside use case (not relying on BFF)
 * - Domain error taxonomy (UnauthorizedError, ConflictError, etc.)
 * - Optimistic locking on audit chain via appendEvent
 * - Audit trail for denied attempts
 */

import { User } from '../../../domain/entities/user.entity';
import { Membership } from '../../../domain/entities/membership.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import type { ITransactionManager, TransactionScope } from '../../ports/outbound/transaction.manager.port';
import type { InviteUserInput } from '../../../contracts/user.contract';

/**
 * Dependencies injected by BFF (NOT in TransactionScope)
 * These are stateless functions that don't need transaction binding.
 */
export interface InviteUserDependencies {
  hashToken: (token: string) => string;
  generateToken: () => string;
}

/**
 * Actor context - who is performing this action
 */
export interface InviteUserActor {
  userId: string;
  tenantId: string;
  // Role is loaded inside use case for security
}

/**
 * Command input
 */
export interface InviteUserCommand {
  input: InviteUserInput;
  actor: InviteUserActor;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Result output
 */
export interface InviteUserResult {
  user: User;
  membership: Membership;
  inviteToken: string; // PLAINTEXT - send via email, NEVER log this!
  auditEvent: AuditEvent;
}

/**
 * InviteUserUseCase Factory
 * 
 * Creates a use case instance with transaction manager and dependencies.
 * This follows the "factory function" pattern for dependency injection.
 * 
 * @example
 * const inviteUser = makeInviteUserUseCase(txManager, deps);
 * const result = await inviteUser(command);
 */
export function makeInviteUserUseCase(
  transactionManager: ITransactionManager,
  deps: InviteUserDependencies,
) {
  return async function inviteUserUseCase(
    command: InviteUserCommand,
  ): Promise<InviteUserResult> {
    const { input, actor, ipAddress, userAgent } = command;
    const { hashToken, generateToken } = deps;

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACTION BOUNDARY
    // All writes happen atomically. If any step fails, everything rolls back.
    // ─────────────────────────────────────────────────────────────────────────
    return transactionManager.run(async (scope: TransactionScope) => {
      const {
        userRepository,
        membershipRepository,
        tokenRepository,
        auditRepository,
      } = scope;

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: PERMISSION CHECK (v1.1 - Inside business engine)
      // ─────────────────────────────────────────────────────────────────────
      
      // Verify actor is a member of the target tenant
      const actorMembership = await membershipRepository.findByUserAndTenant(
        actor.userId,
        input.tenantId,
      );

      if (!actorMembership) {
        // Actor is not a member of this tenant - audit and reject
        await auditDeniedAttempt(scope, actor, input, 'ACTOR_NOT_MEMBER', ipAddress, userAgent);
        throw new UnauthorizedError(
          'INVITE_USER',
          'Actor is not a member of the target tenant',
          { 
            actorUserId: actor.userId, 
            targetTenantId: input.tenantId,
            policyCode: 'F-PERM-INVITE-1' 
          },
        );
      }

      // Check if actor's role allows inviting users
      if (!actorMembership.role.canInviteUser()) {
        // Actor doesn't have permission - audit and reject
        await auditDeniedAttempt(scope, actor, input, 'ROLE_NOT_ALLOWED', ipAddress, userAgent);
        throw new UnauthorizedError(
          'INVITE_USER',
          `Role '${actorMembership.role.toString()}' cannot invite users`,
          { 
            actorUserId: actor.userId,
            actorRole: actorMembership.role.toString(),
            requiredRoles: ['platform_admin', 'org_admin'],
            policyCode: 'F-PERM-INVITE-1' 
          },
        );
      }

      // Check if actor can assign the requested role
      const requestedRole = input.role;
      if (!actorMembership.role.canAssignRole(Membership.createRole(requestedRole))) {
        await auditDeniedAttempt(scope, actor, input, 'CANNOT_ASSIGN_ROLE', ipAddress, userAgent);
        throw new UnauthorizedError(
          'INVITE_USER',
          `Role '${actorMembership.role.toString()}' cannot assign role '${requestedRole}'`,
          { 
            actorRole: actorMembership.role.toString(),
            requestedRole,
            policyCode: 'F-PERM-ROLE-1' 
          },
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: CHECK IF USER ALREADY EXISTS
      // ─────────────────────────────────────────────────────────────────────
      
      let user = await userRepository.findByEmail(input.email);
      let isNewUser = false;

      if (!user) {
        // Create new invited user
        user = User.createInvited({
          email: input.email,
          name: input.name,
        });
        user = await userRepository.save(user);
        isNewUser = true;
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: CHECK IF MEMBERSHIP ALREADY EXISTS
      // ─────────────────────────────────────────────────────────────────────
      
      const existingMembership = await membershipRepository.findByUserAndTenant(
        user.id!,
        input.tenantId,
      );

      if (existingMembership) {
        throw new ConflictError(
          'Membership',
          `${input.email}:${input.tenantId}`,
          `User '${input.email}' is already a member of this tenant`,
          { userId: user.id, tenantId: input.tenantId },
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: CREATE MEMBERSHIP
      // ─────────────────────────────────────────────────────────────────────
      
      const membership = Membership.create({
        userId: user.id!,
        tenantId: input.tenantId,
        role: input.role,
        createdBy: actor.userId,
      });
      const savedMembership = await membershipRepository.save(membership);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: GENERATE INVITE TOKEN
      // GRCD F-USER-1: invite_token + expiry
      // ─────────────────────────────────────────────────────────────────────
      
      const plainToken = generateToken();
      const tokenHash = hashToken(plainToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await tokenRepository.saveInviteToken({
        tokenHash,
        userId: user.id!,
        tenantId: input.tenantId,
        role: input.role,
        expiresAt,
        invitedBy: actor.userId,
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: APPEND AUDIT EVENT (with optimistic locking)
      // GRCD F-TRACE-2: Every lifecycle action MUST generate an audit event
      // ─────────────────────────────────────────────────────────────────────
      
      const prevAuditEvent = await auditRepository.getLatestByTraceId(
        user.traceId.toString(),
      );

      const auditEvent = AuditEvent.create({
        traceId: user.traceId.toString(),
        resourceType: 'USER',
        resourceId: user.id!,
        action: 'INVITE',
        actorUserId: actor.userId,
        metadataDiff: {
          tenantId: input.tenantId,
          role: input.role,
          isNewUser,
          invitedEmail: input.email,
        },
        ipAddress,
        userAgent,
        prevHash: prevAuditEvent?.hash ?? null,
      });

      // appendEvent enforces optimistic locking - throws AuditConcurrencyError if fork
      const savedAuditEvent = await auditRepository.appendEvent(auditEvent);

      // ─────────────────────────────────────────────────────────────────────
      // RETURN RESULT
      // Note: plainToken is SENSITIVE - BFF must not log it!
      // ─────────────────────────────────────────────────────────────────────
      
      return {
        user,
        membership: savedMembership,
        inviteToken: plainToken,
        auditEvent: savedAuditEvent,
      };
    });
  };
}

/**
 * Helper: Audit denied permission attempts
 * This creates an audit trail of blocked attempts (governance gold).
 */
async function auditDeniedAttempt(
  scope: TransactionScope,
  actor: InviteUserActor,
  input: InviteUserInput,
  reason: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    // Create a "denial" audit event
    // We use the actor's trace context since the target user may not exist yet
    const auditEvent = AuditEvent.create({
      traceId: `denial:${actor.userId}:${Date.now()}`, // Synthetic trace for denials
      resourceType: 'USER',
      resourceId: actor.userId, // The actor who was denied
      action: 'INVITE_DENIED',
      actorUserId: actor.userId,
      metadataDiff: {
        targetEmail: input.email,
        targetTenantId: input.tenantId,
        requestedRole: input.role,
        denialReason: reason,
      },
      ipAddress,
      userAgent,
      prevHash: null, // Denial events start their own chain
    });

    // Use save() not appendEvent() for denial events (no chain to append to)
    await scope.auditRepository.save(auditEvent);
  } catch {
    // Don't let audit failure block the permission denial
    // But log it for ops visibility
    console.error('[AUDIT] Failed to record denial event:', reason);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY EXPORT (for backward compatibility during migration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use makeInviteUserUseCase() factory instead.
 * This export maintains backward compatibility with v1.0 code.
 */
export { makeInviteUserUseCase as inviteUserUseCase };
