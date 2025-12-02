/**
 * Sample AI Proposals - Phase 2
 *
 * Realistic AI-generated suggestions for metadata improvements.
 * Demonstrates "Quiet AI" - suggestions, not chatbots.
 */

import type { AISuggestion } from "@/components/metadata/AISuggestionCard";

/**
 * Get AI suggestions for a specific field
 */
export function getAISuggestionsForField(fieldName: string): AISuggestion[] {
  const suggestionsMap: Record<string, AISuggestion[]> = {
    customer_name: [
      {
        id: "ai-001",
        type: "compliance",
        severity: "warning",
        title: "PII field not tagged for GDPR compliance",
        description:
          "This field contains Personally Identifiable Information (PII) but is missing required GDPR compliance tags and encryption flags.",
        confidence: 98,
        suggestedAction: "Add tags: 'pii', 'gdpr-article-6', 'encryption-required'",
        impact: "High - Required for GDPR compliance audit",
        agentName: "ComplianceGuardian",
        createdAt: "2 hours ago",
      },
    ],
    phone_number: [
      {
        id: "ai-002",
        type: "quality",
        severity: "warning",
        title: "Low quality score detected (78%)",
        description:
          "Field has 22% null values, exceeding the 5% threshold. This may indicate incomplete data collection or integration issues.",
        confidence: 95,
        suggestedAction: "Review data collection process and add validation rules",
        impact: "Medium - Affects 3 downstream reports",
        agentName: "DataQualitySentinel",
        createdAt: "1 day ago",
      },
      {
        id: "ai-003",
        type: "mapping",
        severity: "info",
        title: "Mapping suggestion: phone_number → CONTACT_PHONE",
        description:
          "Based on field name and data type analysis, this field should be mapped to the canonical field 'CONTACT_PHONE'.",
        confidence: 92,
        suggestedAction: "Map to canonical: CONTACT_PHONE (VARCHAR(20), PII)",
        impact: "Low - Improves metadata consistency",
        agentName: "MappingAgent",
        createdAt: "3 days ago",
      },
    ],
    email_address: [
      {
        id: "ai-004",
        type: "quality",
        severity: "warning",
        title: "Quality score below threshold (85%)",
        description:
          "15% of records have invalid email formats. Consider adding format validation or data cleansing rules.",
        confidence: 97,
        suggestedAction: "Add regex validation: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        impact: "Medium - Affects email campaigns and notifications",
        agentName: "DataQualitySentinel",
        createdAt: "5 hours ago",
      },
    ],
    payment_terms: [
      {
        id: "ai-005",
        type: "optimization",
        severity: "info",
        title: "Standardization opportunity detected",
        description:
          "Found 12 variations of payment terms (NET30, Net 30, net30, etc.). Standardizing to a controlled vocabulary would improve data quality.",
        confidence: 89,
        suggestedAction: "Create lookup table with standard values: NET30, NET60, NET90, COD",
        impact: "Low - Improves reporting consistency",
        agentName: "DataQualitySentinel",
        createdAt: "1 week ago",
      },
    ],
  };

  return suggestionsMap[fieldName] || [];
}

/**
 * Get all pending AI suggestions (across all fields)
 */
export function getAllPendingProposals(): AISuggestion[] {
  return [
    {
      id: "ai-global-001",
      type: "quality",
      severity: "error",
      title: "5 fields missing data steward assignment",
      description:
        "Fields without assigned owners: product_code, quantity_on_hand, sales_order_id, vendor_name, cost_center",
      confidence: 100,
      suggestedAction: "Assign data stewards from respective domain teams",
      impact: "High - Required for governance tier advancement",
      agentName: "GovernanceAgent",
      createdAt: "Today",
    },
    {
      id: "ai-global-002",
      type: "mapping",
      severity: "info",
      title: "3 unmapped fields detected",
      description:
        "Fields not mapped to canonical model: department_code, hire_date, cost_center",
      confidence: 85,
      suggestedAction: "Review and map to global metadata registry",
      impact: "Medium - Affects cross-system reporting",
      agentName: "MappingAgent",
      createdAt: "Yesterday",
    },
  ];
}

/**
 * Check if a field has AI suggestions
 */
export function hasAISuggestions(fieldName: string): boolean {
  return getAISuggestionsForField(fieldName).length > 0;
}

/**
 * Get suggestion count for a field
 */
export function getAISuggestionCount(fieldName: string): number {
  return getAISuggestionsForField(fieldName).length;
}

