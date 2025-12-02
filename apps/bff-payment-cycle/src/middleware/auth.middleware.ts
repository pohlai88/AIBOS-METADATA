/**
 * Authentication Middleware
 *
 * Validates JWT tokens and extracts user/tenant context.
 * Calls bff-admin-config for token validation in production.
 */

import { Context, Next } from "hono";
import { getSupabaseClient } from "../config/database";
import { getConfig } from "../config/env";

// Context variables set by middleware
declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    tenantId: string;
    userRole: string;
    userEmail: string;
  }
}

/**
 * Auth middleware - validates token and sets context
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const token = authHeader.slice(7);
  const config = getConfig();

  try {
    // Use Supabase to verify token
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Extract tenant from header or user metadata
    const tenantId = c.req.header("X-Tenant-ID") || user.user_metadata?.tenant_id;
    if (!tenantId) {
      return c.json({ error: "Tenant ID required" }, 400);
    }

    // Set context variables
    c.set("userId", user.id);
    c.set("tenantId", tenantId);
    c.set("userEmail", user.email || "");
    c.set("userRole", user.user_metadata?.role || "member");

    await next();
  } catch (error) {
    console.error("[AUTH] Token validation error:", error);
    return c.json({ error: "Authentication failed" }, 401);
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get("userRole");

    if (!allowedRoles.includes(userRole)) {
      return c.json(
        {
          error: "Insufficient permissions",
          required: allowedRoles,
          current: userRole,
        },
        403
      );
    }

    await next();
  };
}

/**
 * Treasury/Finance role middleware
 */
export const requireTreasuryRole = requireRole(
  "treasury",
  "finance",
  "finance_approver",
  "finance_disburser",
  "org_admin",
  "platform_admin"
);

/**
 * Approver role middleware
 */
export const requireApproverRole = requireRole(
  "approver",
  "finance_approver",
  "org_admin",
  "platform_admin"
);

