/**
 * Dependency Injection Container
 *
 * Wires up:
 * - Repositories (Drizzle implementations)
 * - Services (Password, Token, Email, TraceId)
 * - Use Cases (Business logic)
 */

import { db } from "./database";

// Repositories
import {
  TenantRepository,
  UserRepository,
  MembershipRepository,
  AuditRepository,
  TokenRepository,
} from "../../../../business-engine/admin-config/infrastructure/persistence/drizzle/repositories";

// Services
import {
  PasswordService,
  TokenService,
  TraceIdService,
  ConsoleEmailService,
} from "../../../../business-engine/admin-config/infrastructure/services";

/**
 * Container singleton
 */
class Container {
  // Repositories
  public readonly tenantRepository: TenantRepository;
  public readonly userRepository: UserRepository;
  public readonly membershipRepository: MembershipRepository;
  public readonly auditRepository: AuditRepository;
  public readonly tokenRepository: TokenRepository;

  // Services
  public readonly passwordService: PasswordService;
  public readonly tokenService: TokenService;
  public readonly traceIdService: TraceIdService;
  public readonly emailService: ConsoleEmailService;

  constructor() {
    // Initialize repositories
    this.tenantRepository = new TenantRepository(db);
    this.userRepository = new UserRepository(db);
    this.membershipRepository = new MembershipRepository(db);
    this.auditRepository = new AuditRepository(db);
    this.tokenRepository = new TokenRepository(db);

    // Initialize services
    this.passwordService = new PasswordService();
    this.tokenService = new TokenService(
      process.env.JWT_SECRET || "your-secret-key"
    );
    this.traceIdService = new TraceIdService();
    this.emailService = new ConsoleEmailService();
  }
}

// Export singleton instance
export const container = new Container();
