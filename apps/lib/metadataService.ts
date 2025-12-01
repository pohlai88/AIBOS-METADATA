/**
 * Metadata Service
 * 
 * Provides read-only access to metadata concepts, standard packs, and aliases.
 * Uses Neon Postgres instead of Supabase.
 */

import { sql } from './db';
import { logConceptLookup } from './metadata-observability';

export type StandardPack = {
  id: string;
  code: string;
  name: string;
  domain: string;
  authority_level: 'LAW' | 'INDUSTRY' | 'INTERNAL';
  version: string;
  status: 'ACTIVE' | 'DEPRECATED';
  notes: string | null;
};

export type Concept = {
  id: string;
  tenant_id: string;
  canonical_key: string;
  label: string;
  description: string | null;
  domain: string;
  concept_type: 'FIELD' | 'KPI' | 'ENTITY' | 'SERVICE_RULE';
  governance_tier: number;
  standard_pack_id_primary: string | null;
  standard_ref: string | null;
  is_active: boolean;
};

export type Alias = {
  id: string;
  concept_id: string;
  alias_value: string;
  alias_type: 'LEXICAL' | 'SEMANTIC' | 'LEGACY_SYSTEM';
  source_system: string | null;
  is_preferred_for_display: boolean;
};

export type MetadataConceptView = {
  concept: Concept;
  standardPack: StandardPack | null;
  aliases: Alias[];
};

export class MetadataService {
  /**
   * Look up a concept by term (canonical key or alias).
   * - Case-insensitive
   * - Respects tenant boundary
   */
  async lookupConcept(
    tenantId: string,
    term: string,
  ): Promise<MetadataConceptView | null> {
    const normalized = term.trim().toLowerCase();

    // 1) Try direct canonical_key match (case-insensitive)
    const conceptsByKey = await sql`
      SELECT * FROM mdm_concept
      WHERE tenant_id = ${tenantId}
        AND LOWER(canonical_key) = ${normalized}
      LIMIT 1
    `;

    let concept: Concept | null = null;

    if (conceptsByKey && conceptsByKey.length > 0) {
      concept = conceptsByKey[0] as Concept;
      await logConceptLookup(tenantId, term, true, concept.id, concept.canonical_key, 'canonical_key');
    } else {
      // 2) Try alias match (case-insensitive)
      const aliasRows = await sql`
        SELECT 
          c.id,
          c.tenant_id,
          c.canonical_key,
          c.label,
          c.description,
          c.domain,
          c.concept_type,
          c.governance_tier,
          c.standard_pack_id_primary,
          c.standard_ref,
          c.is_active
        FROM mdm_alias a
        INNER JOIN mdm_concept c ON a.concept_id = c.id
        WHERE c.tenant_id = ${tenantId}
          AND LOWER(a.alias_value) = ${normalized}
        LIMIT 1
      `;

      if (aliasRows && aliasRows.length > 0) {
        concept = aliasRows[0] as Concept;
        await logConceptLookup(tenantId, term, true, concept.id, concept.canonical_key, 'alias');
      }
    }

    if (!concept) {
      await logConceptLookup(tenantId, term, false, null, null, null);
      return null;
    }

    // Load primary pack if any
    let standardPack: StandardPack | null = null;
    if (concept.standard_pack_id_primary) {
      const packRows = await sql`
        SELECT * FROM mdm_standard_pack
        WHERE id = ${concept.standard_pack_id_primary}
        LIMIT 1
      `;

      if (packRows && packRows.length > 0) {
        standardPack = packRows[0] as StandardPack;
      }
    }

    // Load aliases
    const aliasRows = await sql`
      SELECT * FROM mdm_alias
      WHERE concept_id = ${concept.id}
      ORDER BY is_preferred_for_display DESC, alias_type, alias_value
    `;

    const aliases = (aliasRows ?? []) as Alias[];

    return {
      concept,
      standardPack,
      aliases,
    };
  }

  /**
   * List standard packs (optionally filtered by domain).
   */
  async listStandardPacks(domain?: string): Promise<StandardPack[]> {
    if (domain) {
      const rows = await sql`
        SELECT * FROM mdm_standard_pack
        WHERE domain = ${domain}
        ORDER BY code ASC
      `;
      return (rows ?? []) as StandardPack[];
    } else {
      const rows = await sql`
        SELECT * FROM mdm_standard_pack
        ORDER BY code ASC
      `;
      return (rows ?? []) as StandardPack[];
    }
  }

  /**
   * Get standard pack by ID
   * Used by PostingGuard to validate journal entries.
   */
  async getStandardPackById(id: string): Promise<StandardPack | null> {
    const rows = await sql`
      SELECT * FROM mdm_standard_pack
      WHERE id = ${id}::uuid
      LIMIT 1
    `;
    return (rows[0] ?? null) as StandardPack | null;
  }

  /**
   * Get concept by ID with pack info
   * Used by PostingGuard to validate account-concept mappings.
   */
  async getConceptById(id: string): Promise<(Concept & { pack_code?: string; authority_level?: string; pack_name?: string }) | null> {
    const rows = await sql`
      SELECT 
        c.*,
        p.code AS pack_code,
        p.authority_level,
        p.name AS pack_name
      FROM mdm_concept c
      LEFT JOIN mdm_standard_pack p
        ON c.standard_pack_id_primary = p.id
      WHERE c.id = ${id}::uuid
      LIMIT 1
    `;
    return (rows[0] ?? null) as (Concept & { pack_code?: string; authority_level?: string; pack_name?: string }) | null;
  }
}

// Export singleton instance
export const metadataService = new MetadataService();

