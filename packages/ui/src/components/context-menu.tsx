// packages/ui/src/components/context-menu.tsx
"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import {
  componentTokens,
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from "../design/tokens";

export interface ContextMenuProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root> {}

export const ContextMenu = ({ ...props }: ContextMenuProps) => {
  return <ContextMenuPrimitive.Root {...props} />;
};

ContextMenu.displayName = "ContextMenu";

export interface ContextMenuTriggerProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger> {}

export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

ContextMenuTrigger.displayName = "ContextMenuTrigger";

export interface ContextMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content> {}

export const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  ContextMenuContentProps
>(({ className, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        className={[
          componentTokens.card,
          "z-50 min-w-[8rem] overflow-hidden p-1 shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className ?? "",
        ].join(" ")}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
});

ContextMenuContent.displayName = "ContextMenuContent";

export interface ContextMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> {}

export const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  ContextMenuItemProps
>(({ className, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      className={[
        spacingTokens.sm,
        radiusTokens.sm,
        typographyTokens.bodySm,
        "cursor-pointer outline-none focus:bg-bg-muted focus:text-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

ContextMenuItem.displayName = "ContextMenuItem";

export interface ContextMenuSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator> {}

export const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  ContextMenuSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Separator
      ref={ref}
      className={[
        "-mx-1 my-1 h-px",
        colorTokens.borderSubtle,
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

ContextMenuSeparator.displayName = "ContextMenuSeparator";

