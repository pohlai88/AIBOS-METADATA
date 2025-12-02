/**
 * Controlled Vocabulary for Metadata Studio
 * 
 * Define your metadata terms, definitions, and relationships here.
 * This file serves as the single source of truth for your metadata glossary.
 */

export interface MetadataTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  aliases?: string[];
  tags?: string[];
  relatedTerms?: string[];
  examples?: string[];
  governance?: {
    owner?: string;
    tier?: string;
    status?: 'draft' | 'approved' | 'deprecated';
  };
}

/**
 * TODO: Add your metadata terms below
 * 
 * Example:
 * {
 *   id: "customer-id",
 *   term: "Customer ID",
 *   definition: "Unique identifier for a customer in the system",
 *   category: "Identifiers",
 *   aliases: ["CustID", "Customer Number"],
 *   tags: ["master-data", "pii"],
 *   governance: {
 *     owner: "Data Governance Team",
 *     tier: "Tier 1",
 *     status: "approved"
 *   }
 * }
 */
export const CONTROLLED_VOCABULARY: MetadataTerm[] = [
  // Add your terms here
];

export const METADATA_CATEGORIES = [
  // Add your categories here
  // Example: "Identifiers", "Financial Metrics", "Customer Data", etc.
];

export const GOVERNANCE_TIERS = [
  // Add your governance tiers here
  // Example: "Tier 1 - Critical", "Tier 2 - Important", "Tier 3 - Standard"
];
