/**
 * Lineage Mini Graph - Phase 2
 *
 * Lightweight, beautiful lineage visualization using SVG.
 * Shows field-level data lineage: sources → field → destinations
 *
 * Design Philosophy: "Simplicity is the ultimate sophistication." - Leonardo da Vinci
 */

"use client";

import { cn } from "@aibos/ui";
import { Database, Workflow, BarChart3, FileCode2, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface LineageNode {
  id: string;
  label: string;
  type: "source" | "transform" | "current" | "destination";
  nodeType: "database" | "table" | "etl" | "api" | "report" | "dashboard";
  status?: "active" | "deprecated" | "planned";
}

export interface LineageEdge {
  from: string;
  to: string;
  type: "read" | "write" | "transform";
  frequency?: "realtime" | "hourly" | "daily" | "batch";
}

interface LineageMiniGraphProps {
  /**
   * Lineage nodes to display
   */
  nodes: LineageNode[];

  /**
   * Edges connecting nodes
   */
  edges: LineageEdge[];

  /**
   * Highlighted node ID (usually the current field)
   */
  currentNodeId?: string;

  /**
   * Max nodes to display before showing "View Full Graph"
   */
  maxNodes?: number;

  /**
   * Callback when "View Full Graph" is clicked
   */
  onViewFull?: () => void;

  /**
   * Custom className
   */
  className?: string;
}

const nodeIcons: Record<string, LucideIcon> = {
  database: Database,
  table: Database,
  etl: Workflow,
  api: FileCode2,
  report: BarChart3,
  dashboard: BarChart3,
};

const nodeColors = {
  source: "border-primary/30 bg-primary/5 text-primary",
  transform: "border-warning/30 bg-warning/5 text-warning",
  current: "border-primary bg-primary/10 text-primary",
  destination: "border-success/30 bg-success/5 text-success",
};

export function LineageMiniGraph({
  nodes,
  edges,
  currentNodeId,
  maxNodes = 7,
  onViewFull,
  className,
}: LineageMiniGraphProps) {
  const displayNodes = nodes.slice(0, maxNodes);
  const hasMore = nodes.length > maxNodes;

  // Group nodes by type for vertical layout
  const sources = displayNodes.filter((n) => n.type === "source");
  const transforms = displayNodes.filter((n) => n.type === "transform");
  const current = displayNodes.find((n) => n.type === "current");
  const destinations = displayNodes.filter((n) => n.type === "destination");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upstream (Sources) */}
      {sources.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-muted">Upstream Sources</p>
          <div className="space-y-2">
            {sources.map((node) => (
              <LineageNodeCard
                key={node.id}
                node={node}
                isCurrent={node.id === currentNodeId}
                hasConnection
                direction="down"
              />
            ))}
          </div>
        </div>
      )}

      {/* Transforms (ETL/Jobs) */}
      {transforms.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-muted">Transformations</p>
          <div className="space-y-2">
            {transforms.map((node) => (
              <LineageNodeCard
                key={node.id}
                node={node}
                isCurrent={node.id === currentNodeId}
                hasConnection
                direction="down"
              />
            ))}
          </div>
        </div>
      )}

      {/* Current Field */}
      {current && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-muted">Current Field</p>
          <LineageNodeCard
            node={current}
            isCurrent
            hasConnection={destinations.length > 0}
            direction="down"
          />
        </div>
      )}

      {/* Downstream (Destinations) */}
      {destinations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-muted">Downstream Consumers</p>
          <div className="space-y-2">
            {destinations.map((node, idx) => (
              <LineageNodeCard
                key={node.id}
                node={node}
                isCurrent={node.id === currentNodeId}
                hasConnection={idx < destinations.length - 1}
                direction="down"
              />
            ))}
          </div>
        </div>
      )}

      {/* View Full Graph Button */}
      {(hasMore || onViewFull) && (
        <button
          onClick={onViewFull}
          className="w-full rounded-lg border border-dashed border-border-base bg-bg-subtle px-4 py-3 text-sm text-text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
        >
          <div className="flex items-center justify-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>View Full Lineage Graph</span>
            {hasMore && (
              <span className="rounded-full bg-bg-muted px-2 py-0.5 text-xs">
                +{nodes.length - maxNodes} more
              </span>
            )}
          </div>
        </button>
      )}

      {/* Lineage Stats */}
      {nodes.length > 0 && (
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-border-base bg-bg-subtle px-3 py-2 text-center">
          <div>
            <p className="text-xs text-text-muted">Sources</p>
            <p className="text-sm font-semibold text-text-base">{sources.length}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Transforms</p>
            <p className="text-sm font-semibold text-text-base">{transforms.length}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Consumers</p>
            <p className="text-sm font-semibold text-text-base">{destinations.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Lineage Node Card
 */
function LineageNodeCard({
  node,
  isCurrent,
  hasConnection,
  direction,
}: {
  node: LineageNode;
  isCurrent?: boolean;
  hasConnection?: boolean;
  direction?: "down" | "right";
}) {
  const Icon = nodeIcons[node.nodeType] || Database;
  const colorClass = nodeColors[node.type];

  return (
    <div className="relative">
      {/* Node Card */}
      <div
        className={cn(
          "rounded-lg border-2 px-3 py-2 transition-all hover:scale-[1.02] hover:shadow-md",
          colorClass,
          isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-bg-base"
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{node.label}</p>
            <p className="text-xs opacity-70 capitalize">{node.nodeType}</p>
          </div>
          {node.status && (
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                node.status === "active" && "bg-success",
                node.status === "deprecated" && "bg-danger",
                node.status === "planned" && "bg-warning"
              )}
            />
          )}
        </div>
      </div>

      {/* Connection Line */}
      {hasConnection && (
        <div className="flex items-center justify-center py-1">
          <ChevronRight className="h-4 w-4 rotate-90 text-border-base" />
        </div>
      )}
    </div>
  );
}

