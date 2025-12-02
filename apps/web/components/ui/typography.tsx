/**
 * Typography Component
 *
 * Enforces the AIBOS type scale and visual hierarchy using design tokens.
 * This is a Shared Component (NO 'use client') - works in Server Components.
 *
 * Usage:
 *   <Typography variant="h1">Page Title</Typography>
 *   <Typography variant="body" color="text-muted">Description</Typography>
 *
 * Type Scale (~1.25 ratio from 16px base):
 *   - hero: 6xl (60px) - Marketing hero
 *   - display: 5xl (48px) - Display headings
 *   - h1: 3xl (30px) - Page titles
 *   - h2: 2xl (24px) - Section headings
 *   - h3: xl (20px) - Subsection headings
 *   - h4: lg (18px) - Card titles
 *   - body: base (16px) - Default body text
 *   - caption: xs (12px) - Small text
 */

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'display'
  | 'hero';

type TypographyElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'div'
  | 'label';

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant: TypographyVariant;
  as?: TypographyElement;
  children: React.ReactNode;
  className?: string;
}

// Infer semantic HTML element from variant
function getDefaultElement(variant: TypographyVariant): TypographyElement {
  if (variant.startsWith('h')) return variant as TypographyElement;
  if (variant === 'hero' || variant === 'display') return 'h1';
  if (variant === 'subtitle') return 'p';
  if (variant === 'body') return 'p';
  if (variant === 'caption') return 'span';
  return 'p';
}

// Variant styles using Tailwind v4 tokens
const variantStyles: Record<TypographyVariant, string> = {
  // Display & Hero
  hero: 'text-6xl font-extrabold tracking-tight',
  display: 'text-5xl font-bold tracking-tight',

  // Semantic Headings
  h1: 'text-3xl font-bold tracking-tight',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-xl font-medium tracking-tight',
  h4: 'text-lg font-medium tracking-tight',

  // Body Text
  subtitle: 'text-lg font-medium leading-relaxed',
  body: 'text-base font-normal leading-relaxed',
  caption: 'text-xs font-normal text-muted-foreground',
};

export function Typography({
  variant,
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  const tag = as ?? getDefaultElement(variant);
  const combinedClassName = cn('antialiased', variantStyles[variant], className);

  // Render based on tag
  switch (tag) {
    case 'h1':
      return <h1 className={combinedClassName} {...props}>{children}</h1>;
    case 'h2':
      return <h2 className={combinedClassName} {...props}>{children}</h2>;
    case 'h3':
      return <h3 className={combinedClassName} {...props}>{children}</h3>;
    case 'h4':
      return <h4 className={combinedClassName} {...props}>{children}</h4>;
    case 'h5':
      return <h5 className={combinedClassName} {...props}>{children}</h5>;
    case 'h6':
      return <h6 className={combinedClassName} {...props}>{children}</h6>;
    case 'span':
      return <span className={combinedClassName} {...props}>{children}</span>;
    case 'div':
      return <div className={combinedClassName} {...props}>{children}</div>;
    case 'label':
      return <label className={combinedClassName} {...props}>{children}</label>;
    case 'p':
    default:
      return <p className={combinedClassName} {...props}>{children}</p>;
  }
}

/**
 * Pre-configured Typography shortcuts
 */
export function H1({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h1" className={className} {...props}>{children}</Typography>;
}

export function H2({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h2" className={className} {...props}>{children}</Typography>;
}

export function H3({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h3" className={className} {...props}>{children}</Typography>;
}

export function Body({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body" className={className} {...props}>{children}</Typography>;
}

export function Caption({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="caption" className={className} {...props}>{children}</Typography>;
}

