// business-engine/admin-config/application/use-cases/user/invite-user.use-case.ts
import { User } from '../../../domain/entities/user.entity';
import { Membership } from '../../../domain/entities/membership.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import type { IUserRepository } from '../../ports/outbound/user.repository.port';
import type { IMembershipRepository } from '../../ports/outbound/membership.repository.port';
import type { IAuditRepository } from '../../ports/outbound/audit.repository.port';
import type { ITokenRepository } from '../../ports/outbound/token.repository.port';
import type { InviteUserInput } from '../../../contracts/user.contract';

/**
 * InviteUserUseCase
 * 
 * GRCD F-USER-1: Invite users via email to a specific tenant with an initial role.
 */
export interface InviteUserDependencies {
  userRepository: IUserRepository;
  membershipRepository: IMembershipRepository;
  auditRepository: IAuditRepository;
  tokenRepository: ITokenRepository;
  hashToken: (token: string) => string; // Injected hashing function
  generateToken: () => string; // Injected token generator
}

export interface InviteUserCommand {
  input: InviteUserInput;
  actorUserId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface InviteUserResult {
  user: User;
  membership: Membership;
  inviteToken: string; // Plaintext token to send via email
  auditEvent: AuditEvent;
}

export async function inviteUserUseCase(
  command: InviteUserCommand,
  deps: InviteUserDependencies,
): Promise<InviteUserResult> {
  const { input, actorUserId, ipAddress, userAgent } = command;
  const {
    userRepository,
    membershipRepository,
    auditRepository,
    tokenRepository,
    hashToken,
    generateToken,
  } = deps;

  // 1. Check if user already exists
  let user = await userRepository.findByEmail(input.email);
  let isNewUser = false;

  if (!user) {
    // 2a. Create new invited user
    user = User.createInvited({
      email: input.email,
      name: input.name,
    });
    user = await userRepository.save(user);
    isNewUser = true;
  }

  // 3. Check if membership already exists
  const existingMembership = await membershipRepository.findByUserAndTenant(
    user.id!,
    input.tenantId,
  );
  if (existingMembership) {
    throw new Error(
      `User ${input.email} is already a member of this tenant`,
    );
  }

  // 4. Create membership
  const membership = Membership.create({
    userId: user.id!,
    tenantId: input.tenantId,
    role: input.role,
    createdBy: actorUserId,
  });
  const savedMembership = await membershipRepository.save(membership);

  // 5. Generate invite token
  // GRCD F-USER-1: invite_token + expiry
  const plainToken = generateToken();
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await tokenRepository.saveInviteToken({
    tokenHash,
    userId: user.id!,
    tenantId: input.tenantId,
    role: input.role,
    expiresAt,
    invitedBy: actorUserId,
  });

  // 6. Get previous audit event for hash chain
  const prevAuditEvent = await auditRepository.getLatestByTraceId(
    user.traceId.toString(),
  );

  // 7. Create audit event
  const auditEvent = AuditEvent.create({
    traceId: user.traceId.toString(),
    resourceType: 'USER',
    resourceId: user.id!,
    action: 'INVITE',
    actorUserId,
    metadataDiff: {
      tenantId: input.tenantId,
      role: input.role,
      isNewUser,
    },
    ipAddress,
    userAgent,
    prevHash: prevAuditEvent?.hash ?? null,
  });

  const savedAuditEvent = await auditRepository.save(auditEvent);

  return {
    user,
    membership: savedMembership,
    inviteToken: plainToken, // Send this via email
    auditEvent: savedAuditEvent,
  };
}

