/**
 * Contextual Sidebar - Silent Killer Frontend Pattern
 *
 * Right sidebar that displays context-specific information:
 * - Definition (business meaning, technical details)
 * - Owner (data steward, approval history)
 * - Quality (profile score, thresholds)
 * - Lineage (upstream/downstream dependencies)
 * - AI (suggestions, warnings, guided flows)
 * - Compliance (standards mapping, controls)
 *
 * Updated dynamically when user clicks on a row/column/field.
 * Never causes navigation away from the main canvas.
 *
 * @see UI-IMPLEMENTATION-PLAN.md Phase 1: Foundation Screens
 */

"use client";

import { cn } from "@aibos/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReactNode } from "react";

export interface SidebarTab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  badge?: string | number;
}

interface ContextualSidebarProps {
  /**
   * Array of tabs to display
   */
  tabs: SidebarTab[];

  /**
   * Default active tab ID
   */
  defaultTab?: string;

  /**
   * Header content (e.g., entity name, close button)
   */
  header?: ReactNode;

  /**
   * Custom className
   */
  className?: string;
}

export function ContextualSidebar({
  tabs,
  defaultTab,
  header,
  className,
}: ContextualSidebarProps) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Sidebar Header */}
      {header && (
        <div className="flex-none border-b border-border-base px-4 py-3">
          {header}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={defaultTab || tabs[0]?.id} className="flex flex-1 flex-col">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-3 gap-1 bg-bg-muted p-1">
          {tabs.slice(0, 6).map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative text-xs data-[state=active]:bg-bg-base data-[state=active]:text-text-base"
            >
              {tab.icon && <span className="mr-1">{tab.icon}</span>}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content with Scroll */}
        <div className="flex-1 overflow-hidden">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="h-full data-[state=inactive]:hidden"
            >
              <ScrollArea className="h-full">
                <div className="p-4">{tab.content}</div>
              </ScrollArea>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

