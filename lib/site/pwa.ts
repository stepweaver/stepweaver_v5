import { META_COLOR_DARK } from "@/lib/theme/themes";

/** Homescreen / install name. The glyph carries the lambda; the label stays readable. */
export const PWA_NAME = "λstepweaver";
export const PWA_SHORT_NAME = "stepweaver";

export const PWA_DESCRIPTION =
  "Technical operator. Systems builder. Lambda architecture.";

/** Splash and browser chrome. Matches the dark terminal field behind the lambda mark. */
export const PWA_THEME_COLOR = META_COLOR_DARK;
export const PWA_BACKGROUND_COLOR = META_COLOR_DARK;

/**
 * Files written by `scripts/render-app-icons.ts`.
 * `favicon` is `app/favicon.ico` (Next route). The rest live in `public/`.
 * Root `apple-touch-icon.png` is what iOS looks up when adding to the home screen.
 */
export const PWA_ICON_FILES = {
  favicon: "/favicon.ico",
  icon32: "/icons/icon-32.png",
  appleTouch: "/apple-touch-icon.png",
  icon192: "/icons/icon-192.png",
  icon512: "/icons/icon-512.png",
  maskable192: "/icons/icon-maskable-192.png",
  maskable512: "/icons/icon-maskable-512.png",
} as const;
