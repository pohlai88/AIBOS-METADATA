// packages/ui/src/components/one-time-password-field.tsx
// Radix OneTimePasswordField wrapper using tokens.ts
"use client";

import * as React from "react";
import * as OneTimePasswordFieldPrimitive from "@radix-ui/react-one-time-password-field";
import { componentTokens } from "../design/tokens";

export interface OneTimePasswordFieldProps
  extends React.ComponentPropsWithoutRef<
    typeof OneTimePasswordFieldPrimitive.Root
  > {}

export const OneTimePasswordField = React.forwardRef<
  React.ElementRef<typeof OneTimePasswordFieldPrimitive.Root>,
  OneTimePasswordFieldProps
>(({ className, ...props }, ref) => {
  return (
    <OneTimePasswordFieldPrimitive.Root
      ref={ref}
      className={["flex gap-2", className ?? ""].filter(Boolean).join(" ")}
      {...props}
    />
  );
});

OneTimePasswordField.displayName = "OneTimePasswordField";

export interface OneTimePasswordFieldInputProps
  extends React.ComponentPropsWithoutRef<
    typeof OneTimePasswordFieldPrimitive.Input
  > {}

export const OneTimePasswordFieldInput = React.forwardRef<
  React.ElementRef<typeof OneTimePasswordFieldPrimitive.Input>,
  OneTimePasswordFieldInputProps
>(({ className, ...props }, ref) => {
  return (
    <OneTimePasswordFieldPrimitive.Input
      ref={ref}
      className={[
        componentTokens.input,
        "h-12 w-12 text-center text-lg font-semibold",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});

OneTimePasswordFieldInput.displayName = "OneTimePasswordFieldInput";

export interface OneTimePasswordFieldHiddenInputProps
  extends React.ComponentPropsWithoutRef<
    typeof OneTimePasswordFieldPrimitive.HiddenInput
  > {}

export const OneTimePasswordFieldHiddenInput = React.forwardRef<
  React.ElementRef<typeof OneTimePasswordFieldPrimitive.HiddenInput>,
  OneTimePasswordFieldHiddenInputProps
>(({ ...props }, ref) => {
  return <OneTimePasswordFieldPrimitive.HiddenInput ref={ref} {...props} />;
});

OneTimePasswordFieldHiddenInput.displayName = "OneTimePasswordFieldHiddenInput";
