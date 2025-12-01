import {
  TaxComputationResult,
  TaxRule,
  TaxRuleId,
  TaxableLine,
} from "./types";
import {
  ISODate,
  TenantId,
} from "../../core/types";

/**
 * TaxRuleService
 * --------------
 * Manages registration and lookup of tax rules.
 */
export interface TaxRuleService {
  upsertTaxRule(
    draft: Omit<TaxRule, "taxRuleId">
  ): Promise<TaxRule>;

  getTaxRule(
    taxRuleId: TaxRuleId
  ): Promise<TaxRule | null>;

  findApplicableTaxRule(params: {
    tenantId: TenantId;
    jurisdiction: string;
    taxCode: string;
    effectiveDate: ISODate;
  }): Promise<TaxRule | null>;
}

/**
 * TaxComputationService
 * ---------------------
 * Computes tax amounts for a set of taxable lines.
 * Kernel invariant: tax is always separated from revenue/expense.
 */
export interface TaxComputationService {
  computeTaxes(
    lines: readonly TaxableLine[]
  ): Promise<TaxComputationResult>;
}

