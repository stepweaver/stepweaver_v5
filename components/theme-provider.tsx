"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { META_COLORS } from "@/lib/theme/themes";

export const VALID_THEMES = [
  "dark", "light", "monochrome", "monochrome-inverted",
  "vintage", "apple", "c64", "amber", "synthwave",
  "dracula", "solarized", "nord", "cobalt", "skynet",
] as const;

export type Theme = (typeof VALID_THEMES)[number];

interface ThemeContextValue {
  theme: Theme;
  changeTheme: (_theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored && VALID_THEMES.includes(stored)) {
      setTheme(stored);
    } else {
      setTheme(getSystemTheme());
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const mc = document.querySelector('meta[name="theme-color"]');
    if (mc) mc.setAttribute("content", META_COLORS[theme]);
  }, [theme, mounted]);

  const changeTheme = useCallback((t: Theme) => setTheme(t), []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const idx = VALID_THEMES.indexOf(prev);
      return VALID_THEMES[(idx + 1) % VALID_THEMES.length];
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
