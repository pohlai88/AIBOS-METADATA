// business-engine/admin-config/application/ports/outbound/transaction.manager.port.ts
import type { IUserRepository } from './user.repository.port';
import type { ITenantRepository } from './tenant.repository.port';
import type { IMembershipRepository } from './membership.repository.port';
import type { IAuditRepository } from './audit.repository.port';
import type { ITokenRepository } from './token.repository.port';

/**
 * TransactionScope
 * 
 * A strongly-typed context containing all repositories bound to a single transaction.
 * Use cases receive this from the TransactionManager and use these repos
 * instead of the "naked" repos.
 * 
 * This ensures:
 * 1. All writes happen in one atomic transaction
 * 2. Use case code doesn't need to pass `scope` to every method
 * 3. "Read your own writes" consistency within the transaction
 * 
 * @example
 * txManager.run(async (scope) => {
 *   const user = await scope.userRepository.findByEmail(email);
 *   await scope.userRepository.save(user);
 *   await scope.auditRepository.appendEvent(event);
 *   // Both writes commit together or both roll back
 * });
 */
export interface TransactionScope {
  userRepository: IUserRepository;
  tenantRepository: ITenantRepository;
  membershipRepository: IMembershipRepository;
  auditRepository: IAuditRepository;
  tokenRepository: ITokenRepository;
}

/**
 * ITransactionManager
 * 
 * Abstraction for database transactions.
 * The BFF implements this using Drizzle/Prisma/TypeORM transaction primitives.
 * 
 * INVARIANT E-TX-1:
 * Any use case that writes to more than one repository MUST be executed
 * within a single transaction provided by this manager.
 * 
 * @example BFF Implementation (Drizzle)
 * ```typescript
 * class DrizzleTransactionManager implements ITransactionManager {
 *   constructor(private db: DrizzleClient) {}
 *   
 *   async run<T>(operation: (scope: TransactionScope) => Promise<T>): Promise<T> {
 *     return this.db.transaction(async (tx) => {
 *       const scope: TransactionScope = {
 *         userRepository: new DrizzleUserRepository(tx),
 *         tenantRepository: new DrizzleTenantRepository(tx),
 *         membershipRepository: new DrizzleMembershipRepository(tx),
 *         auditRepository: new DrizzleAuditRepository(tx),
 *         tokenRepository: new DrizzleTokenRepository(tx),
 *       };
 *       return operation(scope);
 *     });
 *   }
 * }
 * ```
 */
export interface ITransactionManager {
  /**
   * Executes a callback within a transactional scope.
   * 
   * - If the callback resolves, the transaction COMMITS.
   * - If the callback throws, the transaction ROLLS BACK.
   * 
   * @param operation The business logic to execute atomically
   * @returns The result of the operation
   * @throws Re-throws any error from the operation after rollback
   */
  run<T>(operation: (scope: TransactionScope) => Promise<T>): Promise<T>;
}

