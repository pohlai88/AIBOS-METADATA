/**
 * @aibos/types - Shared TypeScript Types
 *
 * Types are automatically derived from Zod schemas (SSOT)
 * This ensures zero duplication and automatic type safety
 *
 * How it works:
 * 1. Zod schemas are defined in metadata-studio/schemas/*.schema.ts
 * 2. Types are auto-generated using z.infer<typeof Schema>
 * 3. This package re-exports them for easy access
 * 4. Any schema change automatically updates types everywhere!
 */

// ============================================
// RE-EXPORT AUTO-GENERATED TYPES FROM METADATA-STUDIO
// ============================================
// These types are automatically inferred from Zod schemas
// ✅ Single Source of Truth: Zod schemas
// ✅ No duplication: Types auto-sync with schemas
// ✅ Type-safe: Compile-time checking everywhere

export type {
  // MDM Global Metadata (from mdm-global-metadata.schema.ts)
  MetadataEntity,
  ColumnMetadata,
  TableMetadata,

  // Observability (from observability.schema.ts)
  GovernanceRecord,
  GovernanceTier,
  ProfileStatistics,
  DataProfile,
  UsageEvent,
  UsageStats,

  // Standard Packs (from standard-pack.schema.ts)
  StandardPack,
  StandardPackConformance,

  // Lineage (from lineage.schema.ts)
  LineageNode,
  LineageEdge,
  LineageGraph,
  ColumnLineage,

  // Glossary (from glossary.schema.ts)
  GlossaryTerm,
  GlossaryCategory,
  TermAssignment,

  // Tags (from tags.schema.ts)
  Tag,
  TagAssignment,
  TagCategory,

  // KPI (from kpi.schema.ts)
  KPI,
  KPIValue,
} from "@aibos/metadata-studio";

// ============================================
// CONTROLLED VOCABULARY (Approved Terms Only!)
// ============================================
// These are the ONLY terms developers can use in code.
// Using unapproved terms will cause TypeScript errors.

export {
  // Approved term dictionaries
  APPROVED_FINANCE_TERMS,
  APPROVED_HR_TERMS,
  APPROVED_OPERATIONS_TERMS,
  BLOCKED_FINANCE_TERMS,
  
  // Controlled vocabulary types
  type ApprovedFinanceTerm,
  type ApprovedHRTerm,
  type ApprovedOperationsTerm,
  type ApprovedTerm,
  
  // Validation schemas
  ApprovedFinanceTermSchema,
  
  // Utility functions
  isApprovedTerm,
  getSuggestion,
  validateTerm,
  ControlledVocabulary,
} from "@aibos/metadata-studio/glossary/controlled-vocabulary";

// ============================================
// ADDITIONAL SHARED TYPES (not in schemas)
// ============================================

/**
 * Generic API Response wrapper
 */
export type ApiResponse<T> = {
  data: T;
  error?: string;
  status: number;
  timestamp: string;
};

/**
 * Paginated API Response
 */
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

/**
 * API Error structure
 */
export type ApiError = {
  message: string;
  code: string;
  field?: string;
  details?: Record<string, unknown>;
};

/**
 * Common utility types
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;
export type Timestamp = string; // ISO 8601

/**
 * Audit trail fields
 */
export interface Auditable {
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

/**
 * Soft delete fields
 */
export interface SoftDeletable {
  deletedAt?: Timestamp;
  deletedBy?: string;
  isDeleted: boolean;
}

/**
 * Multi-tenancy fields
 */
export interface MultiTenant {
  tenantId: string;
}
