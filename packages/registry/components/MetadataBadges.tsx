/**
 * Metadata Badge Component (Registry Template)
 * 
 * Displays metadata domain badges using controlled vocabulary for colors.
 * Uses CSS variables from globals.css for consistency.
 * 
 * Usage:
 *   <MetadataBadge domain="glossary" />
 *   <MetadataBadge domain="lineage" label="Data Lineage" />
 */

import { cn } from '@aibos/ui/utils/cn';

interface MetadataBadgeProps {
  domain: 'glossary' | 'lineage' | 'quality' | 'governance' | 'tags' | 'kpi';
  label?: string;
  className?: string;
}

export function MetadataBadge({ 
  domain, 
  label,
  className = '' 
}: MetadataBadgeProps) {
  // Map domains to their display names
  const domainLabels = {
    glossary: 'Glossary',
    lineage: 'Lineage',
    quality: 'Data Quality',
    governance: 'Governance',
    tags: 'Tags',
    kpi: 'KPI',
  };
  
  // Use CSS variables from globals.css (Controlled Vocabulary for Styling!)
  const domainStyles = {
    glossary: 'bg-[rgb(var(--color-metadata-glossary)/0.1)] text-[rgb(var(--color-metadata-glossary))] border-[rgb(var(--color-metadata-glossary)/0.2)]',
    lineage: 'bg-[rgb(var(--color-metadata-lineage)/0.1)] text-[rgb(var(--color-metadata-lineage))] border-[rgb(var(--color-metadata-lineage)/0.2)]',
    quality: 'bg-[rgb(var(--color-metadata-quality)/0.1)] text-[rgb(var(--color-metadata-quality))] border-[rgb(var(--color-metadata-quality)/0.2)]',
    governance: 'bg-[rgb(var(--color-metadata-governance)/0.1)] text-[rgb(var(--color-metadata-governance))] border-[rgb(var(--color-metadata-governance)/0.2)]',
    tags: 'bg-[rgb(var(--color-metadata-tags)/0.1)] text-[rgb(var(--color-metadata-tags))] border-[rgb(var(--color-metadata-tags)/0.2)]',
    kpi: 'bg-[rgb(var(--color-metadata-kpi)/0.1)] text-[rgb(var(--color-metadata-kpi))] border-[rgb(var(--color-metadata-kpi)/0.2)]',
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md border',
        domainStyles[domain],
        className
      )}
    >
      {label || domainLabels[domain]}
    </span>
  );
}

/**
 * Tier Badge Component
 * 
 * Displays governance tier badges (Tier 1, 2, 3, 4)
 */
interface TierBadgeProps {
  tier: 1 | 2 | 3 | 4;
  label?: string;
  className?: string;
}

export function TierBadge({ 
  tier, 
  label,
  className = '' 
}: TierBadgeProps) {
  const tierLabels = {
    1: 'Tier 1 - Critical',
    2: 'Tier 2 - Important',
    3: 'Tier 3 - Standard',
    4: 'Tier 4 - Low Priority',
  };
  
  const tierStyles = {
    1: 'bg-[rgb(var(--color-tier-1)/0.1)] text-[rgb(var(--color-tier-1))] border-[rgb(var(--color-tier-1)/0.2)]',
    2: 'bg-[rgb(var(--color-tier-2)/0.1)] text-[rgb(var(--color-tier-2))] border-[rgb(var(--color-tier-2)/0.2)]',
    3: 'bg-[rgb(var(--color-tier-3)/0.1)] text-[rgb(var(--color-tier-3))] border-[rgb(var(--color-tier-3)/0.2)]',
    4: 'bg-[rgb(var(--color-tier-4)/0.1)] text-[rgb(var(--color-tier-4))] border-[rgb(var(--color-tier-4)/0.2)]',
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md border',
        tierStyles[tier],
        className
      )}
    >
      {label || tierLabels[tier]}
    </span>
  );
}

/**
 * Finance Badge Component
 * 
 * Displays finance domain badges (Revenue, Expense, Asset, etc.)
 */
interface FinanceBadgeProps {
  type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  label?: string;
  className?: string;
}

export function FinanceBadge({ 
  type, 
  label,
  className = '' 
}: FinanceBadgeProps) {
  const financeLabels = {
    revenue: 'Revenue',
    expense: 'Expense',
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
  };
  
  const financeStyles = {
    revenue: 'bg-[rgb(var(--color-finance-revenue)/0.1)] text-[rgb(var(--color-finance-revenue))] border-[rgb(var(--color-finance-revenue)/0.2)]',
    expense: 'bg-[rgb(var(--color-finance-expense)/0.1)] text-[rgb(var(--color-finance-expense))] border-[rgb(var(--color-finance-expense)/0.2)]',
    asset: 'bg-[rgb(var(--color-finance-asset)/0.1)] text-[rgb(var(--color-finance-asset))] border-[rgb(var(--color-finance-asset)/0.2)]',
    liability: 'bg-[rgb(var(--color-finance-liability)/0.1)] text-[rgb(var(--color-finance-liability))] border-[rgb(var(--color-finance-liability)/0.2)]',
    equity: 'bg-[rgb(var(--color-finance-equity)/0.1)] text-[rgb(var(--color-finance-equity))] border-[rgb(var(--color-finance-equity)/0.2)]',
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md border',
        financeStyles[type],
        className
      )}
    >
      {label || financeLabels[type]}
    </span>
  );
}

