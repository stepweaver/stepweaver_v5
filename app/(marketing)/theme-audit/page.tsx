"use client";

import { useEffect } from "react";
import {
  applyAppearance,
  applyColorSchemeOverride,
  nextAppearance,
  restoreStoredColorScheme,
} from "@/lib/theme/color-scheme";
import { THEMES } from "@/lib/theme/themes";
import { useResolvedAppearance } from "@/lib/theme/use-resolved-appearance";

export default function ThemeAuditPage() {
  const { appearance, mounted } = useResolvedAppearance();

  useEffect(() => {
    return () => {
      restoreStoredColorScheme();
    };
  }, []);

  function cycleThemes() {
    applyAppearance(nextAppearance(appearance, THEMES));
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            {"// APPEARANCE"}
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--text-color))] mb-4">
            Appearance lab
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-3 max-w-2xl">
            Light and dark comfort lives in the header. These palettes are novelty
            surfaces: amber CRT, skynet, nord. Previews stay on this page and do
            not persist as the site theme.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={cycleThemes}
              className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color))] hover:text-[rgb(var(--neon))] border border-[rgb(var(--border)/0.35)] px-2 py-1"
            >
              Cycle all themes (↻)
            </button>
            <button
              type="button"
              onClick={() => applyColorSchemeOverride(null)}
              className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color))] hover:text-[rgb(var(--neon))] border border-[rgb(var(--border)/0.35)] px-2 py-1"
            >
              Reset to system
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => applyAppearance(theme)}
              className={`surface-panel p-4 text-center hover:border-[rgb(var(--neon)/0.5)] transition-colors cursor-pointer ${
                mounted && appearance === theme
                  ? "border-[rgb(var(--neon)/0.7)]"
                  : ""
              }`}
            >
              <div className="text-xs font-[var(--font-ocr)] text-[rgb(var(--text-color))] capitalize">
                {theme}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
