// packages/ui/src/components/hover-card.tsx
"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import {
  componentTokens,
  colorTokens,
  radiusTokens,
} from "../design/tokens";

export interface HoverCardProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root> {}

export const HoverCard = ({ ...props }: HoverCardProps) => {
  return <HoverCardPrimitive.Root {...props} />;
};

HoverCard.displayName = "HoverCard";

export interface HoverCardTriggerProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger> {}

export const HoverCardTrigger = HoverCardPrimitive.Trigger;

HoverCardTrigger.displayName = "HoverCardTrigger";

export interface HoverCardContentProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {}

export const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  return (
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={[
        componentTokens.card,
        "z-50 w-64 p-4 shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

HoverCardContent.displayName = "HoverCardContent";

