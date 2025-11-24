// packages/ui/src/components/visually-hidden.tsx
"use client";

import * as React from "react";
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";

export interface VisuallyHiddenProps
  extends React.ComponentPropsWithoutRef<typeof VisuallyHiddenPrimitive.Root> {}

export const VisuallyHidden = React.forwardRef<
  React.ElementRef<typeof VisuallyHiddenPrimitive.Root>,
  VisuallyHiddenProps
>(({ className, ...props }, ref) => {
  return (
    <VisuallyHiddenPrimitive.Root
      ref={ref}
      className={className ?? ""}
      {...props}
    />
  );
});

VisuallyHidden.displayName = "VisuallyHidden";

