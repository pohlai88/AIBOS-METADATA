// packages/ui/src/components/slot.tsx
"use client";

import * as React from "react";
import * as SlotPrimitive from "@radix-ui/react-slot";

export interface SlotProps
  extends React.ComponentPropsWithoutRef<typeof SlotPrimitive.Root> {}

export const Slot = React.forwardRef<
  React.ElementRef<typeof SlotPrimitive.Root>,
  SlotProps
>(({ ...props }, ref) => {
  return <SlotPrimitive.Root ref={ref} {...props} />;
});

Slot.displayName = "Slot";

