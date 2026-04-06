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

export const META_COLORS: Record<ThemeId, string> = {
  dark: "#0a0a0a",
  light: "#f5f5f5",
  monochrome: "#0f0f0f",
  "monochrome-inverted": "#f0f0f0",
  vintage: "#19160f",
  apple: "#f5f5f5",
  c64: "#2828a0",
  amber: "#0f0c05",
  synthwave: "#0f081e",
  dracula: "#191923",
  solarized: "#fdf6e3",
  nord: "#1e222e",
  cobalt: "#0a121e",
  skynet: "#0f0505",
};
