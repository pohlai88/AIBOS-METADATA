# 🧠 AI-BOS Finance Kernel V1  

**Status:** Draft Implementation Blueprint  

**Scope:** IFRS-first core accounting engine for AI-BOS  

**Target ERP Tier:** Tier-1 logic (SAP/Oracle/NetSuite class) with lean, modular execution

---

## 1. Purpose & Scope

The **Finance Kernel V1** is the **authoritative accounting brain** of AI-BOS.

- It is **not** copied from ERPNext or any vendor.
- It is designed **directly from IFRS / IAS principles** and your **Master PRD**, with clean domain boundaries.
- It is built for:
  - Multi-tenant, multi-entity environments  
  - AI-governed orchestration (MCP, agents, orchestras)  
  - Strong metadata & audit governance

The kernel exposes **pure TypeScript interfaces + implementation skeletons**, behind **ports**.  
Any framework (Supabase, Postgres, Hono/Express, queues) lives **outside** via adapters.

---

## 2. Domain Map (Finance Kernel V1)

| Code | Domain                        | Standard / Reference          | Key Services (Interfaces)                                             |
|------|------------------------------|-------------------------------|------------------------------------------------------------------------|
| A    | General Ledger (GL)          | IAS 1, IAS 8, Framework       | `PostingService`, `PeriodService` (via ports), validation invariants   |
| F    | Foreign Exchange (FX)        | IAS 21                        | `FxRateService`, `FxRevaluationService`, `RealisedFxService`          |
| B    | Inventory & Valuation        | IAS 2                         | `InventoryValuationService`, `LandedCostService`                      |
| C    | Property, Plant & Equipment  | IAS 16                        | `AssetLifecycleService`, `AssetDepreciationService`                   |
| H    | AP/AR Sub-ledgers            | IFRS 9 (credit loss), IFRS 7  | `PaymentAllocationService`, `AgingReportService`, `SubLedgerReconciliationService` |
| G    | Tax Engine (VAT/GST/WHT)     | Local tax acts, IAS 12 anchor | `TaxRuleService`, `TaxComputationService`                             |

**Kernel V1 implements concrete skeletons for A, B, C, F, H.**  
**Domain G** is defined at type/interface level and ready for engine implementation.

---

## 3. Core Architectural Principles

1. **IFRS-first, vendor-neutral**
   - Logic is derived from IFRS/IAS and your Master PRD, not from ERPNext/Odoo/SAP internals.
   - This protects your **metadata purity** and **governance**, avoiding pollution from legacy ERPs.

2. **Ports & Adapters**
   - Each domain has **ports** (`*Repository`, `*ServiceDeps`) defining what the kernel requires.
   - Supabase/Postgres, queues, Redis, etc. are **adapters**, plugged in at the app layer.

3. **Immutable Journals, Single Posting Gate**
   - All financial postings go through `PostingService`.
   - Journals are write-once, `status = POSTED` and never mutated — corrections use new journals.

4. **Event-Driven Finance**
   - Domain services emit **FinanceEvents** (e.g. `GL.JOURNAL_POSTED`, `FX.REVALUATION_RUN`) via `FinanceEventPublisher`.
   - Orchestras (closing, compliance, analytics) subscribe without coupling to core math.

5. **Decimal & Validation Invariants**
   - Monetary values are `DecimalString` and handled via a `Decimal` helper (later swappable with `decimal.js` or similar).
   - Every posting returns a `ValidationReport` (no silent failures).

6. **Metadata-First**
   - All domain entities carry `MetadataBag` hooks.
   - This lets your **Metadata Studio / Nexus** add governance tags without touching core logic.

---

## 4. Cross-Cutting Types (Core)

Defined in `core/types.ts`:

- **Identity & tenancy**
  - `TenantId`, `EntityId`, `Ulid`
- **Time**
  - `ISODate`, `ISODateTime`, `PeriodId`, `PeriodStatus`
- **Money & FX**
  - `CurrencyCode`, `DecimalString`
- **GL constructs**
  - `AccountId`, `AccountType`, `JournalStatus`
- **Dimensions**
  - `SegmentId`, `ProjectId`, `CostCenterId`
- **Metadata**
  - `MetadataBag`
- **Origin**
  - `OriginCellMeta` (e.g. `"kernel.fx.revaluation"`, `"kernel.assets.depreciation"`)

These keep the kernel **strictly typed** and easy for MCP/agents to reason about.

---

## 5. Domain A — General Ledger (GL)

### Types

- `Account` (with `isPostingAllowed`, mapping to control accounts)  
- `JournalEntry`, `JournalLine`, `JournalEntryDraft`  
- `ValidationMessage`, `ValidationReport`

### Ports

- `JournalRepository` – persist `JournalEntry` as immutable `POSTED`.  
- `AccountRepository` – read COA.  
- `PeriodRepository` – resolve periods and statuses.  
- `Clock`, `IdGenerator` – infra abstractions.  
- `FinanceEventPublisher` – publish `JournalPostedEvent`.  

### Service

