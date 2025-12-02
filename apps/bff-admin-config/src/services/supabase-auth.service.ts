/**
 * Supabase Auth Service
 *
 * Uses Supabase JS client for authentication queries
 * Bypasses Drizzle/pooler connection issues
 */

import { getSupabase } from "../config/supabase";
import { getConfig } from "../config/env";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    locale: string;
    timezone: string;
    status: string;
    traceId: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
    logoUrl?: string;
  };
}

/**
 * Login using Supabase client
 */
export async function supabaseLogin(params: {
  email: string;
  password: string;
  tenantSlug?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<LoginResult> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const config = getConfig();
  const { email, password, tenantSlug } = params;

  // 1. Find user by email
  const { data: user, error: userError } = await supabase
    .from("iam_user")
    .select("*")
    .eq("email", email)
    .single();

  if (userError || !user) {
    throw new Error("Invalid email or password");
  }

  // 2. Verify password
  if (!user.password_hash) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  // 3. Find tenant and membership
  let tenant;
  let membership;

  if (tenantSlug) {
    // Find specific tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from("iam_tenant")
      .select("*")
      .eq("slug", tenantSlug)
      .single();

    if (tenantError || !tenantData) {
      throw new Error(`Tenant not found: ${tenantSlug}`);
    }
    tenant = tenantData;

    // Find membership
    const { data: membershipData, error: membershipError } = await supabase
      .from("iam_user_tenant_membership")
      .select("*")
      .eq("user_id", user.id)
      .eq("tenant_id", tenant.id)
      .single();

    if (membershipError || !membershipData) {
      throw new Error("User is not a member of this tenant");
    }
    membership = membershipData;
  } else {
    // Find any membership
    const { data: memberships, error: membershipError } = await supabase
      .from("iam_user_tenant_membership")
      .select("*, iam_tenant(*)")
      .eq("user_id", user.id)
      .limit(1);

    if (membershipError || !memberships || memberships.length === 0) {
      throw new Error("User is not associated with any tenant");
    }

    membership = memberships[0];
    tenant = membership.iam_tenant;
  }

  // 4. Update last login
  await supabase
    .from("iam_user")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  // 5. Generate JWT
  const accessToken = jwt.sign(
    {
      userId: user.id,
      tenantId: tenant.id,
      role: membership.role,
    },
    config.auth.jwtSecret,
    { expiresIn: config.auth.accessTokenExpiry }
  );

  // 6. Log audit event
  await supabase.from("iam_audit_event").insert({
    trace_id: user.trace_id,
    resource_type: "USER",
    resource_id: user.id,
    action: "LOGIN",
    actor_user_id: user.id,
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
    prev_hash: null,
    hash: `sha256:${randomUUID().replace(/-/g, "")}`,
  });

  console.log(`📡 [EVENT] auth.user.loggedIn - ${user.email}`);

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      locale: user.locale,
      timezone: user.timezone,
      status: user.status,
      traceId: user.trace_id,
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      logoUrl: tenant.logo_url,
    },
  };
}

