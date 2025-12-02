// business-engine/admin-config/domain/errors/domain.error.ts

/**
 * Error Code Taxonomy
 * 
 * These codes allow BFF to map domain errors to HTTP responses
 * and allow the kernel/telemetry to classify failures.
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'CONCURRENCY'
  | 'INVARIANT_VIOLATION';

/**
 * Base Domain Error
 * 
 * All business engine errors extend this class.
 * The BFF layer maps these to appropriate HTTP responses.
 * 
 * @example
 * catch (error) {
 *   if (error instanceof DomainError) {
 *     switch (error.code) {
 *       case 'UNAUTHORIZED': return c.json({ error }, 403);
 *       case 'NOT_FOUND': return c.json({ error }, 404);
 *       case 'CONFLICT': return c.json({ error }, 409);
 *       case 'VALIDATION_ERROR': return c.json({ error }, 400);
 *       case 'CONCURRENCY': return c.json({ error }, 409);
 *       default: return c.json({ error }, 500);
 *     }
 *   }
 * }
 */
export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert to JSON-safe object for API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

