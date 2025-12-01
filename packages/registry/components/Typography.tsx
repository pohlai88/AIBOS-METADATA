/**
 * Typography Component (Registry Template)
 *
 * Enforces the AIBOS type scale and visual hierarchy using design tokens.
 * This component ensures consistent typography across all applications.
 *
 * Usage:
 *   <Typography variant="h1">Page Title</Typography>
 *   <Typography variant="body" color="text-muted">Description text</Typography>
 *   <Typography variant="caption" as="span" className="ml-2">Metadata</Typography>
 *
 * Type Scale:
 *   - h1: 3xl (30px) - Page titles
 *   - h2: 2xl (24px) - Section headings
 *   - h3: xl (20px) - Subsection headings
 *   - subtitle: lg (18px) - Subtitles, important text
 *   - body: base (16px) - Default body text
 *   - caption: sm (14px) - Small text, metadata
 */

import { type HTMLAttributes } from "react";
import { cn } from "@aibos/ui/utils/cn";

type TypographyVariant = "h1" | "h2" | "h3" | "subtitle" | "body" | "caption";
type TypographyColor =
  | "text-fg" // Default foreground (was text-base)
  | "text-fg-muted" // Muted foreground
  | "text-fg-subtle" // Subtle foreground
  | "text-primary"
  | "text-success"
  | "text-warning"
  | "text-danger";
type TypographyElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "label";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /**
   * Typography variant (maps to font size tokens)
   */
  variant: TypographyVariant;

  /**
   * Optional color override using design tokens
   * @default 'text-fg'
   */
  color?: TypographyColor;

  /**
   * HTML element to render (for semantic HTML)
   * @default Inferred from variant (h1-h3 render as headings, others as <p>)
   */
  as?: TypographyElement;

  /**
   * Children content
   */
  children: React.ReactNode;

  /**
   * Additional classes (merged intelligently with cn utility)
   */
  className?: string;
}

export function Typography({
  variant,
  color = "text-fg",
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  // Infer semantic HTML element from variant if not specified
  const Component =
    as || (variant.startsWith("h") ? (variant as TypographyElement) : "p");

  // Base classes for all typography
  const baseClasses = "antialiased leading-tight";

  // Variant-specific styles (using design tokens from tailwind.config.ts)
  const variantStyles: Record<TypographyVariant, string> = {
    h1: "text-3xl font-bold tracking-tight",
    h2: "text-2xl font-semibold tracking-tight",
    h3: "text-xl font-medium tracking-tight",
    subtitle: "text-lg font-medium",
    body: "text-base font-normal leading-relaxed",
    caption: "text-sm font-normal text-fg-muted",
  };

  // Color styles (using design tokens)
  const colorClass = color;

  return (
    <Component
      className={cn(baseClasses, variantStyles[variant], colorClass, className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Pre-configured Typography variants for common use cases
 */

export function H1({
  children,
  className,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="h1" className={className} {...props}>
      {children}
    </Typography>
  );
}

export function H2({
  children,
  className,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="h2" className={className} {...props}>
      {children}
    </Typography>
  );
}

export function H3({
  children,
  className,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="h3" className={className} {...props}>
      {children}
    </Typography>
  );
}

export function Subtitle({
  children,
  className,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="subtitle" className={className} {...props}>
      {children}
    </Typography>
  );
}

export function Body({
  children,
  className,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="body" className={className} {...props}>
      {children}
    </Typography>
  );
}

export function Caption({
  children,
  className,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="caption" className={className} {...props}>
      {children}
    </Typography>
  );
}
