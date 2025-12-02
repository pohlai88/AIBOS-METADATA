import { randomBytes } from "crypto";
import { sign, verify } from "jsonwebtoken";

/**
 * Token Service
 * 
 * Handles:
 * 1. JWT tokens for authentication
 * 2. Secure random tokens for invites and password resets
 */
export class TokenService {
  constructor(private readonly jwtSecret: string) {}

  /**
   * Generate JWT for authentication
   */
  generateJWT(payload: {
    userId: string;
    tenantId: string;
    role: string;
  }): string {
    return sign(payload, this.jwtSecret, {
      expiresIn: "7d", // 7 days
      issuer: "aibos-admin-config",
    });
  }

  /**
   * Verify and decode JWT
   */
  verifyJWT(token: string): {
    userId: string;
    tenantId: string;
    role: string;
  } | null {
    try {
      const payload = verify(token, this.jwtSecret) as any;
      return {
        userId: payload.userId,
        tenantId: payload.tenantId,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }

  /**
   * Generate secure random token
   * Used for:
   * - Invite tokens
   * - Password reset tokens
   * - Email verification tokens
   */
  generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString("hex");
  }

  /**
   * Calculate expiration date for tokens
   */
  getInviteTokenExpiration(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // 7 days
    return expiry;
  }

  getPasswordResetTokenExpiration(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // 24 hours
    return expiry;
  }
}

