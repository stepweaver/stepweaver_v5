import Link from "next/link";
import type { ShoeDerivedSummary } from "@/lib/footwear/queries";
import { FootwearActiveLoadoutCard } from "./footwear-active-loadout-card";
import {
  FootwearCheckpointPath,
  FootwearRosterGrid,
} from "./footwear-checkpoint-path";

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
  "Mileage comes from Field Journal daily logs for shoes you own — not a brand testing program.",
  "This ledger tracks personal walking miles and condition only.",
  "One primary pair can be marked active at a time.",
  "Checkpoint notes occur at personal mileage thresholds.",
  "No sponsorships, free-product solicitations, or duty-linked endorsements.",
  "This is a personal independent project with no employer affiliation.",
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
          FIELD JOURNAL // SHOE LEDGER
        </p>
        <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))]">
          Shoe Ledger
        </h1>
        <p className="max-w-2xl text-[rgb(var(--text-secondary))] leading-relaxed">
          Personal equipment roster for footwear you bought yourself. Miles are
          experience. Checkpoints are condition notes — not a product review
          service or partnership pitch.
        </p>
        <p>
          <Link
            href="/carrier-journal"
            className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))] hover:underline"
          >
            ← Back to Field Journal
          </Link>
        </p>
      </header>

      {active ? (
        <FootwearActiveLoadoutCard summary={active} />
      ) : (
        <section className="border border-[rgb(var(--neon)/0.2)] p-5">
          <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--text-meta))]">
            ACTIVE PAIR
          </p>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
            No public active shoe yet. Profiles appear here once published.
          </p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]">
          METHOD
        </h2>
        <ul className="space-y-2 text-sm text-[rgb(var(--text-secondary))]">
          {METHOD_POINTS.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="text-[rgb(var(--neon))]">▸</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {activeList.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]">
            ACTIVE
          </h2>
          <FootwearRosterGrid
            shoes={activeList.map((s) => ({
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
          {active && (
            <FootwearCheckpointPath items={active.checkpointProgress} />
          )}
        </section>
      )}

      {others.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]">
            ROTATION / PLANNED
          </h2>
          <FootwearRosterGrid
            shoes={others.map((s) => ({
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

      {retired.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]">
            RETIRED
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

      {recentNotes.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]">
            RECENT NOTES
          </h2>
          <ul className="space-y-3">
            {recentNotes.map((n) => (
              <li
                key={`${n.shoeSlug}-${n.date}-${n.title ?? n.notes.slice(0, 12)}`}
                className="border border-[rgb(var(--border)/0.25)] p-4"
              >
                <Link
                  href={`/carrier-journal/footwear/${n.shoeSlug}`}
                  className="font-[var(--font-ibm)] text-sm text-[rgb(var(--neon))] hover:underline"
                >
                  {n.shoeLabel}
                </Link>
                <p className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))] mt-1">
                  {n.date} · {n.mileage} MI · {n.entryType.toUpperCase()}
                </p>
                {n.title ? (
                  <p className="mt-2 text-sm text-[rgb(var(--text-color))]">{n.title}</p>
                ) : null}
                <p className="mt-1 text-sm text-[rgb(var(--text-secondary))] line-clamp-3">
                  {n.notes}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
