import {
  isColorScheme,
  isLightAppearance,
  isThemeId,
  META_COLOR_DARK,
  META_COLOR_LIGHT,
  type ColorScheme,
  type ThemeId,
} from "@/lib/theme/themes";

export type { ColorScheme, ThemeId };

export const COLOR_SCHEME_STORAGE_KEY = "stepweaver-color-scheme";
export const LEGACY_THEME_STORAGE_KEY = "theme";
export const COLOR_SCHEME_EVENT = "stepweaver:color-scheme";

export function parseStoredOverride(value: string | null | undefined): ColorScheme | null {
  return isColorScheme(value) ? value : null;
}

/** Old multi-theme `localStorage.theme` only migrates light/dark. Novelty ids are ignored. */
export function parseLegacyTheme(value: string | null | undefined): ColorScheme | null {
  return parseStoredOverride(value);
}

export function resolveNextOverride(
  effectiveScheme: ColorScheme,
  systemScheme: ColorScheme
): ColorScheme | null {
  const nextScheme: ColorScheme = effectiveScheme === "dark" ? "light" : "dark";
  return nextScheme === systemScheme ? null : nextScheme;
}

export function resolveVisualScheme(options: {
  override: ColorScheme | null;
  systemScheme: ColorScheme;
  dataTheme?: string | null;
}): ColorScheme {
  const { override, systemScheme, dataTheme } = options;

  if (isColorScheme(dataTheme)) {
    return dataTheme;
  }

  if (isThemeId(dataTheme)) {
    return isLightAppearance(dataTheme) ? "light" : "dark";
  }

  return override ?? systemScheme;
}

export function readStoredOverride(): ColorScheme | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = parseStoredOverride(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY));
    if (stored) return stored;

    const legacy = parseLegacyTheme(localStorage.getItem(LEGACY_THEME_STORAGE_KEY));
    if (legacy) return legacy;
  } catch {
    return null;
  }

  return null;
}

export function readSystemScheme(): ColorScheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readDocumentTheme(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.documentElement.dataset.theme;
}

function notifyColorSchemeChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COLOR_SCHEME_EVENT));
}

function syncThemeColorMeta(scheme: ColorScheme | null): void {
  if (typeof document === "undefined") return;

  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  if (metas.length === 0) return;

  if (scheme === null) {
    for (const meta of metas) {
      const media = meta.media ?? "";
      if (media.includes("light")) meta.content = META_COLOR_LIGHT;
      else if (media.includes("dark")) meta.content = META_COLOR_DARK;
    }
    return;
  }

  const color = scheme === "light" ? META_COLOR_LIGHT : META_COLOR_DARK;
  for (const meta of metas) {
    meta.content = color;
  }
}

export function applyColorSchemeOverride(value: ColorScheme | null): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  try {
    if (value === null) {
      localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
      delete root.dataset.theme;
    } else {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, value);
      root.dataset.theme = value;
    }
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
  } catch {
    if (value === null) delete root.dataset.theme;
    else root.dataset.theme = value;
  }

  syncThemeColorMeta(value);
  notifyColorSchemeChange();
}

/** Session preview for novelty palettes. Does not persist a color-scheme override. */
export function applyAppearance(id: ThemeId): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = id;
  notifyColorSchemeChange();
}

export function restoreStoredColorScheme(): void {
  applyColorSchemeOverride(readStoredOverride());
}

export function nextAppearance(current: ThemeId, themes: readonly ThemeId[]): ThemeId {
  const idx = themes.indexOf(current);
  if (idx < 0) return themes[0] ?? "dark";
  return themes[(idx + 1) % themes.length] ?? "dark";
}
