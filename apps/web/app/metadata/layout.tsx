/**
 * Metadata Section Layout
 *
 * Shared layout for all metadata-related pages (glossary, proposals, analytics, SDK).
 */

import Link from "next/link";
import type { ReactNode } from "react";

export default function MetadataLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full">
      <aside className="w-48 border-r border-border bg-bg-subtle p-4">
        <nav className="space-y-2">
          <Link
            href="/metadata/glossary"
            className="block text-fg-muted hover:text-fg"
          >
            Glossary
          </Link>
          <Link
            href="/metadata/proposals"
            className="block text-fg-muted hover:text-fg"
          >
            Proposals
          </Link>
          <Link
            href="/metadata/analytics"
            className="block text-fg-muted hover:text-fg"
          >
            Analytics
          </Link>
          <Link
            href="/metadata/sdk"
            className="block text-fg-muted hover:text-fg"
          >
            SDK
          </Link>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
