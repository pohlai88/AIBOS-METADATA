import type { ReactNode } from "react";

/**
 * Auth Layout
 * 
 * Minimal wrapper for auth pages.
 * Each page controls its own layout (Nike-style full pages, card layouts, etc.)
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

