// packages/contracts/src/metadata.ts

/**
 * Metadata Contracts - Zod Schemas (SSOT)
 * 
 * These Zod schemas are the Single Source of Truth for:
 * - Backend route validation
 * - SDK TypeScript types (via z.infer)
 * - OpenAPI generation
 * - Client codegen
 * 
 * DO NOT manually write types elsewhere - always derive from these schemas.
 */

import { z } from './openapi-setup';

// ============================================================================
// Core Enums
// ============================================================================

/**
 * Governance Tier
 * 
 * tier1 = Critical (daily profiling)
 * tier2 = High (3-day profiling)
 * tier3 = Medium (weekly profiling)
 * tier4 = Low (monthly profiling)
 * tier5 = Minimal (quarterly profiling)
 */
export const TierSchema = z.enum(['tier1', 'tier2', 'tier3', 'tier4', 'tier5']).openapi({
  description: 'Metadata tier: tier1 = statutory (daily), tier2 = high (3-day), tier3 = medium (weekly), tier4 = low (monthly), tier5 = minimal (quarterly)',
  example: 'tier1',
});

/**
 * Alias Strength
 * 
 * PRIMARY_LABEL = Preferred term for this context
 * SECONDARY_LABEL = Allowed but clarify meaning
 * DISCOURAGED = Avoid if possible
 * FORBIDDEN = Do NOT use in this context
 */
export const AliasStrengthSchema = z.enum([
  'PRIMARY_LABEL',
  'SECONDARY_LABEL',
  'DISCOURAGED',
  'FORBIDDEN',
]).openapi({
  description: 'Label strength / usage rule for the alias',
  example: 'PRIMARY_LABEL',
});

/**
 * Naming Context
 * 
 * Where the name variant is used:
 * - db: Database column names (snake_case)
 * - typescript: TypeScript property names (camelCase)
 * - graphql: GraphQL type names (PascalCase)
 * - api_path: API URL paths (kebab-case)
 * - const: Constants (UPPER_SNAKE)
 * - bi: BI/reporting tools
 * - tax: Tax compliance systems
 */
export const NamingContextSchema = z.enum([
  'db',
  'typescript',
  'graphql',
  'api_path',
  'const',
  'bi',
  'tax',
]).openapi({
  description: 'Naming context for variants (db, typescript, graphql, api_path, const, bi, tax)',
  example: 'typescript',
});

/**
 * Naming Style
 * 
 * How the name is formatted:
 * - snake_case: revenue_ifrs_core
 * - camelCase: revenueIfrsCore
 * - PascalCase: RevenueIfrsCore
 * - UPPER_SNAKE: REVENUE_IFRS_CORE
 * - kebab-case: revenue-ifrs-core
 */
export const NamingStyleSchema = z.enum([
  'snake_case',
  'camelCase',
  'PascalCase',
  'UPPER_SNAKE',
  'kebab-case',
]).openapi({
  description: 'Naming style format (snake_case, camelCase, PascalCase, UPPER_SNAKE, kebab-case)',
  example: 'camelCase',
});

/**
 * Context Domain
 * 
 * Where the alias is used:
 * - FINANCIAL_REPORTING: Statutory financial statements (IFRS/MFRS)
 * - MANAGEMENT_REPORTING: Internal management reports, dashboards
 * - OPERATIONS: Operational metrics, real-time tracking
 * - STATUTORY_DISCLOSURE: Regulatory filings, audit reports
 * - GENERIC_SPEECH: Everyday conversation, UI labels
 */
export const ContextDomainSchema = z.enum([
  'FINANCIAL_REPORTING',
  'MANAGEMENT_REPORTING',
  'OPERATIONS',
  'STATUTORY_DISCLOSURE',
  'GENERIC_SPEECH',
]).openapi({
  description: 'Business context domain where alias is used',
  example: 'MANAGEMENT_REPORTING',
});

// ============================================================================
// Core Entities
// ============================================================================

/**
 * Metadata Concept
 * 
 * Represents a canonical business concept in the metadata registry.
 * 
 * Example: revenue_ifrs_core
 */
