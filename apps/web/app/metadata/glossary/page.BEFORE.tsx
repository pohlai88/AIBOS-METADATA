/**
 * BEFORE: Business Glossary UI (No Design System)
 *
 * ❌ PROBLEMS:
 * - Hardcoded colors (text-gray-600, bg-white, text-blue-600)
 * - Arbitrary spacing (p-8, gap-4, mt-8)
 * - No typography scale (text-3xl, text-xl random)
 * - No elevation tokens (shadow-sm arbitrary)
 * - No semantic meaning
 * - Dark mode won't work
 * - Junior dev picks colors by "vibes"
 */

import {
  ControlledVocabulary,
  APPROVED_FINANCE_TERMS,
  APPROVED_HR_TERMS,
  APPROVED_OPERATIONS_TERMS,
} from "@aibos/types";

export default function GlossaryPage() {
  const stats = {
    totalTerms: ControlledVocabulary.metadata.totalApprovedTerms,
    finance: Object.keys(APPROVED_FINANCE_TERMS).length,
    hr: Object.keys(APPROVED_HR_TERMS).length,
    operations: Object.keys(APPROVED_OPERATIONS_TERMS).length,
  };

  return (
    // ❌ Arbitrary padding (p-8)
    <div className="p-8">
      {/* ❌ Arbitrary spacing (mb-8) */}
      {/* ❌ Random text sizes (text-3xl) */}
      {/* ❌ Hardcoded colors (text-gray-600) */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Business Glossary</h2>
        <p className="mt-2 text-gray-600">
          Controlled vocabulary - Only approved terms can be used in code
        </p>
      </div>

      {/* ❌ Arbitrary grid (grid-cols-4 gap-4) */}
      {/* ❌ Hardcoded bg (bg-white) */}
      {/* ❌ Arbitrary shadow (shadow-sm) */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalTerms}
          </div>
          <div className="mt-1 text-sm text-gray-600">Total Approved Terms</div>
        </div>
        {/* ... more cards with random colors ... */}
      </div>

      {/* ❌ More hardcoded colors and arbitrary spacing */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-blue-600">
          Finance Domain (IFRS/MFRS)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* ... */}
        </div>
      </div>
    </div>
  );
}

// TOTAL VIOLATIONS:
// - 15+ hardcoded colors
// - 10+ arbitrary spacing values
// - 8+ arbitrary text sizes
// - No design system compliance
// - No dark mode support
// - Junior dev nightmare!

