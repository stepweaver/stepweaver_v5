import Link from "next/link";
import Image from "next/image";
import type { ShoeDerivedSummary } from "@/lib/footwear/queries";
import type { ShoeObservation, ShoeMedia } from "@/lib/db/schema";
import type { RatingTrendPoint } from "@/lib/footwear/stats";
import { FootwearCheckpointPath } from "./footwear-checkpoint-path";
import { getObservationTrends } from "@/lib/footwear/queries";

type Props = {
  summary: ShoeDerivedSummary;
  observations: ShoeObservation[];
  media: ShoeMedia[];
};

const TREND_METRICS = [
  ["cushioning", "CUSHIONING"],
  ["stability", "STABILITY"],
  ["comfort", "COMFORT"],
  ["durability", "DURABILITY"],
  ["endOfShiftSupport", "END-OF-SHIFT SUPPORT"],
] as const;

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[rgb(var(--neon)/0.1)] py-1.5">
      <span className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
        {label}
      </span>
      <span className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color))]">
        {value}
      </span>
    </div>
  );
}

function LifecycleTrendsSection({
  trends,
}: {
  trends: Record<(typeof TREND_METRICS)[number][0], RatingTrendPoint[]>;
}) {
  const checkpoints = trends.cushioning.map((p) => ({
    miles: p.checkpointMiles,
    retrospective: p.retrospective,
  }));
  const hasRetrospective = checkpoints.some((c) => c.retrospective);
  const singleCheckpoint = checkpoints.length === 1;

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]">
          LIFECYCLE TRENDS
        </h2>
        {singleCheckpoint ? (
          <p className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
            {checkpoints[0].miles} MI
            {checkpoints[0].retrospective ? " // RETROSPECTIVE" : ""}
          </p>
        ) : (
          <p className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
            {checkpoints.map((c) => c.miles).join(" · ")} MI CHECKPOINTS
          </p>
        )}
        {hasRetrospective && (
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Retrospective scores were logged looking back, not scored live at
            that checkpoint.
          </p>
        )}
      </div>

      {singleCheckpoint ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {TREND_METRICS.map(([key, label]) => (
            <div
              key={key}
              className="flex justify-between gap-4 border border-[rgb(var(--neon)/0.15)] px-3 py-2"
            >
              <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))]">
                {label}
              </span>
              <span className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-color))]">
                {trends[key][0]?.value ?? "-"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto border border-[rgb(var(--neon)/0.15)]">
          <table className="w-full min-w-[20rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-[rgb(var(--neon)/0.15)]">
                <th className="px-3 py-2 font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))] font-normal">
                  METRIC
                </th>
                {checkpoints.map((c) => (
                  <th
                    key={c.miles}
                    className="px-3 py-2 font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))] font-normal"
                  >
                    {c.miles} MI
                    {c.retrospective ? (
                      <span className="block text-[rgb(var(--warn))]">
                        RETROSPECTIVE
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TREND_METRICS.map(([key, label]) => (
                <tr
                  key={key}
                  className="border-b border-[rgb(var(--neon)/0.1)] last:border-b-0"
                >
                  <td className="px-3 py-2 font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))]">
                    {label}
                  </td>
                  {trends[key].map((p) => (
                    <td
                      key={`${key}-${p.checkpointMiles}`}
                      className="px-3 py-2 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-color))]"
                    >
                      {p.value ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function FootwearShoeProfile({ summary, observations, media }: Props) {
  const { shoe, mileage, level, condition, conditionLabel, checkpointProgress } =
    summary;
  const trends = getObservationTrends(observations);
  const publicNotes = observations.filter(
    (o) => o.entryType !== "checkpoint" || true
  );

  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <p>
          <Link
            href="/carrier-journal/footwear"
            className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))] hover:underline"
          >
            ← Footwear Lab
          </Link>
        </p>
        <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.3em] text-[rgb(var(--neon))]">
          FOOTWEAR PROFILE // {shoe.status.toUpperCase()}
          {shoe.isLegacyRecord ? " // LEGACY RECORD" : ""}
        </p>
        <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))]">
          {shoe.brand.toUpperCase()} {shoe.model.toUpperCase()}
        </h1>
        {shoe.nickname && (
          <p className="text-xl text-[rgb(var(--text-secondary))]">
            “{shoe.nickname.toUpperCase()}”
          </p>
        )}
      </header>

      {summary.heroImageUrl && (
        <div className="relative aspect-[16/10] w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] overflow-hidden">
          <Image
            src={summary.heroImageUrl}
            alt={
              media.find((m) => m.imageUrl === summary.heroImageUrl)?.altText ??
              `${shoe.brand} ${shoe.model}`
            }
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            unoptimized
          />
        </div>
      )}

      {summary.legacyDisclaimer && (
        <aside className="border border-[rgb(var(--warn)/0.35)] bg-[rgb(var(--warn)/0.05)] p-4 text-sm text-[rgb(var(--text-secondary))]">
          <p className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--warn))] mb-2">
            LEGACY RECORD
          </p>
          <p>{summary.legacyDisclaimer}</p>
        </aside>
      )}

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="border border-[rgb(var(--neon)/0.2)] p-4">
          <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))] mb-3">
            EQUIPMENT DATA
          </h2>
          <StatRow label="STATUS" value={shoe.status.toUpperCase()} />
          <StatRow label="LEVEL" value={level.title.toUpperCase()} />
          <StatRow label="MILEAGE" value={`${mileage.totalMiles} MI`} />
          {mileage.adjustmentMiles !== 0 && (
            <StatRow label="ADJUSTMENT" value={mileage.adjustmentMiles} />
          )}
          <StatRow label="DAYS WORN" value={mileage.daysWorn} />
          <StatRow label="CONDITION" value={conditionLabel} />
          <StatRow label="SIZE" value={`${shoe.size}${shoe.width ? ` ${shoe.width}` : ""}`} />
          <StatRow label="ACQUISITION" value={shoe.acquisitionType.replace(/_/g, " ")} />
          {shoe.firstWearDate && (
            <StatRow label="DEPLOYED" value={shoe.firstWearDate} />
          )}
          {summary.amountPaid != null && (
            <StatRow
              label="PAID"
              value={
                Number.isInteger(summary.amountPaid)
                  ? `$${summary.amountPaid}`
                  : `$${summary.amountPaid.toFixed(2)}`
              }
            />
          )}
          {summary.costPer100Miles != null && (
            <StatRow label="COST / 100 MI" value={`$${summary.costPer100Miles}`} />
          )}
        </div>

        {condition && (
          <div className="border border-[rgb(var(--neon)/0.2)] p-4">
            <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))] mb-3">
              CURRENT CONDITION // {condition.checkpointMiles} MI
            </h2>
            <StatRow label="CUSHIONING" value={condition.performance.cushioning} />
            <StatRow label="STABILITY" value={condition.performance.stability} />
            <StatRow label="DRY TRACTION" value={condition.performance.tractionDry} />
            <StatRow label="WET TRACTION" value={condition.performance.tractionWet} />
            <StatRow label="COMFORT" value={condition.performance.comfort} />
            <StatRow label="FIT SECURITY" value={condition.performance.fitSecurity} />
            <StatRow label="BREATHABILITY" value={condition.performance.breathability} />
            <StatRow label="DURABILITY" value={condition.performance.durability} />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]">
          CHECKPOINT PATH
        </h2>
        <FootwearCheckpointPath items={checkpointProgress} />
      </section>

      {trends.ratings.cushioning.length > 0 && (
        <LifecycleTrendsSection trends={trends.ratings} />
      )}

      {publicNotes.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]">
            SERVICE HISTORY
          </h2>
          <ul className="space-y-3">
            {publicNotes.map((o) => (
              <li key={o.id} className="border border-[rgb(var(--neon)/0.15)] p-4">
                <p className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))]">
                  {o.entryType.toUpperCase()}
                  {o.checkpointMiles != null ? ` // ${o.checkpointMiles} MI` : ""}
                  {" // "}
                  {o.shoeMileageAtEntry} MI SERVICE // {o.date}
                  {o.retrospective ? " // RETROSPECTIVE" : ""}
                </p>
                {o.title && (
                  <p className="mt-1 font-[var(--font-ibm)] text-[rgb(var(--text-color))]">
                    {o.title}
                  </p>
                )}
                <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
                  {o.notes}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {media.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]">
            FIELD PHOTOS
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {media.map((m) => (
              <li key={m.id} className="border border-[rgb(var(--neon)/0.2)]">
                <div className="relative aspect-square bg-[rgb(var(--window)/0.3)]">
                  <Image
                    src={m.imageUrl}
                    alt={m.altText ?? `${shoe.brand} ${shoe.model} ${m.imageType}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized
                  />
                </div>
                <div className="p-3">
                  <p className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))]">
                    {m.imageType.toUpperCase()} // {m.mileageAtPhoto} MI
                  </p>
                  {m.caption && (
                    <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
                      {m.caption}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(shoe.status === "retired" || shoe.status === "failed") && shoe.finalReview && (
        <section className="border border-[rgb(var(--neon)/0.3)] p-5 space-y-3">
          <h2 className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]">
            RETIREMENT REPORT
          </h2>
          {shoe.finalVerdict && (
            <p className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))]">
              Verdict: {shoe.finalVerdict}
            </p>
          )}
          <p className="text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
            {shoe.finalReview}
          </p>
        </section>
      )}
    </article>
  );
}
