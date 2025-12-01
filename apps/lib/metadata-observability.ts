/**
 * Metadata Observability
 * 
 * Logs concept lookups and tool usage for monitoring
 */

import { sql } from './db';

export interface ConceptLookupLog {
  tenant_id: string;
  term: string;
  found: boolean;
  concept_id: string | null;
  canonical_key: string | null;
  matched_via: 'canonical_key' | 'alias' | null;
  timestamp: Date;
}

/**
 * Log a concept lookup
 * 
 * Stores usage telemetry in mdm_usage_log for analytics.
 * This enables answering questions like:
 * - Which concepts do agents touch the most?
 * - Which Tier 1 concepts have zero usage? (maybe over-specified)
 * - Are agents over-using aliases from legacy ERP instead of canonical keys?
 */
export async function logConceptLookup(
  tenantId: string,
  term: string,
  found: boolean,
  conceptId: string | null = null,
  canonicalKey: string | null = null,
  matchedVia: 'canonical_key' | 'alias' | null = null,
  actorType: 'AGENT' | 'HUMAN' | 'SYSTEM' = 'AGENT'
): Promise<void> {
  const log: ConceptLookupLog = {
    tenant_id: tenantId,
    term,
    found,
    concept_id: conceptId,
    canonical_key: canonicalKey,
    matched_via: matchedVia,
    timestamp: new Date(),
  };

  // Console logging for development
  if (found) {
    console.error(`[METADATA] Lookup: "${term}" → ${canonicalKey} (via ${matchedVia})`);
  } else {
    console.error(`[METADATA] Lookup: "${term}" → NOT FOUND`);
  }

  // Store in database for analytics
  try {
    if (found && conceptId) {
      await sql`
        INSERT INTO mdm_usage_log (
          tool_name,
          concept_id,
          tenant_id,
          used_at,
          actor_type,
          matched_via,
          metadata
        ) VALUES (
          'metadata.lookupConcept',
          ${conceptId}::uuid,
          ${tenantId}::uuid,
          NOW(),
          ${actorType},
          ${matchedVia},
          ${JSON.stringify({ term, canonical_key: canonicalKey })}::jsonb
        )
      `;
    }
  } catch (error) {
    // Don't fail the lookup if logging fails
    console.error('[METADATA] Failed to log usage:', error);
  }
}

/**
 * Log tool usage
 */
export async function logToolUsage(
  toolId: string,
  toolName: string,
  success: boolean,
  error?: string
): Promise<void> {
  // For v0: console logging
  if (success) {
    console.error(`[METADATA] Tool: ${toolName} (${toolId}) - SUCCESS`);
  } else {
    console.error(`[METADATA] Tool: ${toolName} (${toolId}) - ERROR: ${error}`);
  }

  // Future: Store in database
  // await sql`
  //   INSERT INTO mdm_tool_usage_log (
  //     tool_id, tool_name, success, error, created_at
  //   ) VALUES (
  //     ${toolId}, ${toolName}, ${success}, ${error}, NOW()
  //   )
  // `;
}

