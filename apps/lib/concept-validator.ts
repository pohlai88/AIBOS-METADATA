/**
 * Concept Validator
 * 
 * Validates concept creation/updates to enforce governance rules:
 * - Tier 1/2 FINANCE concepts must have LAW-level standard packs
 */

import { sql } from './db';

export interface ConceptValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate that a Tier 1/2 FINANCE concept has a LAW-level standard pack
 */
export async function validateTierEnforcement(
  domain: string,
  governanceTier: number,
  standardPackId: string | null
): Promise<ConceptValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if this is a Tier 1/2 FINANCE concept
  if (domain === 'FINANCE' && (governanceTier === 1 || governanceTier === 2)) {
    if (!standardPackId) {
      errors.push(
        `FINANCE concepts with governance tier ${governanceTier} must have a standard_pack_id_primary pointing to a LAW-level pack (e.g., IFRS/MFRS).`
      );
      return { valid: false, errors, warnings };
    }

    // Verify the standard pack exists and is LAW-level
    const pack = await sql`
      SELECT authority_level, status 
      FROM mdm_standard_pack 
      WHERE id = ${standardPackId} 
      LIMIT 1
    `;

    if (!pack || pack.length === 0) {
      errors.push(`Standard pack with id ${standardPackId} does not exist.`);
      return { valid: false, errors, warnings };
    }

    const packData = pack[0] as { authority_level: string; status: string };

    if (packData.authority_level !== 'LAW') {
      errors.push(
        `FINANCE concepts with governance tier ${governanceTier} must reference a LAW-level standard pack, but pack has authority_level: ${packData.authority_level}`
      );
      return { valid: false, errors, warnings };
    }

    if (packData.status === 'DEPRECATED') {
      warnings.push(
        `Standard pack is DEPRECATED. Consider updating to an ACTIVE pack.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate concept before insert/update
 */
export async function validateConcept(
  domain: string,
  conceptType: string,
  governanceTier: number,
  standardPackId: string | null
): Promise<ConceptValidationResult> {
  // Tier enforcement
  const tierResult = await validateTierEnforcement(domain, governanceTier, standardPackId);
  
  return {
    valid: tierResult.valid,
    errors: tierResult.errors,
    warnings: tierResult.warnings,
  };
}

