/** Shared link styles for Meshtastic docs sidebar and mobile nav (v5 theme tokens). */
export function getMeshtasticNavLinkClass(active: boolean): string {
  return `block py-1.5 px-2 rounded-sm text-sm transition-colors border-l-2 -ml-0.5 pl-2.5 font-[var(--font-ocr)] ${
    active
      ? "text-neon bg-[rgb(var(--neon)/0.1)] border-[rgb(var(--neon))]"
      : "text-[rgb(var(--text-secondary))] border-transparent hover:text-neon hover:bg-[rgb(var(--neon)/0.05)] hover:border-[rgb(var(--neon)/0.3)]"
  }`;
}
