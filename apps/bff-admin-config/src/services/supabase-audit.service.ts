/**
 * Supabase Audit Service
 *
 * Audit log queries via Supabase JS client
 */

import { getSupabase } from "../config/supabase";

interface AuditEvent {
  id: string;
  traceId: string;
  resourceType: string;
  resourceId: string;
  action: string;
  actorUserId?: string;
  actorEmail?: string;
  metadataDiff?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface AuditListResult {
  events: AuditEvent[];
  total: number;
}

/**
 * List audit events for tenant
 */
export async function listAuditEvents(
  tenantId: string,
  filters?: {
    resourceType?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
): Promise<AuditListResult> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  // First get all user IDs in this tenant
  const { data: memberships } = await supabase
    .from("iam_user_tenant_membership")
    .select("user_id")
    .eq("tenant_id", tenantId);

  const userIds = (memberships || []).map((m) => m.user_id);

  if (userIds.length === 0) {
    return { events: [], total: 0 };
  }

  // Build query for audit events
  let query = supabase
    .from("iam_audit_event")
    .select("*", { count: "exact" })
    .in("actor_user_id", userIds)
    .order("created_at", { ascending: false });

  if (filters?.resourceType) {
    query = query.eq("resource_type", filters.resourceType);
  }

  if (filters?.action) {
    query = query.eq("action", filters.action);
  }

  if (filters?.userId) {
    query = query.eq("actor_user_id", filters.userId);
  }

  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate);
  }

  // Pagination
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data: events, error, count } = await query;

  if (error) throw new Error(error.message);

  // Get user emails for display
  const actorIds = [...new Set((events || []).map((e) => e.actor_user_id).filter(Boolean))];
  
  let userMap: Record<string, string> = {};
  if (actorIds.length > 0) {
    const { data: users } = await supabase
      .from("iam_user")
      .select("id, email")
      .in("id", actorIds);

    userMap = (users || []).reduce((acc, u) => {
      acc[u.id] = u.email;
      return acc;
    }, {} as Record<string, string>);
  }

  const result: AuditEvent[] = (events || []).map((e) => ({
    id: e.audit_id,
    traceId: e.trace_id,
    resourceType: e.resource_type,
    resourceId: e.resource_id,
    action: e.action,
    actorUserId: e.actor_user_id,
    actorEmail: e.actor_user_id ? userMap[e.actor_user_id] : undefined,
    metadataDiff: e.metadata_diff,
    ipAddress: e.ip_address,
    userAgent: e.user_agent,
    createdAt: e.created_at,
  }));

  return { events: result, total: count || result.length };
}

/**
 * Get audit trail for specific resource
 */
export async function getResourceAuditTrail(
  resourceType: string,
  resourceId: string,
  limit: number = 20
): Promise<AuditEvent[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { data: events, error } = await supabase
    .from("iam_audit_event")
    .select("*")
    .eq("resource_type", resourceType)
    .eq("resource_id", resourceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (events || []).map((e) => ({
    id: e.audit_id,
    traceId: e.trace_id,
    resourceType: e.resource_type,
    resourceId: e.resource_id,
    action: e.action,
    actorUserId: e.actor_user_id,
    metadataDiff: e.metadata_diff,
    ipAddress: e.ip_address,
    userAgent: e.user_agent,
    createdAt: e.created_at,
  }));
}

