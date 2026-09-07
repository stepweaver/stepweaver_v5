"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  applyColorSchemeOverride,
  readDocumentTheme,
  readStoredOverride,
  resolveNextOverride,
  resolveVisualScheme,
  type ColorScheme,
} from "@/lib/theme/color-scheme";
import { isThemeId } from "@/lib/theme/themes";
import "./theme-toggle.css";

export function ThemeToggle() {
  const [systemScheme, setSystemScheme] = useState<ColorScheme>("light");
  const [override, setOverride] = useState<ColorScheme | null>(null);
  const [dataTheme, setDataTheme] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const sync = () => {
      setSystemScheme(media.matches ? "dark" : "light");
      setOverride(readStoredOverride());
      setDataTheme(readDocumentTheme());
    };

    sync();
    setReady(true);

    media.addEventListener("change", sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      media.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  const effectiveScheme = resolveVisualScheme({
    override,
    systemScheme,
    dataTheme,
  });
  const targetScheme: ColorScheme = effectiveScheme === "dark" ? "light" : "dark";
  const targetIsSystem = targetScheme === systemScheme;
  const label = `Switch to ${targetScheme} theme${
    targetIsSystem ? " (system default)" : ""
  }`;
  const appearance = isThemeId(dataTheme) ? dataTheme : systemScheme;

  function toggleTheme() {
    const nextOverride = resolveNextOverride(effectiveScheme, systemScheme);
    applyColorSchemeOverride(nextOverride);
    setOverride(nextOverride);
    setDataTheme(nextOverride ?? undefined);
  }

  return (
    <button
      type="button"
      className={`theme-toggle ${appearance}`}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      disabled={!ready}
    >
      {ready ? (
        <span className="theme-toggle-lambda">
          <Image
            src="/images/lambda_stepweaver.png"
            alt=""
            fill
            className={`lambda-icon ${appearance}`}
            sizes="24px"
          />
        </span>
      ) : (
        <span className="theme-placeholder" aria-hidden="true" />
      )}
    </button>
  );
}
