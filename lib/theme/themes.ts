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
  dark: "#070a10",
  light: "#e5e5e5",
  monochrome: "#0f0f0f",
  "monochrome-inverted": "#f0f0f0",
  vintage: "#000000",
  apple: "#000000",
  c64: "#40318d",
  amber: "#1a0f00",
  synthwave: "#0f081e",
  dracula: "#191923",
  solarized: "#fdf6e3",
  nord: "#1e222e",
  cobalt: "#001b2e",
  skynet: "#0a0505",
};
