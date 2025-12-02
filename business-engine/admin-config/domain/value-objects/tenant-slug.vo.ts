// business-engine/admin-config/domain/value-objects/tenant-slug.vo.ts
import { ValidationError } from '../errors/validation.error';

/**
 * TenantSlug Value Object
 * 
 * Enforces URL-safe slug format for tenant identifiers.
 * This is used in URLs like: /tenant/{slug}/dashboard
 * 
 * Rules:
 * - 3-50 characters
 * - Lowercase alphanumeric and hyphens only
 * - Cannot start or end with hyphen
 * - Normalized to lowercase
 * 
 * @example
 * const slug = TenantSlug.create('acme-corp');  // OK
 * const slug = TenantSlug.create('Acme Corp'); // Throws ValidationError
 * const slug = TenantSlug.create('-acme');     // Throws ValidationError
 */
export class TenantSlug {
  private constructor(private readonly value: string) {}

  /**
   * Create a TenantSlug from a string.
   * Normalizes to lowercase and validates format.
   * 
   * @throws ValidationError if format is invalid
   */
  static create(slug: string): TenantSlug {
    const trimmed = slug.trim().toLowerCase();

    if (trimmed.length < 3) {
      throw new ValidationError('TenantSlug', 'Must be at least 3 characters', {
        value: slug,
        length: trimmed.length,
      });
    }

    if (trimmed.length > 50) {
      throw new ValidationError('TenantSlug', 'Must be under 50 characters', {
        value: slug,
        length: trimmed.length,
      });
    }

    // Regex: Alphanumeric and hyphens only. Cannot start/end with hyphen.
    // ^[a-z0-9]           - Must start with alphanumeric
    // (?:[a-z0-9-]{0,48}  - Middle can be alphanumeric or hyphen (0-48 chars)
    // [a-z0-9])?$         - Must end with alphanumeric (if > 1 char)
    const slugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;

    if (!slugRegex.test(trimmed)) {
      throw new ValidationError(
        'TenantSlug',
        'Must contain only lowercase letters, numbers, and hyphens. Cannot start or end with hyphen.',
        { value: slug },
      );
    }

    // Additional check: no consecutive hyphens
    if (trimmed.includes('--')) {
      throw new ValidationError(
        'TenantSlug',
        'Cannot contain consecutive hyphens',
        { value: slug },
      );
    }

    return new TenantSlug(trimmed);
  }

  /**
   * Reconstitute from persistence (no validation, already validated)
   */
  static fromPersistence(slug: string): TenantSlug {
    return new TenantSlug(slug);
  }

  /**
   * Compare equality with another TenantSlug
   */
  equals(other: TenantSlug): boolean {
    return this.value === other.value;
  }

  /**
   * Get the string value
   */
  toString(): string {
    return this.value;
  }
}

