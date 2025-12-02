/**
 * Controlled Vocabulary System (SDK v1.0.0)
 *
 * This is the CENTRAL NERVOUS SYSTEM for approved terminology.
 * Only terms defined here can be used in code.
 *
 * VERSIONING:
 * - This SDK is versioned to ensure compatibility
 * - Clients MUST use compatible SDK version
 * - Mismatched versions will cause deployment errors
 *
 * OPENMETADATA COMPATIBLE:
 * - Follows OpenMetadata schema patterns
 * - Compatible with OpenMetadata v1.4.0
 * - See: https://open-metadata.org/
 *
 * How it works:
 * 1. Glossary defines approved terms (SSOT)
 * 2. TypeScript generates literal types
 * 3. Developers get autocomplete for approved terms only
 * 4. ESLint blocks unapproved terms
 * 5. Version checking prevents deployment mismatches
 */

import { z } from "zod";
import { SDK_VERSION, assertVersionCompatibility } from "../sdk/version";

// ============================================
// APPROVED BUSINESS TERMS (Glossary)
// ============================================

/**
 * Finance Domain - Approved Terms
 *
 * These are the ONLY terms developers can use for finance entities.
 * Using unapproved terms will cause TypeScript errors.
 */
export const APPROVED_FINANCE_TERMS = {
  // Core Financial Statements
  revenue: "revenue",
  expense: "expense",
  asset: "asset",
  liability: "liability",
  equity: "equity",

  // Income Statement Terms (APPROVED by IFRS)
  grossProfit: "gross_profit",
  operatingIncome: "operating_income",
  netIncome: "net_income",
  ebitda: "ebitda",

  // Balance Sheet Terms (APPROVED by IFRS)
  currentAssets: "current_assets",
  nonCurrentAssets: "non_current_assets",
  currentLiabilities: "current_liabilities",
  nonCurrentLiabilities: "non_current_liabilities",

  // Cash Flow Terms (APPROVED by IFRS)
  operatingCashFlow: "operating_cash_flow",
  investingCashFlow: "investing_cash_flow",
  financingCashFlow: "financing_cash_flow",

  // IFRS-Specific Terms
  propertyPlantEquipment: "property_plant_equipment", // IAS 16
  inventory: "inventory", // IAS 2
  tradeReceivables: "trade_receivables",
  tradePayables: "trade_payables",
} as const;

/**
 * ❌ BLOCKED TERMS (Not Approved)
 *
 * These terms are AMBIGUOUS or NON-STANDARD.
 * Do NOT use these - use approved terms instead!
 */
export const BLOCKED_FINANCE_TERMS = {
  // ❌ Ambiguous - use 'revenue' instead
  income: 'Use "revenue" or "net_income" (be specific!)',
  sales: 'Use "revenue" (IFRS term)',

  // ❌ Ambiguous - use specific term
  profit:
    'Use "gross_profit", "operating_income", or "net_income" (be specific!)',

  // ❌ Non-standard abbreviations
  AR: 'Use "trade_receivables" (full term)',
  AP: 'Use "trade_payables" (full term)',
  PPE: 'Use "property_plant_equipment" (full term)',

  // ❌ Colloquial terms
  money: 'Use "cash", "revenue", or specific account',
  stuff: "Use specific term from approved list",
} as const;

/**
 * HR Domain - Approved Terms
 */
export const APPROVED_HR_TERMS = {
  employee: "employee",
  contractor: "contractor",
  department: "department",
  position: "position",
  salary: "salary",
  benefits: "benefits",

  // ❌ Blocked: worker, staff, people (use 'employee')
} as const;

/**
 * Operations Domain - Approved Terms
 */
export const APPROVED_OPERATIONS_TERMS = {
  product: "product",
  service: "service",
  customer: "customer",
  supplier: "supplier",
  order: "order",
  shipment: "shipment",

  // ❌ Blocked: client (use 'customer'), vendor (use 'supplier')
} as const;

// ============================================
// AUTO-GENERATED TYPES (from Glossary)
// ============================================

/**
 * Approved Finance Term
 *
 * TypeScript will ONLY allow values from APPROVED_FINANCE_TERMS.
 * Any other value = compile error!
 */
export type ApprovedFinanceTerm =
  (typeof APPROVED_FINANCE_TERMS)[keyof typeof APPROVED_FINANCE_TERMS];

/**
 * Approved HR Term
 */
export type ApprovedHRTerm =
  (typeof APPROVED_HR_TERMS)[keyof typeof APPROVED_HR_TERMS];

