export type ThemeId =
  | "dark"
  | "light"
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

export const THEMES: ThemeId[] = [
  "dark", "light", "monochrome", "monochrome-inverted",
  "vintage", "apple", "c64", "amber", "synthwave",
  "dracula", "solarized", "nord", "cobalt", "skynet",
];

/** Browser chrome / PWA theme-color (kept in sync with root layout bootstrap script). */
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

export const THEME_BOOTSTRAP_FALLBACK_META = META_COLORS.dark;
