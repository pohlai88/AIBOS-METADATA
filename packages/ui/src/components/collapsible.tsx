// packages/ui/src/components/collapsible.tsx
"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

export interface CollapsibleProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {}

export const Collapsible = ({ ...props }: CollapsibleProps) => {
  return <CollapsiblePrimitive.Root {...props} />;
};

Collapsible.displayName = "Collapsible";

export interface CollapsibleTriggerProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> {}

export const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

CollapsibleTrigger.displayName = "CollapsibleTrigger";

export interface CollapsibleContentProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content> {}

export const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  CollapsibleContentProps
>(({ className, ...props }, ref) => {
  return (
    <CollapsiblePrimitive.Content
      ref={ref}
      className={`overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down ${className ?? ""}`}
      {...props}
    />
  );
});

CollapsibleContent.displayName = "CollapsibleContent";

