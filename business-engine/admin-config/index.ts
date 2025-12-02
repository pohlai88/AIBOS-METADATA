// business-engine/admin-config/index.ts
// Identity & Org Admin Module (MVP1)
// Hexagonal Architecture Entry Point

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACTS (Zod Schemas - Shared API)
// ─────────────────────────────────────────────────────────────────────────────
export * from './contracts/tenant.contract';
export * from './contracts/user.contract';
export * from './contracts/membership.contract';
export * from './contracts/audit.contract';
export * from './contracts/auth.contract';

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN (Pure Business Logic)
// ─────────────────────────────────────────────────────────────────────────────
export * from './domain/value-objects';
export * from './domain/entities';
export * from './domain/events';

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION (Use Cases & Ports)
// ─────────────────────────────────────────────────────────────────────────────
export * from './application/ports/outbound';
export * from './application/use-cases';

// ─────────────────────────────────────────────────────────────────────────────
// INFRASTRUCTURE (Adapters - Import selectively in apps)
// ─────────────────────────────────────────────────────────────────────────────
// Note: Infrastructure adapters are NOT exported here.
// Import directly from ./infrastructure/* in your app composition root.

