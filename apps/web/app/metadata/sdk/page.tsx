/**
 * SDK Documentation Page
 * 
 * Shows SDK version, installation instructions, and usage examples
 */

import { SDK_VERSION, SDK_METADATA, OPENMETADATA_SCHEMA_VERSION } from "@aibos/metadata-studio/sdk/version";
import { ControlledVocabulary } from "@aibos/types";

export default function SDKPage() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Controlled Vocabulary SDK</h2>
        <p className="mt-2 text-gray-600">
          Versioned SDK for consistent business terminology across all applications
        </p>
      </div>

      {/* SDK Info Card */}
      <div className="mb-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white shadow-lg">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="mb-4 text-xl font-semibold">Current Version</h3>
            <div className="text-5xl font-bold">v{SDK_VERSION.full}</div>
            <div className="mt-2 text-blue-100">
              Compatible: {SDK_VERSION.compatible}
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-semibold">OpenMetadata Compatible</h3>
            <div className="text-5xl font-bold">v{OPENMETADATA_SCHEMA_VERSION}</div>
            <a
              href="https://open-metadata.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-100 hover:text-white"
            >
              Learn more →
            </a>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900">
            {ControlledVocabulary.metadata.totalApprovedTerms}
          </div>
          <div className="mt-1 text-sm text-gray-600">Approved Terms</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900">
            {ControlledVocabulary.metadata.domains.length}
          </div>
          <div className="mt-1 text-sm text-gray-600">Business Domains</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900">
            {SDK_VERSION.major}
          </div>
          <div className="mt-1 text-sm text-gray-600">Major Version</div>
        </div>
      </div>

      {/* Installation */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">Installation</h3>
        <div className="rounded-md bg-gray-900 p-4">
          <code className="text-sm text-green-400">
            pnpm add @aibos/types@{SDK_VERSION.compatible}
          </code>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          ⚠️ Make sure to use compatible version ({SDK_VERSION.compatible}) to avoid deployment mismatches!
        </p>
      </div>

      {/* Usage Example */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">Usage Example</h3>
        <div className="rounded-md bg-gray-900 p-4">
          <pre className="text-sm text-gray-300">
{`import { 
  APPROVED_FINANCE_TERMS,
  type ApprovedFinanceTerm,
  initializeControlledVocabularySDK 
} from "@aibos/types";

// 1. Initialize SDK with version check
initializeControlledVocabularySDK("${SDK_VERSION.full}");

// 2. Use approved terms only
const accountType: ApprovedFinanceTerm = 
  APPROVED_FINANCE_TERMS.revenue; // ✅ OK

// 3. Unapproved terms cause TypeScript error
const accountType: ApprovedFinanceTerm = 
  "sales"; // ❌ Type Error!`}
          </pre>
        </div>
      </div>

      {/* Version Checking */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">Version Checking</h3>
        <p className="mb-4 text-gray-700">
          The SDK automatically checks version compatibility on initialization. 
          Mismatched versions will cause deployment errors.
        </p>
        <div className="rounded-md bg-yellow-50 p-4">
          <h4 className="mb-2 font-medium text-yellow-900">Why Version Checking?</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-yellow-800">
            <li>Prevents runtime errors from term mismatches</li>
            <li>Ensures all apps use same approved terminology</li>
            <li>Blocks deployments with incompatible SDKs</li>
            <li>Maintains data quality and consistency</li>
          </ul>
        </div>
      </div>

      {/* API Reference */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">API Reference</h3>
        <div className="space-y-4">
          {/* Function 1 */}
          <div className="rounded-md border p-4">
            <code className="text-sm font-mono text-purple-600">
              initializeControlledVocabularySDK(clientVersion: string)
            </code>
            <p className="mt-2 text-sm text-gray-600">
              Initialize SDK and check version compatibility. Throws error if versions don't match.
            </p>
          </div>

          {/* Function 2 */}
          <div className="rounded-md border p-4">
            <code className="text-sm font-mono text-purple-600">
              isApprovedTerm(term: string): boolean
            </code>
            <p className="mt-2 text-sm text-gray-600">
              Check if a term is in the approved glossary.
            </p>
          </div>

          {/* Function 3 */}
          <div className="rounded-md border p-4">
            <code className="text-sm font-mono text-purple-600">
              validateTerm(term: string): void
            </code>
            <p className="mt-2 text-sm text-gray-600">
              Validate term and throw error if not approved. Provides suggestions for blocked terms.
            </p>
          </div>

          {/* Function 4 */}
          <div className="rounded-md border p-4">
            <code className="text-sm font-mono text-purple-600">
              getSuggestion(blockedTerm: string): string | undefined
            </code>
            <p className="mt-2 text-sm text-gray-600">
              Get suggested approved term for a blocked/ambiguous term.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

