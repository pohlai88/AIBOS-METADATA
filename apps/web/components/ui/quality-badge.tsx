/**
 * Quality Score Badge - Silent Killer Frontend Pattern
 *
 * Visual indicator for data quality scores:
 * - Color-coded by threshold (green/yellow/red)
 * - Percentage display
 * - Visual progress indicator
 * - Size variants
 *
 * @see UI-IMPLEMENTATION-PLAN.md Section 2: Core UI Patterns
 */

import { cn } from "@aibos/ui";
import { Badge } from "@/components/ui/badge";

interface QualityScoreBadgeProps {
  /**
   * Quality score (0-100)
   */
  score: number;

  /**
   * Threshold for "good" quality (default: 80)
   */
  threshold?: number;

  /**
   * Size variant
   */
  size?: "xs" | "sm" | "md" | "lg";

  /**
   * Show visual progress indicator
   */
  showProgress?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

export function QualityScoreBadge({
  score,
  threshold = 80,
  size = "sm",
  showProgress = false,
  className,
}: QualityScoreBadgeProps) {
  // Determine color based on score and threshold
  const getColor = () => {
    if (score >= threshold) return "success";
    if (score >= threshold * 0.7) return "warning";
    return "danger";
  };

  const color = getColor();

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const colorClasses = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <Badge
        variant="outline"
        className={cn(
          "font-semibold",
          sizeClasses[size],
          colorClasses[color]
        )}
      >
        {Math.round(score)}%
      </Badge>
      {showProgress && (
        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-bg-muted">
          <div
            className={cn(
              "h-full transition-all duration-300",
              color === "success" && "bg-success",
              color === "warning" && "bg-warning",
              color === "danger" && "bg-danger"
            )}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Quality Score Indicator - Compact dot indicator
 */
export function QualityScoreIndicator({
  score,
  threshold = 80,
  showTooltip = true,
}: {
  score: number;
  threshold?: number;
  showTooltip?: boolean;
}) {
  const getColor = () => {
    if (score >= threshold) return "bg-success";
    if (score >= threshold * 0.7) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div
      className="flex items-center gap-1"
      title={showTooltip ? `Quality: ${Math.round(score)}%` : undefined}
    >
      <div className={cn("h-2 w-2 rounded-full", getColor())} />
      <span className="text-xs text-text-muted">{Math.round(score)}%</span>
    </div>
  );
}

