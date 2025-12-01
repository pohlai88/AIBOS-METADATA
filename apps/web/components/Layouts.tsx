/**
 * Layout Components (Registry Template)
 *
 * Standard layout compositions enforcing the AIBOS Layout Constitution.
 * All layouts follow the 75% rule and use approved spacing tokens.
 *
 * Constitution:
 * - PageShell: Fixed sidebar + main content area
 * - ContentWithSidebar: 75/25 split (3fr/1fr grid)
 * - CenteredContent: Centered container with max-width
 * - FullBleedSection: Full-width background + centered content
 *
 * Usage:
 *   <PageShell>
 *     <ContentWithSidebar main={<>...</>} sidebar={<>...</>} />
 *   </PageShell>
 */

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ============================================ */
/* PAGE SHELL - App-Level Layout              */
/* ============================================ */

interface PageShellProps {
  /**
   * Optional fixed sidebar (left navigation)
   */
  sidebar?: ReactNode;

  /**
   * Main content area
   */
  children: ReactNode;

  /**
   * Additional classes
   */
  className?: string;
}

/**
 * PageShell - App-level layout with optional fixed sidebar
 *
 * Constitution:
 * - Sidebar width: 280px (--layout-sidebar-width)
 * - Main content: Flex-1 with centered container
 * - Responsive: Sidebar hidden on mobile, shown on lg+
 */
export function PageShell({ sidebar, children, className }: PageShellProps) {
  return (
    <div className={cn("flex min-h-screen", className)}>
      {/* Fixed Sidebar (hidden on mobile) */}
      {sidebar && (
        <aside className="hidden lg:block w-sidebar shrink-0 border-r border-border">
          {sidebar}
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>
    </div>
  );
}

/* ============================================ */
/* CONTENT WITH SIDEBAR - 75/25 Split         */
/* ============================================ */

interface ContentWithSidebarProps {
  /**
   * Main content (75% width)
   */
  main: ReactNode;

  /**
   * Sidebar content (25% width)
   */
  sidebar: ReactNode;

  /**
   * Gap between main and sidebar (spacing token)
   * @default 6 (32px)
   */
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

  /**
   * Additional classes
   */
  className?: string;
}

/**
 * ContentWithSidebar - 75/25 split layout (The 75% Rule)
 *
 * Constitution:
 * - Desktop: 3fr (main) + 1fr (sidebar) = 75/25 split
 * - Mobile: Stacked vertically
 * - Gap: 6 (32px) by default
 */
export function ContentWithSidebar({
  main,
  sidebar,
  gap = 6,
  className,
}: ContentWithSidebarProps) {
  return (
    <div
      className={cn(
        "grid gap-6 lg:grid-cols-[3fr,1fr]",
        gap !== 6 && `gap-${gap}`,
        className
      )}
    >
      {/* Main Content (75%) */}
      <section>{main}</section>

      {/* Sidebar (25%) */}
      <aside>{sidebar}</aside>
    </div>
  );
}

/* ============================================ */
/* CENTERED CONTENT - Max-Width Container     */
/* ============================================ */

interface CenteredContentProps {
  /**
   * Content to center
   */
  children: ReactNode;

  /**
   * Max-width constraint
   * @default 'xl' (1280px)
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";

  /**
   * Horizontal padding
   * @default 4 (16px on mobile, 8/32px on lg+)
   */
  padding?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

  /**
   * Additional classes
   */
  className?: string;
}

/**
 * CenteredContent - Centered container with max-width
 *
 * Constitution:
 * - Max-width: xl (1280px) by default
 * - Padding: 4 (16px) on mobile, 8 (48px) on lg+
 * - Always centered
 */
export function CenteredContent({
  children,
  maxWidth = "xl",
  padding = 4,
  className,
}: CenteredContentProps) {
  return (
    <div className="flex justify-center w-full">
      <div
        className={cn(
          "w-full",
          `max-w-${maxWidth}`,
          padding === 4 ? "px-4 lg:px-8" : `px-${padding}`,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================ */
/* FULL BLEED SECTION - Hero Pattern          */
/* ============================================ */

interface FullBleedSectionProps {
  /**
   * Content (will be centered)
   */
  children: ReactNode;

  /**
   * Background color class
   * @default 'bg-bg-subtle'
   */
  background?: string;

  /**
   * Vertical padding
   * @default 12 (96px)
   */
  paddingY?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12;

  /**
   * Max-width for inner content
   * @default 'xl'
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";

  /**
   * Additional classes
   */
  className?: string;
}

/**
 * FullBleedSection - Full-width background + centered content
 *
 * Constitution:
 * - Background: Full viewport width
 * - Inner content: Centered with max-width constraint
 * - Padding: 12 (96px) vertical by default
 */
export function FullBleedSection({
  children,
  background = "bg-bg-subtle",
  paddingY = 12,
  maxWidth = "xl",
  className,
}: FullBleedSectionProps) {
  return (
    <section className={cn("w-full", background, `py-${paddingY}`, className)}>
      <CenteredContent maxWidth={maxWidth}>{children}</CenteredContent>
    </section>
  );
}

/* ============================================ */
/* GRID LAYOUT - Standard Content Grid        */
/* ============================================ */

interface GridLayoutProps {
  /**
   * Grid items
   */
  children: ReactNode;

  /**
   * Number of columns on desktop
   * @default 3
   */
  cols?: 1 | 2 | 3 | 4 | 6;

  /**
   * Gap between items (spacing token)
   * @default 6 (32px)
   */
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

  /**
   * Additional classes
   */
  className?: string;
}

/**
 * GridLayout - Responsive grid for cards, tiles, etc.
 *
 * Constitution:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3 columns (default)
 * - Gap: 6 (32px) by default
 */
export function GridLayout({
  children,
  cols = 3,
  gap = 6,
  className,
}: GridLayoutProps) {
  const colsClass = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    6: "lg:grid-cols-6",
  }[cols];

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2",
        colsClass,
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
}

