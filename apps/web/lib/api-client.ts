/**
 * API Client
 *
 * Type-safe API client for backend communication
 * Uses fetch with automatic token injection
 */

/**
 * API Base URL
 * 
 * In production: Routes through API Gateway (e.g., /admin-config/...)
 * In development: Direct to BFF service
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Auth token management
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
}

/**
 * API Request wrapper
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Auth API
 */
export const authApi = {
  login: async (email: string, password: string, tenantSlug?: string) => {
    const response = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string; name: string };
      tenant?: { id: string; name: string; slug: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, tenantSlug }),
    });

    // Store token
    setAuthToken(response.accessToken);

    return response;
  },

  logout: async () => {
    await apiRequest("/auth/logout", { method: "POST" });
    removeAuthToken();
  },

  forgotPassword: async (email: string) => {
    return apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return apiRequest<{ message: string; user: { id: string; email: string } }>(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ token, password }),
      }
    );
  },

  acceptInvite: async (token: string, password: string, name?: string) => {
    return apiRequest<{
      message: string;
      user: { id: string; email: string; name: string; status: string };
      tenantId: string;
      role: string;
    }>("/auth/accept-invite", {
      method: "POST",
      body: JSON.stringify({ token, password, name }),
    });
  },
};

/**
 * Organization API
 */
export const organizationApi = {
  get: async () => {
    return apiRequest<{
      id: string;
      name: string;
      slug: string;
      contactEmail: string | null;
      website: string | null;
      address: string | null;
      logoUrl: string | null;
      updatedBy: { name: string; email: string };
      updatedAt: string;
    }>("/organization");
  },

  update: async (data: {
    name?: string;
    slug?: string;
    contactEmail?: string;
    website?: string;
    address?: string;
    logoUrl?: string | null;
  }) => {
    return apiRequest<{ message: string }>("/organization", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

/**
 * Users API
 */
export const usersApi = {
  list: async (filters?: { q?: string; status?: string; role?: string }) => {
    const params = new URLSearchParams(filters as Record<string, string>);
    return apiRequest<{
      users: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        avatarUrl: string | null;
        joinedAt: string;
        lastActive: string | null;
      }>;
      total: number;
    }>(`/users?${params}`);
  },

  get: async (userId: string) => {
    return apiRequest<{
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        avatarUrl: string | null;
        joinedAt: string;
        lastActive: string | null;
        permissions: string[];
        invitedBy: string;
      };
    }>(`/users/${userId}`);
  },

  invite: async (email: string, role: string) => {
    return apiRequest<{ message: string; email: string }>("/users/invite", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  },

  update: async (
    userId: string,
    data: {
      displayName?: string;
      avatarUrl?: string | null;
      status?: string;
    }
  ) => {
    return apiRequest<{ message: string }>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deactivate: async (userId: string, reason?: string) => {
    return apiRequest<{ message: string }>(`/users/${userId}/deactivate`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  reactivate: async (userId: string) => {
    return apiRequest<{ message: string }>(`/users/${userId}/reactivate`, {
      method: "POST",
    });
  },
};

/**
 * Current User (Me) API
 */
export const meApi = {
  get: async () => {
    return apiRequest<{
      id: string;
      email: string;
      displayName: string;
      avatarUrl: string | null;
      status: string;
      locale: string;
      timezone: string;
      memberships: Array<{
        tenantId: string;
        tenantName: string;
        role: string;
        joinedAt: string;
      }>;
      permissions: string[];
    }>("/me");
  },

  update: async (data: {
    displayName?: string;
    avatarUrl?: string | null;
    locale?: string;
    timezone?: string;
  }) => {
    return apiRequest<{ message: string }>("/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest<{ message: string }>("/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

/**
 * Audit API
 */
export const auditApi = {
  list: async (filters?: {
    limit?: number;
    offset?: number;
    action?: string;
    entityType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams(filters as Record<string, string>);
    return apiRequest<{
      events: Array<{
        id: string;
        traceId: string;
        action: string;
        actorName: string;
        actorEmail: string;
        targetType: string;
        targetId: string;
        description: string;
        timestamp: string;
        metadata: Record<string, unknown>;
      }>;
      total: number;
    }>(`/audit?${params}`);
  },
};
