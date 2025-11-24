// packages/ui/src/components/tabs.tsx
// Radix Tabs wrapper using tokens.ts - Generated following MCP system prompt patterns

"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  componentTokens,
  colorTokens,
  accessibilityTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from "../design/tokens";

export interface TabsProps extends TabsPrimitive.TabsProps {}

export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Root
      ref={ref}
      className={`flex flex-col gap-2 ${className ?? ""}`}
      {...props}
    />
  );
});

Tabs.displayName = "Tabs";

export interface TabsListProps extends TabsPrimitive.TabsListProps {}

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={`inline-flex items-center gap-1 border-b ${colorTokens.border} ${className ?? ""}`}
      {...props}
    />
  );
});

TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends TabsPrimitive.TabsTriggerProps {}

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={[
        spacingTokens.sm,
        typographyTokens.bodySm,
        "border-b-2 border-transparent",
        "transition",
        "data-[state=active]:border-primary",
        "data-[state=active]:text-primary-foreground",
        "data-[state=active]:font-medium",
        "hover:text-fg",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-ring",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends TabsPrimitive.TabsContentProps {}

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={[
        componentTokens.card,
        "mt-4",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

TabsContent.displayName = "TabsContent";

