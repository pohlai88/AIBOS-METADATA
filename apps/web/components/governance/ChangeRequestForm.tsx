/**
 * ChangeRequestForm - Phase 3
 *
 * Form for submitting metadata change requests.
 * Supports different governance tiers (T1-T4).
 *
 * T1: Auto-apply (no approval)
 * T2: Single approval required
 * T3: Multi-stakeholder approval
 * T4: Board-level approval + compliance review
 */

"use client";

import { useState } from "react";
import { cn } from "@aibos/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/metadata-badges";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";

export interface ChangeRequest {
  fieldName: string;
  currentTier: number;
  changeType: "definition" | "tier" | "owner" | "sensitivity" | "tags" | "other";
  proposedValue: string;
  justification: string;
  impact: "low" | "medium" | "high";
  requester?: string;
}

interface ChangeRequestFormProps {
  fieldName: string;
  currentTier: number;
  onSubmit: (request: ChangeRequest) => void;
  onCancel: () => void;
  className?: string;
}

const changeTypeLabels = {
  definition: "Business Definition",
  tier: "Governance Tier",
  owner: "Data Steward",
  sensitivity: "Sensitivity Level",
  tags: "Tags/Labels",
  other: "Other",
};

const impactLabels = {
  low: "Low - Cosmetic or clarification",
  medium: "Medium - Affects some processes",
  high: "High - Critical impact on compliance or operations",
};

export function ChangeRequestForm({
  fieldName,
  currentTier,
  onSubmit,
  onCancel,
  className,
}: ChangeRequestFormProps) {
  const [changeType, setChangeType] = useState<ChangeRequest["changeType"]>("definition");
  const [proposedValue, setProposedValue] = useState("");
  const [justification, setJustification] = useState("");
  const [impact, setImpact] = useState<ChangeRequest["impact"]>("low");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fieldName,
      currentTier,
      changeType,
      proposedValue,
      justification,
      impact,
      requester: "@current.user", // Would come from auth context
    });
  };

  const isValid = proposedValue.trim() !== "" && justification.trim() !== "";

  // Determine approval flow based on tier and impact
  const getApprovalFlow = () => {
    if (currentTier === 1 && impact === "low") {
      return { autoApply: true, approvers: 0, message: "Auto-apply (no approval required)" };
    }
    if (currentTier === 2 || impact === "medium") {
      return { autoApply: false, approvers: 1, message: "Requires 1 approval (Data Steward)" };
    }
    if (currentTier === 3 || impact === "high") {
      return {
        autoApply: false,
        approvers: 2,
        message: "Requires 2 approvals (Steward + Domain Lead)",
      };
    }
    return {
      autoApply: false,
      approvers: 3,
      message: "Requires 3 approvals (Steward + Domain Lead + Compliance)",
    };
  };

  const approvalFlow = getApprovalFlow();

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Field Info */}
      <div className="rounded-lg border border-border-base bg-bg-subtle p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-base">Field Name</p>
            <p className="mt-1 font-mono text-sm text-text-muted">{fieldName}</p>
          </div>
          <TierBadge tier={currentTier} />
        </div>
      </div>

      {/* Change Type */}
      <div className="space-y-2">
        <Label htmlFor="changeType">Change Type</Label>
        <Select value={changeType} onValueChange={(value) => setChangeType(value as ChangeRequest["changeType"])}>
          <SelectTrigger id="changeType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(changeTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Proposed Value */}
      <div className="space-y-2">
        <Label htmlFor="proposedValue">
          Proposed Value <span className="text-danger">*</span>
        </Label>
        {changeType === "definition" ? (
          <Textarea
            id="proposedValue"
            value={proposedValue}
            onChange={(e) => setProposedValue(e.target.value)}
            placeholder="Enter the new business definition..."
            rows={4}
            required
          />
        ) : (
          <Input
            id="proposedValue"
            value={proposedValue}
            onChange={(e) => setProposedValue(e.target.value)}
            placeholder="Enter the new value..."
            required
          />
        )}
      </div>

      {/* Justification */}
      <div className="space-y-2">
        <Label htmlFor="justification">
          Justification <span className="text-danger">*</span>
        </Label>
        <Textarea
          id="justification"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Explain why this change is necessary..."
          rows={3}
          required
        />
      </div>

      {/* Impact */}
      <div className="space-y-2">
        <Label htmlFor="impact">Impact Level</Label>
        <Select value={impact} onValueChange={(value) => setImpact(value as ChangeRequest["impact"])}>
          <SelectTrigger id="impact">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(impactLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Approval Flow Indicator */}
      <div
        className={cn(
          "rounded-lg border-2 p-4",
          approvalFlow.autoApply
            ? "border-success/20 bg-success/5"
            : "border-warning/20 bg-warning/5"
        )}
      >
        <div className="flex items-start gap-3">
          {approvalFlow.autoApply ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-warning" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-text-base">Approval Flow</p>
            <p className="mt-1 text-sm text-text-muted">{approvalFlow.message}</p>
            {!approvalFlow.autoApply && (
              <p className="mt-2 text-xs text-text-muted">
                Estimated approval time: {approvalFlow.approvers === 1 ? "1-2 days" : approvalFlow.approvers === 2 ? "3-5 days" : "5-10 days"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={!isValid} className="flex-1">
          <Send className="mr-2 h-4 w-4" />
          {approvalFlow.autoApply ? "Submit & Auto-Apply" : "Submit Request"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

