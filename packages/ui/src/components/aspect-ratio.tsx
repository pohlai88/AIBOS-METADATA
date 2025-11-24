// packages/ui/src/components/aspect-ratio.tsx
"use client";

import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

export interface AspectRatioProps
  extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {}

export const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>(({ className, ...props }, ref) => {
  return (
    <AspectRatioPrimitive.Root
      ref={ref}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      {...props}
    />
  );
});

AspectRatio.displayName = "AspectRatio";

