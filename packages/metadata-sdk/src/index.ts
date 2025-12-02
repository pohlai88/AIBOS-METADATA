// packages/metadata-sdk/src/index.ts

/**
 * Metadata SDK
 * 
 * Unified client for accessing metadata governance system.
 * 
 * Usage:
 * ```typescript
 * import { createDefaultConfig, MetadataClient } from '@aibos/metadata-sdk';
 * 
 * const config = createDefaultConfig();
 * const metadata = new MetadataClient(config);
 * 
 * // Get concept
 * const concept = await metadata.getConcept('revenue_ifrs_core');
 * 
 * // Resolve alias
 * const mappings = await metadata.resolveAlias({
 *   aliasText: 'Sales',
 *   contextDomain: 'MANAGEMENT_REPORTING',
 * });
 * 
 * // Resolve naming variant
 * const tsName = await metadata.resolveNameForContext({
 *   canonicalKey: 'revenue_ifrs_core',
 *   context: 'typescript',
 * });
 * ```
 */

// Re-export types from contracts package (Zod is SSOT)
export type {
  Tier,
  AliasStrength,
  NamingContext,
  NamingStyle,
  ContextDomain,
  MetadataConcept,
  AliasRecord,
  NamingVariant,
  StandardPack,
  ConceptFilter,
  ResolveAliasInput,
  ResolveAliasResult,
  ResolveNameInput,
  BatchResolveNamesInput,
  BatchResolveNamesResult,
} from '@aibos/contracts/metadata';

// Export SDK-specific modules
export * from './config';
export * from './metadata-client';
export { HttpClient } from './http-client';

