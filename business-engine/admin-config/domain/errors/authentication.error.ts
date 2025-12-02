// business-engine/admin-config/domain/errors/authentication.error.ts
import { DomainError } from './domain.error';

/**
 * AuthenticationError
 * 
 * Thrown when authentication fails.
 * 
 * SECURITY: This error is intentionally vague to prevent information leakage.
 * - Don't reveal if user exists or not
 * - Don't reveal if password is wrong vs account locked
 * - Internal details are in `internalReason` for audit only
 * 
 * @example
 * throw new AuthenticationError(); // Generic message
 * throw new AuthenticationError('Invalid credentials', {
 *   internalReason: 'USER_NOT_FOUND', // Logged in audit, NOT shown to user
 *   email: input.email,
 * });
 */
export class AuthenticationError extends DomainError {
    constructor(
        message = 'Invalid email or password',
        details?: Record<string, unknown>,
    ) {
        // Always use UNAUTHORIZED code for auth failures
        // BFF maps this to 401 (not 403)
        super(message, 'UNAUTHORIZED', details);
    }

    /**
     * Override toJSON to sanitize internal details
     * Only expose safe fields to the API response
     */
    override toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            // Intentionally omit `details` to prevent information leakage
        };
    }
}

/**
 * Internal reason codes for audit trail (NOT exposed to user)
 */
export type AuthFailureReason =
    | 'USER_NOT_FOUND'
    | 'INVALID_PASSWORD'
    | 'ACCOUNT_INACTIVE'
    | 'ACCOUNT_LOCKED'
    | 'TENANT_NOT_FOUND'
    | 'TENANT_INACCESSIBLE'
    | 'NOT_TENANT_MEMBER';