export const MetadataConceptSchema = z.object({
  canonicalKey: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9]+(_[a-z0-9]+)*$/,
      'canonicalKey must be snake_case (a-z, 0-9, underscores only)',
    )
    .openapi({
      example: 'revenue_ifrs_core',
      description: 'Snake_case SSOT key for the concept',
    }),
  label: z.string().min(1).openapi({
    example: 'Revenue (IFRS/MFRS Core)',
    description: 'Human-readable label for the concept',
  }),
  domain: z.string().min(1).openapi({
    example: 'FINANCE',
    description: 'Business domain (FINANCE, OPERATIONS, etc.)',
  }),
  standardPackKey: z.string().min(1).openapi({
    example: 'MFRS15_REVENUE',
    description: 'Standard pack this concept belongs to',
  }),
  semanticType: z.string().min(1).openapi({
    example: 'currency_amount',
    description: 'Semantic type (currency_amount, quantity, etc.)',
  }),
  financialElement: z.string().nullable().optional().openapi({
    example: 'INCOME',
    description: 'Financial statement element (INCOME, ASSET, MANAGEMENT_KPI, etc.)',
  }),
  tier: TierSchema,
  description: z.string().optional().default('').openapi({
    example: 'Income from ordinary activities with customers under MFRS/IFRS',
    description: 'Detailed description of the concept',
  }),
}).openapi({
  description: 'Canonical metadata concept (global, SSOT)',
  ref: 'MetadataConcept',
});

/**
 * Alias Record
 * 
 * Context-aware mapping of business terms to canonical concepts.
 * 
 * Example: "Sales" → sales_value_operational (in MANAGEMENT_REPORTING context)
 */
export const AliasRecordSchema = z.object({
  aliasText: z.string().min(1).openapi({
    example: 'Sales',
    description: 'The alias text (business term)',
  }),
  canonicalKey: z.string().min(1).openapi({
    example: 'sales_value_operational',
    description: 'Canonical concept key this alias maps to',
  }),
  language: z.string().min(1).default('en').openapi({
    example: 'en',
    description: 'Language code (en, en-MY, etc.)',
  }),
  contextDomain: ContextDomainSchema.or(z.string().min(1)).openapi({
    example: 'MANAGEMENT_REPORTING',
    description: 'Business context where this alias is used',
  }),
  strength: AliasStrengthSchema.or(z.string().min(1)).openapi({
    example: 'PRIMARY_LABEL',
    description: 'How strongly this alias is preferred in this context',
  }),
  sourceSystem: z.string().min(1).default('AIBOS').openapi({
    example: 'AIBOS',
    description: 'System that defines this alias (AIBOS, LEGACY_ERP, etc.)',
  }),
  notes: z.string().optional().default('').openapi({
    example: 'Default meaning of Sales in operational dashboards',
    description: 'Additional guidance notes for this alias',
  }),
}).openapi({
  description: 'Alias mapping for a human word to a canonical concept',
  ref: 'AliasRecord',
});

/**
 * Naming Variant
 * 
 * Technical naming variant for a canonical concept in a specific context.
 * 
 * Example: revenue_ifrs_core → revenueIfrsCore (in typescript context)
 */
export const NamingVariantSchema = z.object({
  canonicalKey: z.string().min(1).openapi({
    example: 'revenue_ifrs_core',
    description: 'Canonical concept key',
  }),
  context: NamingContextSchema.or(z.string().min(1)).openapi({
    example: 'typescript',
    description: 'Naming context (db, typescript, graphql, api_path, const, bi, tax)',
  }),
  style: NamingStyleSchema.or(z.string().min(1)).openapi({
    example: 'camelCase',
    description: 'Naming style (snake_case, camelCase, PascalCase, UPPER_SNAKE, kebab-case)',
  }),
  value: z.string().min(1).openapi({
    example: 'revenueIfrsCore',
    description: 'The actual name variant value',
  }),
}).openapi({
  description: 'Concrete naming variant for a concept in a given context (db, TS, GraphQL, etc.)',
  ref: 'NamingVariant',
});

/**
 * Standard Pack
 * 
 * A standard pack (e.g., IFRS, MFRS, HL7) containing canonical concepts.
 */
export const StandardPackSchema = z.object({
  packKey: z.string().min(1).openapi({
    example: 'MFRS15_REVENUE',
    description: 'Unique pack key identifier',
  }),
  packName: z.string().min(1).openapi({
    example: 'IFRS/MFRS Core Revenue',
    description: 'Human-readable pack name',
  }),
  domain: z.string().min(1).openapi({
    example: 'FINANCE',
    description: 'Business domain',
  }),
  version: z.string().min(1).openapi({
    example: '1.0.0',
    description: 'Pack version',
  }),
  status: z.string().min(1).openapi({
    example: 'active',
    description: 'Pack status (active, deprecated)',
  }),
  description: z.string().optional().default('').openapi({
    example: 'Core revenue recognition concepts under MFRS 15 / IFRS 15',
    description: 'Detailed pack description',
  }),
}).openapi({
  description: 'A standard pack (e.g., IFRS, MFRS, HL7) containing canonical concepts',
  ref: 'StandardPack',
});

// ============================================================================
// Request / Response Contracts
// ============================================================================

/**
 * Concept Filter
 * 
 * Filter options for listing concepts.
 */
