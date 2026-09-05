"use client";

import { useId, useState } from "react";
import { formatCalendarDate } from "@/lib/data/carrier-calendar";
import { formatSignedDelta } from "@/lib/data/carrier-adaptation";
import { CARRIER_KPI_EMPTY } from "@/lib/data/carrier-journal";
import type { PublicMassDeltaSeries, PublicMassPoint } from "@/lib/types/carrier-public-telemetry";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const VB_W = 720;
const VB_H = 280;
const PAD = { top: 18, right: 16, bottom: 38, left: 52 };

type Props = {
  series: PublicMassDeltaSeries;
};

function formatSignedLbs(value: number): string {
  if (value === 0) return "0.0 LB";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} LB`;
}

function formatNullableLbs(value: number | null): string {
  return value === null ? CARRIER_KPI_EMPTY : formatSignedLbs(value);
}

function formatSignedPct(value: number | null): string {
  return formatSignedDelta(value, "%");
}

function dateMs(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function yTicks(yMin: number, yMax: number): number[] {
  const ticks: number[] = [];
  for (let v = yMax; v >= yMin - 0.001; v -= 5) {
    ticks.push(Math.round(v));
  }
  return ticks;
}

function monthLabels(points: PublicMassPoint[]): { date: string; label: string }[] {
  const seen = new Set<string>();
  const labels: { date: string; label: string }[] = [];
  for (const p of points) {
    const key = p.date.slice(0, 7);
    if (seen.has(key)) continue;
    seen.add(key);
    const month = Number(p.date.slice(5, 7));
    labels.push({ date: p.date, label: MONTHS[month - 1] });
  }
  return labels;
}

export function MassDeltaTrend({ series }: Props) {
  const titleId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const points = series.points;

  if (points.length === 0) {
    return (
      <section id="mass-trend" className="scroll-mt-28 space-y-4">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
          MASS TREND // WEEKLY
        </div>
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Log weight on Monday weigh-ins.
        </p>
      </section>
    );
  }

  const deltas = points.map((p) => p.deltaFromBaseline);
  const rawMax = Math.max(...deltas);
  const rawMin = Math.min(...deltas);
  let yMax: number;
  let yMin: number;
  if (rawMax <= 0) {
    yMax = 0;
    yMin = rawMin === 0 ? -5 : Math.floor(rawMin / 5) * 5;
  } else if (rawMin >= 0) {
    yMin = 0;
    yMax = Math.ceil(rawMax / 5) * 5;
  } else {
    yMax = Math.ceil(rawMax / 5) * 5;
    yMin = Math.floor(rawMin / 5) * 5;
  }
  const plotW = VB_W - PAD.left - PAD.right;
  const plotH = VB_H - PAD.top - PAD.bottom;
  const t0 = dateMs(points[0].date);
  const t1 = dateMs(points[points.length - 1].date);
  const tSpan = Math.max(t1 - t0, 1);

  const xOf = (date: string) => PAD.left + ((dateMs(date) - t0) / tSpan) * plotW;
  const yOf = (value: number) => PAD.top + ((yMax - value) / (yMax - yMin)) * plotH;

  const polyline = points.map((p) => `${xOf(p.date).toFixed(1)},${yOf(p.deltaFromBaseline).toFixed(1)}`).join(" ");
  const ticks = yTicks(yMin, yMax);
  const months = monthLabels(points);
  const active = activeIndex !== null ? points[activeIndex] : null;

  return (
    <section id="mass-trend" className="scroll-mt-28 space-y-4">
      <div>
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
          MASS TREND // WEEKLY
        </div>
        <p className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--text-meta))] mt-1">
          MASS DELTA FROM BASELINE (LB)
        </p>
      </div>

      <div className="relative border border-[rgb(var(--border)/0.2)] bg-[rgb(var(--panel))]">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-labelledby={titleId}
          className="w-full h-auto block"
        >
          <title id={titleId}>Weekly body-mass delta from first Monday weigh-in, in pounds</title>
          {ticks.map((tick) => {
            const y = yOf(tick);
            const isZero = tick === 0;
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={VB_W - PAD.right}
                  y1={y}
                  y2={y}
                  stroke={isZero ? "rgb(var(--neon) / 0.45)" : "rgb(var(--border) / 0.2)"}
                  strokeWidth={isZero ? 1 : 1}
                />
                <text
                  x={PAD.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgb(var(--text-meta))"
                  fontSize="10"
                  fontFamily="var(--font-ocr), monospace"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {months.map((m) => (
            <text
              key={m.date}
              x={xOf(m.date)}
              y={VB_H - 12}
              textAnchor="middle"
              fill="rgb(var(--text-meta))"
              fontSize="10"
              fontFamily="var(--font-ocr), monospace"
            >
              {m.label}
            </text>
          ))}

          {points.length >= 2 ? (
            <polyline
              points={polyline}
              fill="none"
              stroke="rgb(var(--neon))"
              strokeWidth="1.5"
              strokeLinejoin="miter"
              strokeLinecap="square"
            />
          ) : null}

          {points.map((p, i) => {
            const x = xOf(p.date);
            const y = yOf(p.deltaFromBaseline);
            const focused = activeIndex === i;
            const size = focused ? 8 : 6;
            return (
              <rect
                key={p.date}
                x={x - size / 2}
                y={y - size / 2}
                width={size}
                height={size}
                fill="rgb(var(--panel))"
                stroke="rgb(var(--neon))"
                strokeWidth={focused ? 2 : 1.5}
                tabIndex={0}
                role="img"
                aria-label={`${formatCalendarDate(p.date)}. Total delta ${p.deltaFromBaseline.toFixed(1)} lb. Weekly delta ${p.deltaFromPrevious === null ? "n/a" : `${p.deltaFromPrevious.toFixed(1)} lb`}.`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(i)}
                onBlur={() => setActiveIndex(null)}
                className="outline-none"
              />
            );
          })}
        </svg>

        {active ? (
          <div
            className="pointer-events-none absolute left-3 top-3 border border-[rgb(var(--neon)/0.4)] bg-[rgb(var(--bg)/0.92)] px-3 py-2"
            role="status"
          >
            <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))]">
              {formatCalendarDate(active.date)}
            </div>
            <div className="font-[var(--font-ocr)] text-[10px] tracking-wide text-[rgb(var(--text-color))] mt-1">
              Total delta: {active.deltaFromBaseline.toFixed(1)} lb
            </div>
            <div className="font-[var(--font-ocr)] text-[10px] tracking-wide text-[rgb(var(--text-meta))]">
              Weekly delta:{" "}
              {active.deltaFromPrevious === null
                ? CARRIER_KPI_EMPTY
                : `${active.deltaFromPrevious.toFixed(1)} lb`}
            </div>
          </div>
        ) : null}

        <ol className="sr-only">
          {points.map((p) => (
            <li key={p.date}>
              {p.date}: {p.deltaFromBaseline.toFixed(1)} lb from baseline
              {p.deltaFromPrevious !== null
                ? `, ${p.deltaFromPrevious.toFixed(1)} lb from previous Monday`
                : ""}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        <CaptionStat label="BASELINE" value="0.0 LB" />
        <CaptionStat label="CURRENT" value={formatNullableLbs(series.currentDelta)} />
        <CaptionStat label="LAST 30D" value={formatNullableLbs(series.last30DayDelta)} />
        <CaptionStat label="AVG/WEEK" value={formatNullableLbs(series.averageWeeklyDelta)} />
      </div>
      <div className="grid grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        <CaptionStat
          label="30D MASS VELOCITY"
          value={formatSignedPct(series.last30DayDeltaPct)}
        />
        <CaptionStat
          label="WEEKLY RATE"
          value={
            series.averageWeeklyDeltaPct === null
              ? CARRIER_KPI_EMPTY
              : `${formatSignedPct(series.averageWeeklyDeltaPct)} BM/WK`
          }
        />
      </div>
      <p className="font-[var(--font-ocr)] text-[9px] tracking-[0.16em] text-[rgb(var(--text-meta))]">
        PERCENT OF BODY MASS · DESCRIPTIVE TELEMETRY, NOT A TARGET
      </p>
    </section>
  );
}

function CaptionStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[rgb(var(--panel))] px-4 py-3">
      <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.22em] text-[rgb(var(--text-meta))]">
        {label}
      </div>
      <div className="font-[var(--font-ibm)] text-lg sm:text-xl text-[rgb(var(--text-color))] mt-1 tabular-nums">
        {value}
      </div>
    </div>
  );
}
