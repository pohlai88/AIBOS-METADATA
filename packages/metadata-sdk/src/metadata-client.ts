// packages/metadata-sdk/src/metadata-client.ts

/**
 * Metadata Client
 * 
 * Unified client for accessing metadata governance system.
 * 
 * All services (ERP Engine, dashboards, agents) should use this
 * instead of direct SQL to metadata tables.
 * 
 * Usage:
 * ```typescript
 * import { createDefaultConfig, MetadataClient } from '@aibos/metadata-sdk';
 * 
 * const config = createDefaultConfig();
 * const metadata = new MetadataClient(config);
 * 
 * const concept = await metadata.getConcept('revenue_ifrs_core');
 * ```
 */

import type {
  MetadataConcept,
  ConceptFilter,
  ResolveAliasInput,
  ResolveAliasResult,
  ResolveNameInput,
  NamingVariant,
  NamingContext,
  StandardPack,
  AliasRecord,
} from '@aibos/contracts/metadata';
import type { MetadataSdkConfig } from './config';
import { HttpClient } from './http-client';

export class MetadataClient {
  private readonly http: HttpClient;

  constructor(private readonly config: MetadataSdkConfig) {
    this.http = new HttpClient(config);
  }

  // =========================================================================
  // Concept Queries
  // =========================================================================

  /**
   * Get a single concept by canonical_key
   * 
   * @param canonicalKey - The canonical key (must be snake_case)
   * @returns Concept or null if not found
   * 
   * @example
   * const concept = await metadata.getConcept('revenue_ifrs_core');
   */
  async getConcept(canonicalKey: string): Promise<MetadataConcept | null> {
    if (!canonicalKey) return null;

    try {
      return await this.http.get<MetadataConcept>(
        `/metadata/concepts/${encodeURIComponent(canonicalKey)}`,
      );
    } catch (error) {
      // Return null if not found (404)
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List concepts with optional filtering
   * 
   * @param filter - Filter options (domain, pack, tier, search)
   * @returns Array of matching concepts
   * 
   * @example
   * const concepts = await metadata.listConcepts({ domain: 'FINANCE', tier: 'tier1' });
   */
  async listConcepts(filter: ConceptFilter = {}): Promise<MetadataConcept[]> {
    const { domain, standardPackKey, tier, search } = filter;

    return this.http.get<MetadataConcept[]>('/metadata/concepts', {
      domain,
      standard_pack_key: standardPackKey,
      tier,
      search,
    });
  }

  // =========================================================================
  // Alias Resolution
  // =========================================================================

  /**
   * Resolve an alias to canonical concept(s)
   * 
   * Returns all possible mappings for the alias in the given context.
   * 
   * @param input - Alias text, context domain, language
   * @returns Array of alias mappings (can be multiple)
   * 
   * @example
   * const mappings = await metadata.resolveAlias({
   *   aliasText: 'Sales',
   *   contextDomain: 'MANAGEMENT_REPORTING',
   * });
   * // Returns: [{ alias: {...}, concept: { canonicalKey: 'sales_value_operational', ... } }]
   */
  async resolveAlias(input: ResolveAliasInput): Promise<ResolveAliasResult[]> {
    const { aliasText, contextDomain, language } = input;
    if (!aliasText) return [];

    return this.http.get<ResolveAliasResult[]>('/metadata/aliases/resolve', {
      alias_text: aliasText,
      context_domain: contextDomain,
      language,
    });
  }

  /**
   * Get all aliases for a canonical concept
   * 
   * @param canonicalKey - The canonical key
   * @returns Array of alias records
   * 
   * @example
   * const aliases = await metadata.getAliasesForConcept('revenue_ifrs_core');
   * // Returns: [{ aliasText: 'Revenue', ... }, { aliasText: 'Turnover', ... }]
   */
  async getAliasesForConcept(canonicalKey: string): Promise<AliasRecord[]> {
    if (!canonicalKey) return [];

    return this.http.get<AliasRecord[]>(`/metadata/aliases/concept/${encodeURIComponent(canonicalKey)}`);
  }

  // =========================================================================
  // Naming Variants
  // =========================================================================

  /**
   * Resolve naming variant for a canonical concept in a specific context
   * 
   * @param input - Canonical key and target context
   * @returns The name variant (or canonical_key as fallback)
   * 
   * @example
   * const tsName = await metadata.resolveNameForContext({
   *   canonicalKey: 'revenue_ifrs_core',
   *   context: 'typescript',
   * });
   * // Returns: "revenueIfrsCore"
   */
  async resolveNameForContext(input: ResolveNameInput): Promise<string> {
    const { canonicalKey, context } = input;

    try {
      const result = await this.http.get<{ value: string }>(
        `/naming/resolve/${encodeURIComponent(canonicalKey)}`,
        { context },
      );
      return result.value;
    } catch (error) {
      // Fallback: return canonical_key if resolution fails
      console.warn(
        `Failed to resolve name for ${canonicalKey} in context ${context}, using canonical_key as fallback`,
      );
      return canonicalKey;
    }
  }

  /**
   * Batch resolve naming variants for multiple concepts
   * 
   * @param canonicalKeys - Array of canonical keys
   * @param context - Target naming context
   * @returns Map of canonical_key → name variant
   * 
   * @example
   * const names = await metadata.batchResolveNames(
   *   ['revenue_ifrs_core', 'sales_value_operational'],
   *   'typescript'
   * );
   * // Returns: { revenue_ifrs_core: 'revenueIfrsCore', sales_value_operational: 'salesValueOperational' }
   */
  async batchResolveNames(
    canonicalKeys: string[],
    context: NamingContext,
  ): Promise<Record<string, string>> {
    if (canonicalKeys.length === 0) return {};

    const result = await this.http.post<{ results: Record<string, string> }>(
      '/naming/resolve/batch',
      {
        canonicalKeys,
        context,
      },
    );

    return result.results;
  }

  // =========================================================================
  // Standard Packs
  // =========================================================================

  /**
   * List all standard packs
   * 
   * @returns Array of standard packs
   * 
   * @example
   * const packs = await metadata.listStandardPacks();
   */
  async listStandardPacks(): Promise<StandardPack[]> {
    return this.http.get<StandardPack[]>('/metadata/standard-packs');
  }

  /**
   * Get concepts in a standard pack
   * 
   * @param packKey - The pack key (e.g., 'MFRS15_REVENUE')
   * @returns Array of concepts in the pack
   * 
   * @example
   * const concepts = await metadata.getConceptsInPack('MFRS15_REVENUE');
   */
  async getConceptsInPack(packKey: string): Promise<MetadataConcept[]> {
    return this.listConcepts({ standardPackKey: packKey });
  }

  // =========================================================================
  // Search & Discovery
  // =========================================================================

  /**
   * Search for concepts and aliases by text query
   * 
   * @param query - Search query
   * @returns Array of matching alias results
   * 
   * @example
   * const results = await metadata.searchGlossary('revenue');
   */
  async searchGlossary(query: string): Promise<ResolveAliasResult[]> {
    if (!query) return [];

    return this.http.get<ResolveAliasResult[]>('/metadata/glossary/search', {
      q: query,
    });
  }
}

