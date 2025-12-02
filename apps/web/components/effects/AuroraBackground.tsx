"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Aurora Background Effect
 * 
 * Inspired by Aceternity UI's Aurora Background component.
 * Creates a subtle, animated gradient effect perfect for auth pages.
 * 
 * Features:
 * - Smooth gradient animations
 * - Dark-mode optimized using OKLCH colors
 * - Respects prefers-reduced-motion
 * - GPU-accelerated transforms
 * 
 * @see https://ui.aceternity.com/components/aurora-background
 */

interface AuroraBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  /** Show aurora animation (default: true) */
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <main className={cn("relative min-h-screen", className)}>
      {/* Aurora Effect Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Primary Aurora - Blue/Cyan */}
        <div
          className={cn(
            "pointer-events-none absolute -inset-[10px]",
            "[--aurora-color-1:oklch(0.62_0.25_250_/_0.15)]",
            "[--aurora-color-2:oklch(0.65_0.20_200_/_0.10)]",
            "[--aurora-color-3:oklch(0.58_0.18_280_/_0.08)]",
            "motion-safe:animate-aurora"
          )}
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 50% -20%, var(--aurora-color-1), transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 50%, var(--aurora-color-2), transparent 50%),
              radial-gradient(ellipse 50% 30% at 20% 60%, var(--aurora-color-3), transparent 50%)
            `,
            backgroundSize: "200% 200%",
          }}
        />

        {/* Secondary Aurora - Green/Teal accent */}
        <div
          className={cn(
            "pointer-events-none absolute -inset-[10px] opacity-60",
            "[--aurora-accent-1:oklch(0.65_0.18_150_/_0.12)]",
            "[--aurora-accent-2:oklch(0.60_0.15_170_/_0.08)]",
            "motion-safe:animate-aurora-reverse"
          )}
          style={{
            backgroundImage: `
              radial-gradient(ellipse 40% 30% at 70% 80%, var(--aurora-accent-1), transparent 50%),
              radial-gradient(ellipse 50% 40% at 30% 20%, var(--aurora-accent-2), transparent 50%)
            `,
            backgroundSize: "200% 200%",
          }}
        />

        {/* Noise texture overlay for depth */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Radial gradient overlay to soften edges */}
        {showRadialGradient && (
          <div 
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 70%)",
            }}
          />
        )}
      </div>

      {/* Content */}
      {children}
    </main>
  );
}

/**
 * Floating Orbs - Alternative simpler effect
 * For use when aurora is too heavy
 */
export function FloatingOrbs({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 -z-10 overflow-hidden", className)}>
      {/* Large primary orb */}
      <div 
        className={cn(
          "absolute h-[500px] w-[500px] rounded-full blur-[100px]",
          "bg-primary-500/10",
          "top-[-10%] left-[-10%]",
          "motion-safe:animate-float"
        )}
      />
      
      {/* Medium success orb */}
      <div 
        className={cn(
          "absolute h-[400px] w-[400px] rounded-full blur-[80px]",
          "bg-success/8",
          "bottom-[-5%] right-[-5%]",
          "motion-safe:animate-float-delayed"
        )}
      />
      
      {/* Small accent orb */}
      <div 
        className={cn(
          "absolute h-[300px] w-[300px] rounded-full blur-[60px]",
          "bg-info/6",
          "top-[40%] right-[20%]",
          "motion-safe:animate-float-slow"
        )}
      />
    </div>
  );
}

