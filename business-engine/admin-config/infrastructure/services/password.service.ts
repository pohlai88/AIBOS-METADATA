import { hash, compare } from "bcryptjs";

/**
 * Password Service
 * 
 * Handles password hashing and verification using bcrypt
 * Salt rounds: 12 (balanced security vs performance)
 */
export class PasswordService {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return hash(password, this.saltRounds);
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  /**
   * Validate password strength
   * Requirements from GRCD:
   * - Min 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   */
  validateStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

