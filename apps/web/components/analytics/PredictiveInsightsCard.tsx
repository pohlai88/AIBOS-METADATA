/**
 * PredictiveInsightsCard - Phase 4
 *
 * AI-powered predictions about metadata that needs attention.
 * "The system that knows what you need before you ask."
 */

"use client";

import { cn } from "@aibos/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  ArrowRight,
} from "lucide-react";

export interface PredictiveInsight {
  id: string;
  type: "quality-decline" | "missing-lineage" | "outdated-definition" | "governance-gap" | "usage-spike";
  title: string;
  description: string;
  confidence: number; // 0-100
  priority: "high" | "medium" | "low";
  affectedFields: string[];
  predictedImpact: string;
  suggestedAction: string;
  timeframe: string; // e.g., "Within 7 days"
  historicalPattern?: string;
}

interface PredictiveInsightsCardProps {
  insights: PredictiveInsight[];
  onViewDetails?: (id: string) => void;
  onTakeAction?: (id: string) => void;
  className?: string;
}

const typeConfig = {
  "quality-decline": {
    icon: TrendingUp,
    label: "Quality Decline Predicted",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
  },
  "missing-lineage": {
    icon: AlertTriangle,
    label: "Lineage Gap Detected",
    color: "text-danger",
    bgColor: "bg-danger/10",
    borderColor: "border-danger/20",
  },
  "outdated-definition": {
    icon: Clock,
    label: "Definition Likely Outdated",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
  },
  "governance-gap": {
    icon: Target,
    label: "Governance Gap",
    color: "text-danger",
    bgColor: "bg-danger/10",
    borderColor: "border-danger/20",
  },
  "usage-spike": {
    icon: Zap,
    label: "Unusual Usage Detected",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
};

const priorityConfig = {
  high: { color: "text-danger", bgColor: "bg-danger/10" },
  medium: { color: "text-warning", bgColor: "bg-warning/10" },
  low: { color: "text-success", bgColor: "bg-success/10" },
};

export function PredictiveInsightsCard({
  insights,
  onViewDetails,
  onTakeAction,
  className,
}: PredictiveInsightsCardProps) {
  if (insights.length === 0) {
    return (
      <div className={cn("rounded-lg border border-success/20 bg-success/5 p-6 text-center", className)}>
        <Sparkles className="mx-auto h-12 w-12 text-success mb-3" />
        <h3 className="text-lg font-semibold text-text-base">All Clear!</h3>
        <p className="mt-2 text-sm text-text-muted">
          No predictive insights at the moment. Your metadata is in great shape.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {insights.map((insight) => (
        <InsightCard
          key={insight.id}
          insight={insight}
          onViewDetails={onViewDetails}
          onTakeAction={onTakeAction}
        />
      ))}
    </div>
  );
}

/**
 * Individual Insight Card
 */
function InsightCard({
  insight,
  onViewDetails,
  onTakeAction,
}: {
  insight: PredictiveInsight;
  onViewDetails?: (id: string) => void;
  onTakeAction?: (id: string) => void;
}) {
  const typeConf = typeConfig[insight.type];
  const priorityConf = priorityConfig[insight.priority];
  const TypeIcon = typeConf.icon;

  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-bg-base p-4 transition-all hover:shadow-md",
        typeConf.borderColor
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <div className={cn("rounded-lg p-2", typeConf.bgColor)}>
          <TypeIcon className={cn("h-5 w-5", typeConf.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-medium", typeConf.color)}>
              {typeConf.label}
            </span>
            <Badge
              variant="outline"
              className={cn("text-[10px] capitalize", priorityConf.color)}
            >
              {insight.priority} priority
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {insight.confidence}% confidence
            </Badge>
          </div>
          <h4 className="text-sm font-semibold text-text-base">
            {insight.title}
          </h4>
        </div>
      </div>

      {/* Description */}
      <p className="mb-3 text-sm text-text-muted leading-relaxed">
        {insight.description}
      </p>

      {/* Affected Fields */}
      <div className="mb-3">
        <p className="mb-1 text-xs font-medium text-text-muted">
          Affected Fields:
        </p>
        <div className="flex flex-wrap gap-1">
          {insight.affectedFields.slice(0, 3).map((field, idx) => (
            <Badge key={idx} variant="secondary" className="text-[10px] font-mono">
              {field}
            </Badge>
          ))}
          {insight.affectedFields.length > 3 && (
            <Badge variant="secondary" className="text-[10px]">
              +{insight.affectedFields.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      {/* Impact & Timeframe */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-border-base bg-bg-subtle px-3 py-2">
          <p className="text-xs font-medium text-text-muted mb-1">
            Predicted Impact
          </p>
          <p className="text-xs text-text-base">{insight.predictedImpact}</p>
        </div>
        <div className="rounded-md border border-border-base bg-bg-subtle px-3 py-2">
          <p className="text-xs font-medium text-text-muted mb-1">Timeframe</p>
          <p className="text-xs text-text-base">{insight.timeframe}</p>
        </div>
      </div>

      {/* Suggested Action */}
      <div className="mb-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
        <div className="flex items-start gap-2">
          <ArrowRight className="h-3 w-3 flex-shrink-0 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-primary mb-1">
              Suggested Action:
            </p>
            <p className="text-xs text-text-muted">{insight.suggestedAction}</p>
          </div>
        </div>
      </div>

      {/* Historical Pattern */}
      {insight.historicalPattern && (
        <p className="mb-3 text-xs text-text-muted italic">
          Pattern: {insight.historicalPattern}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onTakeAction && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onTakeAction(insight.id)}
            className="flex-1"
          >
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            Take Action
          </Button>
        )}
        {onViewDetails && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(insight.id)}
          >
            Details
          </Button>
        )}
      </div>
    </div>
  );
}

