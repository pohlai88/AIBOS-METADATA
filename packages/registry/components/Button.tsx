/**
 * Button Component (Registry Template)
 *
 * A primary button component using AIBOS design tokens.
 * This component is copied (not imported) into consuming apps.
 *
 * Usage:
 *   <Button variant="primary">Click me</Button>
 *   <Button variant="secondary" size="sm">Small button</Button>
 */

import { type ButtonHTMLAttributes } from "react";
import { cn } from "@aibos/ui/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  // Base classes with Motion Constitution enforcement
  const baseClasses = cn(
    "inline-flex items-center justify-center font-medium rounded-md",
    // MOTION CONSTITUTION: All interactions use approved duration + easing
    "transition-all duration-fast ease-standard",
    // STATE CONSTITUTION: Focus, disabled states defined here
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    // ELEVATION: Buttons get subtle shadow on hover
    "hover:shadow-raised"
  );

  // Variant classes define the State Matrix (variant × state)
  const variantClasses = {
    primary:
      "bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary active:scale-[0.98]",
    secondary:
      "bg-bg-muted text-fg border border-border hover:bg-bg-subtle focus-visible:ring-border active:scale-[0.98]",
    danger:
      "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger active:scale-[0.98]",
    success:
      "bg-success text-white hover:bg-success/90 focus-visible:ring-success active:scale-[0.98]",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
