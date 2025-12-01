/**
 * Business Glossary UI (WITH Design System - 6 Constitutions Applied!)
 *
 * ✅ IMPROVEMENTS from design system:
 * - Semantic colors (bg-bg, text-fg) - auto dark mode
 * - 8-point grid spacing (p-6, gap-6, space-y-6)
 * - Typography components (H2, H3, Body, Caption)
 * - Elevation tokens (shadow-raised, shadow-floating)
 * - Motion tokens (duration-fast for hover)
 * - Layout components (CenteredContent, GridLayout)
 */

import {
  ControlledVocabulary,
  APPROVED_FINANCE_TERMS,
  APPROVED_HR_TERMS,
  APPROVED_OPERATIONS_TERMS,
} from "@aibos/types";

// Typography Constitution (#3)
import { H2, H3, Body, Caption } from "@/components/Typography";

// Layout Constitution (#2)
import { CenteredContent, GridLayout } from "@/components/Layouts";

// Behavior Constitution (#6) - Use Registry components
import { MetadataBadge } from "@/components/MetadataBadges";

export default function GlossaryPage() {
  const stats = {
    totalTerms: ControlledVocabulary.metadata.totalApprovedTerms,
    finance: Object.keys(APPROVED_FINANCE_TERMS).length,
    hr: Object.keys(APPROVED_HR_TERMS).length,
    operations: Object.keys(APPROVED_OPERATIONS_TERMS).length,
  };

  return (
    // Layout Constitution: CenteredContent with max-width
    <CenteredContent maxWidth="2xl" padding={8}>
      {/* Spacing Constitution: space-y-8 (64px) on 8-point grid */}
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          {/* Typography Constitution: H2 component */}
          <H2>Business Glossary</H2>

          {/* Typography Constitution: Body component with semantic color */}
          <Body color="text-fg-muted">
            Controlled vocabulary - Only approved terms can be used in code
          </Body>
        </div>

        {/* Statistics - Using GridLayout component */}
        <GridLayout cols={4} gap={6}>
          {/* Elevation Constitution: shadow-raised */}
          {/* Motion Constitution: duration-fast for transitions */}
          <div className="rounded-lg bg-bg shadow-raised p-6 transition-all duration-fast hover:shadow-floating hover:scale-[1.02]">
            <div className="text-3xl font-bold text-primary">
              {stats.totalTerms}
            </div>
            <Caption>Total Approved Terms</Caption>
          </div>

          <div className="rounded-lg bg-bg shadow-raised p-6 transition-all duration-fast hover:shadow-floating hover:scale-[1.02]">
            <div className="text-3xl font-bold text-finance-revenue">
              {stats.finance}
            </div>
            <Caption>Finance Terms</Caption>
          </div>

          <div className="rounded-lg bg-bg shadow-raised p-6 transition-all duration-fast hover:shadow-floating hover:scale-[1.02]">
            <div className="text-3xl font-bold text-primary">{stats.hr}</div>
            <Caption>HR Terms</Caption>
          </div>

          <div className="rounded-lg bg-bg shadow-raised p-6 transition-all duration-fast hover:shadow-floating hover:scale-[1.02]">
            <div className="text-3xl font-bold text-warning">
              {stats.operations}
            </div>
            <Caption>Operations Terms</Caption>
          </div>
        </GridLayout>

        {/* Finance Domain Section */}
        <div className="rounded-lg bg-bg shadow-raised p-6 space-y-6">
          {/* Section Header with Badge */}
          <div className="flex items-center gap-3">
            <H3>Finance Domain</H3>
            <MetadataBadge domain="glossary" label="IFRS/MFRS" />
          </div>

          {/* Terms Grid using Layout Constitution */}
          <GridLayout cols={2} gap={4}>
            {Object.entries(APPROVED_FINANCE_TERMS).map(([key, value]) => (
              <div
                key={key}
                className="rounded-md border border-border bg-bg-subtle p-4 
                          transition-all duration-fast ease-standard 
                          hover:border-finance-revenue hover:shadow-raised hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="font-medium text-fg">{key}</h4>
                    <Caption>{value}</Caption>
                  </div>

                  {/* Finance Badge using semantic token */}
                  <span className="shrink-0 rounded-full bg-finance-revenue/10 text-finance-revenue px-2 py-1 text-xs font-medium border border-finance-revenue/20">
                    IFRS
                  </span>
                </div>
              </div>
            ))}
          </GridLayout>
        </div>

        {/* HR Domain Section */}
        <div className="rounded-lg bg-bg shadow-raised p-6 space-y-6">
          <div className="flex items-center gap-3">
            <H3>HR Domain</H3>
            <MetadataBadge domain="tags" label="HR" />
          </div>

          <GridLayout cols={2} gap={4}>
            {Object.entries(APPROVED_HR_TERMS).map(([key, value]) => (
              <div
                key={key}
                className="rounded-md border border-border bg-bg-subtle p-4 
                          transition-all duration-fast ease-standard 
                          hover:border-primary hover:shadow-raised hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="font-medium text-fg">{key}</h4>
                    <Caption>{value}</Caption>
                  </div>

                  <span className="shrink-0 rounded-full bg-primary/10 text-primary px-2 py-1 text-xs font-medium border border-primary/20">
                    HR
                  </span>
                </div>
              </div>
            ))}
          </GridLayout>
        </div>

        {/* Operations Domain Section */}
        <div className="rounded-lg bg-bg shadow-raised p-6 space-y-6">
          <div className="flex items-center gap-3">
            <H3>Operations Domain</H3>
            <MetadataBadge domain="quality" label="Operations" />
          </div>

          <GridLayout cols={2} gap={4}>
            {Object.entries(APPROVED_OPERATIONS_TERMS).map(([key, value]) => (
              <div
                key={key}
                className="rounded-md border border-border bg-bg-subtle p-4 
                          transition-all duration-fast ease-standard 
                          hover:border-warning hover:shadow-raised hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="font-medium text-fg">{key}</h4>
                    <Caption>{value}</Caption>
                  </div>

                  <span className="shrink-0 rounded-full bg-warning/10 text-warning px-2 py-1 text-xs font-medium border border-warning/20">
                    Operations
                  </span>
                </div>
              </div>
            ))}
          </GridLayout>
        </div>
      </div>
    </CenteredContent>
  );
}
