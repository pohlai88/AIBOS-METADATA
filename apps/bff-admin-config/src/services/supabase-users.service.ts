/**
 * Supabase Users Service
 *
 * User management via Supabase JS client
 */

import { getSupabase } from "../config/supabase";
import { getConfig } from "../config/env";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

interface UserListItem {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  status: string;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
}

interface UserDetail {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    status: string;
    locale: string;
    timezone: string;
    lastLoginAt?: string;
    createdAt: string;
  };
  membership: {
    id: string;
    role: string;
    createdAt: string;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    metadataDiff?: Record<string, unknown>;
  }>;
}

/**
 * List users in tenant
 */
export async function listUsers(
  tenantId: string,
  filters?: { status?: string; role?: string; search?: string }
): Promise<{ users: UserListItem[]; total: number }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  // Get memberships for this tenant
  let membershipQuery = supabase
    .from("iam_user_tenant_membership")
    .select("user_id, role")
    .eq("tenant_id", tenantId);

  if (filters?.role) {
    membershipQuery = membershipQuery.eq("role", filters.role);
  }

  const { data: memberships, error: membershipError } = await membershipQuery;

  if (membershipError) throw new Error(membershipError.message);
  if (!memberships || memberships.length === 0) {
    return { users: [], total: 0 };
  }

  const userIds = memberships.map((m) => m.user_id);

  // Get users
  let usersQuery = supabase
    .from("iam_user")
    .select("*")
    .in("id", userIds);

  if (filters?.status) {
    usersQuery = usersQuery.eq("status", filters.status);
  }

  if (filters?.search) {
    usersQuery = usersQuery.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data: users, error: usersError } = await usersQuery;

  if (usersError) throw new Error(usersError.message);

  // Combine data
  const result: UserListItem[] = (users || []).map((user) => {
    const membership = memberships.find((m) => m.user_id === user.id);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      status: user.status,
      role: membership?.role || "member",
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
    };
  });

  return { users: result, total: result.length };
}

/**
 * Get user detail
 */
export async function getUserDetail(
  userId: string,
  tenantId: string
): Promise<UserDetail | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  // Get user
  const { data: user, error: userError } = await supabase
    .from("iam_user")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !user) return null;

  // Get membership
  const { data: membership, error: membershipError } = await supabase
    .from("iam_user_tenant_membership")
    .select("*")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .single();

  if (membershipError || !membership) return null;

  // Get recent audit events
  const { data: auditEvents } = await supabase
    .from("iam_audit_event")
    .select("*")
    .eq("resource_id", userId)
    .eq("resource_type", "USER")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      status: user.status,
      locale: user.locale,
      timezone: user.timezone,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
    },
    membership: {
      id: membership.id,
      role: membership.role,
      createdAt: membership.created_at,
    },
    recentActivity: (auditEvents || []).map((e) => ({
      id: e.audit_id,
      action: e.action,
      timestamp: e.created_at,
      metadataDiff: e.metadata_diff,
    })),
  };
}

/**
 * Invite user to tenant
 */
