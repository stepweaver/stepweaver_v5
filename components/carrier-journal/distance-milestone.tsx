import { formatMiles } from "@/lib/data/carrier-distance";
import { getCompactMilestone } from "@/lib/data/carrier-milestones";
import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";

type Props = {
  dispatches: PublicFieldDispatch[];
};

export function DistanceMilestone({ dispatches }: Props) {
  const milestone = getCompactMilestone(dispatches);

  return (
    <section aria-labelledby="distance-milestone-heading" className="border border-[rgb(var(--border)/0.25)] p-5">
      <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.22em] text-[rgb(var(--neon))]">
        DISTANCE
      </p>
      <h2
        id="distance-milestone-heading"
        className="mt-2 font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]"
      >
        {milestone.title}
      </h2>
      <p className="mt-1 font-[var(--font-ocr)] text-[10px] tracking-wide text-[rgb(var(--text-meta))]">
        {formatMiles(milestone.totalMiles)} miles recorded
      </p>

      {milestone.nextTitle && milestone.nextMiles !== null && milestone.milesToNext !== null ? (
        <div className="mt-5 space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color))]">
              Next: {milestone.nextTitle}
            </p>
            <p className="font-[var(--font-ocr)] text-[10px] tracking-wide text-[rgb(var(--text-meta))] tabular-nums">
              {formatMiles(milestone.milesToNext)} mi to go
            </p>
          </div>
          <div
            className="h-2 bg-[rgb(var(--border)/0.25)]"
            role="progressbar"
            aria-valuenow={milestone.progressToNext}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress toward ${milestone.nextTitle}`}
          >
            <div
              className="h-full bg-[rgb(var(--neon))]"
              style={{ width: `${Math.min(100, Math.max(0, milestone.progressToNext))}%` }}
            />
          </div>
          <p className="font-[var(--font-ocr)] text-[10px] tracking-wide text-[rgb(var(--text-meta))]">
            {milestone.nextTitle} begins at {milestone.nextMiles.toLocaleString("en-US")} miles
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[rgb(var(--text-secondary))]">Final distance rank.</p>
      )}
    </section>
  );
}
