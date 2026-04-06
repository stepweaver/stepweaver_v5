/**
 * Editorial / long-read surfaces get the full terminal scan sequence.
 * Ported from v3 `components/transition/transitionConfig.js`.
 */
export const CONTENT_PATH_PREFIXES = ["/codex", "/meshtastic"];

export function isContentRoute(path: string): boolean {
  if (!path) return false;
  return CONTENT_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export const FADE_MS = 280;
export const STANDARD_HANDOFF_MS = 260;
export const CONTENT_BODY_MS = 650;
export const ESCALATED_BODY_MS = 520;
export const SLOW_NAV_THRESHOLD_MS = 160;
export const REDUCED_MOTION_FADE_MS = 40;
