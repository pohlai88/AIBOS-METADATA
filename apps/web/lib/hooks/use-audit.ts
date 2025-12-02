"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../api-client";

/**
 * Audit Log Hook
 */
export function useAuditLog(filters?: {
  limit?: number;
  offset?: number;
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["audit", filters],
    queryFn: () => auditApi.list(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

