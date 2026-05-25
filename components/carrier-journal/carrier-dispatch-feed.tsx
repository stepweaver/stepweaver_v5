"use client";

import { useState, useMemo } from "react";
import type { CarrierDispatch, CarrierPhase, MailLoad } from "@/lib/data/carrier-journal";
import { CarrierDispatchCard } from "./carrier-dispatch-card";

type PhaseFilter = CarrierPhase | "all";
type LoadFilter = MailLoad | "all";

const PHASE_OPTIONS: { value: PhaseFilter; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "break-in", label: "BREAK-IN" },
  { value: "adapting", label: "ADAPTING" },
  { value: "building", label: "BUILDING" },
  { value: "regular", label: "REGULAR" },
];

const LOAD_OPTIONS: { value: LoadFilter; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "light", label: "LIGHT" },
  { value: "normal", label: "NORMAL" },
  { value: "heavy", label: "HEAVY" },
  { value: "brutal", label: "BRUTAL" },
];

const LOAD_COLOR: Record<LoadFilter, string> = {
  all: "rgb(var(--text-secondary))",
  light: "rgb(var(--green))",
  normal: "rgb(var(--text-secondary))",
  heavy: "rgb(var(--warn))",
  brutal: "rgb(var(--danger))",
};

type ConditionKey = "heat" | "rain" | "dog";

const CONDITION_OPTIONS: { key: ConditionKey; label: string }[] = [
  { key: "heat", label: "HEAT" },
  { key: "rain", label: "RAIN" },
  { key: "dog", label: "DOG" },
];

type Props = {
  dispatches: CarrierDispatch[];
};

export function CarrierDispatchFeed({ dispatches }: Props) {
  const [phase, setPhase] = useState<PhaseFilter>("all");
  const [load, setLoad] = useState<LoadFilter>("all");
  const [conditions, setConditions] = useState<Set<ConditionKey>>(new Set());

  const filtered = useMemo(() => {
    return dispatches.filter((d) => {
      if (phase !== "all" && d.phase !== phase) return false;
      if (load !== "all" && d.mailLoad !== load) return false;
      for (const cond of conditions) {
        if (cond === "heat" && !d.heatDay) return false;
        if (cond === "rain" && !d.rain) return false;
        if (cond === "dog" && !d.dogEncounter) return false;
      }
      return true;
    });
  }, [dispatches, phase, load, conditions]);

  const isFiltered = phase !== "all" || load !== "all" || conditions.size > 0;

  function toggleCondition(key: ConditionKey) {
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
    setPhase("all");
    setLoad("all");
    setConditions(new Set());
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="space-y-3 mb-5">
        {/* Phase filter */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mr-2 shrink-0">
            PHASE
          </span>
          {PHASE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPhase(opt.value)}
              className="font-[var(--font-ocr)] text-[9px] tracking-widest px-2 py-1 border transition-colors"
              style={
                phase === opt.value
                  ? {
                      color: "rgb(var(--bg))",
                      backgroundColor: "rgb(var(--neon))",
                      borderColor: "rgb(var(--neon))",
                    }
                  : {
                      color: "rgb(var(--text-secondary))",
                      borderColor: "rgb(var(--border)/0.4)",
                    }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Load filter */}
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
        </div>

        {/* Condition toggles */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mr-2 shrink-0">
            FLAGS
          </span>
          {CONDITION_OPTIONS.map(({ key, label }) => {
            const active = conditions.has(key);
            return (
              <button
                key={key}
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
        </div>
      </div>

      {/* Count + clear */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
          {isFiltered
            ? `${filtered.length} of ${dispatches.length} dispatch${dispatches.length !== 1 ? "es" : ""}`
            : `${dispatches.length} dispatch${dispatches.length !== 1 ? "es" : ""}`}
        </div>
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] hover:text-[rgb(var(--neon))] transition-colors"
          >
            CLEAR FILTERS ✕
          </button>
        )}
      </div>

      {/* Dispatch list */}
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
