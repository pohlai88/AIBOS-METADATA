"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";

/**
 * Floating Theme Toggle Button
 *
 * A fixed-position toggle button that cycles through light/dark/system themes.
 * Always visible in the bottom-right corner.
 * 
 * Uses mounted state to prevent hydration mismatch - the icon and theme-dependent
 * content only renders after the component has mounted on the client.
 */
export function FloatingThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Only render theme-dependent content after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const icons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  // Use a consistent icon for SSR, then swap to the correct one after mount
  const Icon = mounted ? (icons[theme] || Monitor) : Monitor;
  const displayTheme = mounted ? theme : "system";
  const displayResolvedTheme = mounted ? resolvedTheme : "dark";

  return (
    <button
      onClick={cycleTheme}
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 rounded-full border border-border bg-bg shadow-floating px-4 py-3 text-sm font-medium transition-all duration-fast ease-standard hover:shadow-overlay hover:scale-105 active:scale-95"
      aria-label={`Toggle theme (current: ${displayTheme})`}
      title={`Theme: ${displayTheme} (${displayResolvedTheme})`}
    >
      {/* Icon */}
      <Icon className="w-5 h-5 text-primary transition-transform group-hover:rotate-12" />

      {/* Label (hidden on mobile) */}
      <span className="hidden sm:inline capitalize text-fg">
        {displayTheme}
      </span>

      {/* Status Indicator */}
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            displayResolvedTheme === "dark" ? "bg-primary" : "bg-warning"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            displayResolvedTheme === "dark" ? "bg-primary" : "bg-warning"
          }`}
        />
      </span>
    </button>
  );
}
