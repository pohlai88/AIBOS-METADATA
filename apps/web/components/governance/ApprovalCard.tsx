/**
 * ApprovalCard - Phase 3
 *
 * Displays pending change requests for approval.
 * Shows diff, impact, and allows Approve/Reject actions.
 */

"use client";

import { cn } from "@aibos/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/metadata-badges";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export interface PendingApproval {
  id: string;
  fieldName: string;
  changeType: string;
  currentValue: string;
  proposedValue: string;
  justification: string;
  impact: "low" | "medium" | "high";
  tier: number;
  requester: string;
  createdAt: string;
  approvers: {
    name: string;
    role: string;
    status: "pending" | "approved" | "rejected";
    timestamp?: string;
  }[];
}

interface ApprovalCardProps {
  approval: PendingApproval;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  currentUserRole?: string; // e.g., "data-steward", "domain-lead", "compliance"
  className?: string;
}

const impactColors = {
  low: "border-success/20 bg-success/5 text-success",
  medium: "border-warning/20 bg-warning/5 text-warning",
  high: "border-danger/20 bg-danger/5 text-danger",
};

export function ApprovalCard({
  approval,
  onApprove,
  onReject,
  onViewDetails,
  currentUserRole = "data-steward",
  className,
}: ApprovalCardProps) {
  // Check if current user can approve this request
  const pendingApprover = approval.approvers.find(
    (a) => a.status === "pending" && a.role === currentUserRole
  );
  const canApprove = !!pendingApprover;

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-border-base bg-bg-base p-4 transition-all hover:shadow-md",
        className
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-mono text-sm font-semibold text-text-base">
              {approval.fieldName}
            </h3>
            <TierBadge tier={approval.tier} size="sm" />
          </div>
          <p className="text-xs text-text-muted capitalize">
            Change Type: {approval.changeType}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", impactColors[approval.impact])}
        >
          {approval.impact.toUpperCase()} Impact
        </Badge>
      </div>

      {/* Change Diff */}
      <div className="mb-3 space-y-2">
        <div className="rounded-md border border-border-base bg-bg-subtle p-3">
          <p className="mb-1 text-xs font-medium text-text-muted">Current</p>
          <p className="text-sm text-text-base line-through opacity-60">
            {approval.currentValue}
          </p>
        </div>
        <div className="flex justify-center">
          <ArrowRight className="h-4 w-4 text-primary" />
        </div>
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
          <p className="mb-1 text-xs font-medium text-primary">Proposed</p>
          <p className="text-sm font-medium text-text-base">
            {approval.proposedValue}
          </p>
        </div>
      </div>

      {/* Justification */}
      <div className="mb-3 rounded-md border border-border-base bg-bg-subtle p-3">
        <p className="mb-1 text-xs font-medium text-text-muted">Justification</p>
        <p className="text-sm text-text-base">{approval.justification}</p>
      </div>

      {/* Approvers */}
      <div className="mb-3 space-y-2">
        <p className="text-xs font-medium text-text-muted">Approval Chain</p>
        <div className="space-y-1">
          {approval.approvers.map((approver, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-xs",
                approver.status === "approved" && "bg-success/10 text-success",
                approver.status === "rejected" && "bg-danger/10 text-danger",
                approver.status === "pending" && "bg-bg-subtle text-text-muted"
              )}
            >
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span className="font-medium">{approver.name}</span>
                <span className="text-[10px] opacity-70">({approver.role})</span>
              </div>
              {approver.status === "approved" && (
                <CheckCircle className="h-3 w-3" />
              )}
              {approver.status === "rejected" && <XCircle className="h-3 w-3" />}
              {approver.status === "pending" && <Clock className="h-3 w-3" />}
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-3 flex items-center gap-3 text-xs text-text-muted">
        <span>By {approval.requester}</span>
        <span>•</span>
        <span>{approval.createdAt}</span>
      </div>

      {/* Actions */}
      {canApprove ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => onApprove?.(approval.id)}
            className="flex-1 bg-success hover:bg-success/90"
          >
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject?.(approval.id)}
            className="flex-1 border-danger text-danger hover:bg-danger/10"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails?.(approval.id)}
          >
            Details
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-warning/20 bg-warning/5 px-3 py-2 text-center">
          <p className="text-xs text-warning">
            <AlertTriangle className="mr-1 inline h-3 w-3" />
            Pending approval from {pendingApprover ? "other approvers" : "assigned approvers"}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Approval List Component
 */
export function ApprovalsList({
  approvals,
  onApprove,
  onReject,
  onViewDetails,
  currentUserRole,
  emptyMessage = "No pending approvals",
}: {
  approvals: PendingApproval[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  currentUserRole?: string;
  emptyMessage?: string;
}) {
  if (approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="mb-3 h-12 w-12 text-success" />
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <ApprovalCard
          key={approval.id}
          approval={approval}
          onApprove={onApprove}
          onReject={onReject}
          onViewDetails={onViewDetails}
          currentUserRole={currentUserRole}
        />
      ))}
    </div>
  );
}

