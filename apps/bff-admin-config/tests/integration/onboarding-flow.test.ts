// apps/bff-admin-config/tests/integration/onboarding-flow.test.ts
/**
 * E2E Onboarding Flow Integration Test
 *
 * This test verifies the complete user onboarding journey:
 * 1. Admin invites a new user
 * 2. User accepts the invite (sets password)
 * 3. User logs in with new credentials
 * 4. Audit trail is complete and verified
 *
 * This is the "Proof of System" test - if this passes, the core architecture works.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

import { getDatabase, closeDatabase } from "../../src/config/database";
import {
  DrizzleTransactionManager,
  createRepositoryScope,
} from "../../src/infrastructure";

// Business Engine imports - using vitest alias
import { makeInviteUserUseCase } from "business-engine/admin-config/application/use-cases/user/invite-user.use-case";
import { makeAcceptInviteUseCase } from "business-engine/admin-config/application/use-cases/user/accept-invite.use-case";
import { makeLoginUseCase } from "business-engine/admin-config/application/use-cases/auth/login.use-case";

// ─────────────────────────────────────────────────────────────────────────────
// TEST SETUP
// ─────────────────────────────────────────────────────────────────────────────

describe("E2E Onboarding Flow", () => {
  const db = getDatabase();

  // Test data - unique per run to avoid conflicts
  const testRunId = crypto.randomUUID().slice(0, 8);
  const testEmail = `onboard-test-${testRunId}@example.com`;
  const testPassword = "SecurePass123!";
  const testName = "Test User";

  // These will be populated during the test
  let adminUserId: string;
  let adminTenantId: string;
  let invitedUserId: string;
  let rawInviteToken: string; // The unhashed token (simulating what would be in the email)

  // ─────────────────────────────────────────────────────────────────────────────
  // SETUP: Find or create an admin user for testing
  // ─────────────────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    console.log(`\n🧪 Starting Onboarding Test (Run ID: ${testRunId})`);
    console.log(`   Test Email: ${testEmail}\n`);

    // Find an existing admin user and tenant for testing
    // In a real setup, you'd use test fixtures
    const adminResult = await db.execute(sql`
      SELECT u.id as user_id, tm.tenant_id
      FROM iam_user u
      JOIN iam_user_tenant_membership tm ON u.id = tm.user_id
      WHERE tm.role IN ('platform_admin', 'org_admin')
      AND u.status = 'active'
      LIMIT 1
    `);

    if (!adminResult || adminResult.length === 0) {
      console.error("⚠️  No admin user found in database. Creating test fixtures...");

      // Create a test tenant
      const tenantResult = await db.execute(sql`
        INSERT INTO iam_tenant (name, slug, status)
        VALUES ('Test Tenant', 'test-tenant-${testRunId}', 'active')
        RETURNING tenant_id
      `);
      adminTenantId = (tenantResult[0] as any).tenant_id;

      // Create a test admin user
      const passwordHash = await bcrypt.hash("AdminPass123!", 12);
      const userResult = await db.execute(sql`
        INSERT INTO iam_user (email, password_hash, name, status)
        VALUES ('admin-${testRunId}@test.com', ${passwordHash}, 'Test Admin', 'active')
        RETURNING user_id
      `);
      adminUserId = (userResult[0] as any).user_id;

      // Create membership
      await db.execute(sql`
        INSERT INTO iam_user_tenant_membership (user_id, tenant_id, role)
        VALUES (${adminUserId}, ${adminTenantId}, 'org_admin')
      `);

      console.log(`   Created test admin: ${adminUserId}`);
      console.log(`   Created test tenant: ${adminTenantId}`);
    } else {
      adminUserId = (adminResult[0] as any).user_id;
      adminTenantId = (adminResult[0] as any).tenant_id;
      console.log(`   Using existing admin: ${adminUserId}`);
      console.log(`   Using existing tenant: ${adminTenantId}`);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CLEANUP: Remove test data after all tests
  // ─────────────────────────────────────────────────────────────────────────────

  afterAll(async () => {
    try {
      // Clean up test user and related data
      if (invitedUserId) {
        await db.execute(
          sql`DELETE FROM iam_audit_event WHERE resource_id = ${invitedUserId}::uuid`,
        );
        await db.execute(
          sql`DELETE FROM iam_invite_token WHERE user_id = ${invitedUserId}::uuid`,
        );
        await db.execute(
          sql`DELETE FROM iam_user_tenant_membership WHERE user_id = ${invitedUserId}::uuid`,
        );
        await db.execute(
          sql`DELETE FROM iam_user WHERE id = ${invitedUserId}::uuid`,
        );
        console.log(`\n🧹 Cleaned up test user: ${invitedUserId}`);
      }

      // Clean up test tenant if we created one
      if (adminTenantId?.includes(testRunId)) {
        await db.execute(
          sql`DELETE FROM iam_user_tenant_membership WHERE tenant_id = ${adminTenantId}`,
        );
        await db.execute(
          sql`DELETE FROM iam_tenant WHERE tenant_id = ${adminTenantId}`,
        );
        await db.execute(
          sql`DELETE FROM iam_user WHERE email LIKE 'admin-${testRunId}%'`,
        );
        console.log(`🧹 Cleaned up test tenant and admin`);
      }
    } catch (error) {
      console.error("Cleanup error (non-fatal):", error);
    }

    await closeDatabase();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 1: Admin Invites User
  // ─────────────────────────────────────────────────────────────────────────────

  it("Step 1: Admin should be able to invite a new user", async () => {
    console.log("\n📧 Step 1: Inviting user...");

    const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

    // Generate raw token (simulating what the BFF does)
    rawInviteToken = crypto.randomBytes(32).toString("hex");

    const inviteUserUseCase = makeInviteUserUseCase(txManager, {
      hashToken: (token: string) =>
        crypto.createHash("sha256").update(token).digest("hex"),
      generateToken: () => rawInviteToken, // Use our known token
    });

    const result = await inviteUserUseCase({
      input: {
        email: testEmail,
        name: testName,
        tenantId: adminTenantId,
        role: "member",
      },
      actor: {
        userId: adminUserId,
        tenantId: adminTenantId,
      },
      ipAddress: "127.0.0.1",
      userAgent: "integration-test",
    });

    // Capture the user ID for later tests
    invitedUserId = result.user.id!;

    // Assertions
    expect(result.user).toBeDefined();
    expect(result.user.email.toString()).toBe(testEmail);
    expect(result.user.status.toString()).toBe("invited");
    expect(result.membership).toBeDefined();
    expect(result.membership.role.toString()).toBe("member");
    expect(result.auditEvent).toBeDefined();
    expect(result.auditEvent.action).toBe("INVITE");

    console.log(`   ✅ User invited: ${invitedUserId}`);
    console.log(`   ✅ Status: ${result.user.status.toString()}`);
    console.log(`   ✅ Audit Event: ${result.auditEvent.action}`);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 2: Verify User Cannot Login Yet
  // ─────────────────────────────────────────────────────────────────────────────

  it("Step 2: Invited user should NOT be able to login before accepting", async () => {
    console.log("\n🚫 Step 2: Verifying login is blocked...");

    const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

    const loginUseCase = makeLoginUseCase(txManager, {
      verifyPassword: (pwd: string, hash: string) => bcrypt.compare(pwd, hash),
      generateAccessToken: () => "mock-access-token",
      generateRefreshToken: () => "mock-refresh-token",
    });

    // This should throw AuthenticationError because user has no password yet
    await expect(
      loginUseCase({
        input: {
          email: testEmail,
          password: testPassword, // Not set yet!
        },
        ipAddress: "127.0.0.1",
        userAgent: "integration-test",
      }),
    ).rejects.toThrow(); // AuthenticationError

    console.log(`   ✅ Login correctly blocked (user has no password)`);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 3: User Accepts Invite
  // ─────────────────────────────────────────────────────────────────────────────

  it("Step 3: User should be able to accept invite and set password", async () => {
    console.log("\n🔐 Step 3: Accepting invite...");

    const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

    const acceptInviteUseCase = makeAcceptInviteUseCase(txManager, {
      hashToken: (token: string) =>
        crypto.createHash("sha256").update(token).digest("hex"),
      hashPassword: async (pwd: string) => bcrypt.hash(pwd, 12),
    });

    const result = await acceptInviteUseCase({
      input: {
        token: rawInviteToken, // The token from the "email"
        password: testPassword,
        name: testName + " Updated", // Optional name update
      },
      ipAddress: "127.0.0.1",
      userAgent: "integration-test",
    });

    // Assertions
    expect(result.user).toBeDefined();
    expect(result.user.status.toString()).toBe("active"); // State machine transition!
    expect(result.user.name).toBe(testName + " Updated");
    expect(result.tenantId).toBe(adminTenantId);
    expect(result.role).toBe("member");
    expect(result.auditEvent).toBeDefined();
    expect(result.auditEvent.action).toBe("ACCEPT_INVITE");

    console.log(`   ✅ Invite accepted!`);
    console.log(`   ✅ Status: ${result.user.status.toString()}`);
    console.log(`   ✅ Tenant: ${result.tenantId}`);
    console.log(`   ✅ Role: ${result.role}`);
    console.log(`   ✅ Audit Event: ${result.auditEvent.action}`);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 4: User Can Now Login
  // ─────────────────────────────────────────────────────────────────────────────

  it("Step 4: User should now be able to login with new password", async () => {
    console.log("\n🔓 Step 4: Logging in...");

    const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

    const loginUseCase = makeLoginUseCase(txManager, {
      verifyPassword: (pwd: string, hash: string) => bcrypt.compare(pwd, hash),
      generateAccessToken: (payload) =>
        `mock-token-for-${payload.userId}`,
      generateRefreshToken: (userId: string) => `mock-refresh-for-${userId}`,
    });

    const result = await loginUseCase({
      input: {
        email: testEmail,
        password: testPassword,
      },
      ipAddress: "127.0.0.1",
      userAgent: "integration-test",
    });

    // Assertions
    expect(result.response).toBeDefined();
    expect(result.response.accessToken).toBeDefined();
    expect(result.response.user.email).toBe(testEmail);
    // Status is on result.user (entity), not result.response.user (DTO)
    expect(result.user.status.toString()).toBe("active");
    expect(result.auditEvent).toBeDefined();
    expect(result.auditEvent.action).toBe("LOGIN");

    console.log(`   ✅ Login successful!`);
    console.log(`   ✅ User: ${result.response.user.email}`);
    console.log(`   ✅ Status: ${result.response.user.status}`);
    console.log(`   ✅ Audit Event: ${result.auditEvent.action}`);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 5: Verify Complete Audit Trail
  // ─────────────────────────────────────────────────────────────────────────────

  it("Step 5: Audit trail should contain complete history", async () => {
    console.log("\n📜 Step 5: Verifying audit trail...");

    // Query audit events for this user
    const auditEvents = await db.execute(sql`
      SELECT action, prev_hash, hash, created_at
      FROM iam_audit_event
      WHERE resource_id = ${invitedUserId}
      ORDER BY created_at ASC
    `);

    // Expected sequence: INVITE -> ACCEPT_INVITE -> LOGIN
    expect(auditEvents.length).toBeGreaterThanOrEqual(3);

    const actions = auditEvents.map((e: any) => e.action);
    expect(actions).toContain("INVITE");
    expect(actions).toContain("ACCEPT_INVITE");
    expect(actions).toContain("LOGIN");

    // Verify hash chain integrity
    console.log("\n   Audit Chain:");
    let previousHash: string | null = null;
    for (const event of auditEvents as any[]) {
      const chainValid = event.prev_hash === previousHash;
      const status = chainValid ? "✅" : "❌";
      console.log(
        `   ${status} ${event.action.padEnd(15)} | prevHash: ${event.prev_hash?.slice(0, 8) ?? "NULL".padEnd(8)} | hash: ${event.hash.slice(0, 8)}`,
      );

      // The first event should have null prevHash
      if (previousHash === null) {
        expect(event.prev_hash).toBeNull();
      } else {
        expect(event.prev_hash).toBe(previousHash);
      }

      previousHash = event.hash;
    }

    console.log(`\n   ✅ Audit trail verified: ${auditEvents.length} events`);
    console.log(`   ✅ Hash chain integrity: VALID`);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 6: Token Cannot Be Reused
  // ─────────────────────────────────────────────────────────────────────────────

  it("Step 6: Invite token should be invalidated after use", async () => {
    console.log("\n🔒 Step 6: Verifying token is invalid...");

    const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

    const acceptInviteUseCase = makeAcceptInviteUseCase(txManager, {
      hashToken: (token: string) =>
        crypto.createHash("sha256").update(token).digest("hex"),
      hashPassword: async (pwd: string) => bcrypt.hash(pwd, 12),
    });

    // Try to use the same token again - should fail
    await expect(
      acceptInviteUseCase({
        input: {
          token: rawInviteToken, // Same token
          password: "AnotherPassword123!",
        },
        ipAddress: "127.0.0.1",
        userAgent: "integration-test",
      }),
    ).rejects.toThrow(); // ValidationError - token already used

    console.log(`   ✅ Token correctly invalidated (cannot be reused)`);
  });
});

