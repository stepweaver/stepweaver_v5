"use client";

import { useEffect, useState } from "react";
import {
  COLOR_SCHEME_EVENT,
  readDocumentTheme,
  readSystemScheme,
} from "@/lib/theme/color-scheme";
import { isThemeId, type ThemeId } from "@/lib/theme/themes";

function resolveAppearance(): ThemeId {
  const attr = readDocumentTheme();
  if (isThemeId(attr)) return attr;
  return readSystemScheme();
}

export function useResolvedAppearance(): {
  appearance: ThemeId;
  mounted: boolean;
} {
  const [appearance, setAppearance] = useState<ThemeId>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => setAppearance(resolveAppearance());

    sync();
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);
    window.addEventListener(COLOR_SCHEME_EVENT, sync);

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener(COLOR_SCHEME_EVENT, sync);
      observer.disconnect();
    };
  }, []);

  return { appearance, mounted };
}
