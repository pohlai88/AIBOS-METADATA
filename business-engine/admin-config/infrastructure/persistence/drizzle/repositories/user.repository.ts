import { eq, and, isNull, inArray, or, ilike } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { IUserRepository } from "../../../../application/ports/outbound/user.repository.port";
import type { User } from "../../../../domain/entities/user.entity";
import { userSchema } from "../schema/user.schema";
import * as schema from "../schema";

/**
 * User Repository - Drizzle Implementation
 * 
 * Handles user CRUD with email uniqueness and soft deletes
 */
export class UserRepository implements IUserRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const [created] = await this.db
      .insert(userSchema)
      .values({
        email: user.email,
        passwordHash: user.passwordHash,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        status: user.status,
        emailVerified: user.emailVerified || false,
        locale: user.locale || "en-US",
        timezone: user.timezone || "UTC",
        metadata: user.metadata || {},
      })
      .returning();

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(userSchema)
      .where(and(eq(userSchema.id, id), isNull(userSchema.deletedAt)))
      .limit(1);

    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(userSchema)
      .where(and(eq(userSchema.email, email), isNull(userSchema.deletedAt)))
      .limit(1);

    return user ? this.mapToEntity(user) : null;
  }

  async findMany(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];

    const users = await this.db
      .select()
      .from(userSchema)
      .where(and(inArray(userSchema.id, ids), isNull(userSchema.deletedAt)));

    return users.map((u) => this.mapToEntity(u));
  }

  async search(query: string, limit: number = 50): Promise<User[]> {
    const users = await this.db
      .select()
      .from(userSchema)
      .where(
        and(
          or(
            ilike(userSchema.email, `%${query}%`),
            ilike(userSchema.displayName, `%${query}%`)
          ),
          isNull(userSchema.deletedAt)
        )
      )
      .limit(limit);

    return users.map((u) => this.mapToEntity(u));
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const [updated] = await this.db
      .update(userSchema)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(userSchema.id, id), isNull(userSchema.deletedAt)))
      .returning();

    if (!updated) {
      throw new Error(`User with id ${id} not found`);
    }

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    await this.db
      .update(userSchema)
      .set({ deletedAt: new Date() })
      .where(eq(userSchema.id, id));
  }

  async exists(email: string): Promise<boolean> {
    const [user] = await this.db
      .select({ id: userSchema.id })
      .from(userSchema)
      .where(and(eq(userSchema.email, email), isNull(userSchema.deletedAt)))
      .limit(1);

    return !!user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db
      .update(userSchema)
      .set({ lastLoginAt: new Date() })
      .where(eq(userSchema.id, id));
  }

  private mapToEntity(row: typeof userSchema.$inferSelect): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      status: row.status as "active" | "inactive" | "invited" | "locked",
      emailVerified: row.emailVerified,
      locale: row.locale,
      timezone: row.timezone,
      lastLoginAt: row.lastLoginAt,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

