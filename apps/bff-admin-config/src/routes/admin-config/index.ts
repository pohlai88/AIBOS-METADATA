import { Hono } from "hono";
import { authRoutes } from "./auth.routes";
import { usersRoutes } from "./users.routes";
import { organizationRoutes } from "./organization.routes";
import { auditRoutes } from "./audit.routes";
import { meRoutes } from "./me.routes";

/**
 * Admin Config Routes
 * 
 * Mounts all admin-config related routes:
 * - /auth/* - Authentication
 * - /organization - Organization settings
 * - /users/* - User management
 * - /me/* - Current user profile
 * - /audit - Audit log
 */

export const adminConfigRoutes = new Hono();

// Mount sub-routes
adminConfigRoutes.route("/auth", authRoutes);
adminConfigRoutes.route("/organization", organizationRoutes);
adminConfigRoutes.route("/users", usersRoutes);
adminConfigRoutes.route("/me", meRoutes);
adminConfigRoutes.route("/audit", auditRoutes);

