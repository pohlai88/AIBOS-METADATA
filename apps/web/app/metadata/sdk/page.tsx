/**
 * SDK Documentation Page
 *
 * MVP Version - Simplified without controlled vocabulary SDK
 */

// Typography Constitution
import { H2, H3, Body, Caption } from "@/components/Typography";

// Layout Constitution
import { CenteredContent, GridLayout } from "@/components/Layouts";

// SDK Version (hardcoded for MVP)
const SDK_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  full: "1.0.0",
  compatible: "^1.0.0",
};

const OPENMETADATA_SCHEMA_VERSION = "1.4.0";

export default function SDKPage() {
  return (
    <CenteredContent maxWidth="2xl" padding={8}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <H2>Metadata SDK</H2>
          <Body color="text-fg-muted">
            Versioned SDK for consistent business terminology across all
            applications
          </Body>
        </div>

        {/* SDK Info Card - Hero Banner */}
        <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white shadow-xl">
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
              <div className="text-5xl font-bold">
                v{OPENMETADATA_SCHEMA_VERSION}
              </div>
              <a
                href="https://open-metadata.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-white/80 hover:text-white transition-colors"
              >
                Learn more →
              </a>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <GridLayout cols={3}>
          <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="text-3xl font-bold text-indigo-600">15+</div>
            <Caption>Core Concepts</Caption>
          </div>
          <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="text-3xl font-bold text-green-600">3</div>
            <Caption>Business Domains</Caption>
          </div>
          <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="text-3xl font-bold text-amber-600">
              {SDK_VERSION.major}
            </div>
            <Caption>Major Version</Caption>
          </div>
        </GridLayout>

        {/* Installation Section */}
        <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6 space-y-4">
          <H3>Installation</H3>

          <div className="rounded-md bg-slate-100 dark:bg-slate-700 p-4 border border-slate-200 dark:border-slate-600 font-mono">
            <code className="text-sm text-green-600 dark:text-green-400">
              pnpm add @aibos/metadata-studio@{SDK_VERSION.compatible}
            </code>
          </div>

          <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4">
            <Body className="text-amber-800 dark:text-amber-200">
              ⚠️ Make sure to use compatible version ({SDK_VERSION.compatible})
              to avoid deployment mismatches!
            </Body>
          </div>
        </div>

        {/* Usage Example Section */}
        <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6 space-y-4">
          <H3>Usage Example</H3>

          <div className="rounded-md bg-slate-100 dark:bg-slate-700 p-4 border border-slate-200 dark:border-slate-600 overflow-x-auto">
            <pre className="text-sm text-slate-700 dark:text-slate-300 font-mono">
              {`import { 
  GlossaryTermSchema,
  type GlossaryTerm,
} from "@aibos/metadata-studio/schemas";

// 1. Validate incoming data
const term = GlossaryTermSchema.parse(data);

// 2. Type-safe access
const key: string = term.term;
const definition: string = term.definition;`}
            </pre>
          </div>
        </div>

        {/* API Reference Section */}
        <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6 space-y-6">
          <H3>Available Types</H3>

          <div className="space-y-4">
            {[
              {
                name: "MetadataConcept",
                description: "Canonical business concept with governance tier",
              },
              {
                name: "AliasRecord",
                description:
                  "Context-aware alias mapping to canonical concepts",
              },
              {
                name: "NamingVariant",
                description:
                  "Technical naming variants (camelCase, snake_case, etc.)",
              },
              {
                name: "StandardPack",
                description: "Standard pack groupings (IFRS, MFRS, etc.)",
              },
            ].map((type, idx) => (
              <div
                key={idx}
                className="rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 p-4 space-y-2
                          transition-all hover:border-indigo-400 hover:shadow-md"
              >
                <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {type.name}
                </code>
                <Caption>{type.description}</Caption>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CenteredContent>
  );
}
