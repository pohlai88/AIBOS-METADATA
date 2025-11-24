// packages/ui/src/components/slider.tsx
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { colorTokens, radiusTokens } from "../design/tokens";

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={`relative flex w-full touch-none select-none items-center ${className ?? ""}`}
      {...props}
    >
      <SliderPrimitive.Track
        className={`relative h-1.5 w-full grow overflow-hidden ${colorTokens.bgMuted} ${radiusTokens.full}`}
      >
        <SliderPrimitive.Range
          className={`absolute h-full ${colorTokens.primarySurface} ${radiusTokens.full}`}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={`block h-4 w-4 ${radiusTokens.full} border-2 ${colorTokens.border} ${colorTokens.bgElevated} ${colorTokens.ring} ring-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated disabled:pointer-events-none disabled:opacity-50`}
      />
    </SliderPrimitive.Root>
  );
});

Slider.displayName = "Slider";
