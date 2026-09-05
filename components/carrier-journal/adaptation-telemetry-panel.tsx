import { CARRIER_KPI_EMPTY } from "@/lib/data/carrier-journal";
import { formatSignedDelta } from "@/lib/data/carrier-adaptation";
import type { PublicAdaptationTelemetry } from "@/lib/types/carrier-public-telemetry";

type Props = {
  adaptation: PublicAdaptationTelemetry;
};

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-[var(--font-ocr)] text-[8px] tracking-[0.18em] text-[rgb(var(--text-meta))]">
        {label}
      </div>
      <div className="font-[var(--font-ibm)] text-sm sm:text-base text-[rgb(var(--text-color))] tabular-nums mt-0.5">
        {value}
      </div>
    </div>
  );
}

function vs(left: number | null, right: number | null, suffix = ""): string {
  if (left === null || right === null) return CARRIER_KPI_EMPTY;
  return `${left.toFixed(1)}${suffix} vs ${right.toFixed(1)}${suffix}`;
}

export function AdaptationTelemetryPanel({ adaptation }: Props) {
  const { thermalPenalty, recovery, loadDelta, resilience, heatTolerance, coolantDemand, operatorOutput } =
    adaptation;

  return (
    <div id="field-response" className="space-y-4">
      <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
        FIELD RESPONSE
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        <div className="bg-[rgb(var(--panel))] p-4 sm:p-5 flex flex-col gap-3">
          <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
            THERMAL PENALTY
          </div>
          <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] leading-none tabular-nums">
            {thermalPenalty?.energyDelta === null || thermalPenalty === null
              ? CARRIER_KPI_EMPTY
              : `${formatSignedDelta(thermalPenalty.energyDelta)} ENERGY`}
          </div>
          <p className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide">
            {thermalPenalty
              ? `AVG ENERGY DIFFERENCE ON 90°F+ HI DAYS VS SIMILAR-DISTANCE OPS · ${thermalPenalty.matchedHeatDays} MATCHED HEAT DAYS`
              : "NEEDS MATCHED 90°F+ DAYS VS SIMILAR-DISTANCE MODERATE DAYS"}
          </p>
          {thermalPenalty ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <MiniStat label="ENERGY" value={vs(thermalPenalty.normal.energy, thermalPenalty.heat.energy)} />
              <MiniStat
                label="SORENESS"
                value={vs(thermalPenalty.normal.soreness, thermalPenalty.heat.soreness)}
              />
              <MiniStat
                label="WATER/MI"
                value={vs(thermalPenalty.normal.waterOzPerMi, thermalPenalty.heat.waterOzPerMi)}
              />
              <MiniStat
                label="KCAL/MI"
                value={vs(thermalPenalty.normalKcalPerMi, thermalPenalty.heatKcalPerMi)}
              />
            </div>
          ) : null}
        </div>

        <div className="bg-[rgb(var(--panel))] p-4 sm:p-5 flex flex-col gap-3">
          <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
            POST-LOAD RESPONSE
          </div>
          <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] leading-none tabular-nums">
            {recovery
              ? `ENERGY ${formatSignedDelta(recovery.energyDelta)}`
              : CARRIER_KPI_EMPTY}
          </div>
          {recovery ? (
            <div className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] leading-none tabular-nums">
              SORENESS {formatSignedDelta(recovery.sorenessDelta)}
            </div>
          ) : null}
          <p className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide">
            {recovery
              ? `NEXT LOGGED DAY AFTER ${recovery.loadMilesThreshold}+ MI · ${recovery.pairCount} PAIRS · ${recovery.energyPctOfBaseline === null ? CARRIER_KPI_EMPTY : `${recovery.energyPctOfBaseline.toFixed(0)}% BASELINE ENERGY`}`
              : "NEEDS 12+ MI DAYS WITH A LOG WITHIN 48H"}
          </p>
          {recovery?.thermal ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <MiniStat
                label="THERMAL 24H ENERGY"
                value={formatSignedDelta(recovery.thermal.energyDelta)}
              />
              <MiniStat
                label="THERMAL 24H LOAD"
                value={formatSignedDelta(recovery.thermal.sorenessDelta)}
              />
            </div>
          ) : null}
        </div>

        <div className="bg-[rgb(var(--panel))] p-4 sm:p-5 flex flex-col gap-3">
          <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
            LOAD DELTA
          </div>
          <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] leading-none tabular-nums">
            {formatSignedDelta(loadDelta?.deltaPct ?? null, "%")}
          </div>
          <p className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide">
            WORKLOAD-CHANGE INDICATOR · NOT AN INJURY-RISK SCORE
          </p>
          {loadDelta ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <MiniStat label="CURRENT 7D LOAD" value={`${loadDelta.current7dMi.toFixed(1)} MI`} />
              <MiniStat
                label="28D WEEKLY BASELINE"
                value={`${loadDelta.weeklyBaselineMi.toFixed(1)} MI`}
              />
            </div>
          ) : (
            <p className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide">
              NEEDS 28 CALENDAR DAYS OF JOURNAL HISTORY
            </p>
          )}
        </div>

        <div className="bg-[rgb(var(--panel))] p-4 sm:p-5 flex flex-col gap-3">
          <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
            RESILIENT OPERATIONS
          </div>
          <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] leading-none tabular-nums">
            {resilience
              ? `${resilience.resilientDays} / ${resilience.tenPlusDays}`
              : CARRIER_KPI_EMPTY}
          </div>
          <p className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide">
            {resilience?.resilientPct === null || !resilience
              ? "10+ MI DAYS WITH ENERGY ≥ 7 AND SORENESS ≤ 2"
              : `${resilience.resilientPct.toFixed(1)}% OF 10+ MI DAYS · ENERGY ≥ 7 · SORENESS ≤ 2`}
          </p>
          {resilience?.firstWindow && resilience.recentWindow ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <MiniStat
                label={`FIRST ${resilience.firstWindow.size}`}
                value={
                  resilience.firstWindow.resilientPct === null
                    ? CARRIER_KPI_EMPTY
                    : `${resilience.firstWindow.resilientPct.toFixed(0)}%`
                }
              />
              <MiniStat
                label={`RECENT ${resilience.recentWindow.size}`}
                value={
                  resilience.recentWindow.resilientPct === null
                    ? CARRIER_KPI_EMPTY
                    : `${resilience.recentWindow.resilientPct.toFixed(0)}%`
                }
              />
            </div>
          ) : null}
        </div>

        <div className="bg-[rgb(var(--panel))] p-4 sm:p-5 flex flex-col gap-3">
          <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
            OBSERVED HEAT TOLERANCE
          </div>
          <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] leading-none tabular-nums">
            {heatTolerance
              ? `ENERGY ${formatSignedDelta(heatTolerance.energyDelta)}`
              : CARRIER_KPI_EMPTY}
          </div>
          {heatTolerance ? (
            <div className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] leading-none tabular-nums">
              LOAD {formatSignedDelta(heatTolerance.sorenessDelta)}
            </div>
          ) : null}
          <p className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide">
            {heatTolerance
              ? `FIRST ${heatTolerance.sampleSize} HEAT DAYS VS MOST RECENT ${heatTolerance.sampleSize} · FIELD ADAPTATION, NOT CLINICAL ACCLIMATIZATION`
              : "NEEDS MATCHED EARLY VS RECENT 90°F+ OPERATIONS"}
          </p>
          {heatTolerance ? (
            <div className="grid grid-cols-3 gap-3 pt-1">
              <MiniStat label="ENERGY" value={vs(heatTolerance.early.energy, heatTolerance.recent.energy)} />
              <MiniStat
                label="LOAD"
                value={vs(heatTolerance.early.soreness, heatTolerance.recent.soreness)}
              />
              <MiniStat
                label="COOLANT"
                value={
                  heatTolerance.coolantDeltaPct === null
                    ? CARRIER_KPI_EMPTY
                    : formatSignedDelta(heatTolerance.coolantDeltaPct, "%")
                }
              />
            </div>
          ) : null}
        </div>

        <div className="bg-[rgb(var(--panel))] p-4 sm:p-5 flex flex-col gap-3">
          <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
            COOLANT DEMAND
          </div>
          {coolantDemand ? (
            <div className="grid grid-cols-3 gap-3">
              {coolantDemand.bands.map((band) => (
                <MiniStat
                  key={band.key}
                  label={band.label}
                  value={
                    band.ozPerMi === null ? CARRIER_KPI_EMPTY : `${band.ozPerMi.toFixed(1)} OZ/MI`
                  }
                />
              ))}
            </div>
          ) : (
            <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] leading-none tabular-nums">
              {CARRIER_KPI_EMPTY}
            </div>
          )}
          <p className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide">
            {coolantDemand?.heatHydrationHitPct === null || !coolantDemand
              ? "INTAKE RATE BY ENVIRONMENTAL LOAD · WATER INTAKE IS NOT HYDRATION STATUS"
              : `HYDRATION COMPLIANCE // HEAT ${coolantDemand.heatHydrationHitPct.toFixed(0)}% · ${coolantDemand.heatHydrationHits}/${coolantDemand.heatHydrationEligible} 90°F+ DAYS HIT GOAL`}
          </p>
        </div>

        <div className="bg-[rgb(var(--panel))] p-4 sm:p-5 flex flex-col gap-3 md:col-span-2">
          <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
            OPERATOR OUTPUT
          </div>
          <p className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide">
            ENERGY AND SYSTEM LOAD BY DISTANCE BAND
          </p>
          {operatorOutput ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {operatorOutput.bands.map((band) => (
                <div key={band.key}>
                  <div className="font-[var(--font-ocr)] text-[8px] tracking-[0.18em] text-[rgb(var(--text-meta))]">
                    {band.label}
                  </div>
                  <div className="font-[var(--font-ibm)] text-sm sm:text-base text-[rgb(var(--text-color))] tabular-nums mt-0.5">
                    {band.sampleSize === 0
                      ? CARRIER_KPI_EMPTY
                      : `${band.energy?.toFixed(1) ?? CARRIER_KPI_EMPTY} E · ${band.soreness?.toFixed(1) ?? CARRIER_KPI_EMPTY} L`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-meta))]">
              {CARRIER_KPI_EMPTY}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
