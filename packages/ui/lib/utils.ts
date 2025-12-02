/**
 * Class Name Utility (cn)
 * 
 * A utility function to merge Tailwind CSS classes intelligently.
 * Resolves class conflicts and handles conditional classes cleanly.
 * 
 * Examples:
 *   cn('p-4', 'p-6')  // → 'p-6' (conflict resolved)
 *   cn('text-base', isLarge && 'text-lg')  // → 'text-lg' (conditional)
 *   cn('bg-primary', className)  // → merges with external className
 * 
 * Used by all UI components to allow className overrides.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine Tailwind CSS classes with intelligent conflict resolution.
 * 
 * @param inputs - Class names, conditional objects, or arrays of classes
 * @returns A single, optimized class string
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-4 py-2', 'text-white')  // → 'px-4 py-2 text-white'
 * 
 * // Conflict resolution
 * cn('p-4', 'p-6')  // → 'p-6' (last value wins)
 * 
 * // Conditional classes
 * cn('bg-primary', isActive && 'bg-primary-hover')
 * 
 * // With external className prop
 * cn('default-class', props.className)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

