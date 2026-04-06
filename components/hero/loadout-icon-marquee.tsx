import Link from "next/link";
import { LOADOUT_MARQUEE_TOOLS } from "@/lib/loadout/marquee-tools";

/** Infinite horizontal ticker of loadout tooling; pairs with Recent Intel panel. */
export function LoadoutIconMarquee() {
  return (
    <div className="mt-auto min-w-0 w-full">
      <div className="mt-5 pt-4 border-t border-[rgb(var(--border)/0.12)]">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <p className="font-[var(--font-ocr)] text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--text-label))]">
            Loadout pulse
          </p>
          <Link
            href="/capabilities"
            className="font-[var(--font-ocr)] text-[10px] uppercase tracking-wider text-[rgb(var(--neon)/0.45)] hover:text-[rgb(var(--neon)/0.75)] transition-colors shrink-0"
          >
            Full stack →
          </Link>
        </div>
        <div className="relative overflow-hidden -mx-1 py-1" aria-label="Tools in operator loadout">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[rgb(var(--panel)/0.92)] to-transparent sm:w-14"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[rgb(var(--panel)/0.92)] to-transparent sm:w-14"
            aria-hidden
          />
          <div className="flex w-max loadout-marquee-track items-center gap-12 sm:gap-16 md:gap-20 pl-2 pr-2">
            {[0, 1].flatMap((pass) =>
              LOADOUT_MARQUEE_TOOLS.map(({ id, label, Icon }) => (
                <span
                  key={`${id}-${pass}`}
                  className="inline-flex shrink-0 items-center gap-3 opacity-[0.85] transition-opacity duration-300 hover:opacity-100"
                  title={label}
                  role="presentation"
                >
                  <Icon className="h-5 w-5 shrink-0 text-[rgb(var(--neon)/0.72)] sm:h-6 sm:w-6" aria-hidden />
                  <span className="font-[var(--font-ocr)] text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--text-meta))] max-[479px]:hidden">
                    {label}
                  </span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
