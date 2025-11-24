// packages/ui/src/components/navigation-menu.tsx
"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import {
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from "../design/tokens";

export interface NavigationMenuProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {}

export const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  NavigationMenuProps
>(({ className, children, ...props }, ref) => {
  return (
    <NavigationMenuPrimitive.Root
      ref={ref}
      className={`relative z-10 flex max-w-max flex-1 items-center justify-center ${className ?? ""}`}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Viewport className="absolute left-0 top-full flex justify-center" />
    </NavigationMenuPrimitive.Root>
  );
});

NavigationMenu.displayName = "NavigationMenu";

export interface NavigationMenuListProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List> {}

export const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  NavigationMenuListProps
>(({ className, ...props }, ref) => {
  return (
    <NavigationMenuPrimitive.List
      ref={ref}
      className={`group flex flex-1 list-none items-center justify-center space-x-1 ${className ?? ""}`}
      {...props}
    />
  );
});

NavigationMenuList.displayName = "NavigationMenuList";

export interface NavigationMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item> {}

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

NavigationMenuItem.displayName = "NavigationMenuItem";

export interface NavigationMenuTriggerProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger> {}

export const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  NavigationMenuTriggerProps
>(({ className, children, ...props }, ref) => {
  return (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      className={[
        "group inline-flex h-10 w-max items-center justify-center",
        spacingTokens.md,
        typographyTokens.bodySm,
        "font-medium transition-colors hover:bg-bg-muted hover:text-fg focus:bg-bg-muted focus:text-fg focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-bg-muted data-[state=open]:bg-bg-muted",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {children}
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      >
        <path
          d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89247 4.93179 6.06821C5.10753 6.24395 5.39247 6.24395 5.56821 6.06821L7.5 4.13643L9.43179 6.06821C9.60753 6.24395 9.89247 6.24395 10.0682 6.06821C10.2439 5.89247 10.2439 5.60753 10.0682 5.43179L7.81821 3.18179C7.73379 3.09736 7.61933 3.04999 7.5 3.04999C7.38067 3.04999 7.26621 3.09736 7.18179 3.18179L4.93179 5.43179Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
    </NavigationMenuPrimitive.Trigger>
  );
});

NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export interface NavigationMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content> {}

export const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  NavigationMenuContentProps
>(({ className, ...props }, ref) => {
  return (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={[
        "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

NavigationMenuContent.displayName = "NavigationMenuContent";

export interface NavigationMenuLinkProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link> {}

export const NavigationMenuLink = NavigationMenuPrimitive.Link;

NavigationMenuLink.displayName = "NavigationMenuLink";

export interface NavigationMenuViewportProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport> {}

export const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  NavigationMenuViewportProps
>(({ className, ...props }, ref) => {
  return (
    <div className="absolute left-0 top-full flex justify-center">
      <NavigationMenuPrimitive.Viewport
        ref={ref}
        className={[
          "relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full origin-top overflow-hidden",
          colorTokens.bgElevated,
          "border",
          colorTokens.border,
          radiusTokens.lg,
          "shadow-lg",
          "transition-[width,_height] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
          className ?? "",
        ].join(" ")}
        {...props}
      />
    </div>
  );
});

NavigationMenuViewport.displayName = "NavigationMenuViewport";

