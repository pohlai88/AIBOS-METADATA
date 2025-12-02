/**
 * Workbench Layout - Silent Killer Frontend Pattern
 *
 * The foundational layout for context-of-work UI:
 * - Top: ActionHeader (filters, state, actions)
 * - Left: PrimaryCanvas (data grid, visual editor)
 * - Right: ContextualSidebar (metadata, lineage, AI, compliance)
 *
 * Key Principle: Clicking never navigates away - only refreshes sidebar context.
 *
 * @see UI-IMPLEMENTATION-PLAN.md Section 2: Core UI Patterns
 */

import { cn } from "@aibos/ui";
import type { ReactNode } from "react";

interface WorkbenchLayoutProps {
  /**
   * Top action bar with filters, badges, and actions
   */
  header: ReactNode;

  /**
   * Main content area (data grid, canvas, workflow)
   */
  children: ReactNode;

  /**
   * Right sidebar with contextual information
   */
  sidebar?: ReactNode;

  /**
   * Whether sidebar is open (controlled mode)
   */
  sidebarOpen?: boolean;

  /**
   * Custom className for the main container
   */
  className?: string;
}

export function WorkbenchLayout({
  header,
  children,
  sidebar,
  sidebarOpen = true,
  className,
}: WorkbenchLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-bg-base text-text-base",
        className
      )}
    >
      {/* Action Header */}
      <header className="flex-none border-b border-border-base">
        {header}
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Primary Canvas */}
        <div className="flex-1 overflow-auto">{children}</div>

        {/* Contextual Sidebar */}
        {sidebarOpen && sidebar && (
          <aside className="w-[380px] flex-none border-l border-border-base bg-bg-subtle">
            {sidebar}
          </aside>
        )}
      </main>
    </div>
  );
}

