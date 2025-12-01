#!/usr/bin/env node
// .mcp/metadata/metadataTools.mjs
// Tool definitions for metadata MCP server

import { neon } from "@neondatabase/serverless";

/**
 * Log concept lookup (v0: console, future: database)
 */
function logConceptLookup(tenantId, term, found, conceptId, canonicalKey, matchedVia) {
  if (found) {
    console.error(`[METADATA] Lookup: "${term}" → ${canonicalKey} (via ${matchedVia})`);
  } else {
    console.error(`[METADATA] Lookup: "${term}" → NOT FOUND`);
  }
}

/**
 * Look up a concept by term (canonical key or alias).
 */
async function lookupConcept(sql, tenantId, term) {
  const normalized = term.trim().toLowerCase();

  // 1) Try direct canonical_key match (case-insensitive)
  const conceptsByKey = await sql`
    SELECT * FROM mdm_concept
    WHERE tenant_id = ${tenantId}
      AND LOWER(canonical_key) = ${normalized}
    LIMIT 1
  `;

  let concept = null;

  if (conceptsByKey && conceptsByKey.length > 0) {
    concept = conceptsByKey[0];
    logConceptLookup(tenantId, term, true, concept.id, concept.canonical_key, 'canonical_key');
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
      concept = aliasRows[0];
      logConceptLookup(tenantId, term, true, concept.id, concept.canonical_key, 'alias');
    }
  }

  if (!concept) {
    logConceptLookup(tenantId, term, false, null, null, null);
    return null;
  }

  // Load primary pack if any
  let standardPack = null;
  if (concept.standard_pack_id_primary) {
    const packRows = await sql`
      SELECT * FROM mdm_standard_pack
      WHERE id = ${concept.standard_pack_id_primary}
      LIMIT 1
    `;

    if (packRows && packRows.length > 0) {
      standardPack = packRows[0];
    }
  }

  // Load aliases
  const aliasRows = await sql`
    SELECT * FROM mdm_alias
    WHERE concept_id = ${concept.id}
    ORDER BY is_preferred_for_display DESC, alias_type, alias_value
  `;

  const aliases = aliasRows ?? [];

  return {
    concept,
    standardPack,
    aliases,
  };
}

/**
 * List standard packs (optionally filtered by domain).
 */
async function listStandardPacks(sql, domain) {
  if (domain) {
    const rows = await sql`
      SELECT * FROM mdm_standard_pack
      WHERE domain = ${domain}
      ORDER BY code ASC
    `;
    return rows ?? [];
  } else {
    const rows = await sql`
      SELECT * FROM mdm_standard_pack
      ORDER BY code ASC
    `;
    return rows ?? [];
  }
}

/**
 * Tool handler for metadata.lookupConcept
 */
export async function lookupConceptTool(sql, args, withGovernanceMetadata) {
  const { tenantId, term } = args;
  if (!tenantId || !term) {
    throw new Error("tenantId and term are required");
  }

  const result = await lookupConcept(sql, tenantId, term);

  if (!result) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              found: false,
              message: `No concept found for term "${term}" in tenant "${tenantId}"`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          withGovernanceMetadata(
            {
              found: true,
              concept: result.concept,
              standardPack: result.standardPack,
              aliases: result.aliases,
            },
            "info",
            "info"
          ),
          null,
          2
        ),
      },
    ],
  };
}

/**
 * Tool handler for metadata.listStandardPacks
 */
export async function listStandardPacksTool(sql, args, withGovernanceMetadata) {
  const { domain } = args || {};
  const packs = await listStandardPacks(sql, domain);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          withGovernanceMetadata(
            {
              count: packs.length,
              packs: packs,
              domain: domain || "all",
            },
            "info",
            "info"
          ),
          null,
          2
        ),
      },
    ],
  };
}

