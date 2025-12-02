import { randomUUID } from "crypto";

/**
 * Trace ID Service
 * 
 * Generates trace IDs for audit trail and traceability
 * Following the pattern from GRCD: `tr_<context>_<uuid>`
 * 
 * Examples:
 * - tr_user_invite_a1b2c3d4
 * - tr_tenant_create_e5f6g7h8
 * - tr_password_reset_i9j0k1l2
 */
export class TraceIdService {
  /**
   * Generate trace ID with context
   * 
   * @param context - Business context (e.g., "user_invite", "payment_approval")
   * @returns Trace ID in format: tr_<context>_<short-uuid>
   */
  generate(context: string): string {
    const uuid = randomUUID().replace(/-/g, "").substring(0, 12);
    return `tr_${context}_${uuid}`;
  }

  /**
   * Predefined contexts for common operations
   */
  contexts = {
    // Tenant operations
    tenantCreate: "tenant_create",
    tenantUpdate: "tenant_update",
    tenantDeactivate: "tenant_deactivate",

    // User operations
    userInvite: "user_invite",
    userAcceptInvite: "user_accept_invite",
    userLogin: "user_login",
    userLogout: "user_logout",
    userUpdate: "user_update",
    userDeactivate: "user_deactivate",
    userReactivate: "user_reactivate",

    // Password operations
    passwordReset: "password_reset",
    passwordChange: "password_change",

    // Membership operations
    roleChange: "role_change",
    membershipCreate: "membership_create",
    membershipDelete: "membership_delete",
  } as const;
}

