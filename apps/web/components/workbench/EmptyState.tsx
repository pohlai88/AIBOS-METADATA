/**
 * Empty State - Steve Jobs Inspired Design
 *
 * Beautiful, aspirational empty states that inspire action.
 * No placeholders - each empty state is a complete, polished experience.
 *
 * Philosophy: "Design is not just what it looks like. Design is how it works." - Steve Jobs
 */

import { cn } from "@aibos/ui";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  /**
   * Icon representing the feature (Lucide icon component)
   */
  icon: LucideIcon;

  /**
   * Primary heading
   */
  title: string;

  /**
   * Descriptive subtitle
   */
  description: string;

  /**
   * Optional action button
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };

  /**
   * Optional secondary text or tips
   */
  tip?: ReactNode;

  /**
   * Custom className
   */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tip,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      {/* Icon with subtle animation */}
      <div className="mb-6 rounded-full bg-primary/5 p-6 transition-transform hover:scale-105">
        <Icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-semibold text-text-base">
        {title}
      </h3>

      {/* Description */}
      <p className="mb-6 max-w-md text-sm text-text-muted leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          size="lg"
          className="mb-4"
        >
          {action.label}
        </Button>
      )}

      {/* Tip */}
      {tip && (
        <div className="mt-6 rounded-lg border border-border-base bg-bg-subtle px-4 py-3 text-xs text-text-muted">
          {tip}
        </div>
      )}
    </div>
  );
}

/**
 * Lineage Empty State
 */
export function LineageEmptyState({ fieldName }: { fieldName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 space-y-2">
        {/* Visual lineage representation */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-lg border-2 border-dashed border-border-base bg-bg-muted" />
          <div className="h-0.5 w-8 bg-border-base" />
          <div className="h-12 w-12 rounded-lg border-2 border-primary bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {fieldName ? fieldName.substring(0, 2).toUpperCase() : "FD"}
            </span>
          </div>
          <div className="h-0.5 w-8 bg-border-base" />
          <div className="h-10 w-10 rounded-lg border-2 border-dashed border-border-base bg-bg-muted" />
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-text-base">
        {fieldName ? `Lineage graph for ${fieldName}` : "No lineage data yet"}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-text-muted">
        Lineage shows how data flows from sources to destinations, helping you
        understand dependencies and impact.
      </p>

      <div className="mt-4 rounded-lg border border-border-base bg-bg-subtle px-4 py-3 text-left">
        <p className="text-xs font-medium text-text-base mb-2">
          What you'll see when lineage is tracked:
        </p>
        <ul className="space-y-1 text-xs text-text-muted">
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Upstream sources (databases, APIs, files)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Transformation jobs (ETL, dbt, Airflow)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Downstream consumers (reports, dashboards, ML models)
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * AI Suggestions Empty State
 */
export function AISuggestionsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <svg
          className="h-12 w-12 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-text-base">
        All clear! No suggestions at the moment
      </h3>
      <p className="mb-4 max-w-sm text-sm text-text-muted">
        Our AI continuously monitors metadata quality, mappings, and compliance.
        When improvements are found, they'll appear here.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 w-full max-w-sm">
        <div className="rounded-lg border border-border-base bg-bg-subtle px-4 py-3 text-left">
          <p className="text-xs font-medium text-text-base mb-1">
            ✨ What AI can suggest:
          </p>
          <ul className="space-y-1 text-xs text-text-muted">
            <li>• Better field mappings (95%+ confidence)</li>
            <li>• Missing metadata (definition, owner)</li>
            <li>• Quality issues (null rates, anomalies)</li>
            <li>• Compliance gaps (PII not tagged)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Compliance Empty State
 */
export function ComplianceEmptyState({ fieldName }: { fieldName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 rounded-full bg-success/10 p-6">
        <svg
          className="h-12 w-12 text-success"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
        </svg>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-text-base">
        {fieldName ? `${fieldName} compliance ready` : "Compliance tracking ready"}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-text-muted">
        This field will be automatically checked against applicable standards
        (MFRS, IFRS, GDPR, PDPA) once standards mapping is configured.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-sm">
        <div className="rounded-lg border border-border-base bg-bg-subtle px-3 py-2 text-left">
          <p className="text-xs font-medium text-text-base mb-1">🛡️ Standards</p>
          <p className="text-xs text-text-muted">MFRS, IFRS, GAAP</p>
        </div>
        <div className="rounded-lg border border-border-base bg-bg-subtle px-3 py-2 text-left">
          <p className="text-xs font-medium text-text-base mb-1">🔒 Privacy</p>
          <p className="text-xs text-text-muted">GDPR, PDPA</p>
        </div>
        <div className="rounded-lg border border-border-base bg-bg-subtle px-3 py-2 text-left">
          <p className="text-xs font-medium text-text-base mb-1">📋 Controls</p>
          <p className="text-xs text-text-muted">SOC2, ISO 27001</p>
        </div>
        <div className="rounded-lg border border-border-base bg-bg-subtle px-3 py-2 text-left">
          <p className="text-xs font-medium text-text-base mb-1">🎯 Industry</p>
          <p className="text-xs text-text-muted">Finance, Tax</p>
        </div>
      </div>
    </div>
  );
}

