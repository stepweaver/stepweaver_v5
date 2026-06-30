import Image from "next/image";
import Link from "next/link";

const CARRIER_TAGS = ["City Carrier", "Mailwalker", "Transformation Arc"];

export function CarrierProfileCard() {
  return (
    <section className="relative w-full max-w-[390px] flex flex-col border border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.25)] p-5">
      {/* Corner brackets */}
      <div className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[rgb(var(--cyan)/0.6)]" />
      <div className="pointer-events-none absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[rgb(var(--cyan)/0.25)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[rgb(var(--cyan)/0.25)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[rgb(var(--cyan)/0.6)]" />
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_12px] opacity-10" />

      <header className="relative z-10 mb-4 flex items-start justify-between gap-4 pb-1">
        <div>
          <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] sm:text-sm font-[var(--font-ocr)] uppercase">
            Field Profile
          </p>
          <h2 className="text-xl font-semibold text-[rgb(var(--text-color))] font-[var(--font-ibm)]">
            Stephen Weaver
          </h2>
        </div>
        <div className="text-right text-xs text-[rgb(var(--muted-color))] font-mono shrink-0">
          <div className="tracking-[0.18em] text-[rgb(var(--text-meta))] uppercase font-[var(--font-ocr)] text-xs">
            Carrier ID
          </div>
          <div className="font-mono text-[rgb(var(--cyan))] whitespace-nowrap">PTF-01</div>
        </div>
      </header>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="grid grid-cols-[144px_1fr] gap-4 items-start">
          {/* Portrait */}
          <div className="flex flex-col gap-3">
            <div className="relative w-36 h-36 overflow-hidden border border-[rgb(var(--cyan)/0.25)] bg-[rgb(var(--window)/0.3)]">
              <div className="pointer-events-none absolute left-0 top-0 z-20 h-5 w-5 border-l border-t border-[rgb(var(--cyan)/0.5)]" />
              <div className="pointer-events-none absolute right-0 top-0 z-20 h-5 w-5 border-r border-t border-[rgb(var(--cyan)/0.25)]" />
              <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-5 w-5 border-b border-l border-[rgb(var(--cyan)/0.25)]" />
              <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-5 w-5 border-b border-r border-[rgb(var(--cyan)/0.5)]" />
              <Image
                src="/images/carrier_me.png"
                alt="Stephen Weaver, City Letter Carrier"
                width={144}
                height={144}
                sizes="144px"
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top"
                priority
              />
            </div>

            <div>
              <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] font-[var(--font-ocr)] uppercase">
                Current chapter
              </p>
              <p className="mt-1 text-sm text-[rgb(var(--text-secondary))] font-[var(--font-ibm)] leading-snug">
                Walking routes + building while the satchel&apos;s off
              </p>
            </div>
          </div>

          {/* Meta fields */}
          <div className="min-w-0 space-y-3">
            <div>
              <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] font-[var(--font-ocr)] uppercase">
                Role
              </p>
              <p className="text-sm text-[rgb(var(--text-secondary))] font-[var(--font-ibm)] leading-snug">
                City Carrier · USPS · Mailwalker in Progress
              </p>
            </div>

            <div>
              <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] font-[var(--font-ocr)] uppercase">
                Status
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-[rgb(var(--cyan))] font-[var(--font-ibm)] whitespace-normal leading-snug">
                  Active, On Route
                </p>
                <span className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center" aria-hidden>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--cyan)/0.35)] motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[rgb(var(--cyan))] shadow-[0_0_14px_rgb(var(--cyan)/0.55)]" />
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] font-[var(--font-ocr)] uppercase">
                Focus
              </p>
              <p className="text-sm text-[rgb(var(--text-secondary))] font-[var(--font-ibm)] leading-snug">
                Miles, hydration, soreness, weight lost
              </p>
            </div>
          </div>
        </div>

        <div className="pt-1">
          <p className="font-[var(--font-ibm)] text-[rgb(var(--text-color))] text-sm leading-relaxed">
            Started overweight and green. Learning what a walking route actually costs: feet, hydration, heat,
            and the quiet math of showing up shift after shift and not falling apart.
          </p>
        </div>

        <div className="pt-1 flex flex-wrap gap-2">
          <Link
            href="/mail-sort-academy"
            className="inline-flex cursor-pointer items-center justify-center border border-[rgb(var(--cyan)/0.25)] bg-[rgb(var(--window)/0.2)] px-3 py-2 text-xs font-[var(--font-ibm)] uppercase tracking-[0.08em] text-[rgb(var(--cyan))] transition-colors hover:border-[rgb(var(--cyan)/0.6)] hover:bg-[rgb(var(--cyan)/0.1)]"
          >
            Mail Sort Academy
          </Link>
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center justify-center border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.2)] px-3 py-2 text-xs font-[var(--font-ibm)] uppercase tracking-[0.08em] text-[rgb(var(--text-secondary))] transition-colors hover:border-[rgb(var(--neon)/0.55)] hover:bg-[rgb(var(--neon)/0.1)] hover:text-[rgb(var(--neon))]"
          >
            Main Profile
          </Link>
        </div>

        <div className="pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {CARRIER_TAGS.map((label) => (
              <span
                key={label}
                className="border border-[rgb(var(--cyan)/0.25)] bg-[rgb(var(--window)/0.15)] px-2 py-1 text-xs font-[var(--font-ibm)] text-[rgb(var(--text-secondary))]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
