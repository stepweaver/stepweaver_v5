import { CARRIER_KPI_EMPTY } from "@/lib/data/carrier-journal";
import { formatSignedDelta } from "@/lib/data/carrier-adaptation";
import type { ConditioningDelta } from "@/lib/types/carrier-public-telemetry";

type Props = {
  data: ConditioningDelta | null;
};

function fmtScore(value: number | null, suffix = ""): string {
  if (value === null) return CARRIER_KPI_EMPTY;
  return `${value.toFixed(1)}${suffix}`;
}

function Meter({
  value,
  max,
}: {
  value: number | null;
  max: number;
}) {
  const pct = value === null ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className="relative h-2 w-full bg-[rgb(var(--border)/0.25)]"
      aria-hidden="true"
    >
      <div
        className="absolute inset-y-0 left-0 bg-[rgb(var(--neon))]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ChannelRow({
  label,
  unit,
  value,
  max,
}: {
  label: string;
  unit?: string;
  value: number | null;
  max: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--text-meta))]">
          {label}
        </div>
        <div className="font-[var(--font-ibm)] text-xl sm:text-2xl text-[rgb(var(--text-color))] tabular-nums leading-none">
          {fmtScore(value, unit ? ` ${unit}` : "")}
        </div>
      </div>
      <Meter value={value} max={max} />
    </div>
  );
}

function WindowColumn({
  side,
  atMi,
  sampleSize,
  bandMin,
  bandMax,
  energy,
  soreness,
  coolant,
  coolantMax,
}: {
  side: "EARLY" | "RECENT";
  atMi: number;
  sampleSize: number;
  bandMin: number;
  bandMax: number;
  energy: number | null;
  soreness: number | null;
  coolant: number | null;
  coolantMax: number;
}) {
  return (
    <div className="bg-[rgb(var(--panel))] p-4 sm:p-5 space-y-5">
      <div>
        <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.22em] text-[rgb(var(--neon))]">
          {side} WINDOW
        </div>
        <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] tabular-nums leading-none mt-1">
          {fmtScore(atMi)} MI
        </div>
        <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.16em] text-[rgb(var(--text-meta))] mt-2">
          WALK-01 · {sampleSize} OPS · {bandMin}–{bandMax} MI
        </div>
      </div>
      <ChannelRow label="ENERGY" value={energy} max={10} />
      <ChannelRow label="SYSTEM LOAD" value={soreness} max={10} />
      <ChannelRow label="COOLANT" unit="OZ/MI" value={coolant} max={coolantMax} />
    </div>
  );
}

export function ConditioningDeltaPanel({ data }: Props) {
  if (!data) {
    return (
      <div id="conditioning-delta" className="space-y-4">
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
            CONDITIONING DELTA
          </div>
          <p className="text-sm text-[rgb(var(--text-secondary))] mt-2 max-w-2xl leading-relaxed">
            Same operation class, different machine. Needs comparable moderate-weather days in
            both the early and recent journal before this panel can resolve.
          </p>
        </div>
        <div className="border border-[rgb(var(--border)/0.2)] bg-[rgb(var(--panel))] p-5">
          <div className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-meta))]">
            {CARRIER_KPI_EMPTY}
          </div>
        </div>
      </div>
    );
  }

  const coolantMax = Math.max(data.early.waterOzPerMi ?? 0, data.recent.waterOzPerMi ?? 0, 16);
  const weather = data.moderateWeatherOnly ? "MODERATE WEATHER" : "MIXED WEATHER";
  const summary = `Comparable ${data.bandMinMi} to ${data.bandMaxMi} mile operations. Early journal at ${data.earlyAtMi.toFixed(1)} miles: energy ${fmtScore(data.early.energy)}, system load ${fmtScore(data.early.soreness)}, coolant ${fmtScore(data.early.waterOzPerMi, " oz/mi")}. Recent journal at ${data.recentAtMi.toFixed(1)} miles: energy ${fmtScore(data.recent.energy)}, system load ${fmtScore(data.recent.soreness)}, coolant ${fmtScore(data.recent.waterOzPerMi, " oz/mi")}. Conditioning delta: energy ${formatSignedDelta(data.energyDeltaPct, "%")}, system load ${formatSignedDelta(data.sorenessDeltaPct, "%")}, coolant ${formatSignedDelta(data.coolantDeltaPct, "%")}.`;

  return (
    <div id="conditioning-delta" className="space-y-4">
      <div>
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
          CONDITIONING DELTA
        </div>
        <p className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--text-meta))] mt-1">
          COMPARABLE {data.bandMinMi}–{data.bandMaxMi} MI OPERATIONS · {weather}
        </p>
        <p className="text-sm text-[rgb(var(--text-secondary))] mt-2 max-w-2xl leading-relaxed">
          How the same operation class affected WALK-01 early in the journal versus recently.
          Observed field telemetry, not a lab test.
        </p>
      </div>

      <div className="relative border border-[rgb(var(--neon)/0.28)] bg-[rgb(var(--panel)/0.35)]">
        <div className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[rgb(var(--cyan)/0.6)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[rgb(var(--cyan)/0.25)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[rgb(var(--cyan)/0.25)]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[rgb(var(--cyan)/0.6)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_12px] opacity-10" />

        <p className="sr-only">{summary}</p>

        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
          <WindowColumn
            side="EARLY"
            atMi={data.earlyAtMi}
            sampleSize={data.earlySampleSize}
            bandMin={data.bandMinMi}
            bandMax={data.bandMaxMi}
            energy={data.early.energy}
            soreness={data.early.soreness}
            coolant={data.early.waterOzPerMi}
            coolantMax={coolantMax}
          />
          <div className="hidden md:flex items-center justify-center px-2 bg-[rgb(var(--panel))] border-x border-[rgb(var(--border)/0.15)]">
            <div className="font-[var(--font-ocr)] text-[10px] tracking-[0.22em] text-[rgb(var(--neon))]">
              VS
            </div>
          </div>
          <WindowColumn
            side="RECENT"
            atMi={data.recentAtMi}
            sampleSize={data.recentSampleSize}
            bandMin={data.bandMinMi}
            bandMax={data.bandMaxMi}
            energy={data.recent.energy}
            soreness={data.recent.soreness}
            coolant={data.recent.waterOzPerMi}
            coolantMax={coolantMax}
          />
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border-t border-[rgb(var(--neon)/0.28)]">
          <DeltaCell label="ENERGY" value={data.energyDeltaPct} />
          <DeltaCell label="SYSTEM LOAD" value={data.sorenessDeltaPct} />
          <DeltaCell label="COOLANT" value={data.coolantDeltaPct} />
        </div>
      </div>
    </div>
  );
}

function DeltaCell({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="bg-[rgb(var(--bg)/0.55)] px-4 py-4">
      <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.22em] text-[rgb(var(--text-meta))]">
        {label}
      </div>
      <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--neon))] tabular-nums leading-none mt-1">
        {formatSignedDelta(value, "%")}
      </div>
    </div>
  );
}
