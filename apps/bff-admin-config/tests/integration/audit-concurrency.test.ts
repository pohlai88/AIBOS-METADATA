// apps/bff-admin-config/tests/integration/audit-concurrency.test.ts
/**
 * Audit Repository - Optimistic Locking Integration Test
 * 
 * This test proves that the atomic conditional INSERT prevents
 * audit chain forks under concurrent load.
 * 
 * THE "DOUBLE CLICK" SCENARIO:
 * Two admins try to update the same user at the exact same millisecond.
 * Only ONE should succeed; the other MUST fail with AuditConcurrencyError.
 * 
 * If this test fails, the entire "tamper-evident audit ledger" claim is invalid.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDatabase, closeDatabase } from "../../src/config/database";
import { createAuditRepository } from "../../src/infrastructure/repository-adapters";
import { AuditEvent } from "../../../../business-engine/admin-config/domain/entities/audit-event.entity";
import { AuditConcurrencyError } from "../../../../business-engine/admin-config/domain/errors/concurrency.error";
import crypto from "node:crypto";

describe("Audit Repository - Optimistic Locking", () => {
  const db = getDatabase();
  const auditRepository = createAuditRepository(db);

  // Unique trace ID for this test run (prevents interference)
  const testTraceId = crypto.randomUUID();
  const testActorId = crypto.randomUUID();
  const testResourceId = crypto.randomUUID();

  afterAll(async () => {
    // Clean up test data
    try {
      await db.execute(`DELETE FROM iam_audit_event WHERE trace_id = '${testTraceId}'`);
    } catch {
      // Ignore cleanup errors
    }
    await closeDatabase();
  });

  it("should allow the first event (genesis) with prevHash = null", async () => {
    // 1. GENESIS: Create the first event (Head of Chain)
    const genesisEvent = AuditEvent.create({
      traceId: testTraceId,
      resourceType: "USER",
      resourceId: testResourceId,
      action: "CREATE",
      actorUserId: testActorId,
      metadataDiff: { test: "genesis" },
      ipAddress: "127.0.0.1",
      userAgent: "test-runner",
      prevHash: null, // First event - no parent
    });

    const saved = await auditRepository.appendEvent(genesisEvent);

    expect(saved).toBeDefined();
    // traceId might be a Value Object with .value or .toString()
    const savedTraceId = typeof saved.traceId === 'string' ? saved.traceId : saved.traceId.toString();
    expect(savedTraceId).toBe(testTraceId);
    expect(saved.prevHash).toBeNull();
    expect(saved.hash).toBeDefined();
    expect(saved.hash.length).toBeGreaterThan(0);

    console.log("✅ Genesis event saved. Hash:", saved.hash);
  });

  it("should allow appending to the chain with correct prevHash", async () => {
    // Get the genesis event to link to
    const genesis = await auditRepository.getLatestByTraceId(testTraceId);
    expect(genesis).not.toBeNull();

    // Create a second event linking to genesis
    const secondEvent = AuditEvent.create({
      traceId: testTraceId,
      resourceType: "USER",
      resourceId: testResourceId,
      action: "UPDATE",
      actorUserId: testActorId,
      metadataDiff: { test: "second" },
      ipAddress: "127.0.0.1",
      userAgent: "test-runner",
      prevHash: genesis!.hash, // Link to genesis
    });

    const saved = await auditRepository.appendEvent(secondEvent);

    expect(saved).toBeDefined();
    expect(saved.prevHash).toBe(genesis!.hash);

    console.log("✅ Second event saved. Hash:", saved.hash, "→ prevHash:", saved.prevHash);
  });

  it("should REJECT a duplicate genesis (prevHash=null when chain exists)", async () => {
    // Try to create ANOTHER genesis event for the same trace
    const duplicateGenesis = AuditEvent.create({
      traceId: testTraceId,
      resourceType: "USER",
      resourceId: testResourceId,
      action: "CREATE",
      actorUserId: testActorId,
      metadataDiff: { test: "duplicate-genesis" },
      prevHash: null, // Claiming to be first, but chain already exists!
    });

    await expect(auditRepository.appendEvent(duplicateGenesis)).rejects.toThrow(
      AuditConcurrencyError,
    );

    console.log("✅ Duplicate genesis correctly rejected.");
  });

  it("should REJECT appending to a non-tail event (fork attempt)", async () => {
    // Get the genesis event (which is NOT the tail anymore)
    const events = await auditRepository.getTimelineByTraceId(testTraceId);
    const genesis = events.find((e) => e.prevHash === null);
    expect(genesis).toBeDefined();

    // Try to append to genesis (which already has a child)
    const forkAttempt = AuditEvent.create({
      traceId: testTraceId,
      resourceType: "USER",
      resourceId: testResourceId,
      action: "DEACTIVATE",
      actorUserId: testActorId,
      metadataDiff: { test: "fork-attempt" },
      prevHash: genesis!.hash, // Pointing to genesis, which already has a successor
    });

    await expect(auditRepository.appendEvent(forkAttempt)).rejects.toThrow(
      AuditConcurrencyError,
    );

    console.log("✅ Fork attempt correctly rejected.");
  });

  it("should prevent audit chain forks under CONCURRENT load", async () => {
    // This is the critical test: simulate two concurrent writes
    
    // First, get the current tail
    const currentTail = await auditRepository.getLatestByTraceId(testTraceId);
    expect(currentTail).not.toBeNull();

    console.log("⚡ Current tail hash:", currentTail!.hash);
    console.log("⚡ Launching concurrent writes...");

    // Build two events with SAME prevHash (both trying to be the successor)
    const attackA = AuditEvent.create({
      traceId: testTraceId,
      resourceType: "USER",
      resourceId: testResourceId,
      action: "PROFILE_UPDATE",
      actorUserId: testActorId,
      metadataDiff: { attacker: "A", timestamp: Date.now() },
      prevHash: currentTail!.hash, // Both point to same parent
    });

    const attackB = AuditEvent.create({
      traceId: testTraceId,
      resourceType: "USER",
      resourceId: testResourceId,
      action: "DEACTIVATE",
      actorUserId: testActorId,
      metadataDiff: { attacker: "B", timestamp: Date.now() },
      prevHash: currentTail!.hash, // SAME parent - fork attempt!
    });

    // Execute them in parallel
    const results = await Promise.allSettled([
      auditRepository.appendEvent(attackA),
      auditRepository.appendEvent(attackB),
    ]);

    // ANALYSIS
    const succeeded = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    console.log(`📊 Results: ${succeeded.length} succeeded, ${failed.length} failed`);

    // ASSERTIONS
    // Exactly ONE should succeed (the winner)
    expect(succeeded.length).toBe(1);

    // Exactly ONE should fail (the loser)
    expect(failed.length).toBe(1);

    // The failure MUST be our specific concurrency error
    const failureReason = (failed[0] as PromiseRejectedResult).reason;
    expect(failureReason).toBeInstanceOf(AuditConcurrencyError);
    expect(failureReason.message).toContain("Audit chain fork detected");

    console.log("✅ One write succeeded, one correctly rejected with AuditConcurrencyError");

    // VERIFY CHAIN INTEGRITY
    const allEvents = await auditRepository.getTimelineByTraceId(testTraceId);
    
    // Should have exactly 3 events: genesis + second + winner
    // (If it has 4, the fork happened and we have a bug!)
    expect(allEvents.length).toBe(3);

    // Verify the chain is linear (each event except genesis has exactly one parent)
    const hashSet = new Set(allEvents.map((e) => e.hash));
    const prevHashSet = new Set(allEvents.filter((e) => e.prevHash).map((e) => e.prevHash));
    
    // Every prevHash should point to an existing hash (except null)
    for (const event of allEvents) {
      if (event.prevHash !== null) {
        expect(hashSet.has(event.prevHash)).toBe(true);
      }
    }

    console.log("✅ Audit Chain Integrity Verified: Fork prevented, chain is linear.");
  });

  it("should verify full hash chain integrity", async () => {
    const result = await auditRepository.verifyHashChain(testTraceId);

    expect(result.isValid).toBe(true);
    expect(result.brokenAt).toBeUndefined();

    console.log("✅ Hash chain verification passed.");
  });
});

