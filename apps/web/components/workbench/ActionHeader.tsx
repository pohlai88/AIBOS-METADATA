/**
 * Action Header - Silent Killer Frontend Pattern
 *
 * Top action bar that provides:
 * - Contextual filters (domain, module, status)
 * - State indicators (environment, mode, tier)
 * - Primary actions (create, import, export)
 * - Breadcrumb navigation
 *
 * Stays consistent across all workbench screens.
 *
 * @see UI-IMPLEMENTATION-PLAN.md Section 3.1: Metadata Glossary Browser
 */

import { cn } from "@aibos/ui";
import type { ReactNode } from "react";

interface ActionHeaderProps {
  /**
   * Page title or breadcrumb
   */
  title: ReactNode;

  /**
   * Filter components (search, dropdowns, date pickers)
   */
  filters?: ReactNode;

  /**
   * Primary action buttons (create, import, etc.)
   */
  actions?: ReactNode;

  /**
   * State indicators (environment badge, mode toggle)
   */
  indicators?: ReactNode;

  /**
   * Custom className
   */
  className?: string;
}

export function ActionHeader({
  title,
  filters,
  actions,
  indicators,
  className,
}: ActionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 bg-bg-base px-6 py-3",
        className
      )}
    >
      {/* Left: Title/Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-text-base">{title}</h1>
        {indicators && (
          <div className="flex items-center gap-2">{indicators}</div>
        )}
      </div>

      {/* Center: Filters */}
      {filters && (
        <div className="flex flex-1 items-center gap-2 px-4">{filters}</div>
      )}

      {/* Right: Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

