"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api-client";

/**
 * List Users Hook
 */
export function useUsers(filters?: { q?: string; status?: string; role?: string }) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersApi.list(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get User Detail Hook
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => usersApi.get(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Invite User Hook
 */
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      return usersApi.invite(email, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/**
 * Update User Hook
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: {
        displayName?: string;
        avatarUrl?: string | null;
        status?: string;
      };
    }) => {
      return usersApi.update(userId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    },
  });
}

/**
 * Deactivate User Hook
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason?: string;
    }) => {
      return usersApi.deactivate(userId, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    },
  });
}

/**
 * Reactivate User Hook
 */
export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return usersApi.reactivate(userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    },
  });
}

