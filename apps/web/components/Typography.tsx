/**
 * Typography Components - Temporary compatibility wrapper
 * 
 * This provides backward compatibility with old imports.
 * Maps to the new Typography component.
 */

import { Typography } from "@/components/ui/typography";
import type { ReactNode } from "react";

export function H2({ children, className }: { children: ReactNode; className?: string }) {
  return <Typography variant="h2" className={className}>{children}</Typography>;
}

export function H3({ children, className }: { children: ReactNode; className?: string }) {
  return <Typography variant="h3" className={className}>{children}</Typography>;
}

export function Body({ children, color, className }: { children: ReactNode; color?: string; className?: string }) {
  return <Typography variant="body" className={`${color} ${className}`}>{children}</Typography>;
}

export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <Typography variant="caption" className={className}>{children}</Typography>;
}

