import { eq, and, gt } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ITokenRepository } from "../../../../application/ports/outbound/token.repository.port";
import { inviteTokenSchema } from "../schema/invite-token.schema";
import { passwordResetTokenSchema } from "../schema/password-reset-token.schema";
import * as schema from "../schema";

/**
 * Token Repository - Drizzle Implementation
 * 
 * Manages invite tokens and password reset tokens
 */
export class TokenRepository implements ITokenRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  // Invite Tokens
  async createInviteToken(data: {
    token: string;
    email: string;
    tenantId: string;
    role: string;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.db.insert(inviteTokenSchema).values(data);
  }

  async findInviteToken(token: string): Promise<{
    token: string;
    email: string;
    tenantId: string;
    role: string;
    invitedBy: string;
    expiresAt: Date;
    usedAt: Date | null;
  } | null> {
    const [result] = await this.db
      .select()
      .from(inviteTokenSchema)
      .where(eq(inviteTokenSchema.token, token))
      .limit(1);

    return result || null;
  }

  async markInviteTokenUsed(token: string): Promise<void> {
    await this.db
      .update(inviteTokenSchema)
      .set({ usedAt: new Date() })
      .where(eq(inviteTokenSchema.token, token));
  }

  async isInviteTokenValid(token: string): Promise<boolean> {
    const [result] = await this.db
      .select()
      .from(inviteTokenSchema)
      .where(
        and(
          eq(inviteTokenSchema.token, token),
          gt(inviteTokenSchema.expiresAt, new Date()),
          eq(inviteTokenSchema.usedAt, null as any) // Token not used
        )
      )
      .limit(1);

    return !!result;
  }

  // Password Reset Tokens
  async createPasswordResetToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.db.insert(passwordResetTokenSchema).values(data);
  }

  async findPasswordResetToken(token: string): Promise<{
    token: string;
    userId: string;
    expiresAt: Date;
    usedAt: Date | null;
  } | null> {
    const [result] = await this.db
      .select()
      .from(passwordResetTokenSchema)
      .where(eq(passwordResetTokenSchema.token, token))
      .limit(1);

    return result || null;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await this.db
      .update(passwordResetTokenSchema)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokenSchema.token, token));
  }

  async isPasswordResetTokenValid(token: string): Promise<boolean> {
    const [result] = await this.db
      .select()
      .from(passwordResetTokenSchema)
      .where(
        and(
          eq(passwordResetTokenSchema.token, token),
          gt(passwordResetTokenSchema.expiresAt, new Date()),
          eq(passwordResetTokenSchema.usedAt, null as any) // Token not used
        )
      )
      .limit(1);

    return !!result;
  }

  async deleteExpiredTokens(): Promise<void> {
    // Delete expired invite tokens
    await this.db
      .delete(inviteTokenSchema)
      .where(gt(new Date(), inviteTokenSchema.expiresAt));

    // Delete expired password reset tokens
    await this.db
      .delete(passwordResetTokenSchema)
      .where(gt(new Date(), passwordResetTokenSchema.expiresAt));
  }
}

