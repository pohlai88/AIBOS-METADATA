/**
 * AI Suggestion Card - Phase 2
 *
 * Displays AI-generated suggestions for metadata improvements.
 * Supports: mapping suggestions, quality warnings, compliance gaps.
 *
 * Design Philosophy: "Quiet AI" - suggestions, not chatbots
 */

"use client";

import { cn } from "@aibos/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AISuggestion {
  id: string;
  type: "mapping" | "quality" | "compliance" | "optimization";
  severity: "info" | "warning" | "error";
  title: string;
  description: string;
  confidence?: number;
  suggestedAction?: string;
  impact?: string;
  createdAt?: string;
  agentName?: string;
}

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  className?: string;
}

const typeConfig = {
  mapping: {
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    label: "Mapping Suggestion",
  },
  quality: {
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    label: "Quality Warning",
  },
  compliance: {
    icon: Shield,
    color: "text-danger",
    bgColor: "bg-danger/10",
    borderColor: "border-danger/20",
    label: "Compliance Gap",
  },
  optimization: {
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    label: "Optimization",
  },
};

export function AISuggestionCard({
  suggestion,
  onAccept,
  onReject,
  onViewDetails,
  className,
}: AISuggestionCardProps) {
  const config = typeConfig[suggestion.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group rounded-lg border-2 bg-bg-base p-4 transition-all hover:shadow-md",
        config.borderColor,
        className
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <div className={cn("rounded-lg p-2", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-medium", config.color)}>
              {config.label}
            </span>
            {suggestion.confidence && suggestion.confidence >= 90 && (
              <Badge variant="outline" className="text-[10px]">
                {suggestion.confidence}% confidence
              </Badge>
            )}
          </div>
          <h4 className="text-sm font-semibold text-text-base">
            {suggestion.title}
          </h4>
        </div>
      </div>

      {/* Description */}
      <p className="mb-3 text-sm text-text-muted leading-relaxed">
        {suggestion.description}
      </p>

      {/* Suggested Action */}
      {suggestion.suggestedAction && (
        <div className="mb-3 rounded-md border border-border-base bg-bg-subtle px-3 py-2">
          <div className="flex items-center gap-2 text-xs">
            <ArrowRight className="h-3 w-3 text-primary" />
            <span className="font-medium text-text-base">Suggested:</span>
            <span className="text-text-muted">{suggestion.suggestedAction}</span>
          </div>
        </div>
      )}

      {/* Impact */}
      {suggestion.impact && (
        <p className="mb-3 text-xs text-text-muted">
          <span className="font-medium">Impact:</span> {suggestion.impact}
        </p>
      )}

      {/* Metadata */}
      <div className="mb-3 flex items-center gap-3 text-xs text-text-muted">
        {suggestion.agentName && (
          <span>By {suggestion.agentName}</span>
        )}
        {suggestion.createdAt && (
          <span>{suggestion.createdAt}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onAccept && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onAccept(suggestion.id)}
            className="flex-1"
          >
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            Accept
          </Button>
        )}
        {onReject && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject(suggestion.id)}
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Reject
          </Button>
        )}
        {onViewDetails && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(suggestion.id)}
          >
            Details
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * AI Suggestions List
 */
export function AISuggestionsList({
  suggestions,
  onAccept,
  onReject,
  onViewDetails,
  emptyMessage = "No suggestions at the moment",
}: {
  suggestions: AISuggestion[];
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  emptyMessage?: string;
}) {
  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="h-12 w-12 text-success mb-3" />
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion) => (
        <AISuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onAccept={onAccept}
          onReject={onReject}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}

