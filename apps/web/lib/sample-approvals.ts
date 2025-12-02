/**
 * Sample Approvals Data - Phase 3
 *
 * Realistic pending change requests for approval.
 * Demonstrates multi-tier governance workflows.
 */

import type { PendingApproval } from "@/components/governance/ApprovalCard";

export const SAMPLE_PENDING_APPROVALS: PendingApproval[] = [
  {
    id: "approval-001",
    fieldName: "customer_name",
    changeType: "sensitivity",
    currentValue: "Internal",
    proposedValue: "PII (GDPR Article 6)",
    justification:
      "This field contains customer names which are Personally Identifiable Information under GDPR. Upgrading sensitivity classification to ensure proper encryption and access controls.",
    impact: "high",
    tier: 3,
    requester: "@compliance.officer",
    createdAt: "2 hours ago",
    approvers: [
      {
        name: "John Doe",
        role: "data-steward",
        status: "approved",
        timestamp: "1 hour ago",
      },
      {
        name: "Jane Smith",
        role: "domain-lead",
        status: "pending",
      },
      {
        name: "Compliance Team",
        role: "compliance",
        status: "pending",
      },
    ],
  },
  {
    id: "approval-002",
    fieldName: "revenue_gross",
    changeType: "definition",
    currentValue: "Total revenue generated from sales of goods or services before any deductions.",
    proposedValue:
      "Total revenue recognized from sales of goods or services, measured in accordance with MFRS 15, before any deductions for discounts, returns, or allowances.",
    justification:
      "Aligning definition with MFRS 15 (Revenue from Contracts with Customers) to ensure compliance with Malaysian Financial Reporting Standards.",
    impact: "medium",
    tier: 3,
    requester: "@finance.controller",
    createdAt: "1 day ago",
    approvers: [
      {
        name: "Finance Steward",
        role: "data-steward",
        status: "approved",
        timestamp: "18 hours ago",
      },
      {
        name: "CFO",
        role: "domain-lead",
        status: "pending",
      },
    ],
  },
  {
    id: "approval-003",
    fieldName: "tax_code",
    changeType: "tags",
    currentValue: "tax, compliance",
    proposedValue: "tax, compliance, vat, regulatory-reporting",
    justification:
      "Adding 'vat' and 'regulatory-reporting' tags to improve discoverability and ensure this field is included in automated compliance reports.",
    impact: "low",
    tier: 2,
    requester: "@tax.analyst",
    createdAt: "3 days ago",
    approvers: [
      {
        name: "Tax Steward",
        role: "data-steward",
        status: "pending",
      },
    ],
  },
  {
    id: "approval-004",
    fieldName: "employee_id",
    changeType: "tier",
    currentValue: "Tier 3 (Multi-Stakeholder)",
    proposedValue: "Tier 4 (Board-Level)",
    justification:
      "Employee IDs are used across payroll, benefits, and HR systems. Any change could impact legal compliance and employee records. Upgrading to Tier 4 for maximum governance.",
    impact: "high",
    tier: 3,
    requester: "@hr.director",
    createdAt: "5 days ago",
    approvers: [
      {
        name: "HR Steward",
        role: "data-steward",
        status: "approved",
        timestamp: "4 days ago",
      },
      {
        name: "HR Director",
        role: "domain-lead",
        status: "approved",
        timestamp: "3 days ago",
      },
      {
        name: "Compliance Officer",
        role: "compliance",
        status: "pending",
      },
    ],
  },
  {
    id: "approval-005",
    fieldName: "invoice_amount",
    changeType: "owner",
    currentValue: "@accounts.payable",
    proposedValue: "@senior.accountant",
    justification:
      "Transfer ownership to Senior Accountant who is now the primary steward for AP-related metadata following organizational restructuring.",
    impact: "low",
    tier: 2,
    requester: "@finance.manager",
    createdAt: "1 week ago",
    approvers: [
      {
        name: "Finance Steward",
        role: "data-steward",
        status: "pending",
      },
    ],
  },
];

/**
 * Get approvals for current user role
 */
export function getApprovalsForRole(role: string): PendingApproval[] {
  return SAMPLE_PENDING_APPROVALS.filter((approval) =>
    approval.approvers.some((a) => a.role === role && a.status === "pending")
  );
}

/**
 * Get approval by ID
 */
export function getApprovalById(id: string): PendingApproval | undefined {
  return SAMPLE_PENDING_APPROVALS.find((a) => a.id === id);
}

/**
 * Get approval count by status
 */
export function getApprovalStats() {
  const pending = SAMPLE_PENDING_APPROVALS.length;
  const requiresMyAction = getApprovalsForRole("data-steward").length;

  return {
    total: pending,
    requiresMyAction,
    byImpact: {
      high: SAMPLE_PENDING_APPROVALS.filter((a) => a.impact === "high").length,
      medium: SAMPLE_PENDING_APPROVALS.filter((a) => a.impact === "medium").length,
      low: SAMPLE_PENDING_APPROVALS.filter((a) => a.impact === "low").length,
    },
  };
}

