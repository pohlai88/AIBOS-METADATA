import { eq, and, isNull, inArray, or, ilike } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { iamUser } from "../db/schema/user.schema";
import * as schema from "../db/schema";

/**
 * User Data (Plain object)
 */
export interface UserData {
  id: string;
  traceId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  locale: string;
  timezone: string;
  status: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Repository - Drizzle Implementation
 */
export class UserRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async save(user: {
    id?: string;
    traceId: string;
    email: string;
    name: string;
    passwordHash?: string;
    avatarUrl?: string;
    locale?: string;
    timezone?: string;
    status?: string;
    lastLoginAt?: Date;
  }): Promise<UserData> {
    if (user.id) {
      // Update existing
      const [updated] = await this.db
        .update(iamUser)
        .set({
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          status: (user.status || "active") as any,
          locale: user.locale || "en",
          timezone: user.timezone || "UTC",
          lastLoginAt: user.lastLoginAt,
          updatedAt: new Date(),
        })
        .where(eq(iamUser.id, user.id))
        .returning();

      return this.mapToData(updated);
    } else {
      // Create new
      const [created] = await this.db
        .insert(iamUser)
        .values({
          traceId: user.traceId,
          email: user.email,
          name: user.name,
          passwordHash: user.passwordHash,
          avatarUrl: user.avatarUrl,
          status: (user.status || "invited") as any,
          locale: user.locale || "en",
          timezone: user.timezone || "UTC",
        })
        .returning();

      return this.mapToData(created);
    }
  }

  async findById(id: string): Promise<UserData | null> {
    const [user] = await this.db
      .select()
      .from(iamUser)
      .where(eq(iamUser.id, id))
      .limit(1);

    return user ? this.mapToData(user) : null;
  }

  async findByEmail(email: string): Promise<UserData | null> {
    const [user] = await this.db
      .select()
      .from(iamUser)
      .where(eq(iamUser.email, email))
      .limit(1);

    return user ? this.mapToData(user) : null;
  }

  async findMany(ids: string[]): Promise<UserData[]> {
    if (ids.length === 0) return [];

    const users = await this.db
      .select()
      .from(iamUser)
      .where(inArray(iamUser.id, ids));

    return users.map((u) => this.mapToData(u));
  }

  async search(query: string, limit: number = 50): Promise<UserData[]> {
    const users = await this.db
      .select()
      .from(iamUser)
      .where(
        or(
          ilike(iamUser.email, `%${query}%`),
          ilike(iamUser.name, `%${query}%`)
        )
      )
      .limit(limit);

    return users.map((u) => this.mapToData(u));
  }

  async getPasswordHash(userId: string): Promise<string | null> {
    const [user] = await this.db
      .select({ passwordHash: iamUser.passwordHash })
      .from(iamUser)
      .where(eq(iamUser.id, userId))
      .limit(1);

    return user?.passwordHash || null;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .update(iamUser)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(iamUser.id, userId));
  }

  async updateStatus(userId: string, status: string): Promise<void> {
    await this.db
      .update(iamUser)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(iamUser.id, userId));
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.db
      .update(iamUser)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(iamUser.id, userId));
  }

  private mapToData(row: typeof iamUser.$inferSelect): UserData {
    return {
      id: row.id,
      traceId: row.traceId,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatarUrl || undefined,
      locale: row.locale,
      timezone: row.timezone,
      status: row.status,
      lastLoginAt: row.lastLoginAt || undefined,
      createdAt: row.createdAt!,
      updatedAt: row.updatedAt!,
    };
  }
}
