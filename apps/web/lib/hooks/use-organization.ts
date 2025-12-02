"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api-client";

/**
 * Get Organization Hook
 */
export function useOrganization() {
  return useQuery({
    queryKey: ["organization"],
    queryFn: organizationApi.get,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update Organization Hook
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

