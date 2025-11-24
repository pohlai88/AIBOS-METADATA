// packages/ui/src/components/switch.tsx
"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import {
  colorTokens,
  radiusTokens,
  accessibilityTokens,
  shadowTokens,
} from "../design/tokens";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {}

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, ...props }, ref) => {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center ${radiusTokens.full} border-2 border-transparent ${colorTokens.bgMuted} transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-bg-muted ${className ?? ""}`}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={`pointer-events-none block h-4 w-4 ${radiusTokens.full} ${colorTokens.bgElevated} ${shadowTokens.sm} ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0`}
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = "Switch";

