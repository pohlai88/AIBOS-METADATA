// packages/contracts/src/index.ts

/**
 * @aibos/contracts
 * 
 * Shared Zod contracts for AI-BOS services.
 * 
 * Zod is the Constitution - all types are derived from these schemas.
 * 
 * Usage:
 * ```typescript
 * // Import schemas for validation
 * import { MetadataConceptSchema } from '@aibos/contracts/metadata';
 * const concept = MetadataConceptSchema.parse(data);
 * 
 * // Import types for TypeScript
 * import type { MetadataConcept } from '@aibos/contracts/metadata';
 * const concept: MetadataConcept = { ... };
 * 
 * // Generate OpenAPI doc
 * import { createMetadataOpenApiDocument } from '@aibos/contracts/metadata-openapi';
 * const openApiDoc = createMetadataOpenApiDocument();
 * ```
 */

export * from './metadata';
export * from './metadata-openapi';

