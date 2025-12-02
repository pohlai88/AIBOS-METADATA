/**
 * FieldImpactAnalysis - Phase 4
 *
 * "What if" analysis: Shows the impact of changing a metadata field.
 * Answers: "What will break if I change this?"
 *
 * Philosophy: "Informed decisions prevent disasters."
 */

"use client";

import { cn } from "@aibos/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Database,
  FileCode,
  BarChart3,
  Users,
  GitBranch,
  Zap,
  Info,
} from "lucide-react";

export interface ImpactArea {
  category: "databases" | "apis" | "reports" | "dashboards" | "users" | "downstream";
  items: {
    name: string;
    type: string;
    riskLevel: "low" | "medium" | "high" | "critical";
    description: string;
  }[];
}

export interface FieldImpactData {
  fieldName: string;
  changeType: string;
  overallRisk: "low" | "medium" | "high" | "critical";
  impactAreas: ImpactArea[];
  affectedUsers: number;
  affectedSystems: number;
  recommendations: string[];
}

interface FieldImpactAnalysisProps {
  data: FieldImpactData;
  onProceed?: () => void;
  onCancel?: () => void;
  className?: string;
}

const riskConfig = {
  low: {
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    label: "Low Risk",
  },
  medium: {
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    label: "Medium Risk",
  },
  high: {
    color: "text-danger",
    bgColor: "bg-danger/10",
    borderColor: "border-danger/20",
    label: "High Risk",
  },
  critical: {
    color: "text-danger",
    bgColor: "bg-danger/10",
    borderColor: "border-danger/30",
    label: "CRITICAL RISK",
  },
};

const categoryIcons = {
  databases: Database,
  apis: FileCode,
  reports: BarChart3,
  dashboards: BarChart3,
  users: Users,
  downstream: GitBranch,
};

export function FieldImpactAnalysis({
  data,
  onProceed,
  onCancel,
  className,
}: FieldImpactAnalysisProps) {
  const riskConf = riskConfig[data.overallRisk];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Risk Assessment */}
      <div
        className={cn(
          "rounded-lg border-2 p-4",
          riskConf.borderColor,
          riskConf.bgColor
        )}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className={cn("h-6 w-6 flex-shrink-0", riskConf.color)} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-text-base">
                Impact Analysis: {data.changeType}
              </h3>
              <Badge
                variant="outline"
                className={cn("font-medium", riskConf.color)}
              >
                {riskConf.label}
              </Badge>
            </div>
            <p className="text-sm font-mono text-text-base">
              Field: {data.fieldName}
            </p>
            <div className="mt-2 flex gap-4 text-xs text-text-muted">
              <span>{data.affectedSystems} systems affected</span>
              <span>•</span>
              <span>{data.affectedUsers} users impacted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Areas */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-text-base">
          Affected Components
        </h4>
        {data.impactAreas.map((area, idx) => (
          <ImpactAreaCard key={idx} area={area} />
        ))}
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-2 mb-2">
            <Info className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
            <h4 className="text-sm font-semibold text-primary">
              Recommendations
            </h4>
          </div>
          <ul className="space-y-2">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="text-primary">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {(onProceed || onCancel) && (
        <div className="flex gap-3">
          {onProceed && (
            <Button
              variant={data.overallRisk === "critical" ? "outline" : "default"}
              onClick={onProceed}
              className="flex-1"
            >
              <Zap className="mr-2 h-4 w-4" />
              {data.overallRisk === "critical"
                ? "Proceed with Caution"
                : "Proceed with Change"}
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Impact Area Card
 */
function ImpactAreaCard({ area }: { area: ImpactArea }) {
  const Icon = categoryIcons[area.category];

  return (
    <div className="rounded-lg border border-border-base bg-bg-base p-3">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-text-muted" />
        <h5 className="text-sm font-medium text-text-base capitalize">
          {area.category}
        </h5>
        <Badge variant="secondary" className="text-xs">
          {area.items.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {area.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 rounded-md border border-border-base bg-bg-subtle px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-text-base">{item.name}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    riskConfig[item.riskLevel].color
                  )}
                >
                  {item.riskLevel}
                </Badge>
              </div>
              <p className="text-xs text-text-muted">{item.type}</p>
              <p className="mt-1 text-xs text-text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

