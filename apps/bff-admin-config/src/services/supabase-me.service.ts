/**
 * Supabase Me Service
 *
 * Current user profile management via Supabase JS client
 */

import { getSupabase } from "../config/supabase";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  locale: string;
  timezone: string;
  status: string;
  memberships: Array<{
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    role: string;
  }>;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(userId: string): Promise<CurrentUser | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  // Get user
  const { data: user, error: userError } = await supabase
    .from("iam_user")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !user) return null;

  // Get memberships with tenant info
  const { data: memberships } = await supabase
    .from("iam_user_tenant_membership")
    .select("tenant_id, role, iam_tenant(id, name, slug)")
    .eq("user_id", userId);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    locale: user.locale,
    timezone: user.timezone,
    status: user.status,
    memberships: (memberships || []).map((m: any) => ({
      tenantId: m.tenant_id,
      tenantName: m.iam_tenant?.name || "",
      tenantSlug: m.iam_tenant?.slug || "",
      role: m.role,
    })),
  };
}

/**
 * Update current user profile
 */
export async function updateCurrentUser(
  userId: string,
  updates: {
    name?: string;
    avatarUrl?: string | null;
    locale?: string;
    timezone?: string;
  }
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.locale !== undefined) dbUpdates.locale = updates.locale;
  if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;

  const { error } = await supabase
    .from("iam_user")
    .update(dbUpdates)
    .eq("id", userId);

  if (error) throw new Error(error.message);

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
    action: "PROFILE_UPDATE",
    actor_user_id: userId,
    metadata_diff: updates,
    hash: `sha256:${randomUUID().replace(/-/g, "")}`,
  });
}

/**
 * Change current user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  // Get current password hash
  const { data: user, error: userError } = await supabase
    .from("iam_user")
    .select("password_hash, trace_id")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    throw new Error("User not found");
  }

  // Verify current password
  if (!user.password_hash) {
    throw new Error("No password set");
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 10);

  // Update password
  const { error: updateError } = await supabase
    .from("iam_user")
    .update({
      password_hash: newHash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) throw new Error(updateError.message);

  // Audit event
  await supabase.from("iam_audit_event").insert({
    trace_id: user.trace_id || randomUUID(),
    resource_type: "USER",
    resource_id: userId,
    action: "PASSWORD_CHANGE",
    actor_user_id: userId,
    hash: `sha256:${randomUUID().replace(/-/g, "")}`,
  });
}