/**
 * Approved Operations Term
 */
export type ApprovedOperationsTerm =
  (typeof APPROVED_OPERATIONS_TERMS)[keyof typeof APPROVED_OPERATIONS_TERMS];

/**
 * Any Approved Term (across all domains)
 */
export type ApprovedTerm =
  | ApprovedFinanceTerm
  | ApprovedHRTerm
  | ApprovedOperationsTerm;

// ============================================
// VALIDATION SCHEMAS
// ============================================

/**
 * Zod schema that ONLY accepts approved finance terms
 */
export const ApprovedFinanceTermSchema = z.enum([
  APPROVED_FINANCE_TERMS.revenue,
  APPROVED_FINANCE_TERMS.expense,
  APPROVED_FINANCE_TERMS.asset,
  APPROVED_FINANCE_TERMS.liability,
  APPROVED_FINANCE_TERMS.equity,
  APPROVED_FINANCE_TERMS.grossProfit,
  APPROVED_FINANCE_TERMS.operatingIncome,
  APPROVED_FINANCE_TERMS.netIncome,
  APPROVED_FINANCE_TERMS.ebitda,
  APPROVED_FINANCE_TERMS.currentAssets,
  APPROVED_FINANCE_TERMS.nonCurrentAssets,
  APPROVED_FINANCE_TERMS.currentLiabilities,
  APPROVED_FINANCE_TERMS.nonCurrentLiabilities,
  APPROVED_FINANCE_TERMS.operatingCashFlow,
  APPROVED_FINANCE_TERMS.investingCashFlow,
  APPROVED_FINANCE_TERMS.financingCashFlow,
  APPROVED_FINANCE_TERMS.propertyPlantEquipment,
  APPROVED_FINANCE_TERMS.inventory,
  APPROVED_FINANCE_TERMS.tradeReceivables,
  APPROVED_FINANCE_TERMS.tradePayables,
] as const);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a term is approved
 */
export function isApprovedTerm(term: string): term is ApprovedTerm {
  const allApproved = [
    ...Object.values(APPROVED_FINANCE_TERMS),
    ...Object.values(APPROVED_HR_TERMS),
    ...Object.values(APPROVED_OPERATIONS_TERMS),
  ];
  return allApproved.includes(term as ApprovedTerm);
}

/**
 * Get suggestion for blocked term
 */
export function getSuggestion(blockedTerm: string): string | undefined {
  return BLOCKED_FINANCE_TERMS[
    blockedTerm as keyof typeof BLOCKED_FINANCE_TERMS
  ];
}

/**
 * Validate term and throw error if not approved
 */
export function validateTerm(term: string): void {
  if (!isApprovedTerm(term)) {
    const suggestion = getSuggestion(term);
    if (suggestion) {
      throw new Error(`❌ Term "${term}" is not approved. ${suggestion}`);
    } else {
      throw new Error(
        `❌ Term "${term}" is not in the approved glossary. ` +
          `Use one of: ${Object.values(APPROVED_FINANCE_TERMS).join(", ")}`
      );
    }
  }
}

// ============================================
// EXPORTS FOR TYPE GENERATION
// ============================================

export const ControlledVocabulary = {
  // SDK Version (MUST match client version)
  version: SDK_VERSION.full,
  sdkName: "@aibos/controlled-vocabulary-sdk",

  // Approved terms by domain
  finance: APPROVED_FINANCE_TERMS,
  hr: APPROVED_HR_TERMS,
  operations: APPROVED_OPERATIONS_TERMS,

  // Blocked terms (for validation)
  blocked: BLOCKED_FINANCE_TERMS,

  // Metadata
  metadata: {
    lastUpdated: new Date().toISOString(),
    totalApprovedTerms:
      Object.keys(APPROVED_FINANCE_TERMS).length +
      Object.keys(APPROVED_HR_TERMS).length +
      Object.keys(APPROVED_OPERATIONS_TERMS).length,
    domains: ["finance", "hr", "operations"],
  },
} as const;

/**
 * Initialize SDK with version check
 *
 * Call this at app startup to ensure version compatibility
 */
export function initializeControlledVocabularySDK(clientVersion: string) {
  assertVersionCompatibility(clientVersion);

  console.log(`✅ Controlled Vocabulary SDK v${SDK_VERSION.full} initialized`);
  console.log(
    `   Total approved terms: ${ControlledVocabulary.metadata.totalApprovedTerms}`
  );
  console.log(
    `   Domains: ${ControlledVocabulary.metadata.domains.join(", ")}`
  );

  return ControlledVocabulary;
}