```ts
interface PostingService {
  postJournal(draft: JournalEntryDraft): Promise<{
    journal: JournalEntry | null;
    validation: ValidationReport;
  }>;
  validateJournalDraft(draft: JournalEntryDraft): Promise<ValidationReport>;
}
```

### Implementation

* `PostingServiceImpl` enforces:
  * **Double-entry**: sum(debit) = sum(credit)
  * **No "both sides" lines** (no debit+credit on same line)
  * **No empty lines** (each line must have one side non-zero)
  * **Posting allowed**: `account.isPostingAllowed`
  * **Period open**: period for `journalDate` must be `OPEN`
* On success:
  * Persists journal via `JournalRepository.savePosted`
  * Emits `GL.JOURNAL_POSTED` with cellId `kernel.gl.posting`

**PRD hook points:**
* `// TODO: PRD A.1.x` — balance, rounding, currency rules
* `// TODO: PRD A.2.x` — period/lockdown policies
* `// TODO: PRD A.3.x` — account-type blocking (e.g. RE, tax accounts)

---

## 6. Domain F — Foreign Exchange (FX)

### 6.1 Services

* `FxRateService`
  * `getRate({ tenantId, fromCurrency, toCurrency, rateDate, rateType })`
* `FxRevaluationService`
  * `runRevaluation(FxRevaluationParams): FxRevaluationResult`
* `RealisedFxService`
  * `computeRealisedGainLoss({ originalAmount, originalRate, settlementAmount, settlementRate })`

### 6.2 Implementation

* `FxRevaluationServiceImpl`
  * Reads **monetary balances** from `MonetaryBalanceRepository`
  * Queries closing rates via `FxRateService`
  * Computes `deltaBase` per account
  * Builds and posts FX revaluation journal through `PostingService`
  * Uses configured unrealised gain/loss accounts from `FxRevaluationConfig`
  * Emits `FX.REVALUATION_RUN` event

* `RealisedFxServiceImpl`
  * Pure math:
    `realised = (settlementAmount × settlementRate) − (originalAmount × originalRate)`

**PRD hook points:**
* Define **monetary vs non-monetary** accounts
* Define **closing rate policy** (exact date vs nearest prior)
* Define **tolerance & rounding** for FX

---

## 7. Domain B — Inventory & Valuation (IAS 2)

### 7.1 Types

* `StockItem` – `valuationMethod: "MOVING_AVERAGE" | "FIFO"`
* `StockLedgerEntry` – running quantity, valuation rate, balance value
* `StockMovementEvent` – event from operational flows (GRN, delivery, adjustment)
* `LandedCostLine`, `LandedCostAllocationResultLine`

### 7.2 Ports

* `StockItemRepository`
* `StockLedgerRepository`
* `CostLayerRepository` (FIFO cost layers)
* `LandedCostBaseDocumentRepository` – reads GRN/PO lines
* `LandedCostApplicationRepository` – applies allocation into valuation

### 7.3 Services

* `InventoryValuationService`
  * `applyStockMovement(event: StockMovementEvent): StockLedgerEntry`
  * `getValuationSnapshot(...)`
* `LandedCostService`
  * `allocateLandedCost({ baseDocumentId, landedCostLines, method }): LandedCostAllocationResultLine[]`

### 7.4 Implementation

* `InventoryValuationServiceImpl`
  * **Moving Average**
    * Receipts: recompute average cost
    * Issues: use last valuation rate
  * **FIFO**
    * Maintains cost layers per item/warehouse
    * Issues: consume from oldest layers
* `LandedCostServiceImpl`
  * Allocates cost **by value** or **by quantity**
  * Delegates actual valuation change to `LandedCostApplicationRepository`

**PRD hook points:**
* Negative stock policy (allow vs block vs shadow)
* NRV / impairment handling (IAS 2 lower of cost & NRV)
* Currency & rounding consistency

---

## 8. Domain C — Assets / PPE (IAS 16)

### 8.1 Types

* `Asset`
  * `cost`, `salvageValue`, `usefulLifeMonths`
  * `depreciationMethod: STRAIGHT_LINE`
  * `assetAccountId`, `accumulatedDepreciationAccountId`, `depreciationExpenseAccountId`
* `DepreciationScheduleLine`
  * `periodNumber`, `depreciationAmount`, `netBookValue`, `postedJournalId?`

### 8.2 Ports

* `AssetRepository`
* `DepreciationScheduleRepository`
* `PeriodResolver`
* `AssetJournalConfig` (global gain/loss accounts & memos)

### 8.3 Services & Implementation

* `AssetLifecycleServiceImpl`
  * `registerAsset(...)` – creates asset, ready for schedule
  * `disposeAsset(...)`
    * Calculates NBV at disposal date from schedule
    * Computes gain/loss
    * Posts disposal journal via `PostingService`
* `AssetDepreciationServiceImpl`
  * `generateSchedule(assetId)` – straight-line monthly schedule
  * `postDepreciation(periodId)`
    * Finds assets in period
    * Identifies schedule lines in that period
    * Posts depreciation journal (debit expense, credit accumulated)

