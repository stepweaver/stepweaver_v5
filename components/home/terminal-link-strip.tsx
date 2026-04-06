"use client";

import Link from "next/link";
import { GlitchLambda } from "@/components/ui/glitch-lambda";

const linkClass =
  "inline-flex items-center gap-2 sm:gap-3 text-[rgb(var(--cyan))] hover:text-[rgb(var(--green))] transition-all duration-300 font-[var(--font-ibm)] text-base sm:text-xl md:text-2xl hover:scale-[1.02]";

export function TerminalLinkStrip() {
  return (
    <div className="mb-6 sm:mb-10 flex flex-wrap gap-4 sm:gap-6">
      <Link href="/terminal" className={linkClass}>
        <GlitchLambda className="text-[rgb(var(--green))] text-lg sm:text-2xl md:text-3xl" />
        <span className="font-bold whitespace-nowrap">Explore my terminal</span>
        <span className="text-[rgb(var(--green))] text-lg sm:text-2xl md:text-3xl motion-safe:animate-pulse">→</span>
      </Link>
      <Link href="/meshtastic" className={linkClass}>
        <span className="font-bold whitespace-nowrap">{"//\\ Meshtastic"}</span>
        <span className="text-[rgb(var(--green))] text-lg sm:text-2xl md:text-3xl motion-safe:animate-pulse">→</span>
      </Link>
      <Link href="/dice-roller" className={linkClass}>
        <span className="font-bold whitespace-nowrap">Dice Roller</span>
        <span className="text-[rgb(var(--green))] text-lg sm:text-2xl md:text-3xl motion-safe:animate-pulse">→</span>
      </Link>
    </div>
  );
}
