// packages/ui/src/components/separator.tsx
"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import {
  colorTokens,
} from "../design/tokens";

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {}

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={[
        "shrink-0",
        colorTokens.border,
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});

Separator.displayName = "Separator";

