import Link from "next/link";
import type { ShoeDerivedSummary } from "@/lib/footwear/queries";
import { FootwearActiveLoadoutCard } from "./footwear-active-loadout-card";
import {
  FootwearCheckpointPath,
  FootwearRosterGrid,
} from "./footwear-checkpoint-path";
import { LEGACY_PUBLIC_DISCLAIMER } from "@/lib/footwear/legacy";

type Props = {
  active: ShoeDerivedSummary | null;
  roster: ShoeDerivedSummary[];
  recentNotes: {
    shoeSlug: string;
    shoeLabel: string;
    date: string;
    title: string | null;
    notes: string;
    entryType: string;
    mileage: number;
  }[];
};

const METHOD_POINTS = [
  "Occupational mileage comes from Carrier Journal daily logs, never re-entered here.",
  "Footwear Lab tracks work miles only.",
  "One primary shoe is tested at a time as the active loadout.",
  "Checkpoint reviews occur at standardized mileage thresholds.",
  "Random field notes may be added between checkpoints.",
  "Provided products are disclosed. Reviews are not guaranteed to be positive.",
  "Legacy prior mileage is labeled. Earlier checkpoints may be marked NOT RECORDED.",
  "This is a personal independent project. It is not affiliated with or endorsed by USPS.",
  "No route, customer, mail, or nonpublic postal information is collected.",
];

export function FootwearLabIndex({ active, roster, recentNotes }: Props) {
  const activeList = roster.filter((s) => s.shoe.status === "active");
  const retired = roster.filter(
    (s) => s.shoe.status === "retired" || s.shoe.status === "failed"
  );
  const others = roster.filter(
    (s) =>
      s.shoe.status !== "active" &&
      s.shoe.status !== "retired" &&
      s.shoe.status !== "failed"
  );

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.3em] text-[rgb(var(--neon))]">
          CARRIER JOURNAL // FOOTWEAR LAB
        </p>
        <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))]">
          Carrier Footwear Lab
        </h1>
        <p className="max-w-2xl text-[rgb(var(--text-secondary))] leading-relaxed">
          Field equipment roster for every physical pair worn on the route.
          Miles are experience. Checkpoints are diagnostic scans, not a race.
        </p>
        <p>
          <Link
            href="/carrier-journal"
            className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))] hover:underline"
          >
            ← Back to Carrier&apos;s Log
          </Link>
        </p>
      </header>

      {active ? (
        <FootwearActiveLoadoutCard summary={active} />
      ) : (
        <section className="border border-[rgb(var(--neon)/0.2)] p-5">
          <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--text-meta))]">
            ACTIVE LOADOUT
          </p>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
            No public active shoe yet. Profiles appear here once published.
          </p>
        </section>
      )}

      {active && (
        <section aria-labelledby="checkpoint-heading" className="space-y-4">
          <h2
            id="checkpoint-heading"
            className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]"
          >
            CHECKPOINT PATH // {active.shoe.brand.toUpperCase()}{" "}
            {active.shoe.model.toUpperCase()}
          </h2>
          <FootwearCheckpointPath items={active.checkpointProgress} />
        </section>
      )}

      {recentNotes.length > 0 && (
        <section aria-labelledby="notes-heading" className="space-y-4">
          <h2
            id="notes-heading"
            className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]"
          >
            RECENT FIELD NOTES
          </h2>
          <ul className="space-y-3">
            {recentNotes.map((n, i) => (
              <li
                key={`${n.shoeSlug}-${n.date}-${i}`}
                className="border border-[rgb(var(--neon)/0.15)] p-4"
              >
                <p className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))]">
                  {n.entryType.toUpperCase()} // {n.mileage} MI // {n.date}
                </p>
                <p className="mt-1 font-[var(--font-ibm)] text-[rgb(var(--text-color))]">
                  <Link
                    href={`/carrier-journal/footwear/${n.shoeSlug}`}
                    className="hover:text-[rgb(var(--neon))]"
                  >
                    {n.shoeLabel}
                  </Link>
                  {n.title ? `: ${n.title}` : ""}
                </p>
                <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
                  {n.notes}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="roster-heading" className="space-y-4">
        <h2
          id="roster-heading"
          className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]"
        >
          EQUIPMENT ROSTER
        </h2>
        <FootwearRosterGrid
          shoes={[...activeList, ...others].map((s) => ({
            slug: s.shoe.slug,
            brand: s.shoe.brand,
            model: s.shoe.model,
            nickname: s.shoe.nickname,
            status: s.shoe.status,
            isLegacyRecord: s.shoe.isLegacyRecord,
            totalMiles: s.mileage.totalMiles,
            levelTitle: s.level.title,
            conditionLabel: s.conditionLabel,
          }))}
        />
      </section>

      {retired.length > 0 && (
        <section aria-labelledby="retired-heading" className="space-y-4">
          <h2
            id="retired-heading"
            className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]"
          >
            RETIRED UNITS
          </h2>
          <FootwearRosterGrid
            shoes={retired.map((s) => ({
              slug: s.shoe.slug,
              brand: s.shoe.brand,
              model: s.shoe.model,
              nickname: s.shoe.nickname,
              status: s.shoe.status,
              isLegacyRecord: s.shoe.isLegacyRecord,
              totalMiles: s.mileage.totalMiles,
              levelTitle: s.level.title,
              conditionLabel: s.conditionLabel,
            }))}
          />
        </section>
      )}

      <section aria-labelledby="method-heading" className="space-y-4">
        <h2
          id="method-heading"
          className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]"
        >
          TESTING METHODOLOGY
        </h2>
        <ul className="space-y-2 text-sm text-[rgb(var(--text-secondary))]">
          {METHOD_POINTS.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="text-[rgb(var(--neon)/0.5)] shrink-0" aria-hidden>
                ▸
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        {roster.some((s) => s.shoe.isLegacyRecord) && (
          <aside className="mt-4 border border-[rgb(var(--warn)/0.35)] bg-[rgb(var(--warn)/0.05)] p-4 text-sm text-[rgb(var(--text-secondary))]">
            <p className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--warn))] mb-2">
              LEGACY RECORD NOTE
            </p>
            <p>{LEGACY_PUBLIC_DISCLAIMER}</p>
          </aside>
        )}
      </section>
    </div>
  );
}
