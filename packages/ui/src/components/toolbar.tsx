// packages/ui/src/components/toolbar.tsx
"use client";

import * as React from "react";
import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import {
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from "../design/tokens";

export interface ToolbarProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root> {}

export const Toolbar = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Root>,
  ToolbarProps
>(({ className, ...props }, ref) => {
  return (
    <ToolbarPrimitive.Root
      ref={ref}
      className={[
        "relative flex select-none items-center gap-1",
        colorTokens.bgElevated,
        "min-h-[2.5rem]",
        spacingTokens.sm,
        radiusTokens.md,
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

Toolbar.displayName = "Toolbar";

export interface ToolbarButtonProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button> {}

export const ToolbarButton = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Button>,
  ToolbarButtonProps
>(({ className, ...props }, ref) => {
  return (
    <ToolbarPrimitive.Button
      ref={ref}
      className={[
        "inline-flex items-center justify-center",
        spacingTokens.sm,
        radiusTokens.sm,
        typographyTokens.bodySm,
        "font-medium transition-colors",
        "hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "data-[state=on]:bg-bg-muted",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

ToolbarButton.displayName = "ToolbarButton";

export interface ToolbarSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Separator> {}

export const ToolbarSeparator = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Separator>,
  ToolbarSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <ToolbarPrimitive.Separator
      ref={ref}
      className={[
        "mx-1 h-4 w-px",
        colorTokens.bgMuted,
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

ToolbarSeparator.displayName = "ToolbarSeparator";

export interface ToolbarToggleGroupProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleGroup> {}

export const ToolbarToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.ToggleGroup>,
  ToolbarToggleGroupProps
>(({ className, ...props }, ref) => {
  return (
    <ToolbarPrimitive.ToggleGroup
      ref={ref}
      className={`flex items-center ${className ?? ""}`}
      {...props}
    />
  );
});

ToolbarToggleGroup.displayName = "ToolbarToggleGroup";

export interface ToolbarToggleItemProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleItem> {}

export const ToolbarToggleItem = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.ToggleItem>,
  ToolbarToggleItemProps
>(({ className, ...props }, ref) => {
  return (
    <ToolbarPrimitive.ToggleItem
      ref={ref}
      className={[
        "inline-flex items-center justify-center",
        spacingTokens.sm,
        radiusTokens.sm,
        typographyTokens.bodySm,
        "font-medium transition-colors",
        "hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "data-[state=on]:bg-bg-muted",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

ToolbarToggleItem.displayName = "ToolbarToggleItem";

