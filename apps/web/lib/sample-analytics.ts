/**
 * Sample Analytics Data - Phase 4
 *
 * Realistic analytics and predictive insights data.
 */

import type { MetadataHealthData } from "@/components/analytics/MetadataHealthDashboard";
import type { PredictiveInsight } from "@/components/analytics/PredictiveInsightsCard";
import type { ActivityItem } from "@/components/collaboration/ActivityFeed";
import type { FieldImpactData } from "@/components/analytics/FieldImpactAnalysis";

/**
 * Metadata Health Dashboard Data
 */
export const SAMPLE_HEALTH_DATA: MetadataHealthData = {
  overallHealth: 87,
  qualityScore: 92,
  governanceCoverage: 84,
  complianceRate: 96,
  datasetsCataloged: {
    label: "Datasets Cataloged",
    value: 47,
    total: 50,
    percentage: 94,
    trend: "up",
    trendValue: "+3",
    status: "excellent",
  },
  fieldsDocumented: {
    label: "Fields Documented",
    value: 245,
    total: 280,
    percentage: 87,
    trend: "up",
    trendValue: "+12",
    status: "good",
  },
  lineageMapped: {
    label: "Lineage Mapped",
    value: 38,
    total: 50,
    percentage: 76,
    trend: "stable",
    status: "good",
  },
  activeStakeholders: 23,
  pendingApprovals: 5,
  aiSuggestions: 8,
  avgTimeToApproval: "2.4 days",
};

/**
 * Predictive Insights
 */
export const SAMPLE_PREDICTIVE_INSIGHTS: PredictiveInsight[] = [
  {
    id: "insight-001",
    type: "quality-decline",
    title: "Quality Score Likely to Drop for Revenue Fields",
    description:
      "Based on historical patterns, revenue-related fields are showing early indicators of quality degradation. Null rates have increased by 3% over the past week.",
    confidence: 94,
    priority: "high",
    affectedFields: ["revenue_gross", "revenue_net", "revenue_deferred"],
    predictedImpact:
      "Quality scores may drop below 90% threshold within 7 days",
    suggestedAction:
      "Run data quality profiler on revenue fields and review upstream data sources",
    timeframe: "Within 7 days",
    historicalPattern:
      "Similar pattern observed in Q3 2024, resolved by ETL optimization",
  },
  {
    id: "insight-002",
    type: "missing-lineage",
    title: "New Data Sources Detected Without Lineage",
    description:
      "3 new database connections were added to the payroll system last week, but no lineage mapping has been created. This creates a blind spot in data governance.",
    confidence: 98,
    priority: "medium",
    affectedFields: ["employee_id", "salary_gross", "department_code"],
    predictedImpact: "Incomplete impact analysis for future changes",
    suggestedAction:
      "Map lineage for new payroll data sources using auto-discovery tools",
    timeframe: "Within 14 days",
  },
  {
    id: "insight-003",
    type: "outdated-definition",
    title: "Tax Code Definitions May Be Outdated",
    description:
      "Tax regulations were updated 3 months ago, but tax_code definitions haven't been reviewed. This pattern historically precedes compliance issues.",
    confidence: 89,
    priority: "high",
    affectedFields: ["tax_code", "tax_rate", "tax_amount"],
    predictedImpact: "Potential compliance audit findings",
    suggestedAction:
      "Schedule review with Tax team to validate definitions against current regulations",
    timeframe: "Within 30 days",
    historicalPattern:
      "Last regulatory update in 2024 took 45 days to reflect in metadata",
  },
  {
    id: "insight-004",
    type: "usage-spike",
    title: "Unusual Query Volume on Customer Data",
    description:
      "customer_name and customer_segment fields are being queried 300% more than baseline. This may indicate a new use case that requires governance review.",
    confidence: 92,
    priority: "medium",
    affectedFields: ["customer_name", "customer_segment", "email_address"],
    predictedImpact:
      "Potential PII exposure if new use case lacks proper controls",
    suggestedAction:
      "Investigate new use case and ensure GDPR compliance controls are applied",
    timeframe: "Within 5 days",
    historicalPattern: "Previous spike in Q2 2024 led to new marketing dashboard",
  },
];

/**
 * Activity Feed Data
 */
