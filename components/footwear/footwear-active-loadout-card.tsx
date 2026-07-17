import Link from "next/link";
import type { ShoeDerivedSummary } from "@/lib/footwear/queries";

type Props = {
  summary: ShoeDerivedSummary;
};

export function FootwearActiveLoadoutCard({ summary }: Props) {
  const { shoe, mileage, level, nextCheckpoint, milesRemaining, conditionLabel } =
    summary;

  return (
    <section
      aria-labelledby="footwear-loadout-heading"
      className="border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--panel)/0.35)] p-5 sm:p-6"
    >
      <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.3em] text-[rgb(var(--neon))] mb-3">
        FOOTWEAR LAB // ACTIVE LOADOUT
      </p>
      <h2
        id="footwear-loadout-heading"
        className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))]"
      >
        {shoe.brand.toUpperCase()} {shoe.model.toUpperCase()}
      </h2>
      {shoe.nickname && (
        <p className="mt-1 text-[rgb(var(--text-secondary))]">
          “{shoe.nickname.toUpperCase()}”
        </p>
      )}

      <dl className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-[var(--font-ocr)] text-[10px] tracking-widest">
        <div>
          <dt className="text-[rgb(var(--text-meta))]">STATUS</dt>
          <dd className="mt-1 text-[rgb(var(--neon))]">{shoe.status.toUpperCase()}</dd>
        </div>
        <div>
          <dt className="text-[rgb(var(--text-meta))]">LEVEL</dt>
          <dd className="mt-1 text-[rgb(var(--text-color))]">{level.title.toUpperCase()}</dd>
        </div>
        <div>
          <dt className="text-[rgb(var(--text-meta))]">MILEAGE</dt>
          <dd className="mt-1 text-[rgb(var(--text-color))]">
            {mileage.totalMiles} MI
          </dd>
        </div>
        <div>
          <dt className="text-[rgb(var(--text-meta))]">NEXT SCAN</dt>
          <dd className="mt-1 text-[rgb(var(--text-color))]">
            {nextCheckpoint
              ? `${nextCheckpoint.miles} MI${milesRemaining != null ? ` // ${milesRemaining} LEFT` : ""}`
              : "MAX MARKER"}
          </dd>
        </div>
        <div>
          <dt className="text-[rgb(var(--text-meta))]">CONDITION</dt>
          <dd className="mt-1 text-[rgb(var(--text-color))]">{conditionLabel}</dd>
        </div>
        {shoe.isLegacyRecord && (
          <div>
            <dt className="text-[rgb(var(--text-meta))]">RECORD</dt>
            <dd className="mt-1 text-[rgb(var(--warn))]">LEGACY</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/carrier-journal/footwear/${shoe.slug}`}
          className="inline-flex border border-[rgb(var(--neon))] px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))]"
        >
          VIEW SHOE PROFILE
        </Link>
        <Link
          href="/carrier-journal/footwear"
          className="inline-flex border border-[rgb(var(--neon)/0.35)] px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--neon)/0.6)] hover:text-[rgb(var(--neon))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))]"
        >
          ENTER FOOTWEAR LAB
        </Link>
      </div>
    </section>
  );
}
