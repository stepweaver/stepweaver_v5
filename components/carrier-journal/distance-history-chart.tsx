"use client";

import { useState } from "react";
import { formatMiles, type DistanceBucket } from "@/lib/data/carrier-distance";

type View = "month" | "week";

type Props = {
  months: DistanceBucket[];
  weeks: DistanceBucket[];
};

function axisMax(miles: number): number {
  if (miles <= 0) return 5;
  const padded = miles * 1.08;
  const step = padded <= 20 ? 5 : padded <= 50 ? 10 : padded <= 120 ? 20 : padded <= 300 ? 50 : 100;
  return Math.ceil(padded / step) * step;
}

function bucketSummary(bucket: DistanceBucket, view: View): string {
  const period = view === "month" ? bucket.label : `Week of ${bucket.label}`;
  const partial = bucket.partial ? (view === "month" ? " Partial month." : " Partial week.") : "";
  if (bucket.walkingDays === 0 && bucket.zeroMileDays === 0 && bucket.daysWithoutMileage === 0) {
    return `${period}. No entries.${partial}`;
  }
  const walks =
    bucket.walkingDays === 1 ? "1 walking day" : `${bucket.walkingDays} walking days`;
  return `${period}. ${formatMiles(bucket.miles)} miles. ${walks}.${partial} Days without an entry are not counted.`;
}

export function DistanceHistoryChart({ months, weeks }: Props) {
  const [view, setView] = useState<View>("month");
  const buckets = view === "month" ? months : weeks;
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected =
    buckets.find((bucket) => bucket.key === selectedKey) ?? buckets[buckets.length - 1] ?? null;
  const max = axisMax(Math.max(0, ...buckets.map((bucket) => bucket.miles)));
  const mid = Math.round((max / 2) * 10) / 10;

  return (
    <section aria-labelledby="distance-history-heading" className="space-y-4 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="distance-history-heading"
            className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]"
          >
            Distance
          </h2>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))] max-w-xl">
            Recorded miles. A day with no entry is left out, not counted as zero.
          </p>
        </div>
        <div className="flex" role="group" aria-label="Distance chart range">
          {(
            [
              ["month", "Monthly"],
              ["week", "Weekly"],
            ] as const
          ).map(([key, label]) => {
            const active = view === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setView(key);
                  setSelectedKey(null);
                }}
                className={`min-h-11 px-4 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] uppercase border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))] ${
                  active
                    ? "border-[rgb(var(--neon))] text-[rgb(var(--neon))] bg-[rgb(var(--neon)/0.08)]"
                    : "border-[rgb(var(--border)/0.4)] text-[rgb(var(--text-meta))]"
                } ${key === "week" ? "-ml-px" : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {buckets.length === 0 || selected === null ? (
        <p className="text-sm text-[rgb(var(--text-secondary))]">No walking mileage recorded yet.</p>
      ) : (
        <>
          <p className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] tabular-nums">
            {selected.label}
            <span className="text-[rgb(var(--text-secondary))]">
              {" "}
              · {formatMiles(selected.miles)} mi
            </span>
            {selected.partial ? (
              <span className="ml-2 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
                {view === "month" ? "PARTIAL MONTH" : "PARTIAL WEEK"}
              </span>
            ) : null}
          </p>

          <div className="flex gap-3 min-w-0">
            <div
              className="flex h-48 sm:h-56 flex-col justify-between pb-6 font-[var(--font-ocr)] text-[10px] tabular-nums text-[rgb(var(--text-meta))]"
              aria-hidden="true"
            >
              <span>{max}</span>
              <span>{mid}</span>
              <span>0</span>
            </div>
            <div className="min-w-0 flex-1 overflow-x-auto">
              <div
                role="group"
                aria-label={view === "month" ? "Miles by month" : "Miles by week, Monday through Sunday"}
                className="flex h-48 sm:h-56 items-end gap-1"
                style={view === "week" ? { minWidth: `${buckets.length * 2.75}rem` } : undefined}
              >
                {buckets.map((bucket) => {
                  const height = bucket.miles <= 0 ? 0 : Math.max(4, (bucket.miles / max) * 100);
                  const isSelected = bucket.key === selected.key;
                  return (
                    <button
                      key={bucket.key}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={bucketSummary(bucket, view)}
                      onClick={() => setSelectedKey(bucket.key)}
                      className={`group flex h-full min-w-0 flex-1 flex-col justify-end focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))] ${
                        view === "week" ? "w-10 flex-none" : "min-w-8"
                      }`}
                    >
                      <span
                        className={`block w-full box-border ${
                          bucket.partial
                            ? "bg-[rgb(var(--neon)/0.72)] border-2 border-[rgb(var(--text-color))]"
                            : "bg-[rgb(var(--neon))]"
                        } ${isSelected ? "outline outline-1 outline-offset-2 outline-[rgb(var(--neon))]" : ""}`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="mt-2 h-4 truncate text-center font-[var(--font-ocr)] text-[9px] tracking-wide text-[rgb(var(--text-meta))]">
                        {bucket.axisLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="font-[var(--font-ocr)] text-[10px] tracking-wide text-[rgb(var(--text-meta))] leading-relaxed">
            {view === "week"
              ? "Weeks run Monday through Sunday."
              : "Each bar is one calendar month."}
            {buckets.some((bucket) => bucket.partial)
              ? view === "week"
                ? " Outlined bars are incomplete weeks."
                : " The outlined bar is the current partial month."
              : ""}{" "}
            {selected.walkingDays} walking {selected.walkingDays === 1 ? "day" : "days"}
            {selected.zeroMileDays > 0
              ? ` · ${selected.zeroMileDays} explicit zero-mile ${selected.zeroMileDays === 1 ? "day" : "days"}`
              : ""}
            .
          </p>
        </>
      )}
    </section>
  );
}
