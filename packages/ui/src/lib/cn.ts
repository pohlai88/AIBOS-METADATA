// packages/ui/src/lib/cn.ts
// Class name combiner utility using clsx and tailwind-merge
// TypeScript-safe, MCP-ready

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names into a single string using clsx and tailwind-merge.
 * Filters out falsy values and intelligently merges Tailwind classes.
 *
 * @example
 * cn("px-2 py-1", "px-4") // Returns: "py-1 px-4" (px-2 is overridden)
 * cn("base", condition && "conditional", className)
 * // Returns: "base conditional <className>" or "base <className>"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