**PRD hook points:**
* Prorata / mid-month rules
* Last-period rounding adjustments
* Multi-component assets (future extension)

---

## 9. Domain H — AP/AR Sub-Ledgers

### 9.1 Types

* `SubLedgerInvoice` – AR or AP invoice, with `openBalance`, `controlAccountId`
* `PaymentEntry` – cash/bank movement
* `PaymentAllocation` – link payment → invoice
* `AgingBucketConfig`, `AgingSummaryPerParty`

### 9.2 Ports

* `SubLedgerInvoiceRepository`
* `PaymentRepository` (optional persistence)
* `AgingInvoiceViewRepository`
* `ControlAccountBalanceRepository`
* `SubLedgerControlBalanceRepository`

### 9.3 Services & Implementation

* `PaymentAllocationServiceImpl`
  * Strategies:
    * `FIFO` – oldest invoices first
    * `SPECIFIC` – targeted invoices
  * Returns allocations + unapplied amount (for residual credits)
* `AgingReportServiceImpl`
  * Buckets open balances per party & currency into aging buckets
  * Example buckets: `0–30`, `31–60`, `61–90`, `>90`
* `SubLedgerReconciliationServiceImpl`
  * Compares GL control balances vs sub-ledger totals per control account
  * Reports differences; `isInBalance` flag + per-account deltas

**PRD hook points:**
* Sign conventions (AR vs AP)
* Treatment of credit notes / negative balances in aging
* Reconciliation tolerance (e.g. ignore ±0.01)

---

## 10. Domain G — Tax (VAT/GST/WHT) — Types Ready

Domain G is **spec'd but not yet implemented** in V1.

* `TaxRule` – jurisdiction, tax type, rate, validity, linked GL accounts
* `TaxableLine` → `TaxLineResult` → `TaxComputationResult`
* Services:
  * `TaxRuleService`
  * `TaxComputationService`

This is ready for:
* SST/GST logic (MY, SG, etc.)
* Input/output tax separation
* WHT calculations based on local rules

---

## 11. Finance Events & Orchestras

The kernel emits structured **FinanceEvents** (via `FinanceEventPublisher`), e.g.:

* `GL.JOURNAL_POSTED`
* `FX.REVALUATION_RUN`
* Future:
  * `ASSET.DEPRECIATION_POSTED`
  * `ASSET.DISPOSAL_POSTED`
  * `INVENTORY.MOVEMENT_VALUED`

Your **orchestras** (closing, audit, analytics, AI agents) subscribe to these events to:

* Build dashboards
* Enforce approvals
* Trigger AI checks (SchemaGuardian, PolicyGuardian, etc.)
* Run MCP workflows

---

## 12. Integration Pattern (Backend Example)

At the app layer (e.g. Hono/Express), you compose services via factories:

```ts
// apps/backend/src/kernel/posting-service-factory.ts
const deps: PostingServiceDeps = {
  journalRepository: createJournalRepository(),
  accountRepository: createAccountRepository(),
  periodRepository: createPeriodRepository(),
  eventPublisher: createFinanceEventPublisher(),
  clock: { now: () => new Date().toISOString() },
  idGenerator: { generate: ulid },
  currentUserProvider: () => getCurrentUserId(),
};

export const postingService = new PostingServiceImpl(deps);
```

Routes are thin shells that:
* Accept DTOs
* Map to kernel types (`JournalEntryDraft`, etc.)
* Call kernel services
* Return `validation` + payload

---

## 13. Known Gaps vs Full Tier-1 ERP Coverage (for V1)

Finance Kernel V1 **already covers** the foundations expected of Tier-1 ERP:

* Robust GL posting with period controls
* Sub-ledger linkages (AR/AP control accounts)
* FX revaluation + realised FX
* IAS 2 inventory valuation (moving average + FIFO)
* IAS 16 PPE & depreciation
* Aging & reconciliation engines

Planned / known gaps (future phases):

* IFRS 15 (Revenue recognition patterns, multi-element contracts)
* IFRS 16 (Leases engine)
* Advanced IFRS 9 (ECL valuation, staging)
* Group consolidation (IFRS 10, 3) & intercompany elimination
* Full tax engine (Domain G implementation, multi-jurisdiction rules)

These are **deliberately deferred** to keep Kernel V1 clean, testable, and stable.

---

## 14. How MCP/Agents Should Use This Kernel

* Treat this README as the **SSOT for finance logic**.
* For any new automation:
  * **Never** post directly to GL tables. Always go through `PostingService`.
  * Respect domain boundaries (use `InventoryValuationService` for stock, `AssetDepreciationService` for PPE, etc.).
  * Fill in only the marked `// TODO: PRD ...` sections when extending logic.
* When in doubt:
  * Ask: *"Which domain owns this?"*
  * If ambiguous, extend the **domain** first, not the adapter.

---

**End of Finance Kernel V1 Blueprint**

This document is the **contract** between your Master PRD, IFRS standards, and any implementation (human or AI) building on top of AI-BOS Finance.
