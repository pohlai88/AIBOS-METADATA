// business-engine/admin-config/domain/value-objects/email.vo.ts

/**
 * Email Value Object
 * 
 * Encapsulates email validation and normalization.
 * Used for user email addresses throughout the identity domain.
 * 
 * Properties:
 * - Immutable: Value cannot change after construction
 * - Self-validating: Validates format on construction
 * - Normalized: Converts to lowercase for consistent comparison
 */
export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Create an Email from a string value.
   * Validates format and normalizes to lowercase.
   */
  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();

    if (!Email.isValidFormat(normalized)) {
      throw new Error(`Invalid email format: ${value}`);
    }

    return new Email(normalized);
  }

  /**
   * Validate email format using RFC 5322 simplified regex.
   */
  private static isValidFormat(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * Get the normalized email string.
   */
  toString(): string {
    return this.value;
  }

  /**
   * Get the domain part of the email.
   */
  getDomain(): string {
    return this.value.split('@')[1];
  }

  /**
   * Get the local part (before @) of the email.
   */
  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * Check equality with another Email.
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Get raw value for serialization.
   */
  toJSON(): string {
    return this.value;
  }
}

