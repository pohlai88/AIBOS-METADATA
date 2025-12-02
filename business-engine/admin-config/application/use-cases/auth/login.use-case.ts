// business-engine/admin-config/application/use-cases/auth/login.use-case.ts
import { User } from '../../../domain/entities/user.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import type { IUserRepository } from '../../ports/outbound/user.repository.port';
import type { IMembershipRepository } from '../../ports/outbound/membership.repository.port';
import type { ITenantRepository } from '../../ports/outbound/tenant.repository.port';
import type { IAuditRepository } from '../../ports/outbound/audit.repository.port';
import type { LoginInput, LoginResponse } from '../../../contracts/auth.contract';

/**
 * LoginUseCase
 * 
 * GRCD F-USER-4: Login (email + password)
 * GRCD F-API-1: /auth/login endpoint
 */
export interface LoginDependencies {
  userRepository: IUserRepository;
  membershipRepository: IMembershipRepository;
  tenantRepository: ITenantRepository;
  auditRepository: IAuditRepository;
  verifyPassword: (password: string, hash: string) => Promise<boolean>;
  generateAccessToken: (payload: {
    userId: string;
    email: string;
    tenantId?: string;
    role?: string;
  }) => string;
  generateRefreshToken: (userId: string) => string;
}

export interface LoginCommand {
  input: LoginInput;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResult {
  response: LoginResponse;
  user: User;
  auditEvent: AuditEvent;
}

export async function loginUseCase(
  command: LoginCommand,
  deps: LoginDependencies,
): Promise<LoginResult> {
  const { input, ipAddress, userAgent } = command;
  const {
    userRepository,
    membershipRepository,
    tenantRepository,
    auditRepository,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
  } = deps;

  // 1. Find user by email
  const user = await userRepository.findByEmail(input.email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // 2. Check user can login
  if (!user.canLogin()) {
    throw new Error(`User account is ${user.status.toString()}`);
  }

  // 3. Verify password
  const passwordHash = await userRepository.getPasswordHash(user.id!);
  if (!passwordHash) {
    throw new Error('Invalid email or password');
  }

  const isValid = await verifyPassword(input.password, passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // 4. Get tenant context (if tenantSlug provided)
  let tenant = null;
  let membership = null;
  if (input.tenantSlug) {
    tenant = await tenantRepository.findBySlug(input.tenantSlug);
    if (!tenant) {
      throw new Error(`Tenant not found: ${input.tenantSlug}`);
    }
    if (!tenant.isAccessible()) {
      throw new Error(`Tenant is ${tenant.status.toString()}`);
    }
    membership = await membershipRepository.findByUserAndTenant(
      user.id!,
      tenant.id!,
    );
    if (!membership) {
      throw new Error('User is not a member of this tenant');
    }
  }

  // 5. Record login
  user.recordLogin();
  const savedUser = await userRepository.save(user);

  // 6. Generate tokens
  const accessToken = generateAccessToken({
    userId: savedUser.id!,
    email: savedUser.email.toString(),
    tenantId: tenant?.id,
    role: membership?.role.toString(),
  });
  const refreshToken = generateRefreshToken(savedUser.id!);

  // 7. Create audit event
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
      tenantId: tenant?.id,
      tenantSlug: tenant?.slug,
    },
    ipAddress,
    userAgent,
    prevHash: prevAuditEvent?.hash ?? null,
  });

  const savedAuditEvent = await auditRepository.save(auditEvent);

  // 8. Build response
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
    tenant: tenant
      ? {
          id: tenant.id!,
          name: tenant.name,
          slug: tenant.slug,
        }
      : undefined,
  };

  return {
    response,
    user: savedUser,
    auditEvent: savedAuditEvent,
  };
}

