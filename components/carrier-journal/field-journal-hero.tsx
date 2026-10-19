import { formatMiles, type DistanceJournal } from "@/lib/data/carrier-distance";

type Props = {
  journal: DistanceJournal;
  /** Null when there is no change to show. Later absolute weights never arrive here. */
  weightChangeLbs: number | null;
};

function formatWeightChange(delta: number): string {
  if (delta === 0) return "No change";
  const amount = Math.abs(delta).toFixed(1);
  return delta < 0 ? `${amount} lb lost` : `${amount} lb gained`;
}

export function FieldJournalHero({ journal, weightChangeLbs }: Props) {
  const average = journal.recentAverage;
  const secondary = [
    {
      label: "Walking days",
      value: journal.walkingDays.toLocaleString("en-US"),
      detail: "Days with miles recorded",
    },
    ...(average.milesPerWalkingDay !== null
      ? [
          {
            label: "Daily average",
            value: `${formatMiles(average.milesPerWalkingDay)} mi`,
            detail: `${average.label} · walking days only`,
          },
        ]
      : []),
    ...(weightChangeLbs !== null
      ? [
          {
            label: "Weight change",
            value: formatWeightChange(weightChangeLbs),
            detail: "Since the first weigh-in",
          },
        ]
      : []),
  ];

  return (
    <header className="space-y-8">
      <div className="max-w-2xl">
        <p className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
          FIELD JOURNAL // THE LONG WALK
        </p>
        <h1 className="font-[var(--font-ibm)] text-4xl sm:text-6xl text-[rgb(var(--text-color))] leading-none">
          The Long Walk
        </h1>
        <p className="mt-3 text-[rgb(var(--text-secondary))] text-sm sm:text-base leading-relaxed">
          A record of distance, endurance, and progress.
        </p>
      </div>

      <div>
        <p className="font-[var(--font-ibm)] text-6xl sm:text-8xl text-[rgb(var(--text-color))] leading-none tabular-nums tracking-tight">
          {formatMiles(journal.totalMiles)}
        </p>
        <p className="mt-3 font-[var(--font-ocr)] text-[11px] sm:text-xs tracking-[0.28em] text-[rgb(var(--neon))]">
          MILES WALKED
        </p>
      </div>

      {secondary.length > 0 ? (
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgb(var(--border)/0.2)] border border-[rgb(var(--border)/0.25)]">
          {secondary.map((stat) => (
            <div key={stat.label} className="bg-[rgb(var(--panel))] px-4 py-4">
              <dt className="font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--text-meta))] uppercase">
                {stat.label}
              </dt>
              <dd className="mt-2 font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))] tabular-nums leading-none">
                {stat.value}
              </dd>
              <dd className="mt-2 font-[var(--font-ocr)] text-[10px] tracking-wide text-[rgb(var(--text-meta))]">
                {stat.detail}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </header>
  );
}
