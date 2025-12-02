// business-engine/admin-config/application/use-cases/user/accept-invite.use-case.ts
import { User } from '../../../domain/entities/user.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import type { IUserRepository } from '../../ports/outbound/user.repository.port';
import type { IAuditRepository } from '../../ports/outbound/audit.repository.port';
import type { ITokenRepository } from '../../ports/outbound/token.repository.port';
import type { AcceptInviteInput } from '../../../contracts/user.contract';

/**
 * AcceptInviteUseCase
 * 
 * GRCD F-USER-2: Accept invite and set password.
 */
export interface AcceptInviteDependencies {
  userRepository: IUserRepository;
  auditRepository: IAuditRepository;
  tokenRepository: ITokenRepository;
  hashToken: (token: string) => string;
  hashPassword: (password: string) => Promise<string>;
}

export interface AcceptInviteCommand {
  input: AcceptInviteInput;
  ipAddress?: string;
  userAgent?: string;
}

export interface AcceptInviteResult {
  user: User;
  auditEvent: AuditEvent;
}

export async function acceptInviteUseCase(
  command: AcceptInviteCommand,
  deps: AcceptInviteDependencies,
): Promise<AcceptInviteResult> {
  const { input, ipAddress, userAgent } = command;
  const { userRepository, auditRepository, tokenRepository, hashToken, hashPassword } = deps;

  // 1. Find and validate token
  const tokenHash = hashToken(input.token);
  const inviteToken = await tokenRepository.findInviteTokenByHash(tokenHash);

  if (!inviteToken) {
    throw new Error('Invalid invite token');
  }

  if (inviteToken.isUsed) {
    throw new Error('Invite token has already been used');
  }

  if (inviteToken.expiresAt < new Date()) {
    throw new Error('Invite token has expired');
  }

  // 2. Load user
  const user = await userRepository.findById(inviteToken.userId);
  if (!user) {
    throw new Error('User not found');
  }

  // 3. Hash the password
  // GRCD C-ORG-2: Password NOT logged in plaintext
  const passwordHash = await hashPassword(input.password);

  // 4. Accept invite (transition status + set password)
  user.acceptInvite(passwordHash, input.name);

  // 5. Persist user
  const savedUser = await userRepository.save(user);

  // 6. Mark token as used
  // GRCD F-USER-5: Token invalid after use
  await tokenRepository.markInviteTokenUsed(inviteToken.id);

  // 7. Get previous audit event for hash chain
  const prevAuditEvent = await auditRepository.getLatestByTraceId(
    savedUser.traceId.toString(),
  );

  // 8. Create audit event
  const auditEvent = AuditEvent.create({
    traceId: savedUser.traceId.toString(),
    resourceType: 'USER',
    resourceId: savedUser.id!,
    action: 'ACCEPT_INVITE',
    actorUserId: savedUser.id!, // Self-action
    metadataDiff: {
      tenantId: inviteToken.tenantId,
      statusChange: { from: 'invited', to: 'active' },
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

