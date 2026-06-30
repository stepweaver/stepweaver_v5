"use client";

import { useState, useMemo } from "react";
import type { CarrierDispatch, MailLoadTier } from "@/lib/data/carrier-journal";
import { deriveWeatherSignals } from "@/lib/carrier-journal/weather-signals";
import { CarrierDispatchCard } from "./carrier-dispatch-card";

type WeatherFilter = "heat" | "rain" | "storm" | "snow";
type LoadFilter = MailLoadTier | "all";

const WEATHER_OPTIONS: { key: WeatherFilter; label: string }[] = [
  { key: "heat", label: "HEAT" },
  { key: "rain", label: "RAIN" },
  { key: "storm", label: "STORM" },
  { key: "snow", label: "SNOW" },
];

const LOAD_OPTIONS: { value: LoadFilter; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "light", label: "LIGHT" },
  { value: "medium", label: "MEDIUM" },
  { value: "heavy", label: "HEAVY" },
];

const LOAD_COLOR: Record<LoadFilter, string> = {
  all: "rgb(var(--text-secondary))",
  light: "rgb(var(--green))",
  medium: "rgb(var(--text-secondary))",
  heavy: "rgb(var(--warn))",
};

type Props = {
  dispatches: CarrierDispatch[];
};

export function CarrierDispatchFeed({ dispatches }: Props) {
  const [load, setLoad] = useState<LoadFilter>("all");
  const [conditions, setConditions] = useState<Set<WeatherFilter>>(new Set());

  const filtered = useMemo(() => {
    return dispatches.filter((d) => {
      if (load !== "all" && d.mailLoadTier !== load) return false;
      if (conditions.size === 0) return true;
      const weather = deriveWeatherSignals(d);
      for (const cond of conditions) {
        if (!weather[cond]) return false;
      }
      return true;
    });
  }, [dispatches, load, conditions]);

  const isFiltered = load !== "all" || conditions.size > 0;

  function toggleCondition(key: WeatherFilter) {
    setConditions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function clearFilters() {
    setLoad("all");
    setConditions(new Set());
  }

  return (
    <div>
      <div className="space-y-3 mb-5">
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mr-2 shrink-0">
            LOAD
          </span>
          {LOAD_OPTIONS.map((opt) => {
            const active = load === opt.value;
            const activeColor = LOAD_COLOR[opt.value];
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLoad(opt.value)}
                className="font-[var(--font-ocr)] text-[9px] tracking-widest px-2 py-1 border transition-colors"
                style={
                  active
                    ? {
                        color: "rgb(var(--bg))",
                        backgroundColor: activeColor,
                        borderColor: activeColor,
                      }
                    : {
                        color: "rgb(var(--text-secondary))",
                        borderColor: "rgb(var(--border)/0.4)",
                      }
                }
              >
                {opt.label}
              </button>
            );
          })}
          <span className="font-[var(--font-ocr)] text-[8px] tracking-widest text-[rgb(var(--text-meta)/0.6)] ml-1">
            VS YOUR DPS + PARCEL BASELINE
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mr-2 shrink-0">
            WEATHER
          </span>
          {WEATHER_OPTIONS.map(({ key, label }) => {
            const active = conditions.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleCondition(key)}
                className="font-[var(--font-ocr)] text-[9px] tracking-widest px-2 py-1 border transition-colors"
                style={
                  active
                    ? {
                        color: "rgb(var(--bg))",
                        backgroundColor: "rgb(var(--warn))",
                        borderColor: "rgb(var(--warn))",
                      }
                    : {
                        color: "rgb(var(--text-secondary))",
                        borderColor: "rgb(var(--border)/0.4)",
                      }
                }
              >
                {label}
              </button>
            );
          })}
          <span className="font-[var(--font-ocr)] text-[8px] tracking-widest text-[rgb(var(--text-meta)/0.6)] ml-1">
            CALCULATED FROM TEMP + NOTES
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
          {isFiltered
            ? `${filtered.length} of ${dispatches.length} dispatch${dispatches.length !== 1 ? "es" : ""}`
            : `${dispatches.length} dispatch${dispatches.length !== 1 ? "es" : ""}`}
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={clearFilters}
            className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] hover:text-[rgb(var(--neon))] transition-colors"
          >
            CLEAR FILTERS ✕
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-px">
          {filtered.map((d) => (
            <CarrierDispatchCard key={d.id} dispatch={d} />
          ))}
        </div>
      ) : (
        <div className="surface-panel p-8 text-center">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--text-label))] mb-2">
            NO MATCH
          </div>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            No dispatches match the current filters.
          </p>
        </div>
      )}
    </div>
  );
}
