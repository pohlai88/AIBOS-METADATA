'use client';

/**
 * Agent Proposals Page
 * 
 * GRCD Phase 2: Proposal Review UI
 * 
 * Displays AI-generated proposals for human review and approval.
 */

import { useState, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

interface AgentProposal {
  proposal: {
    id: string;
    agentType: string;
    agentVersion: string;
    confidence: 'high' | 'medium' | 'low';
    confidenceScore?: string;
    reasoning: string;
    riskLevel: string;
    potentialImpact?: string;
    suggestedAction: string;
    createdAt: string;
  };
  approval: {
    id: string;
    entityType: string;
    entityKey?: string;
    tier: string;
    status: string;
    payload: unknown;
    currentState?: unknown;
    requiredRole?: string;
  };
}

interface ProposalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  byAgent: Record<string, number>;
  byConfidence: Record<string, number>;
  feedbackStats: {
    helpful: number;
    notHelpful: number;
    helpfulRate: number;
  };
}

// ============================================================================
// Mock Data (Replace with API calls)
// ============================================================================

const MOCK_PROPOSALS: AgentProposal[] = [
  {
    proposal: {
      id: '1',
      agentType: 'data_quality_sentinel',
      agentVersion: '1.0.0',
      confidence: 'high',
      confidenceScore: '92',
      reasoning: 'Metadata "revenue_core" has no description. Tier 1 metadata requires detailed documentation.',
      riskLevel: 'medium',
      potentialImpact: 'Quality improvement for tier1 metadata',
      suggestedAction: 'flag',
      createdAt: new Date().toISOString(),
    },
    approval: {
      id: 'a1',
      entityType: 'GLOBAL_METADATA',
      entityKey: 'revenue_core',
      tier: 'tier1',
      status: 'pending',
      payload: { issueType: 'missing_description', suggestion: 'Add detailed description' },
      requiredRole: 'metadata_steward',
    },
  },
  {
    proposal: {
      id: '2',
      agentType: 'data_quality_sentinel',
      agentVersion: '1.0.0',
      confidence: 'medium',
      confidenceScore: '75',
      reasoning: 'Metadata "customer_name" has no lineage connections. Tier 2 metadata should have documented data flow.',
      riskLevel: 'low',
      potentialImpact: 'Lineage completeness for tier2 metadata',
      suggestedAction: 'investigate',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    approval: {
      id: 'a2',
      entityType: 'GLOBAL_METADATA',
      entityKey: 'customer_name',
      tier: 'tier2',
      status: 'pending',
      payload: { issueType: 'orphaned_metadata', suggestion: 'Add lineage connections' },
      requiredRole: 'business_admin',
    },
  },
];

const MOCK_STATS: ProposalStats = {
  total: 15,
  pending: 3,
  approved: 10,
  rejected: 2,
  approvalRate: 83,
  byAgent: {
    data_quality_sentinel: 12,
    naming_validator: 3,
  },
  byConfidence: {
    high: 8,
    medium: 5,
    low: 2,
  },
  feedbackStats: {
    helpful: 9,
    notHelpful: 1,
    helpfulRate: 90,
  },
};

// ============================================================================
// Components
// ============================================================================

function ConfidenceBadge({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[confidence]}`}>
      {confidence.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[status] ?? colors.pending}`}>
      {status.toUpperCase()}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    tier1: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    tier2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    tier3: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    tier4: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    tier5: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[tier] ?? colors.tier3}`}>
      {tier.toUpperCase()}
    </span>
  );
}

function StatCard({ label, value, subValue }: { label: string; value: string | number; subValue?: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="text-2xl font-semibold text-zinc-100 mt-1">{value}</div>
      {subValue && <div className="text-xs text-zinc-500 mt-1">{subValue}</div>}
    </div>
  );
}

function ProposalCard({ proposal, onApprove, onReject }: { 
  proposal: AgentProposal; 
  onApprove: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-zinc-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-zinc-300">
                {proposal.approval.entityKey ?? proposal.approval.entityType}
              </span>
              <TierBadge tier={proposal.approval.tier} />
              <ConfidenceBadge confidence={proposal.proposal.confidence} />
              <StatusBadge status={proposal.approval.status} />
            </div>
            <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
              {proposal.proposal.reasoning}
            </p>
          </div>
          <div className="ml-4 text-zinc-500">
            <svg 
              className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
          <span>Agent: {proposal.proposal.agentType}</span>
          <span>Risk: {proposal.proposal.riskLevel}</span>
          <span>Action: {proposal.proposal.suggestedAction}</span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-zinc-800 p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-zinc-300 mb-2">Reasoning</h4>
            <p className="text-sm text-zinc-400">{proposal.proposal.reasoning}</p>
          </div>

          {proposal.proposal.potentialImpact && (
            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-2">Potential Impact</h4>
              <p className="text-sm text-zinc-400">{proposal.proposal.potentialImpact}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-zinc-300 mb-2">Suggested Change</h4>
            <pre className="text-xs bg-zinc-950 p-3 rounded border border-zinc-800 overflow-x-auto">
              {JSON.stringify(proposal.approval.payload, null, 2)}
            </pre>
          </div>

          {proposal.approval.requiredRole && (
            <div className="text-xs text-zinc-500">
              Required approval role: <span className="text-zinc-400">{proposal.approval.requiredRole}</span>
            </div>
          )}

          {/* Actions */}
          {proposal.approval.status === 'pending' && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded transition-colors"
              >
                Approve
              </button>
              <button
                onClick={onReject}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded transition-colors"
              >
                Reject
              </button>
              <button className="px-4 py-2 text-zinc-400 hover:text-zinc-300 text-sm transition-colors">
                Request More Info
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<AgentProposal[]>(MOCK_PROPOSALS);
  const [stats, setStats] = useState<ProposalStats>(MOCK_STATS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const filteredProposals = filter === 'all' 
    ? proposals 
    : proposals.filter(p => p.approval.status === filter);

  const handleApprove = (proposalId: string) => {
    setProposals(prev => prev.map(p => 
      p.proposal.id === proposalId 
        ? { ...p, approval: { ...p.approval, status: 'approved' } }
        : p
    ));
  };

  const handleReject = (proposalId: string) => {
    setProposals(prev => prev.map(p => 
      p.proposal.id === proposalId 
        ? { ...p, approval: { ...p.approval, status: 'rejected' } }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Agent Proposals</h1>
          <p className="text-zinc-400 mt-1">
            Review and approve AI-generated metadata improvement proposals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Proposals" value={stats.total} />
          <StatCard 
            label="Pending Review" 
            value={stats.pending} 
            subValue="Awaiting decision"
          />
          <StatCard 
            label="Approval Rate" 
            value={`${stats.approvalRate}%`} 
            subValue={`${stats.approved} approved`}
          />
          <StatCard 
            label="AI Helpfulness" 
            value={`${stats.feedbackStats.helpfulRate}%`} 
            subValue="Based on feedback"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                filter === tab
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pending' && stats.pending > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No proposals found for this filter
            </div>
          ) : (
            filteredProposals.map(proposal => (
              <ProposalCard
                key={proposal.proposal.id}
                proposal={proposal}
                onApprove={() => handleApprove(proposal.proposal.id)}
                onReject={() => handleReject(proposal.proposal.id)}
              />
            ))
          )}
        </div>

        {/* Run Scan Button */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors">
            Run Data Quality Scan
          </button>
          <p className="text-sm text-zinc-500 mt-2">
            Trigger the DataQualitySentinel agent to scan for metadata quality issues
          </p>
        </div>
      </div>
    </div>
  );
}

