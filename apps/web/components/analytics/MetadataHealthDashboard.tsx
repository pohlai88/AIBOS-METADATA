/**
 * MetadataHealthDashboard - Phase 4
 *
 * High-level overview of metadata governance health.
 * Shows key metrics, trends, and areas needing attention.
 *
 * Philosophy: "At a glance, I know the state of my metadata universe."
 */

"use client";

import { cn } from "@aibos/ui";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Shield,
  Sparkles,
  Clock,
} from "lucide-react";

export interface HealthMetric {
  label: string;
  value: number;
  total: number;
  percentage: number;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "excellent" | "good" | "warning" | "critical";
}

export interface MetadataHealthData {
  overallHealth: number; // 0-100
  qualityScore: number;
  governanceCoverage: number;
  complianceRate: number;
  datasetsCataloged: HealthMetric;
  fieldsDocumented: HealthMetric;
  lineageMapped: HealthMetric;
  activeStakeholders: number;
  pendingApprovals: number;
  aiSuggestions: number;
  avgTimeToApproval: string;
}

interface MetadataHealthDashboardProps {
  data: MetadataHealthData;
  className?: string;
}

const statusColors = {
  excellent: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
  },
  good: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  critical: {
    bg: "bg-danger/10",
    text: "text-danger",
    border: "border-danger/20",
  },
};

export function MetadataHealthDashboard({
  data,
  className,
}: MetadataHealthDashboardProps) {
  const overallStatus =
    data.overallHealth >= 90
      ? "excellent"
      : data.overallHealth >= 75
        ? "good"
        : data.overallHealth >= 60
          ? "warning"
          : "critical";

  const statusConfig = statusColors[overallStatus];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Health Score */}
      <div
        className={cn(
          "rounded-lg border-2 p-6",
          statusConfig.border,
          statusConfig.bg
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-text-muted">
              Metadata Health Score
            </h3>
            <div className="mt-2 flex items-baseline gap-3">
              <p className={cn("text-4xl font-bold", statusConfig.text)}>
                {data.overallHealth}%
              </p>
              <Badge
                variant="outline"
                className={cn("capitalize", statusConfig.text)}
              >
                {overallStatus}
              </Badge>
            </div>
          </div>
          <div className="h-20 w-20">
            <CircularProgress
              value={data.overallHealth}
              color={statusConfig.text}
            />
          </div>
        </div>
        <Progress
          value={data.overallHealth}
          className="mt-4 h-2"
          indicatorClassName={statusConfig.text.replace("text-", "bg-")}
        />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          icon={CheckCircle}
          label="Quality Score"
          value={`${data.qualityScore}%`}
          status={data.qualityScore >= 90 ? "excellent" : "good"}
        />
        <MetricCard
          icon={Shield}
          label="Governance Coverage"
          value={`${data.governanceCoverage}%`}
          status={data.governanceCoverage >= 80 ? "excellent" : "warning"}
        />
        <MetricCard
          icon={FileText}
          label="Compliance Rate"
          value={`${data.complianceRate}%`}
          status={data.complianceRate >= 95 ? "excellent" : "good"}
        />
      </div>

      {/* Progress Metrics */}
      <div className="space-y-4">
        <ProgressMetric metric={data.datasetsCataloged} />
        <ProgressMetric metric={data.fieldsDocumented} />
        <ProgressMetric metric={data.lineageMapped} />
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border-base bg-bg-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-text-muted" />
            <span className="text-xs font-medium text-text-muted">
              Active Stakeholders
            </span>
          </div>
          <p className="text-2xl font-bold text-text-base">
            {data.activeStakeholders}
          </p>
        </div>

        <div className="rounded-lg border border-border-base bg-bg-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-text-muted" />
            <span className="text-xs font-medium text-text-muted">
              Avg. Time to Approval
            </span>
          </div>
          <p className="text-2xl font-bold text-text-base">
            {data.avgTimeToApproval}
          </p>
        </div>

        <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-medium text-warning">
              Pending Approvals
            </span>
          </div>
          <p className="text-2xl font-bold text-warning">
            {data.pendingApprovals}
          </p>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">
              AI Suggestions
            </span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {data.aiSuggestions}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  status: "excellent" | "good" | "warning" | "critical";
}) {
  const config = statusColors[status];

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        config.border,
        config.bg
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", config.text)} />
        <span className="text-xs font-medium text-text-muted">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold", config.text)}>{value}</p>
    </div>
  );
}

/**
 * Progress Metric Component
 */
function ProgressMetric({ metric }: { metric: HealthMetric }) {
  const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : null;
  const statusConfig = metric.status ? statusColors[metric.status] : statusColors.good;

  return (
    <div className="rounded-lg border border-border-base bg-bg-base p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-text-base">
          {metric.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-base">
            {metric.value} / {metric.total}
          </span>
          {TrendIcon && metric.trendValue && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                metric.trend === "up" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {metric.trendValue}
            </div>
          )}
        </div>
      </div>
      <Progress
        value={metric.percentage}
        className="h-2"
        indicatorClassName={statusConfig.text.replace("text-", "bg-")}
      />
      <p className="mt-1 text-xs text-text-muted">{metric.percentage}% complete</p>
    </div>
  );
}

/**
 * Circular Progress Component
 */
function CircularProgress({ value, color }: { value: number; color: string }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg className="h-full w-full -rotate-90 transform">
      <circle
        cx="40"
        cy="40"
        r={radius}
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        className="text-bg-muted"
      />
      <circle
        cx="40"
        cy="40"
        r={radius}
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={cn("transition-all duration-300", color)}
      />
    </svg>
  );
}

