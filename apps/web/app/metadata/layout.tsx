/**
 * Metadata Studio UI Layout
 *
 * OpenMetadata-inspired UI for business metadata management
 * Compatible with OpenMetadata schema v1.4.0
 */

import { SDK_VERSION } from "@aibos/metadata-studio";

export default function MetadataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Metadata Studio</h1>
            <p className="text-sm text-gray-600">
              Central Nervous System for Business Terminology
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* SDK Version Indicator */}
            <div className="rounded-md bg-blue-50 px-3 py-1.5">
              <span className="text-xs font-medium text-blue-700">
                SDK v{SDK_VERSION.full}
              </span>
            </div>

            {/* OpenMetadata Compatible Badge */}
            <div className="rounded-md bg-green-50 px-3 py-1.5">
              <span className="text-xs font-medium text-green-700">
                OpenMetadata Compatible
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-gray-50 px-6 py-3">
        <ul className="flex gap-6 text-sm font-medium">
          <li>
            <a
              href="/metadata/glossary"
              className="text-gray-700 hover:text-gray-900"
            >
              Glossary
            </a>
          </li>
          <li>
            <a
              href="/metadata/lineage"
              className="text-gray-700 hover:text-gray-900"
            >
              Lineage
            </a>
          </li>
          <li>
            <a
              href="/metadata/quality"
              className="text-gray-700 hover:text-gray-900"
            >
              Data Quality
            </a>
          </li>
          <li>
            <a
              href="/metadata/governance"
              className="text-gray-700 hover:text-gray-900"
            >
              Governance
            </a>
          </li>
          <li>
            <a
              href="/metadata/sdk"
              className="text-gray-700 hover:text-gray-900"
            >
              SDK Documentation
            </a>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-3">
        <p className="text-xs text-gray-500">
          Powered by AIBOS Metadata Studio • Following OpenMetadata Standards
        </p>
      </footer>
    </div>
  );
}
