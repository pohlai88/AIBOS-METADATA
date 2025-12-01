"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@aibos/ui";
import { Sun, Moon, Monitor } from "lucide-react";

/**
 * Floating Theme Toggle Button
 *
 * A fixed-position toggle button that cycles through light/dark/system themes.
 * Always visible in the bottom-right corner.
 */
export function FloatingThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount before rendering
  // This prevents hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server or before hydration
  if (!mounted) {
    return null;
  }

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

  const Icon = icons[theme];

  return (
    <button
      onClick={cycleTheme}
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 rounded-full border border-border bg-bg shadow-floating px-4 py-3 text-sm font-medium transition-all duration-fast ease-standard hover:shadow-overlay hover:scale-105 active:scale-95"
      aria-label={`Toggle theme (current: ${theme})`}
      title={`Theme: ${theme} (${resolvedTheme})`}
    >
      {/* Icon */}
      <Icon className="w-5 h-5 text-primary transition-transform group-hover:rotate-12" />

      {/* Label (hidden on mobile) */}
      <span className="hidden sm:inline capitalize text-fg">{theme}</span>

      {/* Status Indicator */}
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            resolvedTheme === "dark" ? "bg-primary" : "bg-warning"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            resolvedTheme === "dark" ? "bg-primary" : "bg-warning"
          }`}
        />
      </span>
    </button>
  );
}
