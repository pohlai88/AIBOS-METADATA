// packages/ui/src/components/avatar.tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import {
  colorTokens,
  radiusTokens,
  typographyTokens,
} from "../design/tokens";

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {}

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, ...props }, ref) => {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden ${radiusTokens.full} ${className ?? ""}`}
      {...props}
    />
  );
});

Avatar.displayName = "Avatar";

export interface AvatarImageProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {}

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={`aspect-square h-full w-full ${className ?? ""}`}
      {...props}
    />
  );
});

AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {}

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, ...props }, ref) => {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={[
        "flex h-full w-full items-center justify-center",
        colorTokens.bgMuted,
        typographyTokens.bodySm,
        "font-medium",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

AvatarFallback.displayName = "AvatarFallback";

