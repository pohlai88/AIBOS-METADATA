import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";

/**
 * Auth Middleware
 * 
 * Extracts and validates JWT from Authorization header
 * Injects user context into request
 */

export interface AuthContext {
  userId: string;
  tenantId: string;
  role: string;
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { error: "Unauthorized - No token provided" },
      401
    );
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

  try {
    const payload = jwt.verify(token, jwtSecret) as AuthContext;

    // Inject auth context into request
    c.set("auth", payload);
    c.set("userId", payload.userId);
    c.set("tenantId", payload.tenantId);
    c.set("role", payload.role);

    await next();
  } catch (error) {
    return c.json(
      { error: "Unauthorized - Invalid token" },
      401
    );
  }
}

/**
 * Optional auth middleware
 * Does not fail if no token provided
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

    try {
      const payload = jwt.verify(token, jwtSecret) as AuthContext;
      c.set("auth", payload);
      c.set("userId", payload.userId);
      c.set("tenantId", payload.tenantId);
      c.set("role", payload.role);
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }

  await next();
}

/**
 * Role check middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const role = c.get("role") as string;

    if (!role || !allowedRoles.includes(role)) {
      return c.json(
        { error: "Forbidden - Insufficient permissions" },
        403
      );
    }

    await next();
  };
}

