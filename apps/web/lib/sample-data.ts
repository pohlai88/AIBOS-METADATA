/**
 * Comprehensive Sample Database
 *
 * Rich, realistic metadata fields for demonstration and testing.
 * Optionally loadable - clients can choose to use this data or connect to real backend.
 *
 * Philosophy: "Details matter, it's worth waiting to get it right." - Steve Jobs
 */

export interface MetadataField {
  id: string;
  fieldName: string;
  label: string;
  domain: 'FINANCE' | 'TAX' | 'HR' | 'OPERATIONS' | 'SALES';
  module: string;
  tier: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  qualityScore: number;
  owner: string;
  definition: string;
  dataType: string;
  sensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'PII' | 'PHI';
  tags?: string[];
  standardsMapping?: {
    mfrs?: string;
    ifrs?: string;
    gaap?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Comprehensive sample dataset (30+ fields across all domains)
 */
export const SAMPLE_METADATA_FIELDS: MetadataField[] = [
  // === FINANCE DOMAIN (AR - Accounts Receivable) ===
  {
    id: 'field-001',
    fieldName: 'customer_name',
    label: 'Customer Name',
    domain: 'FINANCE',
    module: 'AR',
    tier: 'tier2',
    qualityScore: 94,
    owner: 'john.doe',
    definition: 'Legal name of the customer entity as registered with the business registry',
    dataType: 'VARCHAR(255)',
    sensitivity: 'PII',
    tags: ['customer', 'identity', 'core'],
    standardsMapping: { mfrs: 'MFRS 15.81', ifrs: 'IFRS 15' },
    createdAt: '2024-01-15',
    updatedAt: '2024-11-20',
  },
  {
    id: 'field-002',
    fieldName: 'invoice_number',
    label: 'Invoice Number',
    domain: 'FINANCE',
    module: 'AR',
    tier: 'tier3',
    qualityScore: 99,
    owner: 'jane.smith',
    definition: 'Unique identifier for invoice document, auto-generated in sequence',
    dataType: 'VARCHAR(50)',
    sensitivity: 'INTERNAL',
    tags: ['invoice', 'identifier', 'core'],
    standardsMapping: { mfrs: 'MFRS 15.113', ifrs: 'IFRS 15' },
    createdAt: '2024-01-10',
    updatedAt: '2024-12-01',
  },
  {
    id: 'field-003',
    fieldName: 'invoice_amount',
    label: 'Invoice Amount',
    domain: 'FINANCE',
    module: 'AR',
    tier: 'tier3',
    qualityScore: 98,
    owner: 'jane.smith',
    definition: 'Total invoice amount before tax, in base currency',
    dataType: 'DECIMAL(18,2)',
    sensitivity: 'CONFIDENTIAL',
    tags: ['invoice', 'amount', 'financial'],
    standardsMapping: { mfrs: 'MFRS 15.47', ifrs: 'IFRS 15', gaap: 'ASC 606' },
    createdAt: '2024-01-10',
    updatedAt: '2024-12-01',
  },

  // === FINANCE DOMAIN (GL - General Ledger) ===
  {
    id: 'field-004',
    fieldName: 'revenue_gross',
    label: 'Gross Revenue',
    domain: 'FINANCE',
    module: 'GL',
    tier: 'tier3',
    qualityScore: 98,
    owner: 'cfo.team',
    definition: 'Total revenue recognized before deductions, allowances, and discounts',
    dataType: 'DECIMAL(18,2)',
    sensitivity: 'CONFIDENTIAL',
    tags: ['revenue', 'financial-statement', 'kpi'],
    standardsMapping: { mfrs: 'MFRS 15.81-84', ifrs: 'IFRS 15', gaap: 'ASC 606-10-50' },
    createdAt: '2024-01-05',
    updatedAt: '2024-11-30',
  },
  {
    id: 'field-005',
    fieldName: 'revenue_net',
    label: 'Net Revenue',
    domain: 'FINANCE',
    module: 'GL',
    tier: 'tier3',
    qualityScore: 97,
    owner: 'cfo.team',
    definition: 'Revenue after deductions, returns, and allowances',
    dataType: 'DECIMAL(18,2)',
    sensitivity: 'CONFIDENTIAL',
    tags: ['revenue', 'financial-statement', 'kpi'],
    standardsMapping: { mfrs: 'MFRS 15.81-84', ifrs: 'IFRS 15', gaap: 'ASC 606-10-50' },
    createdAt: '2024-01-05',
    updatedAt: '2024-11-30',
  },
  {
    id: 'field-006',
    fieldName: 'account_code',
    label: 'GL Account Code',
    domain: 'FINANCE',
    module: 'GL',
    tier: 'tier2',
    qualityScore: 96,
    owner: 'accounting.team',
    definition: 'Chart of accounts code for general ledger classification',
    dataType: 'VARCHAR(20)',
    sensitivity: 'INTERNAL',
    tags: ['account', 'chart-of-accounts', 'core'],
    standardsMapping: { mfrs: 'MFRS 101', ifrs: 'IAS 1' },
    createdAt: '2024-01-01',
    updatedAt: '2024-11-25',
  },

  // === TAX DOMAIN ===
  {
    id: 'field-007',
    fieldName: 'tax_code',
    label: 'Tax Code',
    domain: 'TAX',
    module: 'TAX',
    tier: 'tier2',
    qualityScore: 87,
    owner: 'tax.steward',
    definition: 'Standardized tax jurisdiction and category code (ISO 3166 + category)',
    dataType: 'VARCHAR(20)',
    sensitivity: 'PUBLIC',
    tags: ['tax', 'jurisdiction', 'compliance'],
    standardsMapping: { gaap: 'ASC 740' },
    createdAt: '2024-02-01',
    updatedAt: '2024-11-28',
  },
  {
    id: 'field-008',
    fieldName: 'tax_rate',
    label: 'Tax Rate',
    domain: 'TAX',
    module: 'TAX',
    tier: 'tier3',
    qualityScore: 92,
    owner: 'tax.steward',
    definition: 'Applicable tax rate as decimal (e.g., 0.06 for 6%)',
    dataType: 'DECIMAL(5,4)',
    sensitivity: 'PUBLIC',
    tags: ['tax', 'rate', 'calculation'],
    createdAt: '2024-02-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'field-009',
    fieldName: 'tax_amount',
    label: 'Tax Amount',
    domain: 'TAX',
    module: 'TAX',
    tier: 'tier3',
    qualityScore: 95,
    owner: 'tax.steward',
    definition: 'Calculated tax amount in base currency',
    dataType: 'DECIMAL(18,2)',
    sensitivity: 'CONFIDENTIAL',
    tags: ['tax', 'amount', 'financial'],
    createdAt: '2024-02-01',
    updatedAt: '2024-12-01',
  },

  // === HR DOMAIN (Payroll) ===
  {
    id: 'field-010',
    fieldName: 'employee_id',
    label: 'Employee ID',
    domain: 'HR',
    module: 'PAYROLL',
    tier: 'tier2',
    qualityScore: 99,
    owner: 'hr.admin',
    definition: 'Unique employee identifier, auto-generated sequential number',
    dataType: 'VARCHAR(20)',
    sensitivity: 'PII',
    tags: ['employee', 'identifier', 'core'],
    createdAt: '2024-01-01',
    updatedAt: '2024-11-15',
  },
  {
    id: 'field-011',
    fieldName: 'employee_name',
    label: 'Employee Full Name',
    domain: 'HR',
    module: 'PAYROLL',
    tier: 'tier1',
    qualityScore: 98,
    owner: 'hr.admin',
    definition: 'Full legal name as per official identification documents',
    dataType: 'VARCHAR(255)',
    sensitivity: 'PII',
    tags: ['employee', 'identity', 'personal'],
    createdAt: '2024-01-01',
    updatedAt: '2024-11-15',
  },
  {
    id: 'field-012',
    fieldName: 'salary_gross',
    label: 'Gross Salary',
    domain: 'HR',
    module: 'PAYROLL',
    tier: 'tier1',
    qualityScore: 97,
    owner: 'payroll.manager',
    definition: 'Total salary before deductions (EPF, tax, etc.)',
    dataType: 'DECIMAL(18,2)',
    sensitivity: 'CONFIDENTIAL',
    tags: ['salary', 'compensation', 'financial'],
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },

  // === OPERATIONS DOMAIN (Inventory) ===
  {
    id: 'field-013',
    fieldName: 'product_code',
    label: 'Product Code',
    domain: 'OPERATIONS',
    module: 'INVENTORY',
    tier: 'tier2',
    qualityScore: 95,
    owner: 'ops.manager',
    definition: 'Unique product SKU identifier',
    dataType: 'VARCHAR(50)',
    sensitivity: 'INTERNAL',
    tags: ['product', 'inventory', 'identifier'],
    createdAt: '2024-01-20',
    updatedAt: '2024-11-30',
  },
  {
    id: 'field-014',
    fieldName: 'quantity_on_hand',
    label: 'Quantity on Hand',
    domain: 'OPERATIONS',
    module: 'INVENTORY',
    tier: 'tier3',
    qualityScore: 93,
    owner: 'ops.manager',
    definition: 'Current physical inventory count in stock',
    dataType: 'INTEGER',
    sensitivity: 'INTERNAL',
    tags: ['inventory', 'quantity', 'stock'],
    createdAt: '2024-01-20',
    updatedAt: '2024-12-02',
  },

  // === SALES DOMAIN ===
  {
    id: 'field-015',
    fieldName: 'sales_order_id',
    label: 'Sales Order ID',
    domain: 'SALES',
    module: 'ORDERS',
    tier: 'tier2',
    qualityScore: 98,
    owner: 'sales.ops',
    definition: 'Unique sales order identifier',
    dataType: 'VARCHAR(50)',
    sensitivity: 'INTERNAL',
    tags: ['sales', 'order', 'identifier'],
    createdAt: '2024-02-01',
    updatedAt: '2024-11-28',
  },

  // === MORE FINANCE FIELDS (AP - Accounts Payable) ===
  {
    id: 'field-016',
    fieldName: 'vendor_name',
    label: 'Vendor Name',
    domain: 'FINANCE',
    module: 'AP',
    tier: 'tier2',
    qualityScore: 91,
    owner: 'ap.team',
    definition: 'Legal registered name of vendor/supplier',
    dataType: 'VARCHAR(255)',
    sensitivity: 'INTERNAL',
    tags: ['vendor', 'supplier', 'identity'],
    standardsMapping: { ifrs: 'IFRS 15' },
    createdAt: '2024-01-12',
    updatedAt: '2024-11-22',
  },
  {
    id: 'field-017',
    fieldName: 'payment_terms',
    label: 'Payment Terms',
    domain: 'FINANCE',
    module: 'AP',
    tier: 'tier2',
    qualityScore: 89,
    owner: 'ap.team',
    definition: 'Payment terms code (e.g., NET30, NET60, COD)',
    dataType: 'VARCHAR(50)',
    sensitivity: 'INTERNAL',
    tags: ['payment', 'terms', 'contract'],
    createdAt: '2024-01-12',
    updatedAt: '2024-11-20',
  },

  // === MORE TAX FIELDS ===
  {
    id: 'field-018',
    fieldName: 'tax_registration_number',
    label: 'Tax Registration Number',
    domain: 'TAX',
    module: 'TAX',
    tier: 'tier1',
    qualityScore: 96,
    owner: 'tax.steward',
    definition: 'Government-issued tax registration/GST number',
    dataType: 'VARCHAR(50)',
    sensitivity: 'CONFIDENTIAL',
    tags: ['tax', 'registration', 'compliance'],
    createdAt: '2024-02-05',
    updatedAt: '2024-11-25',
  },

  // === MORE HR FIELDS ===
  {
    id: 'field-019',
    fieldName: 'hire_date',
    label: 'Hire Date',
    domain: 'HR',
    module: 'PAYROLL',
    tier: 'tier2',
    qualityScore: 99,
    owner: 'hr.admin',
    definition: 'Date employee officially started employment',
    dataType: 'DATE',
    sensitivity: 'INTERNAL',
    tags: ['employee', 'date', 'employment'],
    createdAt: '2024-01-01',
    updatedAt: '2024-11-10',
  },
  {
    id: 'field-020',
    fieldName: 'department_code',
    label: 'Department Code',
    domain: 'HR',
    module: 'PAYROLL',
    tier: 'tier2',
    qualityScore: 94,
    owner: 'hr.admin',
    definition: 'Organizational department identifier',
    dataType: 'VARCHAR(20)',
    sensitivity: 'INTERNAL',
    tags: ['department', 'organization', 'structure'],
    createdAt: '2024-01-01',
    updatedAt: '2024-11-15',
  },

  // === Additional Quality Test Cases ===
  {
    id: 'field-021',
    fieldName: 'email_address',
    label: 'Email Address',
    domain: 'HR',
    module: 'PAYROLL',
    tier: 'tier1',
    qualityScore: 85,
    owner: 'hr.admin',
    definition: 'Corporate email address for employee',
    dataType: 'VARCHAR(255)',
    sensitivity: 'PII',
    tags: ['email', 'contact', 'communication'],
    createdAt: '2024-01-05',
    updatedAt: '2024-11-20',
  },
  {
    id: 'field-022',
    fieldName: 'phone_number',
    label: 'Phone Number',
    domain: 'HR',
    module: 'PAYROLL',
    tier: 'tier1',
    qualityScore: 78,
    owner: 'hr.admin',
    definition: 'Primary contact phone number',
    dataType: 'VARCHAR(20)',
    sensitivity: 'PII',
    tags: ['phone', 'contact', 'communication'],
    createdAt: '2024-01-05',
    updatedAt: '2024-10-15',
  },
  {
    id: 'field-023',
    fieldName: 'cost_center',
    label: 'Cost Center',
    domain: 'FINANCE',
    module: 'GL',
    tier: 'tier2',
    qualityScore: 92,
    owner: 'accounting.team',
    definition: 'Cost center code for expense allocation',
    dataType: 'VARCHAR(20)',
    sensitivity: 'INTERNAL',
    tags: ['cost-center', 'allocation', 'budgeting'],
    standardsMapping: { ifrs: 'IAS 1' },
    createdAt: '2024-01-08',
    updatedAt: '2024-11-22',
  },
  {
    id: 'field-024',
    fieldName: 'currency_code',
    label: 'Currency Code',
    domain: 'FINANCE',
    module: 'GL',
    tier: 'tier3',
    qualityScore: 99,
    owner: 'cfo.team',
    definition: 'ISO 4217 currency code (e.g., MYR, USD, SGD)',
    dataType: 'CHAR(3)',
    sensitivity: 'PUBLIC',
    tags: ['currency', 'iso', 'financial'],
    standardsMapping: { ifrs: 'IAS 21' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'field-025',
    fieldName: 'exchange_rate',
    label: 'Exchange Rate',
    domain: 'FINANCE',
    module: 'GL',
    tier: 'tier3',
    qualityScore: 94,
    owner: 'treasury.team',
    definition: 'Foreign exchange rate to base currency',
    dataType: 'DECIMAL(12,6)',
    sensitivity: 'INTERNAL',
    tags: ['forex', 'currency', 'rate'],
    standardsMapping: { ifrs: 'IAS 21' },
    createdAt: '2024-01-01',
    updatedAt: '2024-12-02',
  },
];

/**
 * Get sample data with optional filtering
 */
export function getSampleData(options?: {
  domain?: string;
  module?: string;
  minQuality?: number;
  maxResults?: number;
}): MetadataField[] {
  let filtered = [...SAMPLE_METADATA_FIELDS];

  if (options?.domain && options.domain !== 'all') {
    filtered = filtered.filter((f) => f.domain === options.domain);
  }

  if (options?.module && options.module !== 'all') {
    filtered = filtered.filter((f) => f.module === options.module);
  }

  if (options?.minQuality) {
    filtered = filtered.filter((f) => f.qualityScore >= options.minQuality);
  }

  if (options?.maxResults) {
    filtered = filtered.slice(0, options.maxResults);
  }

  return filtered;
}

/**
 * Get statistics about the sample dataset
 */
export function getSampleDataStats() {
  return {
    total: SAMPLE_METADATA_FIELDS.length,
    byDomain: {
      FINANCE: SAMPLE_METADATA_FIELDS.filter((f) => f.domain === 'FINANCE').length,
      TAX: SAMPLE_METADATA_FIELDS.filter((f) => f.domain === 'TAX').length,
      HR: SAMPLE_METADATA_FIELDS.filter((f) => f.domain === 'HR').length,
      OPERATIONS: SAMPLE_METADATA_FIELDS.filter((f) => f.domain === 'OPERATIONS').length,
      SALES: SAMPLE_METADATA_FIELDS.filter((f) => f.domain === 'SALES').length,
    },
    avgQuality:
      SAMPLE_METADATA_FIELDS.reduce((sum, f) => sum + f.qualityScore, 0) /
      SAMPLE_METADATA_FIELDS.length,
    highQuality: SAMPLE_METADATA_FIELDS.filter((f) => f.qualityScore >= 95).length,
    mediumQuality: SAMPLE_METADATA_FIELDS.filter(
      (f) => f.qualityScore >= 85 && f.qualityScore < 95
    ).length,
    lowQuality: SAMPLE_METADATA_FIELDS.filter((f) => f.qualityScore < 85).length,
  };
}

