// business-engine/admin-config/application/ports/outbound/token.repository.port.ts

/**
 * Invite Token Data
 */
export interface InviteTokenData {
  id: string;
  tokenHash: string;
  userId: string;
  tenantId: string;
  role: 'org_admin' | 'member' | 'viewer';
  expiresAt: Date;
  usedAt?: Date;
  isUsed: boolean;
  invitedBy: string;
  createdAt: Date;
}

/**
 * Password Reset Token Data
 */
export interface PasswordResetTokenData {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt?: Date;
  isUsed: boolean;
  requestedIp?: string;
  requestedUserAgent?: string;
  createdAt: Date;
}

/**
 * ITokenRepository - Outbound Port for Token Persistence
 * 
 * Handles invite tokens and password reset tokens.
 * GRCD F-USER-1: Invite tokens with expiry
 * GRCD F-USER-5: Password reset tokens with expiry
 * GRCD C-ORG-2: Secure, expiring tokens; NOT logged in plaintext
 */
export interface ITokenRepository {
  // ─────────────────────────────────────────────────────────────────────────
  // Invite Tokens
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Save an invite token.
   */
  saveInviteToken(params: {
    tokenHash: string;
    userId: string;
    tenantId: string;
    role: 'org_admin' | 'member' | 'viewer';
    expiresAt: Date;
    invitedBy: string;
  }): Promise<InviteTokenData>;

  /**
   * Find an invite token by its hash.
   */
  findInviteTokenByHash(tokenHash: string): Promise<InviteTokenData | null>;

  /**
   * Mark an invite token as used.
   */
  markInviteTokenUsed(id: string): Promise<void>;

  /**
   * Find active (unused, not expired) invite token for a user.
   */
  findActiveInviteTokenForUser(userId: string): Promise<InviteTokenData | null>;

  /**
   * Delete expired invite tokens (cleanup).
   */
  deleteExpiredInviteTokens(): Promise<number>;

  // ─────────────────────────────────────────────────────────────────────────
  // Password Reset Tokens
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Save a password reset token.
   */
  savePasswordResetToken(params: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    requestedIp?: string;
    requestedUserAgent?: string;
  }): Promise<PasswordResetTokenData>;

  /**
   * Find a password reset token by its hash.
   */
  findPasswordResetTokenByHash(tokenHash: string): Promise<PasswordResetTokenData | null>;

  /**
   * Mark a password reset token as used.
   * GRCD F-USER-5: Token invalid after use.
   */
  markPasswordResetTokenUsed(id: string): Promise<void>;

  /**
   * Invalidate all active password reset tokens for a user.
   * Called after successful password reset.
   */
  invalidateAllPasswordResetTokensForUser(userId: string): Promise<void>;

  /**
   * Delete expired password reset tokens (cleanup).
   */
  deleteExpiredPasswordResetTokens(): Promise<number>;
}

