import Link from "next/link";
import type { HomeCarrierPreviewPayload } from "@/lib/home/carrier-preview";
import type { HomeIntelPayload } from "@/lib/home/recent-intel";
import { HeroRecentIntel } from "@/components/hero/hero-recent-intel";

const WEATHER_FLAG_LABEL: Record<"heat" | "rain" | "storm" | "snow", string> = {
  heat: "HEAT",
  rain: "RAIN",
  storm: "STORM",
  snow: "SNOW",
};

type Props = {
  recentIntel: HomeIntelPayload | null;
  carrierPreview: HomeCarrierPreviewPayload | null;
};

function FieldJournalStreamCard({
  preview,
}: {
  preview: HomeCarrierPreviewPayload | null;
}) {
  const dispatchHref = preview
    ? `/field-journal#${preview.id}`
    : "/field-journal#field-dispatches";

  return (
    <article
      className="relative flex flex-col h-full border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.2)] p-5 sm:p-7 min-w-0"
      aria-labelledby="field-journal-heading"
    >
      <div className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-[rgb(var(--cyan)/0.5)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-[rgb(var(--cyan)/0.5)]" />

      <p
        id="field-journal-heading"
        className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.28em] text-[rgb(var(--cyan)/0.7)] mb-2"
      >
        Field Journal // The Long Walk
      </p>
      <h2 className="font-[var(--font-ibm)] text-xl sm:text-2xl font-semibold text-[rgb(var(--text-color))] mb-3 leading-snug">
        Rebuilding the machine by putting miles through it.
      </h2>
      <p className="font-[var(--font-ibm)] text-sm sm:text-base text-[rgb(var(--text-secondary))] leading-relaxed mb-3 max-w-3xl">
        The body is the system. The miles are the test environment. The journal is the telemetry:
        gait, heat, recovery, footwear, and what the chassis does under load.
      </p>
      <p className="font-[var(--font-ibm)] text-sm sm:text-base text-[rgb(var(--text-secondary))] leading-relaxed mb-5 max-w-3xl">
        A personal human-machine field notebook, not a fitness app and not an achievement board.
      </p>

      {preview ? (
        <div className="mt-auto mb-5 border-t border-[rgb(var(--border)/0.2)] pt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <time
              dateTime={preview.date}
              className="font-[var(--font-ocr)] text-[10px] sm:text-xs tracking-widest text-[rgb(var(--text-meta))]"
            >
              {preview.date}
            </time>
            {preview.weatherFlags.map((flag) => (
              <span
                key={flag}
                className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]"
              >
                {WEATHER_FLAG_LABEL[flag]}
              </span>
            ))}
          </div>
          <Link
            href={dispatchHref}
            className="block font-[var(--font-ibm)] text-sm sm:text-base text-[rgb(var(--text-color))] hover:text-[rgb(var(--neon))] transition-colors leading-snug focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))]"
          >
            {preview.title}
          </Link>
          <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed line-clamp-3">
            {preview.excerpt}
          </p>
          <Link
            href="/field-journal#field-dispatches"
            className="inline-flex font-[var(--font-ocr)] text-[10px] sm:text-xs uppercase tracking-wider text-[rgb(var(--text-meta))] hover:text-[rgb(var(--neon)/0.8)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))]"
          >
            FIELD NOTES
          </Link>
        </div>
      ) : null}

      <Link
        href="/field-journal"
        className="inline-flex items-center gap-2 border border-[rgb(var(--cyan)/0.35)] bg-[rgb(var(--window)/0.2)] px-4 py-2 text-xs font-[var(--font-ibm)] uppercase tracking-[0.1em] text-[rgb(var(--cyan))] transition-colors hover:border-[rgb(var(--cyan)/0.65)] hover:bg-[rgb(var(--cyan)/0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))] w-fit"
      >
        Read Field Journal →
      </Link>
    </article>
  );
}

export function ActivityStreams({ recentIntel, carrierPreview }: Props) {
  return (
    <section className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-14 pb-8">
      <div className="grid grid-cols-1 min-[52rem]:grid-cols-2 gap-4 sm:gap-6 min-[52rem]:gap-8 items-stretch">
        <FieldJournalStreamCard preview={carrierPreview} />
        <HeroRecentIntel intel={recentIntel} />
      </div>
    </section>
  );
}
