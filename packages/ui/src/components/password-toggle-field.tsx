// packages/ui/src/components/password-toggle-field.tsx
"use client";

import * as React from "react";
import * as PasswordToggleFieldPrimitive from "@radix-ui/react-password-toggle-field";
import {
  componentTokens,
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from "../design/tokens";

export interface PasswordToggleFieldProps
  extends React.ComponentPropsWithoutRef<
    typeof PasswordToggleFieldPrimitive.Root
  > {}

export const PasswordToggleField = React.forwardRef<
  React.ElementRef<typeof PasswordToggleFieldPrimitive.Root>,
  PasswordToggleFieldProps
>(({ className, ...props }, ref) => {
  return (
    <PasswordToggleFieldPrimitive.Root
      ref={ref}
      className={[className ?? ""].filter(Boolean).join(" ")}
      {...props}
    />
  );
});

PasswordToggleField.displayName = "PasswordToggleField";

export interface PasswordToggleFieldInputProps
  extends React.ComponentPropsWithoutRef<
    typeof PasswordToggleFieldPrimitive.Input
  > {}

export const PasswordToggleFieldInput = React.forwardRef<
  React.ElementRef<typeof PasswordToggleFieldPrimitive.Input>,
  PasswordToggleFieldInputProps
>(({ className, ...props }, ref) => {
  return (
    <PasswordToggleFieldPrimitive.Input
      ref={ref}
      className={[
        "flex h-10 w-full rounded-md border",
        colorTokens.bg,
        colorTokens.border,
        colorTokens.fg,
        typographyTokens.bodySm,
        spacingTokens.px3,
        "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});

PasswordToggleFieldInput.displayName = "PasswordToggleFieldInput";

export interface PasswordToggleFieldToggleProps
  extends React.ComponentPropsWithoutRef<
    typeof PasswordToggleFieldPrimitive.Toggle
  > {}

export const PasswordToggleFieldToggle = React.forwardRef<
  React.ElementRef<typeof PasswordToggleFieldPrimitive.Toggle>,
  PasswordToggleFieldToggleProps
>(({ className, ...props }, ref) => {
  return (
    <PasswordToggleFieldPrimitive.Toggle
      ref={ref}
      className={[
        "inline-flex items-center justify-center rounded-md",
        colorTokens.bg,
        colorTokens.fg,
        typographyTokens.bodySm,
        spacingTokens.px2,
        spacingTokens.py1,
        "ring-offset-background transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});

PasswordToggleFieldToggle.displayName = "PasswordToggleFieldToggle";

export interface PasswordToggleFieldIconProps
  extends React.ComponentPropsWithoutRef<
    typeof PasswordToggleFieldPrimitive.Icon
  > {}

export const PasswordToggleFieldIcon = React.forwardRef<
  React.ElementRef<typeof PasswordToggleFieldPrimitive.Icon>,
  PasswordToggleFieldIconProps
>(({ className, ...props }, ref) => {
  return (
    <PasswordToggleFieldPrimitive.Icon
      ref={ref}
      className={[className ?? ""].filter(Boolean).join(" ")}
      {...props}
    />
  );
});

PasswordToggleFieldIcon.displayName = "PasswordToggleFieldIcon";

