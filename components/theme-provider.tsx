"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const VALID_THEMES = [
  "dark",
  "light",
  "monochrome",
  "monochrome-inverted",
  "vintage",
  "apple",
  "c64",
  "amber",
  "synthwave",
  "dracula",
  "solarized",
  "nord",
  "cobalt",
  "skynet",
] as const;

type Theme = (typeof VALID_THEMES)[number];

interface ThemeContextValue {
  theme: Theme;
  changeTheme: (_theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const META_COLORS: Record<Theme, string> = {
  dark: "#050b12",
  light: "#f5f7fa",
  monochrome: "#0f0f0f",
  "monochrome-inverted": "#f0f0f0",
  vintage: "#19160f",
  apple: "#f5f5f7",
  c64: "#221b54",
  amber: "#0f0c05",
  synthwave: "#0f081e",
  dracula: "#191923",
  solarized: "#fdf6e3",
  nord: "#1e222e",
  cobalt: "#0a121e",
  skynet: "#0f0505",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function isValidTheme(value: string | null): value is Theme {
  return !!value && VALID_THEMES.includes(value as Theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const nextTheme = isValidTheme(stored) ? stored : getSystemTheme();

    setTheme(nextTheme);
    setMounted(true);

    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.classList.add("theme-loaded");

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", META_COLORS[nextTheme]);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.add("theme-loaded");
    localStorage.setItem("theme", theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", META_COLORS[theme]);
    }
  }, [theme, mounted]);

  const changeTheme = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
  }, []);

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
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}