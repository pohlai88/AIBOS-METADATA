// packages/ui/src/components/tooltip.tsx
"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  componentTokens,
  typographyTokens,
  colorTokens,
  radiusTokens,
} from "../design/tokens";

export interface TooltipProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {}

export const Tooltip = ({ ...props }: TooltipProps) => {
  return <TooltipPrimitive.Root {...props} />;
};

Tooltip.displayName = "Tooltip";

export interface TooltipTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> {}

export const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  TooltipTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      className={className ?? ""}
      {...props}
    />
  );
});

TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {}

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, ...props }, ref) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={[
          "z-50 overflow-hidden rounded-md",
          colorTokens.bgElevated,
          colorTokens.text,
          typographyTokens.bodySm,
          "px-3 py-1.5 shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className ?? "",
        ].join(" ")}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});

TooltipContent.displayName = "TooltipContent";

export interface TooltipProviderProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider> {}

export const TooltipProvider = ({ ...props }: TooltipProviderProps) => {
  return <TooltipPrimitive.Provider {...props} />;
};

TooltipProvider.displayName = "TooltipProvider";

