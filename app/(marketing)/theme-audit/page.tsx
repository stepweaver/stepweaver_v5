"use client";

import { useTheme } from "@/components/theme-provider";

const THEMES = [
  "dark", "light", "monochrome", "monochrome-inverted",
  "vintage", "apple", "c64", "amber", "synthwave",
  "dracula", "solarized", "nord", "cobalt", "skynet",
] as const;

export default function ThemeAuditPage() {
  const { changeTheme } = useTheme();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// THEME AUDIT"}</div>
          <h1 className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--text-color))] mb-4">Theme Preview</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm">Click any theme to activate it.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => changeTheme(theme)}
              className="surface-panel p-4 text-center hover:border-[rgb(var(--neon)/0.5)] transition-colors cursor-pointer"
            >
              <div className="text-xs font-[var(--font-ocr)] text-[rgb(var(--text-color))] capitalize">{theme}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
