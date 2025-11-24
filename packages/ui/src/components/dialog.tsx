// packages/ui/src/components/dialog.tsx

"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  componentTokens,
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from "../design/tokens";

export interface DialogProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {}

export const Dialog = ({ ...props }: DialogProps) => {
  return <DialogPrimitive.Root {...props} />;
};

Dialog.displayName = "Dialog";

export interface DialogTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {}

export const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  DialogTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Trigger
      ref={ref}
      className={className ?? ""}
      {...props}
    />
  );
});

DialogTrigger.displayName = "DialogTrigger";

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={[
          "fixed inset-0 z-50",
          colorTokens.bgOverlay,
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        ].join(" ")}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={[
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
          colorTokens.bgElevated,
          colorTokens.border,
          spacingTokens.p4,
          radiusTokens.lg,
          "border shadow-lg duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
});

DialogContent.displayName = "DialogContent";

export interface DialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = ({
  className,
  ...props
}: DialogHeaderProps) => {
  return (
    <div
      className={[
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
};

DialogHeader.displayName = "DialogHeader";

export interface DialogFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = ({
  className,
  ...props
}: DialogFooterProps) => {
  return (
    <div
      className={[
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
};

DialogFooter.displayName = "DialogFooter";

export interface DialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {}

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={[
        typographyTokens.headingLg,
        "leading-none tracking-tight",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});

DialogTitle.displayName = "DialogTitle";

export interface DialogDescriptionProps
  extends React.ComponentPropsWithoutRef<
    typeof DialogPrimitive.Description
  > {}

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={[
        typographyTokens.bodySm,
        colorTokens.fgMuted,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});

DialogDescription.displayName = "DialogDescription";

export interface DialogCloseProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> {}

export const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  DialogCloseProps
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Close
      ref={ref}
      className={className ?? ""}
      {...props}
    />
  );
});

DialogClose.displayName = "DialogClose";

export interface DialogOverlayProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {}

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={[
        "fixed inset-0 z-50",
        colorTokens.bgOverlay,
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});

DialogOverlay.displayName = "DialogOverlay";

export interface DialogPortalProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal> {}

export const DialogPortal = ({ ...props }: DialogPortalProps) => {
  return <DialogPrimitive.Portal {...props} />;
};

DialogPortal.displayName = "DialogPortal";