export async function inviteUser(params: {
  email: string;
  name?: string;
  role: string;
  tenantId: string;
  invitedBy: string;
}): Promise<{ userId: string; email: string; status: string }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { email, name, role, tenantId, invitedBy } = params;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("iam_user")
    .select("id")
    .eq("email", email)
    .single();

  let userId: string;

  if (existingUser) {
    // Check if already member
    const { data: existingMembership } = await supabase
      .from("iam_user_tenant_membership")
      .select("id")
      .eq("user_id", existingUser.id)
      .eq("tenant_id", tenantId)
      .single();

    if (existingMembership) {
      throw new Error("User is already a member of this organization");
    }

    userId = existingUser.id;
  } else {
    // Create new user
    const newUserId = randomUUID();
    const traceId = randomUUID();

    const { error: createError } = await supabase.from("iam_user").insert({
      id: newUserId,
      trace_id: traceId,
      email,
      name: name || email.split("@")[0],
      status: "invited",
      locale: "en",
      timezone: "UTC",
    });

    if (createError) throw new Error(createError.message);
    userId = newUserId;
  }

  // Create membership
  const { error: membershipError } = await supabase
    .from("iam_user_tenant_membership")
    .insert({
      id: randomUUID(),
      user_id: userId,
      tenant_id: tenantId,
      role,
      created_by: invitedBy,
      updated_by: invitedBy,
    });

  if (membershipError) throw new Error(membershipError.message);

  // Create invite token (for email link)
  const inviteToken = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await supabase.from("iam_invite_token").insert({
    id: randomUUID(),
    token_hash: bcrypt.hashSync(inviteToken, 10),
    user_id: userId,
    tenant_id: tenantId,
    role,
    expires_at: expiresAt.toISOString(),
    invited_by: invitedBy,
  });

  console.log(`📧 Invite email would be sent to ${email} with token: ${inviteToken}`);

  // Audit event
  const { data: userData } = await supabase
    .from("iam_user")
    .select("trace_id")
    .eq("id", userId)
    .single();

  await supabase.from("iam_audit_event").insert({
    trace_id: userData?.trace_id || randomUUID(),
    resource_type: "USER",
    resource_id: userId,
    action: "INVITE",
    actor_user_id: invitedBy,
    metadata_diff: { email, role, tenantId },
    hash: `sha256:${randomUUID().replace(/-/g, "")}`,
  });

  return { userId, email, status: "invited" };
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  tenantId: string,
  actorId: string,
  updates: { displayName?: string; avatarUrl?: string | null; role?: string }
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  // Update user fields
  if (updates.displayName !== undefined || updates.avatarUrl !== undefined) {
    const userUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.displayName) userUpdates.name = updates.displayName;
    if (updates.avatarUrl !== undefined) userUpdates.avatar_url = updates.avatarUrl;

    await supabase.from("iam_user").update(userUpdates).eq("id", userId);
  }

  // Update role if changed
  if (updates.role) {
    await supabase
      .from("iam_user_tenant_membership")
      .update({ role: updates.role, updated_by: actorId, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("tenant_id", tenantId);
  }

  // Audit event
  const { data: userData } = await supabase
    .from("iam_user")
    .select("trace_id")
    .eq("id", userId)
    .single();

  await supabase.from("iam_audit_event").insert({
    trace_id: userData?.trace_id || randomUUID(),
    resource_type: "USER",
    resource_id: userId,
    action: "UPDATE",
    actor_user_id: actorId,
    metadata_diff: updates,
    hash: `sha256:${randomUUID().replace(/-/g, "")}`,
  });
}

/**
 * Deactivate user
 */
export async function deactivateUser(
  userId: string,
  tenantId: string,
  actorId: string,
  reason?: string
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  // Check if last admin
  const { data: membership } = await supabase
    .from("iam_user_tenant_membership")
    .select("role")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .single();

  if (membership?.role === "org_admin") {
    const { data: admins } = await supabase
      .from("iam_user_tenant_membership")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("role", "org_admin");

    if (admins && admins.length <= 1) {
      throw new Error("Cannot deactivate the last admin");
    }
  }

  // Deactivate
  await supabase
    .from("iam_user")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", userId);

  // Audit event
  const { data: userData } = await supabase
    .from("iam_user")
    .select("trace_id")
    .eq("id", userId)
    .single();

  await supabase.from("iam_audit_event").insert({
    trace_id: userData?.trace_id || randomUUID(),
    resource_type: "USER",
    resource_id: userId,
    action: "DEACTIVATE",
    actor_user_id: actorId,
    metadata_diff: { reason },
    hash: `sha256:${randomUUID().replace(/-/g, "")}`,
  });
}

/**
 * Reactivate user
 */
export async function reactivateUser(
  userId: string,
  tenantId: string,
  actorId: string
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  await supabase
    .from("iam_user")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", userId);

  // Audit event
  const { data: userData } = await supabase
    .from("iam_user")
    .select("trace_id")
    .eq("id", userId)
    .single();

  await supabase.from("iam_audit_event").insert({
    trace_id: userData?.trace_id || randomUUID(),
    resource_type: "USER",
    resource_id: userId,
    action: "REACTIVATE",
    actor_user_id: actorId,
    hash: `sha256:${randomUUID().replace(/-/g, "")}`,
  });
}

