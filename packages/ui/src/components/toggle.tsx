// packages/ui/src/components/toggle.tsx
"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import {
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from "../design/tokens";

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {}

export const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, ...props }, ref) => {
  return (
    <TogglePrimitive.Root
      ref={ref}
      className={`inline-flex items-center justify-center ${spacingTokens.sm} ${radiusTokens.md} ${typographyTokens.bodySm} font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-bg-muted data-[state=on]:text-fg hover:bg-bg-muted ${className ?? ""}`}
      {...props}
    />
  );
});

Toggle.displayName = "Toggle";

