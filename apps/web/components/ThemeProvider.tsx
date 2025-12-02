/**
 * AIBOS Theme Provider
 *
 * A 'use client' component that manages theme state (light/dark)
 * and applies the .dark class to the <html> tag.
 *
 * Usage in app/layout.tsx:
 *
 * import { ThemeProvider } from '@/components/ThemeProvider';
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
  useCallback,
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

// Helper to get system theme
function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Helper to resolve effective theme
function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

// Helper to get initial theme from localStorage
function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === "undefined") return defaultTheme;
  const stored = localStorage.getItem(storageKey) as Theme | null;
  return stored ?? defaultTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "aibos-theme",
}: ThemeProviderProps) {
  // Initialize theme state with value from localStorage
  const [theme, setThemeState] = useState<Theme>(() =>
    getInitialTheme(storageKey, defaultTheme)
  );

  const resolvedTheme = resolveTheme(theme);

  // Wrapped setTheme that also persists to localStorage
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, newTheme);
      }
    },
    [storageKey]
  );

  // Apply theme class to <html> element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes (only when theme is "system")
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // Force re-render by toggling state
      setThemeState((prev) => (prev === "system" ? "system" : prev));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

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