export const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: "activity-001",
    type: "approval-approved",
    actor: {
      name: "Jane Smith",
      initials: "JS",
      role: "Domain Lead - Finance",
    },
    subject: "revenue_gross",
    action: "approved definition change for",
    timestamp: "2 hours ago",
    metadata: {
      impact: "Medium",
      tier: "T3",
    },
  },
  {
    id: "activity-002",
    type: "ai-suggestion",
    actor: {
      name: "DataQualitySentinel",
      initials: "AI",
      role: "AI Agent",
    },
    subject: "phone_number",
    action: "suggested quality improvement for",
    timestamp: "3 hours ago",
    metadata: {
      confidence: "95%",
    },
  },
  {
    id: "activity-003",
    type: "field-updated",
    actor: {
      name: "John Doe",
      initials: "JD",
      role: "Data Steward",
    },
    subject: "customer_name",
    action: "updated sensitivity classification for",
    timestamp: "5 hours ago",
    metadata: {
      from: "Internal",
      to: "PII",
    },
  },
  {
    id: "activity-004",
    type: "lineage-added",
    actor: {
      name: "Sarah Lee",
      initials: "SL",
      role: "Data Engineer",
    },
    subject: "invoice_amount",
    action: "mapped lineage for",
    timestamp: "1 day ago",
  },
  {
    id: "activity-005",
    type: "field-created",
    actor: {
      name: "Mike Chen",
      initials: "MC",
      role: "Data Analyst",
    },
    subject: "discount_percentage",
    action: "created new field",
    timestamp: "1 day ago",
    metadata: {
      tier: "T1",
      domain: "SALES",
    },
  },
  {
    id: "activity-006",
    type: "compliance-check",
    actor: {
      name: "ComplianceGuardian",
      initials: "AI",
      role: "AI Agent",
    },
    subject: "employee_id",
    action: "ran compliance check on",
    timestamp: "2 days ago",
    metadata: {
      result: "Compliant",
      standards: "GDPR, SOC2",
    },
  },
  {
    id: "activity-007",
    type: "approval-rejected",
    actor: {
      name: "Compliance Officer",
      initials: "CO",
      role: "Compliance Team",
    },
    subject: "salary_details",
    action: "rejected tier change for",
    timestamp: "2 days ago",
    metadata: {
      reason: "Missing controls",
    },
  },
  {
    id: "activity-008",
    type: "tier-changed",
    actor: {
      name: "HR Director",
      initials: "HD",
      role: "Domain Lead - HR",
    },
    subject: "employee_id",
    action: "upgraded governance tier for",
    timestamp: "3 days ago",
    metadata: {
      from: "T3",
      to: "T4",
    },
  },
];

/**
 * Field Impact Analysis Data
 */
export function getFieldImpactAnalysis(fieldName: string): FieldImpactData {
  const impactMap: Record<string, FieldImpactData> = {
    customer_name: {
      fieldName: "customer_name",
      changeType: "Sensitivity Classification Change (Internal → PII)",
      overallRisk: "high",
      affectedUsers: 47,
      affectedSystems: 8,
      impactAreas: [
        {
          category: "databases",
          items: [
            {
              name: "CRM Database",
              type: "PostgreSQL",
              riskLevel: "high",
              description:
                "Requires encryption at rest and in transit. 3 million records affected.",
            },
            {
              name: "Data Warehouse",
              type: "Snowflake",
              riskLevel: "medium",
              description:
                "Masking policies must be updated for reporting queries.",
            },
          ],
        },
        {
          category: "apis",
          items: [
            {
              name: "GET /api/customers",
              type: "REST API",
              riskLevel: "critical",
              description:
                "Currently returns customer_name in plaintext. Requires authentication upgrade and audit logging.",
            },
            {
              name: "Customer Search API",
              type: "GraphQL",
              riskLevel: "high",
              description:
                "Field resolver must add GDPR consent checks before returning data.",
            },
          ],
        },
        {
          category: "reports",
          items: [
            {
              name: "Sales Dashboard",
              type: "PowerBI",
              riskLevel: "medium",
              description:
                "12 reports use this field. Access controls must be reviewed.",
            },
            {
              name: "AR Aging Report",
              type: "Excel Export",
              riskLevel: "high",
              description:
                "Downloaded by 23 users. Export permissions need re-validation.",
            },
          ],
        },
        {
          category: "users",
          items: [
            {
              name: "Sales Team",
              type: "47 users",
              riskLevel: "medium",
              description:
                "Current access may no longer be appropriate under PII classification. GDPR training required.",
            },
          ],
        },
      ],
      recommendations: [
        "Enable encryption for customer_name field in all databases",
        "Update API authentication to require GDPR consent verification",
        "Review and re-validate user access permissions (47 users affected)",
        "Add audit logging for all customer_name field access",
        "Schedule GDPR training for Sales team before change is applied",
        "Test masking policies in staging environment first",
        "Coordinate with Legal team for compliance sign-off",
      ],
    },
    revenue_gross: {
      fieldName: "revenue_gross",
      changeType: "Definition Change (MFRS 15 Alignment)",
      overallRisk: "medium",
      affectedUsers: 15,
      affectedSystems: 4,
      impactAreas: [
        {
          category: "reports",
          items: [
            {
              name: "P&L Statement",
              type: "Financial Report",
              riskLevel: "high",
              description:
                "Monthly close process depends on this field. Coordinate timing with Finance.",
            },
            {
              name: "Revenue Dashboard",
              type: "Tableau",
              riskLevel: "medium",
              description:
                "Historical comparisons may show discontinuity. Add annotation.",
            },
          ],
        },
        {
          category: "downstream",
          items: [
            {
              name: "Revenue Forecast Model",
              type: "ML Model",
              riskLevel: "high",
              description:
                "Model trained on old definition. Requires retraining with updated logic.",
            },
          ],
        },
      ],
      recommendations: [
        "Coordinate change with month-end close schedule",
        "Add historical footnote to revenue reports explaining definition change",
        "Retrain ML model with updated revenue definition",
        "Update API documentation to reflect MFRS 15 compliance",
      ],
    },
  };

  return (
    impactMap[fieldName] || {
      fieldName,
      changeType: "Field Update",
      overallRisk: "low",
      affectedUsers: 0,
      affectedSystems: 0,
      impactAreas: [],
      recommendations: ["No significant impact detected. Change can proceed."],
    }
  );
}

