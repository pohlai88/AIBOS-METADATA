// packages/ui/src/components/toast.tsx
"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import {
  componentTokens,
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
  shadowTokens,
} from "../design/tokens";

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {}

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={[
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden",
        componentTokens.card,
        spacingTokens.md,
        shadowTokens.lg,
        "pr-8",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

Toast.displayName = "Toast";

export interface ToastProviderProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Provider> {}

export const ToastProvider = ({ ...props }: ToastProviderProps) => {
  return <ToastPrimitive.Provider {...props} />;
};

ToastProvider.displayName = "ToastProvider";

export interface ToastViewportProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport> {}

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  ToastViewportProps
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Viewport
      ref={ref}
      className={[
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

ToastViewport.displayName = "ToastViewport";

export interface ToastTitleProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title> {}

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  ToastTitleProps
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Title
      ref={ref}
      className={[typographyTokens.headingSm, className ?? ""].join(" ")}
      {...props}
    />
  );
});

ToastTitle.displayName = "ToastTitle";

export interface ToastDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description> {}

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  ToastDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Description
      ref={ref}
      className={[typographyTokens.bodySm, colorTokens.textMuted, "opacity-90", className ?? ""].join(" ")}
      {...props}
    />
  );
});

ToastDescription.displayName = "ToastDescription";

export interface ToastActionProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action> {}

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  ToastActionProps
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Action
      ref={ref}
      className={[
        componentTokens.buttonGhost,
        "h-8 shrink-0",
        radiusTokens.sm,
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

ToastAction.displayName = "ToastAction";

export interface ToastCloseProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close> {}

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  ToastCloseProps
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Close
      ref={ref}
      className={[
        "absolute right-2 top-2",
        radiusTokens.sm,
        "opacity-0 transition-opacity",
        "hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring",
        "group-[.destructive]:text-fg group-[.destructive]:hover:text-fg group-[.destructive]:focus:ring-danger",
        className ?? "",
      ].join(" ")}
      toast-close=""
      {...props}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
    </ToastPrimitive.Close>
  );
});

ToastClose.displayName = "ToastClose";

