// packages/ui/src/components/toggle-group.tsx
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import {
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from "../design/tokens";

export interface ToggleGroupProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> {}

export const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(({ className, ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md ${colorTokens.bgMuted} p-1 ${className ?? ""}`}
      {...props}
    />
  );
});

ToggleGroup.displayName = "ToggleGroup";

export interface ToggleGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> {}

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={`inline-flex items-center justify-center ${spacingTokens.sm} ${radiusTokens.sm} ${typographyTokens.bodySm} font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-bg-elevated data-[state=on]:text-fg data-[state=on]:shadow-xs hover:bg-bg-elevated ${className ?? ""}`}
      {...props}
    />
  );
});

ToggleGroupItem.displayName = "ToggleGroupItem";

