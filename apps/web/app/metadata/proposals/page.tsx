/**
 * Metadata Proposals Page - Phase 3
 *
 * Displays pending change requests and approvals.
 * Demonstrates multi-tier governance workflows.
 */

"use client";

import { useState } from "react";
import { WorkbenchLayout } from "@/components/workbench/WorkbenchLayout";
import { ActionHeader } from "@/components/workbench/ActionHeader";
import { ApprovalsList } from "@/components/governance/ApprovalCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, FileText, AlertTriangle, Filter } from "lucide-react";
import {
  SAMPLE_PENDING_APPROVALS,
  getApprovalsForRole,
  getApprovalStats,
} from "@/lib/sample-approvals";

export default function ProposalsPage() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [impactFilter, setImpactFilter] = useState<string>("all");

  const stats = getApprovalStats();

  // Filter approvals
  const filteredApprovals = SAMPLE_PENDING_APPROVALS.filter((approval) => {
    const matchesRole =
      roleFilter === "all" ||
      approval.approvers.some(
        (a) => a.role === roleFilter && a.status === "pending"
      );
    const matchesImpact =
      impactFilter === "all" || approval.impact === impactFilter;
    return matchesRole && matchesImpact;
  });

  const handleApprove = (id: string) => {
    console.log("Approve:", id);
    // In real app: call API to approve
    alert(`Approved proposal ${id}`);
  };

  const handleReject = (id: string) => {
    console.log("Reject:", id);
    // In real app: call API to reject
    alert(`Rejected proposal ${id}`);
  };

  const handleViewDetails = (id: string) => {
    console.log("View details:", id);
    // In real app: navigate to detail page
  };

  return (
    <WorkbenchLayout
      header={
        <ActionHeader
          title={
            <>
              Change Requests & Approvals{" "}
              <Badge variant="outline" className="font-normal">
                {stats.total} pending
              </Badge>
            </>
          }
          filters={
            <>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="data-steward">Data Steward</SelectItem>
                  <SelectItem value="domain-lead">Domain Lead</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={impactFilter} onValueChange={setImpactFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impact Levels</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="low">Low Impact</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
          actions={
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          }
        />
      }
      sidebar={
        <div className="space-y-4 p-4">
          <h3 className="text-sm font-semibold text-text-base">
            Approval Statistics
          </h3>

          {/* My Actions */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-text-base">
                Requires My Action
              </span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {stats.requiresMyAction}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              As Data Steward
            </p>
          </div>

          {/* Total Pending */}
          <div className="rounded-lg border border-border-base bg-bg-subtle p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-text-muted" />
              <span className="text-sm font-medium text-text-base">
                Total Pending
              </span>
            </div>
            <p className="text-2xl font-bold text-text-base">{stats.total}</p>
          </div>

          {/* By Impact */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-text-muted">By Impact</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border border-danger/20 bg-danger/5 px-3 py-2">
                <span className="text-xs text-danger">High</span>
                <Badge variant="outline" className="text-danger">
                  {stats.byImpact.high}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border border-warning/20 bg-warning/5 px-3 py-2">
                <span className="text-xs text-warning">Medium</span>
                <Badge variant="outline" className="text-warning">
                  {stats.byImpact.medium}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border border-success/20 bg-success/5 px-3 py-2">
                <span className="text-xs text-success">Low</span>
                <Badge variant="outline" className="text-success">
                  {stats.byImpact.low}
                </Badge>
              </div>
            </div>
          </div>

          {/* Filter Info */}
          {(roleFilter !== "all" || impactFilter !== "all") && (
            <div className="rounded-lg border border-border-base bg-bg-base p-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-3 w-3 text-text-muted" />
                <span className="text-xs font-medium text-text-muted">
                  Active Filters
                </span>
              </div>
              <div className="space-y-1">
                {roleFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Role: {roleFilter}
                  </Badge>
                )}
                {impactFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Impact: {impactFilter}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRoleFilter("all");
                  setImpactFilter("all");
                }}
                className="mt-2 w-full text-xs"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div className="p-6">
        <ApprovalsList
          approvals={filteredApprovals}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewDetails={handleViewDetails}
          currentUserRole="data-steward"
          emptyMessage={
            roleFilter !== "all" || impactFilter !== "all"
              ? "No approvals match your filters"
              : "No pending approvals at this time"
          }
        />
      </div>
    </WorkbenchLayout>
  );
}
