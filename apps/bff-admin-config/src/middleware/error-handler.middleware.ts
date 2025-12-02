// apps/bff-admin-config/src/middleware/error-handler.middleware.ts
/**
 * Domain Error Handler Middleware
 * 
 * Maps business engine domain errors to HTTP responses.
 * This is the bridge between pure domain logic and HTTP layer.
 */

import type { Context, Next } from "hono";
import {
  DomainError,
  AuthenticationError,
} from "@business-engine/admin-config";

/**
 * Error code to HTTP status mapping
 */
const ERROR_STATUS_MAP: Record<string, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  CONCURRENCY: 409,
  INVARIANT_VIOLATION: 400,
};

/**
 * Domain Error Handler
 * 
 * Use as a wrapper around route handlers:
 * 
 * @example
 * app.post('/login', async (c) => {
 *   return handleDomainError(c, async () => {
 *     const result = await loginUseCase(command);
 *     return c.json(result.response);
 *   });
 * });
 */
export async function handleDomainError<T>(
  c: Context,
  handler: () => Promise<T>,
): Promise<T | Response> {
  try {
    return await handler();
  } catch (error) {
    // AuthenticationError → 401 (special: doesn't leak details)
    if (error instanceof AuthenticationError) {
      return c.json(error.toJSON(), 401);
    }

    // Other domain errors → mapped status
    if (error instanceof DomainError) {
      const status = ERROR_STATUS_MAP[error.code] ?? 500;
      return c.json(error.toJSON(), status);
    }

    // Unexpected errors → 500
    console.error("[ERROR] Unexpected error:", error);
    return c.json(
      {
        name: "InternalError",
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
      500,
    );
  }
}

/**
 * Error Handler Middleware (global)
 * 
 * Alternative: use as Hono middleware for all routes.
 * 
 * @example
 * app.use('*', domainErrorMiddleware);
 */
export async function domainErrorMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    // AuthenticationError → 401
    if (error instanceof AuthenticationError) {
      return c.json(error.toJSON(), 401);
    }

    // Other domain errors → mapped status
    if (error instanceof DomainError) {
      const status = ERROR_STATUS_MAP[error.code] ?? 500;
      return c.json(error.toJSON(), status);
    }

    // Unexpected errors → 500
    console.error("[ERROR] Unhandled error:", error);
    return c.json(
      {
        name: "InternalError",
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
      500,
    );
  }
}

