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

import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@aibos/ui/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  // Use design tokens from globals.css
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary',
    secondary: 'bg-bg-muted text-text-base border border-border-base hover:bg-bg-subtle',
    danger: 'bg-danger text-white hover:opacity-90 focus-visible:ring-danger',
    success: 'bg-success text-white hover:opacity-90 focus-visible:ring-success',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

