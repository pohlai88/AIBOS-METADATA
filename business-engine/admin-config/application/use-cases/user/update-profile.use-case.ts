// business-engine/admin-config/application/use-cases/user/update-profile.use-case.ts
/**
 * UpdateProfileUseCase (v1.1 Hardened)
 * 
 * GRCD F-USER-6: "My Profile" page for users to update name, avatar, locale, etc.
 * 
 * v1.1 Hardening:
 * - Transaction boundary via ITransactionManager
 * - Domain error taxonomy (NotFoundError)
 * - Optimistic locking on audit chain via appendEvent
 * 
 * NOTE: No permission check needed - users can only update their own profile.
 * The userId comes from the authenticated JWT, not from user input.
 */

import type { User } from '../../../domain/entities/user.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import type {
  ITransactionManager,
  TransactionScope,
} from '../../ports/outbound/transaction.manager.port';
import type { UpdateProfileInput } from '../../../contracts/user.contract';

/**
 * Command input
 */
export interface UpdateProfileCommand {
  userId: string; // From authenticated JWT (NOT from user input)
  input: UpdateProfileInput;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Result output
 */
export interface UpdateProfileResult {
  user: User;
  auditEvent: AuditEvent;
}

/**
 * UpdateProfileUseCase Factory
 * 
 * Creates a use case instance with transaction manager.
 * 
 * @example
 * const updateProfile = makeUpdateProfileUseCase(txManager);
 * 
 * // userId comes from JWT, NOT from user input
 * const result = await updateProfile({
 *   userId: authContext.userId, // From middleware
 *   input: { name, avatarUrl, locale, timezone },
 * });
 */
export function makeUpdateProfileUseCase(
  transactionManager: ITransactionManager,
) {
  return async function updateProfileUseCase(
    command: UpdateProfileCommand,
  ): Promise<UpdateProfileResult> {
    const { userId, input, ipAddress, userAgent } = command;

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
      // STEP 2: CAPTURE BEFORE STATE FOR AUDIT
      // ─────────────────────────────────────────────────────────────────────

      const beforeState = {
        name: user.name,
        avatarUrl: user.avatarUrl,
        locale: user.locale,
        timezone: user.timezone,
      };

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: APPLY UPDATES
      // ─────────────────────────────────────────────────────────────────────

      user.updateProfile({
        name: input.name,
        avatarUrl: input.avatarUrl,
        locale: input.locale,
        timezone: input.timezone,
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: PERSIST USER
      // ─────────────────────────────────────────────────────────────────────

      const savedUser = await userRepository.save(user);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: APPEND AUDIT EVENT (with optimistic locking)
      // GRCD C-ORG-3: All changes to personal data MUST be logged with trace_id
      // ─────────────────────────────────────────────────────────────────────

      const prevAuditEvent = await auditRepository.getLatestByTraceId(
        savedUser.traceId.toString(),
      );

      const afterState = {
        name: savedUser.name,
        avatarUrl: savedUser.avatarUrl,
        locale: savedUser.locale,
        timezone: savedUser.timezone,
      };

      const auditEvent = AuditEvent.create({
        traceId: savedUser.traceId.toString(),
        resourceType: 'USER',
        resourceId: savedUser.id!,
        action: 'PROFILE_UPDATE',
        actorUserId: userId, // Self-action
        metadataDiff: {
          before: beforeState,
          after: afterState,
          changedFields: getChangedFields(beforeState, afterState),
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
 * @deprecated Use makeUpdateProfileUseCase() factory instead.
 */
export { makeUpdateProfileUseCase as updateProfileUseCase };
