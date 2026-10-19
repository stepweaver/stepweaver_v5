import Link from "next/link";
import { DistanceHistoryChart } from "@/components/carrier-journal/distance-history-chart";
import { DistanceMilestone } from "@/components/carrier-journal/distance-milestone";
import { FieldJournalDetails } from "@/components/carrier-journal/field-journal-details";
import { FieldJournalFootwear } from "@/components/carrier-journal/field-journal-footwear";
import { FieldJournalHero } from "@/components/carrier-journal/field-journal-hero";
import { RecentWalks } from "@/components/carrier-journal/recent-walks";
import { buildDistanceJournal } from "@/lib/data/carrier-distance";
import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";
import type { ShoeDerivedSummary } from "@/lib/footwear/queries";
import {
  EMPTY_MASS_DELTA_SERIES,
  type PublicMassDeltaSeries,
} from "@/lib/types/carrier-public-telemetry";

type Props = {
  dispatches?: PublicFieldDispatch[];
  massDelta?: PublicMassDeltaSeries;
  footwearActive?: ShoeDerivedSummary | null;
};

export function CarrierJournalPage({
  dispatches = [],
  massDelta = EMPTY_MASS_DELTA_SERIES,
  footwearActive = null,
}: Props = {}) {
  const journal = buildDistanceJournal(dispatches);
  const weightChangeLbs =
    massDelta.points.length >= 2 && massDelta.currentDelta !== null
      ? massDelta.currentDelta
      : null;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-14">
        <FieldJournalHero journal={journal} weightChangeLbs={weightChangeLbs} />
        <DistanceHistoryChart months={journal.months} weeks={journal.weeks} />
        <RecentWalks dispatches={dispatches} />

        <div className="grid gap-4 lg:grid-cols-2">
          <DistanceMilestone dispatches={dispatches} />
          <FieldJournalFootwear summary={footwearActive} />
        </div>

        <FieldJournalDetails dispatches={dispatches} massDelta={massDelta} />

        <div className="border border-[rgb(var(--border)/0.25)] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.22em] text-[rgb(var(--neon))] mb-1">
              LAB
            </p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Experimental calculations stay off this page.
            </p>
          </div>
          <Link
            href="/field-journal/lab"
            className="inline-flex min-h-11 items-center border border-[rgb(var(--neon)/0.4)] px-4 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))]"
          >
            OPEN THE LAB
          </Link>
        </div>

        <div className="surface-panel p-6 sm:p-8 text-center">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--text-label))] mb-3">
            CONTINUE EXPLORING
          </div>
          <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-2">
            More systems. More artifacts.
          </h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-6 max-w-xl mx-auto">
            Field Journal is one live system on the board. The catalog and codex have the rest.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/work" className="glitch-button">
              View Projects
            </Link>
            <Link href="/writing" className="glitch-button">
              Read the Codex
            </Link>
            <Link href="/contact" className="glitch-button">
              Get in Touch
            </Link>
          </div>
        </div>

        <div className="text-center py-2">
          <Link
            href="/log"
            aria-label="Field daybook"
            className="text-[rgb(var(--text-meta)/0.18)] hover:text-[rgb(var(--text-meta)/0.45)] text-[10px] font-[var(--font-ocr)] tracking-widest transition-colors"
          >
            λ
          </Link>
        </div>
      </div>
    </div>
  );
}
