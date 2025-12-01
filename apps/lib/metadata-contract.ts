/**
 * Metadata Kernel Contract
 * 
 * This file defines the contract that all finance code must follow:
 * "No finance code without a concept"
 * 
 * This ensures that every finance field, table, and service is anchored
 * to a canonical concept in the metadata kernel, preventing random
 * "rev_v2_tmp" fields from sneaking into the system.
 */

import { metadataService } from './metadataService';

/**
 * Finance Field Configuration Contract
 * 
 * Every finance field/column must be associated with a canonical concept.
 * This is enforced during bootstrap/deploy via concept validation.
 */
export type FinanceFieldConfig = {
  /** Database column/field name */
  dbColumnName: string;
  
  /** Canonical concept key (must exist in mdm_concept) */
  mdmConceptKey: string;
  
  /** Optional: Standard pack code for validation */
  standardPackCode?: string;
  
  /** Optional: Governance tier requirement */
  requiredGovernanceTier?: 1 | 2 | 3 | 4 | 5;
  
  /** Optional: Domain requirement */
  requiredDomain?: 'FINANCE' | 'HR' | 'SCM' | 'IT' | 'OTHER';
};

/**
 * Concept Validation Result
 */
export type ConceptValidationResult = {
  valid: boolean;
  conceptId: string | null;
  canonicalKey: string | null;
  standardPackCode: string | null;
  governanceTier: number | null;
  errors: string[];
  warnings: string[];
};

/**
 * Concept Validator
 * 
 * Validates that finance fields are properly anchored to metadata concepts.
 */
export class ConceptValidator {
  /**
   * Validate a finance field configuration against the metadata kernel
   */
  async validateFieldConfig(
    tenantId: string,
    config: FinanceFieldConfig
  ): Promise<ConceptValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 1. Lookup the concept
    const conceptView = await metadataService.lookupConcept(
      tenantId,
      config.mdmConceptKey
    );
    
    if (!conceptView) {
      return {
        valid: false,
        conceptId: null,
        canonicalKey: null,
        standardPackCode: null,
        governanceTier: null,
        errors: [
          `Concept '${config.mdmConceptKey}' not found in metadata kernel. ` +
          `All finance fields must be anchored to a canonical concept.`
        ],
        warnings: []
      };
    }
    
    const { concept, standardPack } = conceptView;
    
    // 2. Validate domain requirement
    if (config.requiredDomain && concept.domain !== config.requiredDomain) {
      errors.push(
        `Concept '${config.mdmConceptKey}' has domain '${concept.domain}', ` +
        `but field requires domain '${config.requiredDomain}'`
      );
    }
    
    // 3. Validate governance tier requirement
    if (
      config.requiredGovernanceTier &&
      concept.governance_tier > config.requiredGovernanceTier
    ) {
      warnings.push(
        `Concept '${config.mdmConceptKey}' has governance tier ${concept.governance_tier}, ` +
        `but field requires tier ${config.requiredGovernanceTier} or lower`
      );
    }
    
    // 4. Validate standard pack requirement
    if (config.standardPackCode) {
      if (!standardPack) {
        errors.push(
          `Concept '${config.mdmConceptKey}' is not anchored to a standard pack, ` +
          `but field requires pack '${config.standardPackCode}'`
        );
      } else if (standardPack.code !== config.standardPackCode) {
        errors.push(
          `Concept '${config.mdmConceptKey}' is anchored to pack '${standardPack.code}', ` +
          `but field requires pack '${config.standardPackCode}'`
        );
      }
    }
    
    // 5. Check Tier 1 finance concepts have LAW-level packs
    if (
      concept.domain === 'FINANCE' &&
      concept.governance_tier === 1 &&
      (!standardPack || standardPack.authority_level !== 'LAW')
    ) {
      errors.push(
        `Tier 1 finance concept '${config.mdmConceptKey}' must be anchored to a LAW-level standard pack`
      );
    }
    
    return {
      valid: errors.length === 0,
      conceptId: concept.id,
      canonicalKey: concept.canonical_key,
      standardPackCode: standardPack?.code || null,
      governanceTier: concept.governance_tier,
      errors,
      warnings
    };
  }
  
  /**
   * Validate multiple field configurations (for bootstrap/deploy)
   */
  async validateFieldConfigs(
    tenantId: string,
    configs: FinanceFieldConfig[]
  ): Promise<{
    valid: boolean;
    results: ConceptValidationResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      warnings: number;
    };
  }> {
    const results = await Promise.all(
      configs.map(config => this.validateFieldConfig(tenantId, config))
    );
    
    const passed = results.filter(r => r.valid).length;
    const failed = results.filter(r => !r.valid).length;
    const warnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    
    return {
      valid: failed === 0,
      results,
      summary: {
        total: configs.length,
        passed,
        failed,
        warnings
      }
    };
  }
}

// Export singleton instance
export const conceptValidator = new ConceptValidator();

/**
 * Example usage:
 * 
 * ```ts
 * const config: FinanceFieldConfig = {
 *   dbColumnName: 'journal_entry_amount',
 *   mdmConceptKey: 'gl_journal_entry',
 *   requiredDomain: 'FINANCE',
 *   requiredGovernanceTier: 1,
 *   standardPackCode: 'IFRS_CORE'
 * };
 * 
 * const result = await conceptValidator.validateFieldConfig(tenantId, config);
 * if (!result.valid) {
 *   throw new Error(`Field validation failed: ${result.errors.join(', ')}`);
 * }
 * ```
 */

