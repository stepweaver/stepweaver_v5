import { MassDeltaTrend } from "@/components/carrier-journal/mass-delta-trend";
import { formatWalkDate } from "@/lib/data/carrier-distance";
import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";
import { splitPublicNoteParagraphs } from "@/lib/data/carrier-note-formatting";
import type { PublicMassDeltaSeries } from "@/lib/types/carrier-public-telemetry";

type Props = {
  dispatches: PublicFieldDispatch[];
  massDelta: PublicMassDeltaSeries;
};

export function FieldJournalDetails({ dispatches, massDelta }: Props) {
  const showWeight = massDelta.points.length >= 2;
  const notes = [...dispatches]
    .filter((dispatch) => dispatch.publicNote.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!showWeight && notes.length === 0) return null;

  return (
    <div className="space-y-14">
      {showWeight ? (
        <section aria-labelledby="weight-change-heading" className="space-y-4">
          <div>
            <h2 id="weight-change-heading" className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]">
              Weight
            </h2>
            <p className="mt-1 text-sm text-[rgb(var(--text-secondary))] max-w-xl">
              Change from the first weigh-in. Later scale readings stay private.
            </p>
          </div>
          <MassDeltaTrend series={massDelta} />
        </section>
      ) : null}

      {notes.length > 0 ? (
        <section aria-labelledby="journal-notes-heading" className="space-y-3">
          <h2 id="journal-notes-heading" className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]">
            Notes
          </h2>
          <details className="border border-[rgb(var(--border)/0.25)]">
            <summary className="cursor-pointer list-none px-4 py-3 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[rgb(var(--neon))]">
              PUBLIC NOTES
            </summary>
            <div className="px-4 pb-4 space-y-6">
              {notes.map((dispatch, index) => (
                <article key={`${dispatch.date}-${index}`}>
                  <time
                    dateTime={dispatch.date}
                    className="font-[var(--font-ocr)] text-[10px] tracking-[0.16em] text-[rgb(var(--neon))]"
                  >
                    {formatWalkDate(dispatch.date)}
                  </time>
                  <div className="mt-2 space-y-2">
                    {splitPublicNoteParagraphs(dispatch.publicNote).map((paragraph, noteIndex) => (
                      <p key={noteIndex} className="text-sm leading-relaxed text-[rgb(var(--text-color))] whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </details>
        </section>
      ) : null}
    </div>
  );
}
