// business-engine/admin-config/application/use-cases/user/update-profile.use-case.ts
import { User } from '../../../domain/entities/user.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import type { IUserRepository } from '../../ports/outbound/user.repository.port';
import type { IAuditRepository } from '../../ports/outbound/audit.repository.port';
import type { UpdateProfileInput } from '../../../contracts/user.contract';

/**
 * UpdateProfileUseCase
 * 
 * GRCD F-USER-6: "My Profile" page for users to update name, avatar, locale, etc.
 */
export interface UpdateProfileDependencies {
  userRepository: IUserRepository;
  auditRepository: IAuditRepository;
}

export interface UpdateProfileCommand {
  userId: string;
  input: UpdateProfileInput;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateProfileResult {
  user: User;
  auditEvent: AuditEvent;
}

export async function updateProfileUseCase(
  command: UpdateProfileCommand,
  deps: UpdateProfileDependencies,
): Promise<UpdateProfileResult> {
  const { userId, input, ipAddress, userAgent } = command;
  const { userRepository, auditRepository } = deps;

  // 1. Load user
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // 2. Capture before state
  const beforeState = user.toPublicDTO();

  // 3. Apply updates
  user.updateProfile({
    name: input.name,
    avatarUrl: input.avatarUrl,
    locale: input.locale,
    timezone: input.timezone,
  });

  // 4. Persist user
  const savedUser = await userRepository.save(user);

  // 5. Get previous audit event for hash chain
  const prevAuditEvent = await auditRepository.getLatestByTraceId(
    savedUser.traceId.toString(),
  );

  // 6. Create audit event
  // GRCD C-ORG-3: All changes to personal data MUST be logged with trace_id
  const auditEvent = AuditEvent.create({
    traceId: savedUser.traceId.toString(),
    resourceType: 'USER',
    resourceId: savedUser.id!,
    action: 'PROFILE_UPDATE',
    actorUserId: userId, // Self-action
    metadataDiff: {
      before: beforeState,
      after: savedUser.toPublicDTO(),
    },
    ipAddress,
    userAgent,
    prevHash: prevAuditEvent?.hash ?? null,
  });

  const savedAuditEvent = await auditRepository.save(auditEvent);

  return {
    user: savedUser,
    auditEvent: savedAuditEvent,
  };
}

