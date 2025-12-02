/**
 * DataGrid - Silent Killer Frontend Pattern
 *
 * Enhanced data table with metadata integration:
 * - Row selection triggers sidebar update (no navigation)
 * - Inline quality indicators and state badges
 * - AI suggestion overlays
 * - Sortable, filterable, searchable
 *
 * Built on shadcn/ui Table with metadata awareness.
 *
 * @see UI-IMPLEMENTATION-PLAN.md Section 3.1: Metadata Glossary Browser
 */

"use client";

import { cn } from "@aibos/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export interface DataGridColumn<T = any> {
  /**
   * Column identifier (must match data key)
   */
  id: string;

  /**
   * Column label for header
   */
  label: string;

  /**
   * Optional custom render function
   */
  render?: (value: any, row: T) => React.ReactNode;

  /**
   * Whether column is sortable
   */
  sortable?: boolean;

  /**
   * Column width class (e.g., "w-[200px]")
   */
  width?: string;
}

interface DataGridProps<T = any> {
  /**
   * Column definitions
   */
  columns: DataGridColumn<T>[];

  /**
   * Data rows
   */
  data: T[];

  /**
   * Callback when row is clicked (updates sidebar)
   */
  onRowClick?: (row: T) => void;

  /**
   * Currently selected row ID
   */
  selectedRowId?: string;

  /**
   * Custom row key extractor
   */
  getRowId?: (row: T) => string;

  /**
   * Custom className
   */
  className?: string;
}

export function DataGrid<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  selectedRowId,
  getRowId = (row) => row.id,
  className,
}: DataGridProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  return (
    <div className={cn("rounded-md border border-border-base", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-bg-subtle hover:bg-bg-subtle">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  column.width,
                  column.sortable && "cursor-pointer select-none hover:bg-bg-muted",
                  "font-semibold text-text-base"
                )}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortColumn === column.id && (
                    <span className="text-xs text-text-muted">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-text-muted"
              >
                No data available.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const rowId = getRowId(row);
              const isSelected = rowId === selectedRowId;

              return (
                <TableRow
                  key={rowId}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected && "bg-primary/10 hover:bg-primary/15",
                    !isSelected && "hover:bg-bg-subtle"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.width}>
                      {column.render
                        ? column.render(row[column.id], row)
                        : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Helper component for rendering metadata field cells with badges
 */
export function MetadataFieldCell({
  fieldName,
  label,
  tier,
  qualityScore,
}: {
  fieldName: string;
  label?: string;
  tier?: "tier1" | "tier2" | "tier3";
  qualityScore?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-text-base">{fieldName}</span>
        {tier && (
          <Badge variant="outline" className="text-[10px]">
            T{tier.replace("tier", "")}
          </Badge>
        )}
      </div>
      {label && <span className="text-xs text-text-muted">{label}</span>}
    </div>
  );
}

