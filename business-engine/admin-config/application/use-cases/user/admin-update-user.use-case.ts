// business-engine/admin-config/application/use-cases/user/admin-update-user.use-case.ts
/**
 * AdminUpdateUserUseCase (v1.1 Hardened)
 * 
 * GRCD F-USER-7: Admins can update other users' profiles and roles
 * 
 * v1.1 Hardening:
 * - Transaction boundary via ITransactionManager
 * - Permission check (org_admin+ can update users in their tenant)
 * - Role change validation (can't promote above your own level)
 * - Optimistic locking on audit chain via appendEvent
 * 
 * Different from UpdateProfileUseCase:
 * - UpdateProfileUseCase: User updates their OWN profile
 * - AdminUpdateUserUseCase: Admin updates ANOTHER user's profile/role
 */

import type { User } from '../../../domain/entities/user.entity';
import type { Membership } from '../../../domain/entities/membership.entity';
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
export interface AdminUpdateUserCommand {
    targetUserId: string;
    actor: {
        userId: string;
        tenantId: string;
    };
    input: {
        name?: string;
        avatarUrl?: string;
        role?: 'org_admin' | 'member' | 'viewer';
    };
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Result output
 */
export interface AdminUpdateUserResult {
    user: User;
    membership?: Membership;
    auditEvent: AuditEvent;
}

/**
 * AdminUpdateUserUseCase Factory
 * 
 * Creates a use case instance with transaction manager.
 * 
 * @example
 * const adminUpdateUser = makeAdminUpdateUserUseCase(txManager);
 * 
 * const result = await adminUpdateUser({
 *   targetUserId: 'user-to-update',
 *   actor: { userId: 'admin-id', tenantId: 'tenant-id' },
 *   input: { name: 'New Name', role: 'member' },
 * });
 */
export function makeAdminUpdateUserUseCase(
    transactionManager: ITransactionManager,
) {
    return async function adminUpdateUserUseCase(
        command: AdminUpdateUserCommand,
    ): Promise<AdminUpdateUserResult> {
        const { targetUserId, actor, input, ipAddress, userAgent } = command;

        // ─────────────────────────────────────────────────────────────────────────
        // TRANSACTION BOUNDARY
        // All writes happen atomically. If any step fails, everything rolls back.
        // ─────────────────────────────────────────────────────────────────────────
        return transactionManager.run(async (scope: TransactionScope) => {
            const { userRepository, membershipRepository, auditRepository } = scope;

            // ─────────────────────────────────────────────────────────────────────
            // STEP 1: PERMISSION CHECK
            // Only org_admin or platform_admin can update other users
            // ─────────────────────────────────────────────────────────────────────

            const actorMembership = await membershipRepository.findByUserAndTenant(
                actor.userId,
                actor.tenantId,
            );

            if (!actorMembership || !actorMembership.role.canUpdateOtherUsers()) {
                throw new UnauthorizedError(
                    'ADMIN_UPDATE_USER',
                    'Only administrators can update other users',
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

            const beforeState = {
                name: user.name,
                avatarUrl: user.avatarUrl,
                role: targetMembership.role.toString(),
            };

            // ─────────────────────────────────────────────────────────────────────
            // STEP 5: UPDATE USER PROFILE (if any fields provided)
            // ─────────────────────────────────────────────────────────────────────

            let userUpdated = false;
            if (input.name !== undefined || input.avatarUrl !== undefined) {
                user.updateProfile({
                    name: input.name,
                    avatarUrl: input.avatarUrl,
                });
                userUpdated = true;
            }

            // ─────────────────────────────────────────────────────────────────────
            // STEP 6: UPDATE ROLE (if provided)
            // ─────────────────────────────────────────────────────────────────────

            let membershipUpdated = false;
            let savedMembership: Membership | undefined;

            if (input.role !== undefined) {
                const currentRole = actorMembership.role;

                // Validate: Can't change roles without permission
                if (!currentRole.canChangeUserRole()) {
                    throw new UnauthorizedError(
                        'CHANGE_ROLE',
                        'You do not have permission to change user roles',
                    );
                }

                // Safety: Can't change your own role
                if (targetUserId === actor.userId) {
                    throw new InvariantViolationError(
                        'SELF_ROLE_CHANGE',
                        'You cannot change your own role',
                    );
                }

                // Update membership role (pass actor's role for validation)
                // The Membership entity's changeRole method will validate if actor can assign this role
                try {
                    targetMembership.changeRole(input.role, actorMembership.role, actor.userId);
                } catch (error) {
                    throw new UnauthorizedError(
                        'INVALID_ROLE_ASSIGNMENT',
                        error instanceof Error ? error.message : 'Cannot assign this role',
                    );
                }
                savedMembership = await membershipRepository.save(targetMembership);
                membershipUpdated = true;
            }

            // ─────────────────────────────────────────────────────────────────────
            // STEP 7: PERSIST USER (if updated)
            // ─────────────────────────────────────────────────────────────────────

            const savedUser = userUpdated
                ? await userRepository.save(user)
                : user;

            // ─────────────────────────────────────────────────────────────────────
            // STEP 8: APPEND AUDIT EVENT (with optimistic locking)
            // ─────────────────────────────────────────────────────────────────────

            const prevAuditEvent = await auditRepository.getLatestByTraceId(
                savedUser.traceId.toString(),
            );

            const afterState = {
                name: savedUser.name,
                avatarUrl: savedUser.avatarUrl,
                role: savedMembership?.role.toString() ?? targetMembership.role.toString(),
            };

            const changedFields = getChangedFields(beforeState, afterState);

            // Only create audit if something actually changed
            if (changedFields.length === 0) {
                throw new InvariantViolationError(
                    'NO_CHANGES',
                    'No changes were made to the user',
                );
            }

            const auditEvent = AuditEvent.create({
                traceId: savedUser.traceId.toString(),
                resourceType: 'USER',
                resourceId: savedUser.id!,
                action: 'ADMIN_UPDATE',
                actorUserId: actor.userId,
                metadataDiff: {
                    before: beforeState,
                    after: afterState,
                    changedFields,
                },
                ipAddress,
                userAgent,
                prevHash: prevAuditEvent?.hash ?? null,
            });

            // appendEvent enforces optimistic locking
            const savedAuditEvent = await auditRepository.appendEvent(auditEvent);

            return {
                user: savedUser,
                membership: savedMembership,
                auditEvent: savedAuditEvent,
            };
        });
    };
}

/**
 * Helper: Get list of fields that actually changed
 */
function getChangedFields(
    before: Record<string, unknown>,
    after: Record<string, unknown>,
): string[] {
    const changed: string[] = [];
    for (const key of Object.keys(after)) {
        if (before[key] !== after[key]) {
            changed.push(key);
        }
    }
    return changed;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY EXPORT (for backward compatibility during migration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use makeAdminUpdateUserUseCase() factory instead.
 */
export { makeAdminUpdateUserUseCase as adminUpdateUserUseCase };

