"use client";

import { useEffect, useState } from "react";
import {
  formatLocomotionKcal,
  locomotionMethodDetail,
} from "@/lib/carrier-journal/walking-energy";
import { CARRIER_KPI_EMPTY } from "@/lib/data/carrier-journal";
import type { PublicDerivedTelemetry } from "@/lib/types/carrier-public-telemetry";

type Props = {
  derived: PublicDerivedTelemetry;
};

type Channel = {
  systemLabel: string;
  value: string;
  detail: string;
};

function fmt(value: number | null, suffix: string): string {
  if (value === null) return CARRIER_KPI_EMPTY;
  return `${value.toFixed(1)}${suffix}`;
}

function channels(d: PublicDerivedTelemetry): Channel[] {
  return [
    {
      systemLabel: "MI / LB DELTA",
      value: fmt(d.milesPerLbDelta, ""),
      detail: "FIELD RATIO // RECORDED MI PER LB MASS DELTA",
    },
    {
      systemLabel: "LB / 100 MI",
      value: fmt(d.lbDeltaPer100Mi, ""),
      detail: "LB MASS DELTA PER 100 RECORDED MI",
    },
    {
      systemLabel: "TOTAL COOLANT",
      value: fmt(d.totalCoolantGal, " GAL"),
      detail: "COOLANT PROCESSED",
    },
    {
      systemLabel: "COOLANT RATE",
      value: fmt(d.avgCoolantOzPerMi, " OZ/MI"),
      detail: "AVG ON DAYS WITH WATER + MILES",
    },
    {
      systemLabel: "10+ MI DAYS",
      value: String(d.tenPlusMileDays),
      detail:
        d.tenPlusMileDayPct === null
          ? "LOGGED DAYS AT 10+ MI"
          : `${d.tenPlusMileDayPct.toFixed(1)}% OF LOG DAYS`,
    },
    {
      systemLabel: "HIGH-HEAT MILES",
      value: `${d.highHeatMiles.toFixed(1)} MI`,
      detail: "PEAK HI ≥ 90°F",
    },
  ];
}

export function DerivedTelemetryPanel({ derived }: Props) {
  const tiles = channels(derived);

  return (
    <section id="derived-telemetry" className="scroll-mt-28 space-y-4">
      <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
        DERIVED TELEMETRY
      </div>
      <div className="border border-[rgb(var(--border)/0.2)] bg-[rgb(var(--panel))] p-4 sm:p-5">
        <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
          EST. LOCOMOTION ENERGY
        </div>
        <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] leading-none tabular-nums mt-1">
          {formatLocomotionKcal(derived.estLocomotionKcal)}
        </div>
        <div className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide mt-2">
          {locomotionMethodDetail(derived.locomotionMethod)}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        {tiles.map((tile) => (
          <div
            key={tile.systemLabel}
            className="bg-[rgb(var(--panel))] p-4 flex flex-col gap-1"
          >
            <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
              {tile.systemLabel}
            </div>
            <div className="font-[var(--font-ibm)] text-xl sm:text-2xl text-[rgb(var(--text-color))] leading-none tabular-nums">
              {tile.value}
            </div>
            <div className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide mt-1">
              {tile.detail}
            </div>
          </div>
        ))}
      </div>
      <DistanceEquivalencyLine derived={derived} />
    </section>
  );
}

function DistanceEquivalencyLine({ derived }: { derived: PublicDerivedTelemetry }) {
  const lines: string[] = [];
  if (derived.marathonEquivalents !== null) {
    lines.push(`DISTANCE EQUIVALENCY // ${derived.marathonEquivalents.toFixed(1)} MARATHONS`);
  }
  if (derived.fiveKEquivalents !== null) {
    lines.push(`STANDARD HUMAN TORTURE UNIT // ${derived.fiveKEquivalents.toFixed(1)} × 5K`);
  }
  if (lines.length === 0) return null;

  return <EquivalencyRotator lines={lines} />;
}

function EquivalencyRotator({ lines }: { lines: string[] }) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion || lines.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % lines.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [lines.length, reduceMotion]);

  if (reduceMotion) {
    return (
      <div className="space-y-1">
        {lines.map((line) => (
          <p
            key={line}
            className="font-[var(--font-ocr)] text-[10px] sm:text-[11px] tracking-[0.18em] text-[rgb(var(--neon))]"
          >
            {line}
          </p>
        ))}
      </div>
    );
  }

  return (
    <p
      className="font-[var(--font-ocr)] text-[10px] sm:text-[11px] tracking-[0.18em] text-[rgb(var(--neon))]"
      aria-live="polite"
    >
      {lines[index]}
    </p>
  );
}
