import { z } from "zod";
import {
  // Auth schemas
  LoginRequestSchema,
  LoginResponseSchema,
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
  LogoutResponseSchema,
  // Users schemas
  InviteUserRequestSchema,
  InviteUserResponseSchema,
  UpdateUserRequestSchema,
  UpdateUserResponseSchema,
  DeactivateUserRequestSchema,
  DeactivateUserResponseSchema,
  UsersListResponseSchema,
  UserDetailResponseSchema,
  ListUsersQuerySchema,
  // Organization schemas
  UpdateOrganizationRequestSchema,
  UpdateOrganizationResponseSchema,
  OrganizationResponseSchema,
  // Me schemas
  UpdateProfileRequestSchema,
  UpdateProfileResponseSchema,
  ChangePasswordRequestSchema,
  ChangePasswordResponseSchema,
  CurrentUserResponseSchema,
  // Audit schemas
  AuditQuerySchema,
  AuditListResponseSchema,
  // Common
  ErrorResponseSchema,
} from "../schemas";

/**
 * OpenAPI Specification Generator
 * 
 * Auto-generates OpenAPI 3.0 spec from Zod schemas
 */

function zodToJsonSchema(schema: z.ZodType<any>): any {
  // Basic Zod to JSON Schema conversion
  // In production, use @asteasolutions/zod-to-openapi
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const [key, value] of Object.entries(shape)) {
      const zodField = value as z.ZodType<any>;
      properties[key] = zodToJsonSchema(zodField);
      
      if (!(zodField instanceof z.ZodOptional)) {
        required.push(key);
      }
    }
    
    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }
  
  if (schema instanceof z.ZodString) {
    return { type: "string" };
  }
  
  if (schema instanceof z.ZodNumber) {
    return { type: "number" };
  }
  
  if (schema instanceof z.ZodBoolean) {
    return { type: "boolean" };
  }
  
  if (schema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToJsonSchema(schema.element),
    };
  }
  
  if (schema instanceof z.ZodEnum) {
    return {
      type: "string",
      enum: schema.options,
    };
  }
  
  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap());
  }
  
  if (schema instanceof z.ZodNullable) {
    const inner = zodToJsonSchema(schema.unwrap());
    return { ...inner, nullable: true };
  }
  
  return { type: "object" };
}

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "BFF Admin Config API",
    version: "1.0.0",
    description: "Backend-for-Frontend API for Admin Config & User Management",
    contact: {
      name: "AIBOS Team",
      email: "team@aibos.dev",
    },
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local development",
    },
    {
      url: "https://api.aibos.dev/admin-config",
      description: "Production (via Gateway)",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Users", description: "User management endpoints" },
    { name: "Organization", description: "Organization settings endpoints" },
    { name: "Me", description: "Current user profile endpoints" },
    { name: "Audit", description: "Audit log endpoints" },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Authenticate user and return JWT",
        operationId: "login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: zodToJsonSchema(LoginRequestSchema),
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: zodToJsonSchema(LoginResponseSchema),
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: zodToJsonSchema(ErrorResponseSchema),
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        description: "Invalidate session",
        operationId: "logout",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: zodToJsonSchema(LogoutResponseSchema),
              },
            },
          },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Forgot Password",
        description: "Send password reset email",
        operationId: "forgotPassword",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: zodToJsonSchema(ForgotPasswordRequestSchema),
            },
          },
        },
        responses: {
          "200": {
            description: "Reset link sent",
            content: {
              "application/json": {
                schema: zodToJsonSchema(ForgotPasswordResponseSchema),
              },
            },
          },
        },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset Password",
        description: "Reset password with token",
        operationId: "resetPassword",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: zodToJsonSchema(ResetPasswordRequestSchema),
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successful",
            content: {
              "application/json": {
                schema: zodToJsonSchema(ResetPasswordResponseSchema),
              },
            },
          },
          "400": {
            description: "Invalid or expired token",
            content: {
              "application/json": {
                schema: zodToJsonSchema(ErrorResponseSchema),
              },
            },
          },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List Users",
        description: "Get all users in tenant",
        operationId: "listUsers",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", schema: { type: "string" }, description: "Search query" },
          { name: "status", in: "query", schema: { type: "string" }, description: "Filter by status" },
          { name: "role", in: "query", schema: { type: "string" }, description: "Filter by role" },
        ],
        responses: {
          "200": {
            description: "Users list",
            content: {
              "application/json": {
                schema: zodToJsonSchema(UsersListResponseSchema),
              },
            },
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get User",
        description: "Get user details",
        operationId: "getUser",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "User details",
            content: {
              "application/json": {
                schema: zodToJsonSchema(UserDetailResponseSchema),
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: zodToJsonSchema(ErrorResponseSchema),
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update User",
        description: "Update user (admin only)",
        operationId: "updateUser",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: zodToJsonSchema(UpdateUserRequestSchema),
            },
          },
        },
        responses: {
          "200": {
            description: "User updated",
            content: {
              "application/json": {
                schema: zodToJsonSchema(UpdateUserResponseSchema),
              },
            },
          },
        },
      },
    },
    "/users/invite": {
      post: {
        tags: ["Users"],
        summary: "Invite User",
        description: "Invite user to organization (admin only)",
        operationId: "inviteUser",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: zodToJsonSchema(InviteUserRequestSchema),
            },
          },
        },
        responses: {
          "200": {
            description: "Invitation sent",
            content: {
              "application/json": {
                schema: zodToJsonSchema(InviteUserResponseSchema),
              },
            },
          },
        },
      },
    },
    "/users/{id}/deactivate": {
      post: {
        tags: ["Users"],
        summary: "Deactivate User",
        description: "Deactivate user (admin only)",
        operationId: "deactivateUser",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: zodToJsonSchema(DeactivateUserRequestSchema),
            },
          },
        },
        responses: {
          "200": {
            description: "User deactivated",
            content: {
              "application/json": {
                schema: zodToJsonSchema(DeactivateUserResponseSchema),
              },
            },
          },
        },
      },
    },
    "/users/{id}/reactivate": {
      post: {
        tags: ["Users"],
        summary: "Reactivate User",
        description: "Reactivate user (admin only)",
        operationId: "reactivateUser",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "User reactivated",
            content: {
              "application/json": {
                schema: zodToJsonSchema(UpdateUserResponseSchema),
              },
            },
          },
        },
      },
    },
    "/organization": {
      get: {
        tags: ["Organization"],
        summary: "Get Organization",
        description: "Get current organization details",
        operationId: "getOrganization",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Organization details",
            content: {
              "application/json": {
                schema: zodToJsonSchema(OrganizationResponseSchema),
              },
            },
          },
        },
      },
      patch: {
        tags: ["Organization"],
        summary: "Update Organization",
        description: "Update organization settings (admin only)",
        operationId: "updateOrganization",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: zodToJsonSchema(UpdateOrganizationRequestSchema),
            },
          },
        },
        responses: {
          "200": {
            description: "Organization updated",
            content: {
              "application/json": {
                schema: zodToJsonSchema(UpdateOrganizationResponseSchema),
              },
            },
          },
        },
      },
    },
    "/me": {
      get: {
        tags: ["Me"],
        summary: "Get Current User",
        description: "Get current user profile",
        operationId: "getCurrentUser",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user profile",
            content: {
              "application/json": {
                schema: zodToJsonSchema(CurrentUserResponseSchema),
              },
            },
          },
        },
      },
      patch: {
        tags: ["Me"],
        summary: "Update Profile",
        description: "Update current user profile",
        operationId: "updateProfile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: zodToJsonSchema(UpdateProfileRequestSchema),
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated",
            content: {
              "application/json": {
                schema: zodToJsonSchema(UpdateProfileResponseSchema),
              },
            },
          },
        },
      },
    },
    "/me/password": {
      patch: {
        tags: ["Me"],
        summary: "Change Password",
        description: "Change current user password",
        operationId: "changePassword",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: zodToJsonSchema(ChangePasswordRequestSchema),
            },
          },
        },
        responses: {
          "200": {
            description: "Password changed",
            content: {
              "application/json": {
                schema: zodToJsonSchema(ChangePasswordResponseSchema),
              },
            },
          },
        },
      },
    },
    "/audit": {
      get: {
        tags: ["Audit"],
        summary: "Get Audit Log",
        description: "Get audit events with filters",
        operationId: "getAuditLog",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
          { name: "action", in: "query", schema: { type: "string" } },
          { name: "entityType", in: "query", schema: { type: "string" } },
          { name: "userId", in: "query", schema: { type: "string" } },
          { name: "startDate", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date-time" } },
        ],
        responses: {
          "200": {
            description: "Audit events",
            content: {
              "application/json": {
                schema: zodToJsonSchema(AuditListResponseSchema),
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

