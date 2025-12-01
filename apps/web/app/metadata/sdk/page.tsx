/**
 * SDK Documentation Page (WITH Design System - 6 Constitutions Applied!)
 *
 * ✅ IMPROVEMENTS from design system:
 * - Typography components (H2, H3, Body, Caption)
 * - Semantic colors (bg-primary, text-fg, finance tokens)
 * - 8-point grid spacing (p-6, gap-6, space-y-4)
 * - Elevation tokens (shadow-raised, shadow-floating)
 * - Layout components (CenteredContent, GridLayout)
 * - Motion tokens (duration-fast hover transitions)
 */

import { SDK_VERSION, SDK_METADATA, OPENMETADATA_SCHEMA_VERSION } from "@aibos/metadata-studio";
import { ControlledVocabulary } from "@aibos/types";

// Typography Constitution
import { H2, H3, Body, Caption } from "@/components/Typography";

// Layout Constitution
import { CenteredContent, GridLayout } from "@/components/Layouts";

export default function SDKPage() {
  return (
    <CenteredContent maxWidth="2xl" padding={8}>
      <div className="space-y-8">
        
        {/* Page Header */}
        <div className="space-y-2">
          <H2>Controlled Vocabulary SDK</H2>
          <Body color="text-fg-muted">
            Versioned SDK for consistent business terminology across all applications
          </Body>
        </div>

        {/* SDK Info Card - Hero Banner */}
        {/* Using semantic primary color gradient */}
        <div className="rounded-lg bg-gradient-to-br from-primary to-primary-hover p-8 text-white shadow-overlay">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <H3 className="text-white">Current Version</H3>
              <div className="text-5xl font-bold">v{SDK_VERSION.full}</div>
              <Caption className="text-white/80">
                Compatible: {SDK_VERSION.compatible}
              </Caption>
            </div>
            <div className="space-y-4">
              <H3 className="text-white">OpenMetadata Compatible</H3>
              <div className="text-5xl font-bold">v{OPENMETADATA_SCHEMA_VERSION}</div>
              <a
                href="https://open-metadata.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-white/80 hover:text-white transition-colors duration-fast"
              >
                Learn more →
              </a>
            </div>
          </div>
        </div>

        {/* Statistics - Using GridLayout */}
        <GridLayout cols={3} gap={6}>
          <div className="rounded-lg bg-bg shadow-raised p-6 transition-all duration-fast hover:shadow-floating hover:scale-[1.02]">
            <div className="text-3xl font-bold text-primary">
              {ControlledVocabulary.metadata.totalApprovedTerms}
            </div>
            <Caption>Approved Terms</Caption>
          </div>
          <div className="rounded-lg bg-bg shadow-raised p-6 transition-all duration-fast hover:shadow-floating hover:scale-[1.02]">
            <div className="text-3xl font-bold text-success">
              {ControlledVocabulary.metadata.domains.length}
            </div>
            <Caption>Business Domains</Caption>
          </div>
          <div className="rounded-lg bg-bg shadow-raised p-6 transition-all duration-fast hover:shadow-floating hover:scale-[1.02]">
            <div className="text-3xl font-bold text-warning">
              {SDK_VERSION.major}
            </div>
            <Caption>Major Version</Caption>
          </div>
        </GridLayout>

        {/* Installation Section */}
        <div className="rounded-lg bg-bg shadow-raised p-6 space-y-4">
          <H3>Installation</H3>
          
          {/* Code block with semantic colors */}
          <div className="rounded-md bg-bg-muted p-4 border border-border font-mono">
            <code className="text-sm text-success">
              pnpm add @aibos/types@{SDK_VERSION.compatible}
            </code>
          </div>
          
          {/* Warning callout with semantic warning color */}
          <div className="rounded-md bg-warning/10 border border-warning/20 p-4">
            <Body className="text-warning">
              ⚠️ Make sure to use compatible version ({SDK_VERSION.compatible}) to avoid deployment mismatches!
            </Body>
          </div>
        </div>

        {/* Usage Example Section */}
        <div className="rounded-lg bg-bg shadow-raised p-6 space-y-4">
          <H3>Usage Example</H3>
          
          <div className="rounded-md bg-bg-muted p-4 border border-border overflow-x-auto">
            <pre className="text-sm text-fg-muted font-mono">
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

        {/* Version Checking Section */}
        <div className="rounded-lg bg-bg shadow-raised p-6 space-y-4">
          <H3>Version Checking</H3>
          
          <Body>
            The SDK automatically checks version compatibility on initialization. 
            Mismatched versions will cause deployment errors.
          </Body>
          
          {/* Info callout */}
          <div className="rounded-md bg-info/10 border border-info/20 p-6 space-y-3">
            <h4 className="font-semibold text-info">Why Version Checking?</h4>
            <ul className="list-disc space-y-2 pl-5">
              <Caption className="text-info/90">Prevents runtime errors from term mismatches</Caption>
              <Caption className="text-info/90">Ensures all apps use same approved terminology</Caption>
              <Caption className="text-info/90">Blocks deployments with incompatible SDKs</Caption>
              <Caption className="text-info/90">Maintains data quality and consistency</Caption>
            </ul>
          </div>
        </div>

        {/* API Reference Section */}
        <div className="rounded-lg bg-bg shadow-raised p-6 space-y-6">
          <H3>API Reference</H3>
          
          <div className="space-y-4">
            {/* Function cards with consistent styling */}
            {[
              {
                name: "initializeControlledVocabularySDK(clientVersion: string)",
                description: "Initialize SDK and check version compatibility. Throws error if versions don't match.",
              },
              {
                name: "isApprovedTerm(term: string): boolean",
                description: "Check if a term is in the approved glossary.",
              },
              {
                name: "validateTerm(term: string): void",
                description: "Validate term and throw error if not approved. Provides suggestions for blocked terms.",
              },
              {
                name: "getSuggestion(blockedTerm: string): string | undefined",
                description: "Get suggested approved term for a blocked/ambiguous term.",
              },
            ].map((func, idx) => (
              <div 
                key={idx}
                className="rounded-md border border-border bg-bg-subtle p-4 space-y-2
                          transition-all duration-fast hover:border-primary hover:shadow-raised"
              >
                <code className="text-sm font-mono text-primary font-semibold">
                  {func.name}
                </code>
                <Caption>{func.description}</Caption>
              </div>
            ))}
          </div>
        </div>

      </div>
    </CenteredContent>
  );
}

