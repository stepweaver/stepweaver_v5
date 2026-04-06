"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color))] hover:text-[rgb(var(--neon))] transition-colors"
      title={`Current theme: ${theme}. Click to cycle.`}
      aria-label={`Current theme: ${theme}. Click to cycle.`}
    >
      {theme === "dark" ? "◐" : theme === "light" ? "◑" : "◒"}
    </button>
  );
}
