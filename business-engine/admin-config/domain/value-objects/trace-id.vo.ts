// business-engine/admin-config/domain/value-objects/trace-id.vo.ts

/**
 * TraceId Value Object
 * 
 * GRCD F-TRACE-1: Every tenant and user MUST have a stable trace_id (UUID/ULID)
 * used to correlate all related audit events.
 * 
 * Properties:
 * - Immutable: Once created, never changes
 * - Unique: Generated using crypto-secure UUID v4
 * - Self-validating: Validates format on construction
 */
export class TraceId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Create a new TraceId from a string value.
   * Validates UUID format.
   */
  static create(value: string): TraceId {
    if (!TraceId.isValidUuid(value)) {
      throw new Error(`Invalid TraceId format: ${value}`);
    }
    return new TraceId(value);
  }

  /**
   * Generate a new random TraceId.
   * Uses crypto.randomUUID() for secure generation.
   */
  static generate(): TraceId {
    const uuid = crypto.randomUUID();
    return new TraceId(uuid);
  }

  /**
   * Validate UUID format (any version).
   * Accepts standard UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   */
  private static isValidUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Get the string value.
   */
  toString(): string {
    return this.value;
  }

  /**
   * Check equality with another TraceId.
   */
  equals(other: TraceId): boolean {
    return this.value === other.value;
  }

  /**
   * Get raw value for serialization.
   */
  toJSON(): string {
    return this.value;
  }
}

