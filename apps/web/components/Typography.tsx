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
 * Type Scale Constitution (~1.25 ratio from 16px base):
 *   - hero: 6xl (60px) - Marketing hero
 *   - display: 5xl (48px) - Display headings
 *   - h1: 3xl (30px) - Page titles
 *   - h2: 2xl (24px) - Section headings
 *   - h3: xl (20px) - Subsection headings
 *   - h4: lg (18px) - Card titles
 *   - h5: base (16px) - Small headings
 *   - h6: sm (14px) - Micro headings
 *   - subtitle: lg (18px) - Subtitles
 *   - body: base (16px) - Default body text
 *   - caption: xs (12px) - Small text, metadata
 */

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle"
  | "body"
  | "caption"
  | "display"
  | "hero";
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

// Infer semantic HTML element from variant if not specified
function getDefaultElement(variant: TypographyVariant): TypographyElement {
  if (variant.startsWith("h")) return variant as TypographyElement;
  if (variant === "hero" || variant === "display") return "h1";
  if (variant === "subtitle") return "p";
  if (variant === "body") return "p";
  if (variant === "caption") return "span";
  return "p";
}

// Variant-specific styles (using design tokens from tailwind.config.ts)
// Type Scale Constitution: ~1.25 ratio from 16px base
const variantStyles: Record<TypographyVariant, string> = {
  // Display & Hero (Marketing)
  hero: "text-6xl font-extrabold tracking-tight", // 60px - Marketing hero
  display: "text-5xl font-bold tracking-tight", // 48px - Hero headings

  // Semantic Headings
  h1: "text-3xl font-bold tracking-tight", // 30px - Page titles
  h2: "text-2xl font-semibold tracking-tight", // 24px - Section headings
  h3: "text-xl font-medium tracking-tight", // 20px - Subsection headings
  h4: "text-lg font-medium tracking-tight", // 18px - Card titles
  h5: "text-base font-medium tracking-tight", // 16px - Small headings
  h6: "text-sm font-medium tracking-tight", // 14px - Micro headings

  // Body Text
  subtitle: "text-lg font-medium leading-relaxed", // 18px - Subtitles
  body: "text-base font-normal leading-relaxed", // 16px - Body text
  caption: "text-xs font-normal text-fg-muted", // 12px - Small text
};

// Base classes for all typography
const baseClasses = "antialiased leading-tight";

export function Typography({
  variant,
  color = "text-fg",
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  const tag = as ?? getDefaultElement(variant);
  const combinedClassName = cn(baseClasses, variantStyles[variant], color, className);

  // Use createElement to avoid dynamic component issues with linter
  // This is semantically identical but avoids the JSX pattern that triggers the lint rule
  switch (tag) {
    case "h1":
      return <h1 className={combinedClassName} {...props}>{children}</h1>;
    case "h2":
      return <h2 className={combinedClassName} {...props}>{children}</h2>;
    case "h3":
      return <h3 className={combinedClassName} {...props}>{children}</h3>;
    case "h4":
      return <h4 className={combinedClassName} {...props}>{children}</h4>;
    case "h5":
      return <h5 className={combinedClassName} {...props}>{children}</h5>;
    case "h6":
      return <h6 className={combinedClassName} {...props}>{children}</h6>;
    case "span":
      return <span className={combinedClassName} {...props}>{children}</span>;
    case "div":
      return <div className={combinedClassName} {...props}>{children}</div>;
    case "label":
      return <label className={combinedClassName} {...props}>{children}</label>;
    case "p":
    default:
      return <p className={combinedClassName} {...props}>{children}</p>;
  }
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

