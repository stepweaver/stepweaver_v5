export type ColorScheme = "light" | "dark";

export type NoveltyThemeId =
  | "monochrome"
  | "monochrome-inverted"
  | "vintage"
  | "apple"
  | "c64"
  | "amber"
  | "synthwave"
  | "dracula"
  | "solarized"
  | "nord"
  | "cobalt"
  | "skynet";

export type ThemeId = ColorScheme | NoveltyThemeId;

/** @deprecated Use ThemeId. Kept so effects code can keep a short alias. */
export type Theme = ThemeId;

export const COLOR_SCHEMES: ColorScheme[] = ["light", "dark"];

export const NOVELTY_THEMES: NoveltyThemeId[] = [
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
];

export const THEMES: ThemeId[] = ["dark", "light", ...NOVELTY_THEMES];

const LIGHT_APPEARANCES = new Set<ThemeId>([
  "light",
  "monochrome-inverted",
  "apple",
  "solarized",
]);

/** Browser chrome / PWA theme-color. */
export const META_COLORS: Record<ThemeId, string> = {
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

export const META_COLOR_LIGHT = META_COLORS.light;
export const META_COLOR_DARK = META_COLORS.dark;

export function isColorScheme(value: string | null | undefined): value is ColorScheme {
  return value === "light" || value === "dark";
}

export function isNoveltyTheme(value: string | null | undefined): value is NoveltyThemeId {
  return !!value && (NOVELTY_THEMES as readonly string[]).includes(value);
}

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return isColorScheme(value) || isNoveltyTheme(value);
}

export function isLightAppearance(value: ThemeId): boolean {
  return LIGHT_APPEARANCES.has(value);
}
