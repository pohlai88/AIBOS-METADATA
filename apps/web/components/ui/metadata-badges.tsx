/**
 * Metadata Badge Components
 * 
 * Domain-specific badges using Tailwind v4 design tokens from globals.css
 * All colors defined as --color-* CSS variables (OKLCH format)
 * 
 * Usage:
 *   <MetadataBadge domain="glossary" />
 *   <TierBadge tier={1} />
 *   <FinanceBadge type="revenue" />
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Base badge styles using CVA (shadcn pattern)
const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Metadata Domain Badge
 */
interface MetadataBadgeProps extends VariantProps<typeof badgeVariants> {
  domain: 'glossary' | 'lineage' | 'quality' | 'governance' | 'tags' | 'kpi';
  label?: string;
  className?: string;
}

export function MetadataBadge({ 
  domain, 
  label,
  variant = 'outline',
  className 
}: MetadataBadgeProps) {
  const domainLabels = {
    glossary: 'Glossary',
    lineage: 'Lineage',
    quality: 'Data Quality',
    governance: 'Governance',
    tags: 'Tags',
    kpi: 'KPI',
  };
  
  // Using Tailwind v4 arbitrary values with CSS variables
  const domainStyles = {
    glossary: 'bg-metadata-glossary/10 text-metadata-glossary border-metadata-glossary/20',
    lineage: 'bg-metadata-lineage/10 text-metadata-lineage border-metadata-lineage/20',
    quality: 'bg-metadata-quality/10 text-metadata-quality border-metadata-quality/20',
    governance: 'bg-metadata-governance/10 text-metadata-governance border-metadata-governance/20',
    tags: 'bg-metadata-tags/10 text-metadata-tags border-metadata-tags/20',
    kpi: 'bg-metadata-kpi/10 text-metadata-kpi border-metadata-kpi/20',
  };
  
  return (
    <span 
      className={cn(
        badgeVariants({ variant }),
        domainStyles[domain],
        className
      )}
    >
      {label || domainLabels[domain]}
    </span>
  );
}

/**
 * Governance Tier Badge
 */
interface TierBadgeProps extends VariantProps<typeof badgeVariants> {
  tier: 1 | 2 | 3 | 4 | 'tier1' | 'tier2' | 'tier3' | 'tier4';
  label?: string;
  className?: string;
}

export function TierBadge({ 
  tier, 
  label,
  variant = 'outline',
  className 
}: TierBadgeProps) {
  // Normalize tier to number
  const tierNum = (typeof tier === 'string' ? parseInt(tier.replace('tier', '')) : tier) as 1 | 2 | 3 | 4;
  
  const tierLabels = {
    1: 'Tier 1 - Critical',
    2: 'Tier 2 - Important',
    3: 'Tier 3 - Standard',
    4: 'Tier 4 - Low Priority',
  };
  
  const tierStyles = {
    1: 'bg-tier-1/10 text-tier-1 border-tier-1/20',
    2: 'bg-tier-2/10 text-tier-2 border-tier-2/20',
    3: 'bg-tier-3/10 text-tier-3 border-tier-3/20',
    4: 'bg-tier-4/10 text-tier-4 border-tier-4/20',
  };
  
  return (
    <span 
      className={cn(
        badgeVariants({ variant }),
        tierStyles[tierNum],
        className
      )}
    >
      {label || tierLabels[tierNum]}
    </span>
  );
}

/**
 * Finance Domain Badge
 */
interface FinanceBadgeProps extends VariantProps<typeof badgeVariants> {
  type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  label?: string;
  className?: string;
}

export function FinanceBadge({ 
  type, 
  label,
  variant = 'outline',
  className 
}: FinanceBadgeProps) {
  const financeLabels = {
    revenue: 'Revenue',
    expense: 'Expense',
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
  };
  
  const financeStyles = {
    revenue: 'bg-finance-revenue/10 text-finance-revenue border-finance-revenue/20',
    expense: 'bg-finance-expense/10 text-finance-expense border-finance-expense/20',
    asset: 'bg-finance-asset/10 text-finance-asset border-finance-asset/20',
    liability: 'bg-finance-liability/10 text-finance-liability border-finance-liability/20',
    equity: 'bg-finance-equity/10 text-finance-equity border-finance-equity/20',
  };
  
  return (
    <span 
      className={cn(
        badgeVariants({ variant }),
        financeStyles[type],
        className
      )}
    >
      {label || financeLabels[type]}
    </span>
  );
}

