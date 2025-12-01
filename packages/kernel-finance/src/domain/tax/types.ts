import {
  CurrencyCode,
  DecimalString,
  ISODate,
  MetadataBag,
  TenantId,
  Ulid,
} from "../../core/types";

export type TaxRuleId = Ulid;

export type TaxType = "VAT" | "GST" | "SALES_TAX" | "WHT";

export interface TaxRule {
  readonly taxRuleId: TaxRuleId;
  readonly tenantId: TenantId;

  readonly jurisdiction: string; // e.g. "MY", "SG", "EU"
  readonly taxType: TaxType;
  readonly code: string; // "SST_STD_6", "GST_7", etc.

  readonly rate: DecimalString; // "0.0600" for 6%
  readonly inclusive: boolean; // price includes tax
  readonly recoverable: boolean; // input tax recoverable?

  readonly validFrom: ISODate;
  readonly validTo?: ISODate;

  readonly outputTaxAccountId: Ulid; // liability
  readonly inputTaxAccountId?: Ulid; // recoverable input tax

  readonly metadata?: MetadataBag;
}

export interface TaxableLine {
  readonly lineId: string;
  readonly netAmount: DecimalString; // before tax, in document currency
  readonly currency: CurrencyCode;

  readonly taxRuleId: TaxRuleId;
}

export interface TaxLineResult {
  readonly lineId: string;

  readonly taxRuleId: TaxRuleId;
  readonly taxAmount: DecimalString; // tax amount on this line

  readonly outputTaxAccountId: Ulid;
  readonly inputTaxAccountId?: Ulid;
}

export interface TaxComputationResult {
  readonly totalTaxAmount: DecimalString;
  readonly lines: readonly TaxLineResult[];
}

