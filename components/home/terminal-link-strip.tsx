"use client";

import Link from "next/link";
import { GlitchLambda } from "@/components/ui/glitch-lambda";

const linkClass =
  "inline-flex items-center gap-2 sm:gap-3 text-[rgb(var(--cyan))] hover:text-[rgb(var(--green))] transition-all duration-300 font-[var(--font-ibm)] text-base sm:text-xl md:text-2xl hover:scale-[1.02]";

export function TerminalLinkStrip() {
  return (
    <div className="mb-6 sm:mb-10 flex flex-wrap gap-4 sm:gap-6">
      <Link href="/play" className={linkClass}>
        <GlitchLambda className="text-[rgb(var(--green))] text-lg sm:text-2xl md:text-3xl" />
        <span className="font-bold whitespace-nowrap">Explore the playground</span>
        <span className="text-[rgb(var(--green))] text-lg sm:text-2xl md:text-3xl motion-safe:animate-pulse">→</span>
      </Link>
      <Link href="/terminal" className={linkClass}>
        <span className="font-bold whitespace-nowrap">Terminal</span>
        <span className="text-[rgb(var(--green))] text-lg sm:text-2xl md:text-3xl motion-safe:animate-pulse">→</span>
      </Link>
      <Link href="/carrier-journal" className={linkClass}>
        <span className="font-bold whitespace-nowrap">Carrier&apos;s Log</span>
        <span className="text-[rgb(var(--green))] text-lg sm:text-2xl md:text-3xl motion-safe:animate-pulse">→</span>
      </Link>
    </div>
  );
}