export const ConceptFilterSchema = z.object({
  domain: z.string().optional().openapi({
    example: 'FINANCE',
    description: 'Filter by domain',
  }),
  standardPackKey: z.string().optional().openapi({
    example: 'MFRS15_REVENUE',
    description: 'Filter by standard pack',
  }),
  tier: TierSchema.optional(),
  search: z.string().optional().openapi({
    example: 'revenue',
    description: 'Free-text search within concept label/description',
  }),
}).openapi({
  description: 'Filter for listing metadata concepts',
  ref: 'ConceptFilter',
});

/**
 * Resolve Alias Input
 * 
 * Parameters for resolving an alias to canonical concepts.
 */
export const ResolveAliasInputSchema = z.object({
  aliasText: z.string().min(1).openapi({
    example: 'Sales',
    description: 'Human alias term to resolve',
  }),
  contextDomain: ContextDomainSchema.or(z.string()).optional().openapi({
    example: 'MANAGEMENT_REPORTING',
    description: 'Business context domain filter',
  }),
  language: z.string().optional().default('en').openapi({
    example: 'en',
    description: 'Language code',
  }),
}).openapi({
  description: 'Input for resolving a human alias like "Sales" to canonical concept(s)',
  ref: 'ResolveAliasInput',
});

/**
 * Resolve Alias Result
 * 
 * Result of alias resolution, includes both alias info and linked concept.
 */
export const ResolveAliasResultSchema = z.object({
  alias: AliasRecordSchema,
  concept: MetadataConceptSchema.nullable(),
}).openapi({
  description: 'Result of alias resolution: alias row + its canonical concept (or null)',
  ref: 'ResolveAliasResult',
});

/**
 * Resolve Name Input
 * 
 * Parameters for resolving a naming variant.
 */
export const ResolveNameInputSchema = z.object({
  canonicalKey: z.string().min(1).openapi({
    example: 'revenue_ifrs_core',
    description: 'Canonical concept key',
  }),
  context: NamingContextSchema.or(z.string().min(1)).openapi({
    example: 'typescript',
    description: 'Target naming context',
  }),
}).openapi({
  description: 'Input for naming resolution (e.g. "revenue_ifrs_core" → "revenueIfrsCore")',
  ref: 'ResolveNameInput',
});

/**
 * Batch Resolve Names Input
 * 
 * Parameters for batch resolving naming variants.
 */
export const BatchResolveNamesInputSchema = z.object({
  canonicalKeys: z.array(z.string().min(1)).openapi({
    example: ['revenue_ifrs_core', 'sales_value_operational'],
    description: 'Array of canonical keys to resolve',
  }),
  context: NamingContextSchema.or(z.string().min(1)).openapi({
    example: 'typescript',
    description: 'Target naming context',
  }),
}).openapi({
  description: 'Input for batch naming resolution',
  ref: 'BatchResolveNamesInput',
});

/**
 * Batch Resolve Names Result
 * 
 * Result of batch name resolution.
 */
export const BatchResolveNamesResultSchema = z.object({
  results: z.record(z.string(), z.string()).openapi({
    example: {
      revenue_ifrs_core: 'revenueIfrsCore',
      sales_value_operational: 'salesValueOperational',
    },
    description: 'Map of canonical_key → name variant',
  }),
}).openapi({
  description: 'Result of batch name resolution',
  ref: 'BatchResolveNamesResult',
});

// ============================================================================
// Exported Types (derived from Zod schemas via z.infer)
// ============================================================================

export type Tier = z.infer<typeof TierSchema>;
export type AliasStrength = z.infer<typeof AliasStrengthSchema>;
export type NamingContext = z.infer<typeof NamingContextSchema>;
export type NamingStyle = z.infer<typeof NamingStyleSchema>;
export type ContextDomain = z.infer<typeof ContextDomainSchema>;

export type MetadataConcept = z.infer<typeof MetadataConceptSchema>;
export type AliasRecord = z.infer<typeof AliasRecordSchema>;
export type NamingVariant = z.infer<typeof NamingVariantSchema>;
export type StandardPack = z.infer<typeof StandardPackSchema>;

export type ConceptFilter = z.infer<typeof ConceptFilterSchema>;
export type ResolveAliasInput = z.infer<typeof ResolveAliasInputSchema>;
export type ResolveAliasResult = z.infer<typeof ResolveAliasResultSchema>;
export type ResolveNameInput = z.infer<typeof ResolveNameInputSchema>;
export type BatchResolveNamesInput = z.infer<typeof BatchResolveNamesInputSchema>;
export type BatchResolveNamesResult = z.infer<typeof BatchResolveNamesResultSchema>;

