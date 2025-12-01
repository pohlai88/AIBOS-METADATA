/**
 * @aibos/kernel-finance
 *
 * IFRS-first, vendor-neutral finance kernel types and service interfaces.
 * Framework-agnostic domain layer for all Kernel V1 domains.
 *
 * Usage:
 *   - Import types for your implementations
 *   - Implement service interfaces in your backend (Hono/Express/etc.)
 *   - Wire to Supabase/Postgres as needed
 *   - Connect to Metadata Studio via OriginCellMeta and FinanceEvent
 */

// Core types
export * from "./core/types";

// Domain A: GL
export * from "./domain/gl/types";
export * from "./domain/gl/services";
export * from "./domain/gl/ports";
export { PostingServiceImpl } from "./domain/gl/posting.service.impl";
export { Decimal as DecimalUtils } from "./domain/gl/decimal-utils";

// Domain B: Inventory & Valuation (IAS 2)
export * from "./domain/inventory/types";
export * from "./domain/inventory/services";
export * from "./domain/inventory/ports";
export * from "./domain/inventory/ports.landed-cost";
export { InventoryValuationServiceImpl } from "./domain/inventory/inventory-valuation.service.impl";
export { LandedCostServiceImpl } from "./domain/inventory/landed-cost.service.impl";

// Domain C: PPE / Fixed Assets (IAS 16)
export * from "./domain/assets/types";
export * from "./domain/assets/services";
export * from "./domain/assets/ports";
export { AssetLifecycleServiceImpl } from "./domain/assets/asset-lifecycle.service.impl";
export { AssetDepreciationServiceImpl } from "./domain/assets/asset-depreciation.service.impl";

// Domain F: FX
export * from "./domain/fx/types";
export * from "./domain/fx/services";
export * from "./domain/fx/ports";
export { FxRevaluationServiceImpl } from "./domain/fx/revaluation.service.impl";
export { RealisedFxServiceImpl } from "./domain/fx/realised-fx.service.impl";

// Domain G: Tax
export * from "./domain/tax/types";
export * from "./domain/tax/services";

// Domain H: AP/AR Sub-ledgers
export * from "./domain/party/types";
export * from "./domain/subledger/types";
export * from "./domain/subledger/services";
export * from "./domain/subledger/ports";
export { PaymentAllocationServiceImpl } from "./domain/subledger/payment-allocation.service.impl";
export { AgingReportServiceImpl } from "./domain/subledger/aging-report.service.impl";
export { SubLedgerReconciliationServiceImpl } from "./domain/subledger/reconciliation.service.impl";

// Events
export * from "./events/finance-events";

