// apps/bff-admin-config/src/infrastructure/transaction-manager.ts
/**
 * Drizzle Transaction Manager
 * 
 * Implements ITransactionManager from the business engine.
 * Provides atomic transactions with all repositories bound to the same tx.
 * 
 * COMPOSITION ROOT PRINCIPLE:
 * - The BFF creates the concrete repository implementations
 * - The Business Engine only knows about the interfaces (ports)
 * - This manager bridges them via a scope factory
 */

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  ITransactionManager,
  TransactionScope,
} from "@business-engine/admin-config";

import * as schema from "../db/schema";

/**
 * Type for the scope factory function
 * BFF provides this to inject concrete implementations
 */
export type CreateScopeFn = (
  tx: PostgresJsDatabase<typeof schema>,
) => TransactionScope;

/**
 * DrizzleTransactionManager
 * 
 * Wraps Drizzle's transaction support to provide a strongly-typed
 * TransactionScope to the business engine use cases.
 * 
 * @example
 * const txManager = new DrizzleTransactionManager(db, createRepositoryScope);
 * const login = makeLoginUseCase(txManager, cryptoDeps);
 */
export class DrizzleTransactionManager implements ITransactionManager {
  constructor(
    private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly createScope: CreateScopeFn,
  ) {}

  async run<T>(operation: (scope: TransactionScope) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      // Create all repositories bound to this transaction
      // The createScope function is provided by the BFF (Composition Root)
      const scope = this.createScope(tx);

      // Execute the use case with transactional scope
      return operation(scope);
    });
  }
}

