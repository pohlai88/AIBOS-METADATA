/**
 * AIBOS Theme Provider
 *
 * A 'use client' component that manages theme state (light/dark)
 * and applies the .dark class to the <html> tag.
 *
 * Usage in app/layout.tsx:
 *
 * import { ThemeProvider } from '@aibos/ui/components/ThemeProvider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <ThemeProvider>
 *           {children}
 *         </ThemeProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "aibos-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
  }, [storageKey]);

  // Apply theme to <html> element
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const effectiveTheme = theme === "system" ? systemTheme : theme;

    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
    setResolvedTheme(effectiveTheme);
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      setResolvedTheme(systemTheme);
      window.document.documentElement.classList.remove("light", "dark");
      window.document.documentElement.classList.add(systemTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    if (mounted) {
      localStorage.setItem(storageKey, newTheme);
    }
    setThemeState(newTheme);
  };

  // Always provide context, even before mounting
  // This prevents "useTheme must be used within ThemeProvider" errors
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Theme Toggle Button Component
 *
 * A simple button to toggle between light/dark/system themes.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const icons = {
    light: "☀️",
    dark: "🌙",
    system: "💻",
  };

  return (
    <button
      onClick={cycleTheme}
      className="rounded-md border border-border-base bg-bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-bg-subtle"
      aria-label="Toggle theme"
      title={`Current: ${theme} (${resolvedTheme})`}
    >
      <span className="flex items-center gap-2">
        <span>{icons[theme]}</span>
        <span className="capitalize">{theme}</span>
      </span>
    </button>
  );
}
