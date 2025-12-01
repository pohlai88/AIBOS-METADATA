/**
 * Business Glossary UI
 *
 * OpenMetadata-style glossary browser
 * Shows all approved terms with their definitions
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
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Business Glossary</h2>
        <p className="mt-2 text-gray-600">
          Controlled vocabulary - Only approved terms can be used in code
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalTerms}
          </div>
          <div className="mt-1 text-sm text-gray-600">Total Approved Terms</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-green-600">
            {stats.finance}
          </div>
          <div className="mt-1 text-sm text-gray-600">Finance Terms</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">{stats.hr}</div>
          <div className="mt-1 text-sm text-gray-600">HR Terms</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-orange-600">
            {stats.operations}
          </div>
          <div className="mt-1 text-sm text-gray-600">Operations Terms</div>
        </div>
      </div>

      {/* Finance Domain */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-blue-600">
          Finance Domain (IFRS/MFRS)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(APPROVED_FINANCE_TERMS).map(([key, value]) => (
            <div
              key={key}
              className="rounded-md border p-4 hover:border-blue-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{key}</h4>
                  <p className="mt-1 text-sm text-gray-500">{value}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  IFRS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HR Domain */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-purple-600">
          HR Domain
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(APPROVED_HR_TERMS).map(([key, value]) => (
            <div
              key={key}
              className="rounded-md border p-4 hover:border-purple-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{key}</h4>
                  <p className="mt-1 text-sm text-gray-500">{value}</p>
                </div>
                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                  HR
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operations Domain */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-orange-600">
          Operations Domain
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(APPROVED_OPERATIONS_TERMS).map(([key, value]) => (
            <div
              key={key}
              className="rounded-md border p-4 hover:border-orange-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{key}</h4>
                  <p className="mt-1 text-sm text-gray-500">{value}</p>
                </div>
                <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                  Operations
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
