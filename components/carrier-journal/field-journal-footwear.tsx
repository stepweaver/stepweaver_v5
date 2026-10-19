import Link from "next/link";
import type { ShoeDerivedSummary } from "@/lib/footwear/queries";
import { formatUnitId } from "@/lib/footwear/unit";
import { formatMiles } from "@/lib/data/carrier-distance";

type Props = {
  summary: ShoeDerivedSummary | null;
};

export function FieldJournalFootwear({ summary }: Props) {
  return (
    <section aria-labelledby="footwear-summary-heading" className="border border-[rgb(var(--border)/0.25)] p-5 flex flex-col">
      <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.22em] text-[rgb(var(--neon))]">
        FOOTWEAR
      </p>
      {summary ? (
        <>
          <p className="mt-2 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
            {formatUnitId(summary.unitNumber ?? 1)}
            {summary.shoe.nickname ? ` · ${summary.shoe.nickname}` : ""}
          </p>
          <h2
            id="footwear-summary-heading"
            className="mt-1 font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]"
          >
            {summary.shoe.brand} {summary.shoe.model}
          </h2>
          <p className="mt-2 font-[var(--font-ibm)] text-lg tabular-nums text-[rgb(var(--text-color))]">
            {formatMiles(summary.mileage.totalMiles)} mi
          </p>
          <p className="font-[var(--font-ocr)] text-[10px] tracking-wide text-[rgb(var(--text-meta))]">
            Recorded on this pair
          </p>
        </>
      ) : (
        <>
          <h2
            id="footwear-summary-heading"
            className="mt-2 font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]"
          >
            Footwear roster
          </h2>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
            Walking shoes, mileage, and field notes.
          </p>
        </>
      )}
      <Link
        href="/field-journal/footwear"
        className="mt-5 inline-flex min-h-11 items-center self-start border border-[rgb(var(--neon)/0.4)] px-4 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))]"
      >
        FULL ROSTER
      </Link>
    </section>
  );
}
