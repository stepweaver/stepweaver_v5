"use client";

import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { MatrixSync } from "@/components/ui/matrix-sync";

const HERO_PORTRAIT_FADE_MS = 400;
const HERO_PORTRAIT_GLITCH_BURST_MS = 480;

function portraitLayerStyle(visible: boolean): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transition: `opacity ${HERO_PORTRAIT_FADE_MS}ms ease-in-out`,
  };
}

export const HeroOperatorCard = memo(function HeroOperatorCard() {
  const { theme } = useTheme();
  const isSkynet = theme === "skynet";
  const [portraitGlitchBurst, setPortraitGlitchBurst] = useState(false);
  const skipNextGlitchRef = useRef(true);

  useEffect(() => {
    if (skipNextGlitchRef.current) {
      skipNextGlitchRef.current = false;
      return;
    }
    setPortraitGlitchBurst(true);
    const t = window.setTimeout(() => setPortraitGlitchBurst(false), HERO_PORTRAIT_GLITCH_BURST_MS);
    return () => window.clearTimeout(t);
  }, [isSkynet]);

  return (
    <section className="relative w-full max-w-[390px] flex flex-col border border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.25)] p-5">
      <div className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[rgb(var(--neon)/0.6)]" />
      <div className="pointer-events-none absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[rgb(var(--neon)/0.25)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[rgb(var(--neon)/0.25)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[rgb(var(--neon)/0.6)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_12px] opacity-10" />

      <header className="relative z-10 mb-4 flex items-start justify-between gap-4 pb-1">
        <div>
          <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] sm:text-sm font-[var(--font-ocr)] uppercase">
            Profile
          </p>
          <h2 className="text-xl font-semibold text-[rgb(var(--text-color))] font-[var(--font-ibm)]">Stephen Weaver</h2>
        </div>
        <div className="text-right text-xs text-[rgb(var(--muted-color))] font-mono shrink-0">
          <div className="tracking-[0.18em] text-[rgb(var(--text-meta))] uppercase font-[var(--font-ocr)] text-xs">
            Profile ID
          </div>
          <div className="font-mono text-[rgb(var(--text-secondary))] whitespace-nowrap">HMFIC-01</div>
        </div>
      </header>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="grid grid-cols-[144px_1fr] gap-4 items-start">
          <div className="flex flex-col gap-2">
            <div
              className={[
                "hero-operator-portrait-bay relative w-36 h-36 overflow-hidden border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)]",
                portraitGlitchBurst ? "hero-portrait-glitch-burst" : "",
                isSkynet && !portraitGlitchBurst ? "hero-portrait-skynet-bay" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="pointer-events-none absolute left-0 top-0 z-20 h-5 w-5 border-l border-t border-[rgb(var(--accent)/0.5)]" />
              <div className="pointer-events-none absolute right-0 top-0 z-20 h-5 w-5 border-r border-t border-[rgb(var(--neon)/0.25)]" />
              <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-5 w-5 border-b border-l border-[rgb(var(--neon)/0.25)]" />
              <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-5 w-5 border-b border-r border-[rgb(var(--accent)/0.5)]" />
              <Image
                src="/images/pixarMe-256.png"
                alt="Stephen Weaver"
                width={144}
                height={144}
                sizes="144px"
                placeholder="empty"
                style={portraitLayerStyle(!isSkynet)}
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
                priority
                aria-hidden={isSkynet}
              />
              <Image
                src="/images/pixarMe_terminator.png"
                alt=""
                width={144}
                height={144}
                sizes="144px"
                placeholder="empty"
                style={portraitLayerStyle(isSkynet)}
                className={[
                  "pointer-events-none absolute inset-0 z-10 h-full w-full object-cover",
                  isSkynet && !portraitGlitchBurst ? "hero-portrait-skynet-layer" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                loading="eager"
                aria-hidden={!isSkynet}
              />
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] font-[var(--font-ocr)] uppercase">Role</p>
              <p className="text-sm text-[rgb(var(--text-secondary))] font-[var(--font-ibm)] leading-snug">
                Systems Builder · Full-Stack Developer · Automation &amp; AI Integration
              </p>
            </div>

            <div className="space-y-2">
              <Link href="/resume" className="group block" aria-label="Open to work (view resume)">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] font-[var(--font-ocr)] uppercase">
                      Availability
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm text-[rgb(var(--green))] font-[var(--font-ibm)] whitespace-normal leading-snug">
                        Open to work
                      </p>
                      <span className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center" aria-hidden>
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--green)/0.35)] motion-safe:animate-ping" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[rgb(var(--green))] shadow-[0_0_14px_rgb(var(--green)/0.55)]" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              <div>
                <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] font-[var(--font-ocr)] uppercase">Current focus</p>
                <p className="mt-1 text-sm text-[rgb(var(--text-secondary))] font-[var(--font-ibm)] whitespace-normal leading-snug">
                  DevOps engineering and infrastructure
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3">
          <p className="font-[var(--font-ibm)] text-[rgb(var(--text-color))] text-sm leading-relaxed">
            I turn business workflows into dependable software, automation, and AI-assisted systems. I define what should exist,
            connect the moving parts, supervise implementation, and think through failure points before they become expensive.
          </p>
        </div>

        <div className="pt-3 flex flex-wrap gap-2">
          <Link
            href="/resume"
            className="inline-flex cursor-pointer items-center justify-center border border-[rgb(var(--green)/0.25)] bg-[rgb(var(--window)/0.2)] px-3 py-2 text-xs font-[var(--font-ibm)] uppercase tracking-[0.08em] text-[rgb(var(--green))] transition-colors hover:border-[rgb(var(--green)/0.6)] hover:bg-[rgb(var(--green)/0.1)]"
          >
            Resume
          </Link>
          <Link
            href="/contact"
            className="inline-flex cursor-pointer items-center justify-center border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.2)] px-3 py-2 text-xs font-[var(--font-ibm)] uppercase tracking-[0.08em] text-[rgb(var(--text-secondary))] transition-colors hover:border-[rgb(var(--neon)/0.55)] hover:bg-[rgb(var(--neon)/0.1)] hover:text-[rgb(var(--neon))]"
          >
            Contact
          </Link>
          <Link
            href="/terminal"
            className="inline-flex cursor-pointer items-center justify-center border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--window)/0.2)] px-3 py-2 text-xs font-[var(--font-ibm)] uppercase tracking-[0.08em] text-[rgb(var(--text-meta))] transition-colors hover:border-[rgb(var(--neon)/0.4)] hover:bg-[rgb(var(--neon)/0.1)] hover:text-[rgb(var(--neon))]"
          >
            Terminal
          </Link>
        </div>

        <div className="pt-3 space-y-3">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {["Veteran", "Business Analyst", "Developer"].map((label) => (
                <span
                  key={label}
                  className="border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.15)] px-2 py-1 text-xs font-[var(--font-ibm)] text-[rgb(var(--text-secondary))]"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/yankee-samurai"
                className="inline-flex cursor-pointer items-center gap-1.5 border-l-2 border border-[rgb(var(--identity)/0.3)] border-l-[rgb(var(--identity)/0.7)] bg-[rgb(var(--window)/0.1)] px-2 py-1 text-xs font-[var(--font-ibm)] text-[rgb(var(--identity)/0.85)] hover:border-[rgb(var(--identity)/0.55)] hover:bg-[rgb(var(--identity)/0.1)] transition-colors"
              >
                <span className="opacity-50" aria-hidden>
                  &gt;
                </span>
                YANKEE SAMURAI
              </Link>
              <span className="inline-flex items-center gap-1.5 border-l-2 border border-[rgb(var(--identity)/0.2)] border-l-[rgb(var(--identity)/0.5)] bg-[rgb(var(--window)/0.1)] px-2 py-1 text-xs font-[var(--font-ibm)] text-[rgb(var(--identity)/0.65)]">
                <span className="opacity-40" aria-hidden>
                  &gt;
                </span>
                REBEL
              </span>
            </div>
          </div>

          <MatrixSync />
        </div>
      </div>
    </section>
  );
});
