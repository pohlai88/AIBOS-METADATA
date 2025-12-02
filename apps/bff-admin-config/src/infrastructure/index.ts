// apps/bff-admin-config/src/infrastructure/index.ts
/**
 * Infrastructure Layer Exports
 * 
 * This layer adapts the business engine to BFF infrastructure:
 * - DrizzleTransactionManager: Implements ITransactionManager
 * - createRepositoryScope: Composition Root factory
 * - Repository factories: Individual repo creators (for testing)
 */

export { DrizzleTransactionManager, type CreateScopeFn } from "./transaction-manager";
export {
  // Main composition root
  createRepositoryScope,
  // Individual factories (for testing or custom composition)
  createUserRepository,
  createTenantRepository,
  createMembershipRepository,
  createAuditRepository,
  createTokenRepository,
} from "./repository-adapters";

