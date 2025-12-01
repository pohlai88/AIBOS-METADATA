-- ===========================================
-- 2. CORE CONCEPTS (ABOUT 12)
-- ===========================================

-- NOTE: change this to your real tenant id
-- e.g. select id from tenants where name = 'DLBB Holding';
-- For now we use a placeholder:
-- 20571899-2b11-49cc-8c63-9622eae0f47a

insert into mdm_concept (
  tenant_id,
  canonical_key,
  label,
  description,
  domain,
  concept_type,
  governance_tier,
  standard_pack_id_primary,
  standard_ref,
  is_active
)
values
-- 1. Revenue (IFRS 15, Tier 1)
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'revenue',
  'Revenue',
  'Income arising in the course of ordinary activities, recognised when performance obligations are satisfied (IFRS 15).',
  'FINANCE',
  'FIELD',
  1,
  (select id from mdm_standard_pack where code = 'IFRS_CORE'),
  'IFRS 15:31',
  true
),

-- 2. Deferred Revenue (Contract Liability)
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'deferred_revenue',
  'Deferred Revenue (Contract Liability)',
  'Liability representing consideration received for which performance obligations are not yet satisfied.',
  'FINANCE',
  'FIELD',
  1,
  (select id from mdm_standard_pack where code = 'IFRS_CORE'),
  'IFRS 15:22-30',
  true
),

-- 3. GL Journal Entry (Entity)
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'gl_journal_entry',
  'GL Journal Entry',
  'Immutable record of debits and credits forming the general ledger spine.',
  'FINANCE',
  'ENTITY',
  1,
  (select id from mdm_standard_pack where code = 'IFRS_CORE'),
  'IAS 1:54-79',
  true
),

-- 4. GL Journal Line (Entity detail)
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'gl_journal_line',
  'GL Journal Line',
  'Line-level record within a journal, carrying account, debit/credit, segment, cost center and other tags.',
  'FINANCE',
  'ENTITY',
  1,
  (select id from mdm_standard_pack where code = 'IFRS_CORE'),
  'IAS 1 + internal chart of accounts guidance',
  true
),

-- 5. FX Rate (IAS 21)
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'fx_rate',
  'Foreign Exchange Rate',
  'Rate used to translate one currency into another (spot, closing or average) per IAS 21.',
  'FINANCE',
  'ENTITY',
  2,
  (select id from mdm_standard_pack where code = 'IAS_21_FX'),
  'IAS 21:23-28',
  true
),

-- 6. FX Revaluation (Service Rule)
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'fx_revaluation',
  'FX Revaluation Engine',
  'Service that revalues monetary assets and liabilities at closing rates, posting unrealised FX gains/losses.',
  'FINANCE',
  'SERVICE_RULE',
  2,
  (select id from mdm_standard_pack where code = 'IAS_21_FX'),
  'IAS 21:28-30',
  true
),

-- 7. Inventory Cost (IAS 2)
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'inventory_cost',
  'Inventory Cost',
  'Cost of inventories including purchase price, import duties, transport and other costs to bring inventory to its present location and condition.',
  'FINANCE',
  'FIELD',
  1,
  (select id from mdm_standard_pack where code = 'IAS_2_INV'),
  'IAS 2:10-15',
  true
),

-- 8. Stock Ledger Entry (Entity for valuation)
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'stock_ledger_entry',
  'Stock Ledger Entry',
  'Record of quantity and value movements for inventory, used to derive valuation (FIFO / Moving Average).',
  'FINANCE',
  'ENTITY',
  2,
  (select id from mdm_standard_pack where code = 'IAS_2_INV'),
  'IAS 2 + internal costing guidance',
  true
),

-- 9. Asset (PPE)
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'asset',
  'Property, Plant and Equipment Asset',
  'Tangible asset held for use in production or supply of goods or services, expected to be used more than one period.',
  'FINANCE',
  'ENTITY',
  1,
  (select id from mdm_standard_pack where code = 'IAS_16_PPE'),
  'IAS 16:6-7',
  true
),

-- 10. Depreciation Expense
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'depreciation_expense',
  'Depreciation Expense',
  'Systematic allocation of the depreciable amount of an asset over its useful life.',
  'FINANCE',
  'FIELD',
  2,
  (select id from mdm_standard_pack where code = 'IAS_16_PPE'),
  'IAS 16:50-53',
  true
),

-- 11. Tax Liability
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'tax_liability',
  'Tax Liability',
  'Amount of tax collected or owed to the tax authority (VAT/GST/Sales Tax payable).',
  'FINANCE',
  'FIELD',
  1,
  (select id from mdm_standard_pack where code = 'GLOBAL_TAX'),
  'Local tax law / VAT act',
  true
),

-- 12. Party (AP/AR Sub-ledger)
(
  '20571899-2b11-49cc-8c63-9622eae0f47a',
  'party',
  'Trade Party (Customer / Supplier)',
  'Counterparty for receivables and payables, carrying tax ID, payment terms and default currency.',
  'FINANCE',
  'ENTITY',
  2,
  (select id from mdm_standard_pack where code = 'IFRS_CORE'),
  'IFRS 9:5.1.1 and related',
  true
)
on conflict (tenant_id, canonical_key) do nothing;

