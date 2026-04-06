"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const VALID_THEMES = [
  "dark", "light", "monochrome", "monochrome-inverted",
  "vintage", "apple", "c64", "amber", "synthwave",
  "dracula", "solarized", "nord", "cobalt", "skynet",
] as const;

type Theme = (typeof VALID_THEMES)[number];

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
    const metaColors: Record<Theme, string> = {
      dark: "#0a0a0a", light: "#f5f5f5", monochrome: "#0f0f0f",
      "monochrome-inverted": "#f0f0f0", vintage: "#19160f", apple: "#f5f5f5",
      c64: "#2828a0", amber: "#0f0c05", synthwave: "#0f081e",
      dracula: "#191923", solarized: "#fdf6e3", nord: "#1e222e",
      cobalt: "#0a121e", skynet: "#0f0505",
    };
    const mc = document.querySelector('meta[name="theme-color"]');
    if (mc) mc.setAttribute("content", metaColors[theme]);
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
