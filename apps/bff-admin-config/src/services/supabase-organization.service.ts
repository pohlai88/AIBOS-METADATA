/**
 * Supabase Organization Service
 *
 * Organization/Tenant management via Supabase JS client
 */

import { getSupabase } from "../config/supabase";
import { randomUUID } from "crypto";

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  locale: string;
  logoUrl?: string;
  domain?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get organization by ID
 */
export async function getOrganization(tenantId: string): Promise<Organization | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { data: tenant, error } = await supabase
    .from("iam_tenant")
    .select("*")
    .eq("id", tenantId)
    .single();

  if (error || !tenant) return null;

  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    status: tenant.status,
    timezone: tenant.timezone,
    locale: tenant.locale,
    logoUrl: tenant.logo_url,
    domain: tenant.domain,
    createdAt: tenant.created_at,
    updatedAt: tenant.updated_at,
  };
}

/**
 * Update organization
 */
export async function updateOrganization(
  tenantId: string,
  actorId: string,
  updates: {
    name?: string;
    slug?: string;
    timezone?: string;
    locale?: string;
    logoUrl?: string | null;
    domain?: string | null;
  }
): Promise<Organization> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  // Check slug uniqueness if changing
  if (updates.slug) {
    const { data: existingTenant } = await supabase
      .from("iam_tenant")
      .select("id")
      .eq("slug", updates.slug)
      .neq("id", tenantId)
      .single();

    if (existingTenant) {
      throw new Error("Slug is already taken");
    }
  }

  // Build update object
  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: actorId,
  };

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
  if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
  if (updates.locale !== undefined) dbUpdates.locale = updates.locale;
  if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
  if (updates.domain !== undefined) dbUpdates.domain = updates.domain;

  const { data: updated, error } = await supabase
    .from("iam_tenant")
    .update(dbUpdates)
    .eq("id", tenantId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Get tenant trace_id for audit
  const { data: tenantData } = await supabase
    .from("iam_tenant")
    .select("trace_id")
    .eq("id", tenantId)
    .single();

  // Audit event
  await supabase.from("iam_audit_event").insert({
    trace_id: tenantData?.trace_id || randomUUID(),
    resource_type: "TENANT",
    resource_id: tenantId,
    action: "UPDATE",
    actor_user_id: actorId,
    metadata_diff: updates,
    hash: `sha256:${randomUUID().replace(/-/g, "")}`,
  });

  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    status: updated.status,
    timezone: updated.timezone,
    locale: updated.locale,
    logoUrl: updated.logo_url,
    domain: updated.domain,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  };
}

