// packages/ui/src/components/menubar.tsx
"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import {
  componentTokens,
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from "../design/tokens";

export interface MenubarProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root> {}

export const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  MenubarProps
>(({ className, ...props }, ref) => {
  return (
    <MenubarPrimitive.Root
      ref={ref}
      className={[
        "flex h-10 items-center space-x-1",
        colorTokens.bgElevated,
        "border-b",
        colorTokens.border,
        "p-1",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

Menubar.displayName = "Menubar";

export interface MenubarMenuProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Menu> {}

export const MenubarMenu = ({ ...props }: MenubarMenuProps) => {
  return <MenubarPrimitive.Menu {...props} />;
};

MenubarMenu.displayName = "MenubarMenu";

export interface MenubarTriggerProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger> {}

export const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  MenubarTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <MenubarPrimitive.Trigger
      ref={ref}
      className={[
        "flex items-center",
        spacingTokens.sm,
        radiusTokens.sm,
        typographyTokens.bodySm,
        "font-medium outline-none focus:bg-bg-muted focus:text-fg data-[state=open]:bg-bg-muted",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

MenubarTrigger.displayName = "MenubarTrigger";

export interface MenubarContentProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> {}

export const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  MenubarContentProps
>(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={[
          componentTokens.card,
          "z-50 min-w-[12rem] p-1 shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className ?? "",
        ].join(" ")}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
});

MenubarContent.displayName = "MenubarContent";

export interface MenubarItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> {}

export const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  MenubarItemProps
>(({ className, ...props }, ref) => {
  return (
    <MenubarPrimitive.Item
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

MenubarItem.displayName = "MenubarItem";

