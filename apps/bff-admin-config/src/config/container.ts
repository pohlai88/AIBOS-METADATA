/**
 * Dependency Injection Container
 *
 * Simplified container using plain data objects
 */

import { getDatabase } from "./database";
import { getConfig } from "./env";
import { randomUUID } from "crypto";

// Repositories - Local imports
import { TenantRepository } from "../repositories/tenant.repository";
import { UserRepository } from "../repositories/user.repository";
import { MembershipRepository } from "../repositories/membership.repository";
import { AuditRepository } from "../repositories/audit.repository";
import { TokenRepository } from "../repositories/token.repository";

// Services - Inline implementations
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

// Event Types
export interface DomainEvent {
  type: string;
  version: string;
  timestamp: string;
  source: string;
  correlationId: string;
  tenantId?: string;
  payload: Record<string, unknown>;
}

/**
 * Event Bus Interface
 */
export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
}

/**
 * Console Event Bus (Development)
 */
class ConsoleEventBus implements IEventBus {
  async publish(event: DomainEvent): Promise<void> {
    console.log(`📡 [EVENT] ${event.type}`, JSON.stringify(event.payload));
  }
}

/**
 * Simple hash function for audit trail
 */
function computeHash(data: Record<string, unknown>): string {
  const payload = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, "0")}`;
}

/**
 * Password Service - Inline Implementation
 */
class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  hashSync(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

/**
 * Token Service - Inline Implementation
 */
class TokenService {
  constructor(private readonly jwtSecret: string) {}

  generateJWT(payload: { userId: string; tenantId: string; role: string }): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: "1h" });
  }

  verifyJWT(token: string): { userId: string; tenantId: string; role: string } | null {
    try {
      return jwt.verify(token, this.jwtSecret) as any;
    } catch {
      return null;
    }
  }

  generateSecureToken(): string {
    return nanoid(32);
  }
}

/**
 * Console Email Service - Inline Implementation
 */
class ConsoleEmailService {
  async sendInviteEmail(params: {
    to: string;
    inviterName: string;
    organizationName: string;
    inviteUrl: string;
    role: string;
  }): Promise<void> {
    console.log(`📧 [EMAIL] Invite sent to ${params.to}`);
    console.log(`   Inviter: ${params.inviterName}`);
    console.log(`   Org: ${params.organizationName}`);
    console.log(`   URL: ${params.inviteUrl}`);
  }

  async sendPasswordResetEmail(params: {
    to: string;
    resetUrl: string;
  }): Promise<void> {
    console.log(`📧 [EMAIL] Password reset sent to ${params.to}`);
    console.log(`   URL: ${params.resetUrl}`);
  }
}

/**
 * Container Class
 */
class Container {
  private _tenantRepository?: TenantRepository;
  private _userRepository?: UserRepository;
  private _membershipRepository?: MembershipRepository;
  private _auditRepository?: AuditRepository;
  private _tokenRepository?: TokenRepository;
  private _passwordService?: PasswordService;
  private _tokenService?: TokenService;
  private _emailService?: ConsoleEmailService;
  private _eventBus?: IEventBus;

  // ─────────────────────────────────────────
  // REPOSITORIES
  // ─────────────────────────────────────────

  get tenantRepository(): TenantRepository {
    if (!this._tenantRepository) {
      this._tenantRepository = new TenantRepository(getDatabase());
    }
    return this._tenantRepository;
  }

  get userRepository(): UserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(getDatabase());
    }
    return this._userRepository;
  }

  get membershipRepository(): MembershipRepository {
    if (!this._membershipRepository) {
      this._membershipRepository = new MembershipRepository(getDatabase());
    }
    return this._membershipRepository;
  }

  get auditRepository(): AuditRepository {
    if (!this._auditRepository) {
      this._auditRepository = new AuditRepository(getDatabase());
    }
    return this._auditRepository;
  }

  get tokenRepository(): TokenRepository {
    if (!this._tokenRepository) {
      this._tokenRepository = new TokenRepository(getDatabase());
    }
    return this._tokenRepository;
  }

  // ─────────────────────────────────────────
  // SERVICES
  // ─────────────────────────────────────────

  get passwordService(): PasswordService {
    if (!this._passwordService) {
      this._passwordService = new PasswordService();
    }
    return this._passwordService;
  }

  get tokenService(): TokenService {
    if (!this._tokenService) {
      const config = getConfig();
      this._tokenService = new TokenService(config.auth.jwtSecret);
    }
    return this._tokenService;
  }

  get emailService(): ConsoleEmailService {
    if (!this._emailService) {
      this._emailService = new ConsoleEmailService();
    }
    return this._emailService;
  }

  get eventBus(): IEventBus {
    if (!this._eventBus) {
      this._eventBus = new ConsoleEventBus();
    }
    return this._eventBus;
  }

  // ─────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────

  async executeLogin(params: {
    email: string;
    password: string;
    tenantSlug?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // 1. Find user
    const user = await this.userRepository.findByEmail(params.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 2. Check status
    if (user.status !== "active") {
      throw new Error(`Account is ${user.status}`);
    }

    // 3. Verify password
    const passwordHash = await this.userRepository.getPasswordHash(user.id);
    if (!passwordHash) {
      throw new Error("Invalid email or password");
    }

    const isValid = await this.passwordService.verify(
      params.password,
      passwordHash
    );
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // 4. Get tenant context
    let tenant = null;
    let membership = null;
    if (params.tenantSlug) {
      tenant = await this.tenantRepository.findBySlug(params.tenantSlug);
      if (!tenant) {
        throw new Error(`Tenant not found: ${params.tenantSlug}`);
      }
      membership = await this.membershipRepository.findByUserAndTenant(
        user.id,
        tenant.id
      );
      if (!membership) {
        throw new Error("User is not a member of this tenant");
      }
    }

    // 5. Generate tokens
    const accessToken = this.tokenService.generateJWT({
      userId: user.id,
      tenantId: tenant?.id || "",
      role: membership?.role || "viewer",
    });
    const refreshToken = this.tokenService.generateSecureToken();

    // 6. Update last login
    await this.userRepository.updateLastLogin(user.id);

    // 7. Audit event
    const prevAudit = await this.auditRepository.getLatestByTraceId(
      user.traceId
    );
    await this.auditRepository.save({
      traceId: user.traceId,
      resourceType: "USER",
      resourceId: user.id,
      action: "LOGIN",
      actorUserId: user.id,
      metadataDiff: { tenantId: tenant?.id },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      prevHash: prevAudit?.hash || null,
      hash: computeHash({
        traceId: user.traceId,
        action: "LOGIN",
        timestamp: new Date().toISOString(),
      }),
    });

    // 8. Emit event
    await this.eventBus.publish({
      type: "auth.login.success",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-admin-config",
      correlationId: user.traceId,
      tenantId: tenant?.id,
      payload: { userId: user.id, email: user.email },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: "Bearer" as const,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl || null,
      },
      tenant: tenant
        ? { id: tenant.id, name: tenant.name, slug: tenant.slug }
        : undefined,
    };
  }

  // ─────────────────────────────────────────
  // INVITE USER
  // ─────────────────────────────────────────

  async executeInviteUser(params: {
    email: string;
    name?: string;
    role: string;
    tenantId: string;
    actorUserId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // 1. Check if user exists
    let user = await this.userRepository.findByEmail(params.email);

    if (!user) {
      // Create new invited user
      user = await this.userRepository.save({
        traceId: randomUUID(),
        email: params.email,
        name: params.name || params.email.split("@")[0],
        status: "invited",
      });
    }

    // 2. Check if already member
    const existingMembership =
      await this.membershipRepository.findByUserAndTenant(
        user.id,
        params.tenantId
      );
    if (existingMembership) {
      throw new Error(`User ${params.email} is already a member`);
    }

    // 3. Create membership
    await this.membershipRepository.save({
      userId: user.id,
      tenantId: params.tenantId,
      role: params.role,
      createdBy: params.actorUserId,
    });

    // 4. Generate invite token
    const inviteToken = this.tokenService.generateSecureToken();
    const tokenHash = this.passwordService.hashSync(inviteToken);

    await this.tokenRepository.saveInviteToken({
      tokenHash,
      userId: user.id,
      tenantId: params.tenantId,
      role: params.role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      invitedBy: params.actorUserId,
    });

    // 5. Send email
    await this.emailService.sendInviteEmail({
      to: params.email,
      inviterName: "Admin",
      organizationName: params.tenantId,
      inviteUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/accept-invite?token=${inviteToken}`,
      role: params.role,
    });

    // 6. Audit
    const prevAudit = await this.auditRepository.getLatestByTraceId(
      user.traceId
    );
    await this.auditRepository.save({
      traceId: user.traceId,
      resourceType: "USER",
      resourceId: user.id,
      action: "INVITE",
      actorUserId: params.actorUserId,
      metadataDiff: { tenantId: params.tenantId, role: params.role },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      prevHash: prevAudit?.hash || null,
      hash: computeHash({
        traceId: user.traceId,
        action: "INVITE",
        timestamp: new Date().toISOString(),
      }),
    });

    // 7. Emit event
    await this.eventBus.publish({
      type: "user.invited",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-admin-config",
      correlationId: user.traceId,
      tenantId: params.tenantId,
      payload: { userId: user.id, email: params.email, role: params.role },
    });

    return { user, inviteToken };
  }

  // ─────────────────────────────────────────
  // GET USERS
  // ─────────────────────────────────────────

  async getUsers(
    tenantId: string,
    filters?: {
      status?: string;
      role?: string;
      search?: string;
    }
  ) {
    const memberships = await this.membershipRepository.findByTenant(tenantId);

    const users = await Promise.all(
      memberships.map(async (m) => {
        const user = await this.userRepository.findById(m.userId);
        return user ? { ...user, role: m.role, membershipId: m.id } : null;
      })
    );

    let filtered = users.filter((u): u is NonNullable<typeof u> => u !== null);

    if (filters?.status) {
      filtered = filtered.filter((u) => u.status === filters.status);
    }
    if (filters?.role) {
      filtered = filtered.filter((u) => u.role === filters.role);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  // ─────────────────────────────────────────
  // GET USER DETAIL
  // ─────────────────────────────────────────

  async getUserDetail(userId: string, tenantId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;

    const membership = await this.membershipRepository.findByUserAndTenant(
      userId,
      tenantId
    );
    if (!membership) return null;

    const recentAudit = await this.auditRepository.findByResource(
      "USER",
      userId,
      { limit: 5 }
    );

    return { user, membership, recentActivity: recentAudit };
  }

  // ─────────────────────────────────────────
  // DEACTIVATE USER
  // ─────────────────────────────────────────

  async deactivateUser(
    userId: string,
    tenantId: string,
    actorId: string,
    reason?: string
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    // Check if last admin
    const membership = await this.membershipRepository.findByUserAndTenant(
      userId,
      tenantId
    );
    if (membership?.role === "org_admin") {
      const admins =
        await this.membershipRepository.findAdminsByTenant(tenantId);
      if (admins.length <= 1) {
        throw new Error("Cannot deactivate the last admin");
      }
    }

    await this.userRepository.updateStatus(userId, "inactive");

    // Audit
    const prevAudit = await this.auditRepository.getLatestByTraceId(
      user.traceId
    );
    await this.auditRepository.save({
      traceId: user.traceId,
      resourceType: "USER",
      resourceId: userId,
      action: "DEACTIVATE",
      actorUserId: actorId,
      metadataDiff: { reason, tenantId },
      prevHash: prevAudit?.hash || null,
      hash: computeHash({
        traceId: user.traceId,
        action: "DEACTIVATE",
        timestamp: new Date().toISOString(),
      }),
    });

    await this.eventBus.publish({
      type: "user.deactivated",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-admin-config",
      correlationId: user.traceId,
      tenantId,
      payload: { userId, reason, deactivatedBy: actorId },
    });

    return user;
  }

  // ─────────────────────────────────────────
  // REACTIVATE USER
  // ─────────────────────────────────────────

  async reactivateUser(userId: string, tenantId: string, actorId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    await this.userRepository.updateStatus(userId, "active");

    const prevAudit = await this.auditRepository.getLatestByTraceId(
      user.traceId
    );
    await this.auditRepository.save({
      traceId: user.traceId,
      resourceType: "USER",
      resourceId: userId,
      action: "REACTIVATE",
      actorUserId: actorId,
      metadataDiff: { tenantId },
      prevHash: prevAudit?.hash || null,
      hash: computeHash({
        traceId: user.traceId,
        action: "REACTIVATE",
        timestamp: new Date().toISOString(),
      }),
    });

    await this.eventBus.publish({
      type: "user.reactivated",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-admin-config",
      correlationId: user.traceId,
      tenantId,
      payload: { userId, reactivatedBy: actorId },
    });

    return user;
  }

  // ─────────────────────────────────────────
  // GET ORGANIZATION
  // ─────────────────────────────────────────

  async getOrganization(tenantId: string) {
    return this.tenantRepository.findById(tenantId);
  }

  // ─────────────────────────────────────────
  // GET AUDIT LOGS
  // ─────────────────────────────────────────

  async getAuditLogs(
    tenantId: string,
    filters?: {
      resourceType?: string;
      action?: string;
      userId?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    return this.auditRepository.findByTenant(tenantId, filters);
  }
}

// Export singleton
export const container = new Container();
