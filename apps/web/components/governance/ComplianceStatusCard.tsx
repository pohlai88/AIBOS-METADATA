/**
 * ComplianceStatusCard - Phase 3
 *
 * Displays compliance status for a metadata field.
 * Shows which standards apply, compliance gaps, and remediation steps.
 */

"use client";

import { cn } from "@aibos/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  ExternalLink,
} from "lucide-react";

export interface ComplianceRequirement {
  standard: string;
  description: string;
  status: "compliant" | "non-compliant" | "partial";
  controls: string[];
  gap?: string;
  remediation?: string;
  dueDate?: string;
}

interface ComplianceStatusCardProps {
  fieldName: string;
  requirements: ComplianceRequirement[];
  overallStatus?: "compliant" | "non-compliant" | "partial";
  onViewDetails?: () => void;
  className?: string;
}

const statusConfig = {
  compliant: {
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    label: "Compliant",
  },
  "non-compliant": {
    icon: XCircle,
    color: "text-danger",
    bgColor: "bg-danger/10",
    borderColor: "border-danger/20",
    label: "Non-Compliant",
  },
  partial: {
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    label: "Partially Compliant",
  },
};

export function ComplianceStatusCard({
  fieldName,
  requirements,
  overallStatus = "compliant",
  onViewDetails,
  className,
}: ComplianceStatusCardProps) {
  const config = statusConfig[overallStatus];
  const Icon = config.icon;

  const compliantCount = requirements.filter((r) => r.status === "compliant").length;
  const totalCount = requirements.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall Status */}
      <div
        className={cn(
          "rounded-lg border-2 p-4",
          config.borderColor,
          config.bgColor
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn("h-6 w-6 flex-shrink-0", config.color)} />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-base">
              {config.label}
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              {compliantCount} of {totalCount} standards met
            </p>
          </div>
          <Badge variant="outline" className={cn("text-xs", config.color)}>
            {Math.round((compliantCount / totalCount) * 100)}%
          </Badge>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-3">
        {requirements.map((req, idx) => (
          <ComplianceRequirementItem key={idx} requirement={req} />
        ))}
      </div>

      {/* View Details */}
      {onViewDetails && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="w-full"
        >
          <Shield className="mr-2 h-4 w-4" />
          View Full Compliance Report
          <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

/**
 * Individual Compliance Requirement Item
 */
function ComplianceRequirementItem({
  requirement,
}: {
  requirement: ComplianceRequirement;
}) {
  const config = statusConfig[requirement.status];
  const StatusIcon = config.icon;

  return (
    <div className="rounded-lg border border-border-base bg-bg-base p-3">
      {/* Header */}
      <div className="mb-2 flex items-start gap-2">
        <StatusIcon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", config.color)} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-text-base">
              {requirement.standard}
            </h4>
            <Badge
              variant="outline"
              className={cn("text-[10px]", config.color)}
            >
              {config.label}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-text-muted">
            {requirement.description}
          </p>
        </div>
      </div>

      {/* Controls */}
      {requirement.controls.length > 0 && (
        <div className="mb-2">
          <p className="mb-1 text-xs font-medium text-text-muted">Controls:</p>
          <div className="flex flex-wrap gap-1">
            {requirement.controls.map((control, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px]">
                {control}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Gap & Remediation */}
      {requirement.gap && (
        <div className="mt-2 rounded-md border border-warning/20 bg-warning/5 p-2">
          <p className="text-xs font-medium text-warning">Gap Identified:</p>
          <p className="mt-1 text-xs text-text-muted">{requirement.gap}</p>
          {requirement.remediation && (
            <>
              <p className="mt-2 text-xs font-medium text-success">
                Remediation:
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {requirement.remediation}
              </p>
            </>
          )}
          {requirement.dueDate && (
            <p className="mt-2 text-xs text-warning">
              Due: {requirement.dueDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Get sample compliance requirements for a field
 */
export function getSampleComplianceRequirements(
  fieldName: string
): ComplianceRequirement[] {
  const requirementsMap: Record<string, ComplianceRequirement[]> = {
    customer_name: [
      {
        standard: "GDPR (Article 6)",
        description: "Lawfulness of processing personal data",
        status: "partial",
        controls: ["Consent", "Legitimate Interest"],
        gap: "Missing explicit consent tracking mechanism",
        remediation: "Implement consent management system with audit trail",
        dueDate: "2025-12-31",
      },
      {
        standard: "PDPA (Malaysia)",
        description: "Personal Data Protection Act compliance",
        status: "compliant",
        controls: ["Data Protection Notice", "Security Safeguards"],
      },
      {
        standard: "ISO 27001",
        description: "Information security management",
        status: "compliant",
        controls: ["A.8.2", "A.18.1.4"],
      },
    ],
    revenue_gross: [
      {
        standard: "MFRS 15",
        description: "Revenue from Contracts with Customers",
        status: "compliant",
        controls: ["Recognition", "Measurement", "Disclosure"],
      },
      {
        standard: "IFRS 15",
        description: "International revenue recognition standard",
        status: "compliant",
        controls: ["5-Step Model", "Contract Modifications"],
      },
      {
        standard: "SOX Section 404",
        description: "Internal controls over financial reporting",
        status: "compliant",
        controls: ["Control Testing", "Documentation"],
      },
    ],
    employee_id: [
      {
        standard: "GDPR (Article 9)",
        description: "Processing of special categories of personal data",
        status: "compliant",
        controls: ["Explicit Consent", "Substantial Public Interest"],
      },
      {
        standard: "SOC 2 (Type II)",
        description: "Trust services criteria for security and privacy",
        status: "compliant",
        controls: ["CC6.1", "CC6.7", "PI1.2"],
      },
    ],
  };

  return (
    requirementsMap[fieldName] || [
      {
        standard: "General Data Protection",
        description: "Basic data protection requirements",
        status: "compliant",
        controls: ["Access Control", "Encryption"],
      },
    ]
  );
}

