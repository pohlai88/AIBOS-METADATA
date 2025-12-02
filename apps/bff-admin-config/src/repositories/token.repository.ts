import { eq, and, gt, isNull } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { iamInviteToken } from "../db/schema/invite-token.schema";
import { iamPasswordResetToken } from "../db/schema/password-reset-token.schema";
import * as schema from "../db/schema";

/**
 * Token Repository - Drizzle Implementation
 *
 * Manages invite tokens and password reset tokens
 */
export class TokenRepository implements ITokenRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  // ─────────────────────────────────────────
  // INVITE TOKENS
  // ─────────────────────────────────────────

  async saveInviteToken(data: {
    tokenHash: string;
    userId: string;
    tenantId: string;
    role: string;
    expiresAt: Date;
    invitedBy: string;
  }): Promise<void> {
    await this.db.insert(iamInviteToken).values({
      tokenHash: data.tokenHash,
      userId: data.userId,
      tenantId: data.tenantId,
      role: data.role as any,
      expiresAt: data.expiresAt,
      invitedBy: data.invitedBy,
    });
  }

  async findValidInviteToken(tokenHash: string): Promise<{
    id: string;
    userId: string;
    tenantId: string;
    role: string;
    expiresAt: Date;
  } | null> {
    const [result] = await this.db
      .select()
      .from(iamInviteToken)
      .where(
        and(
          eq(iamInviteToken.tokenHash, tokenHash),
          gt(iamInviteToken.expiresAt, new Date()),
          eq(iamInviteToken.isUsed, false)
        )
      )
      .limit(1);

    return result
      ? {
          id: result.id,
          userId: result.userId,
          tenantId: result.tenantId,
          role: result.role,
          expiresAt: result.expiresAt,
        }
      : null;
  }

  async invalidateInviteToken(id: string): Promise<void> {
    await this.db
      .update(iamInviteToken)
      .set({ isUsed: true, usedAt: new Date() })
      .where(eq(iamInviteToken.id, id));
  }

  // ─────────────────────────────────────────
  // PASSWORD RESET TOKENS
  // ─────────────────────────────────────────

  async savePasswordResetToken(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    requestedIp?: string;
    requestedUserAgent?: string;
  }): Promise<void> {
    await this.db.insert(iamPasswordResetToken).values({
      tokenHash: data.tokenHash,
      userId: data.userId,
      expiresAt: data.expiresAt,
      requestedIp: data.requestedIp,
      requestedUserAgent: data.requestedUserAgent,
    });
  }

  async findValidPasswordResetToken(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
  } | null> {
    const [result] = await this.db
      .select()
      .from(iamPasswordResetToken)
      .where(
        and(
          eq(iamPasswordResetToken.tokenHash, tokenHash),
          gt(iamPasswordResetToken.expiresAt, new Date()),
          eq(iamPasswordResetToken.isUsed, false)
        )
      )
      .limit(1);

    return result
      ? {
          id: result.id,
          userId: result.userId,
          expiresAt: result.expiresAt,
        }
      : null;
  }

  async invalidatePasswordResetToken(id: string): Promise<void> {
    await this.db
      .update(iamPasswordResetToken)
      .set({ isUsed: true, usedAt: new Date() })
      .where(eq(iamPasswordResetToken.id, id));
  }

  // ─────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────

  async deleteExpiredTokens(): Promise<void> {
    const now = new Date();

    // Delete expired invite tokens
    await this.db
      .delete(iamInviteToken)
      .where(gt(now, iamInviteToken.expiresAt));

    // Delete expired password reset tokens
    await this.db
      .delete(iamPasswordResetToken)
      .where(gt(now, iamPasswordResetToken.expiresAt));
  }
}
