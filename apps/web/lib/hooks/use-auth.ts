"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, meApi, getAuthToken, removeAuthToken } from "../api-client";
import { useRouter } from "next/navigation";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Auth State Store (Zustand)
 */
interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
  } | null;
  setAuth: (user: AuthState["user"], tenant: AuthState["tenant"]) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      tenant: null,
      setAuth: (user, tenant) =>
        set({ isAuthenticated: true, user, tenant }),
      clearAuth: () =>
        set({ isAuthenticated: false, user: null, tenant: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);

/**
 * Login Hook
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async ({
      email,
      password,
      tenantSlug,
    }: {
      email: string;
      password: string;
      tenantSlug?: string;
    }) => {
      return authApi.login(email, password, tenantSlug);
    },
    onSuccess: (data) => {
      setAuth(
        {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          avatarUrl: null,
        },
        data.tenant || null
      );
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
  });
}

/**
 * Logout Hook
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } finally {
        removeAuthToken();
      }
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
  });
}

/**
 * Current User Hook
 */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["me"],
    queryFn: meApi.get,
    enabled: isAuthenticated && !!getAuthToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Forgot Password Hook
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return authApi.forgotPassword(email);
    },
  });
}

/**
 * Reset Password Hook
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      token,
      password,
    }: {
      token: string;
      password: string;
    }) => {
      return authApi.resetPassword(token, password);
    },
    onSuccess: () => {
      router.push("/login?reset=success");
    },
  });
}

/**
 * Accept Invite Hook
 * 
 * Used when a user clicks the invite link from their email.
 * Sets their password and activates their account.
 */
export function useAcceptInvite() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async ({
      token,
      password,
      name,
    }: {
      token: string;
      password: string;
      name?: string;
    }) => {
      return authApi.acceptInvite(token, password, name);
    },
    onSuccess: (data) => {
      // After accepting invite, user needs to login
      // We could auto-login here, but it's safer to redirect to login
      router.push("/login?invited=success");
    },
  });
}

/**
 * Update Profile Hook
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: meApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/**
 * Change Password Hook
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      return meApi.changePassword(currentPassword, newPassword);
    },
  });
}

