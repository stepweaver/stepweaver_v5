/**
 * Derived adaptation telemetry for the public Field Journal.
 * Uses only public dispatch fields — no absolute mass, no operational volume.
 *
 * These are observed field comparisons, not clinical measurements.
 */

import { effectiveHeatF, isDerivedHeatDay } from "@/lib/carrier-journal/weather-signals";
import { CARRIER_KPI_EMPTY, type PublicFieldDispatch } from "@/lib/data/carrier-journal";
import {
  addCalendarDays,
  differenceInCalendarDays,
  round1,
} from "@/lib/data/carrier-journal-dates";
import type {
  AdaptationChannelAverages,
  ConditioningDelta,
  CoolantDemand,
  HeatTolerance,
  LoadDelta,
  OperatorOutput,
  PublicAdaptationTelemetry,
  RecoveryResponse,
  SystemResilience,
  ThermalPenalty,
} from "@/lib/types/carrier-public-telemetry";

export const ADAPTATION = {
  comparableBandPrimary: { min: 9, max: 11 },
  comparableBandFallback: { min: 8, max: 12 },
  windowMiles: [150, 200] as const,
  minSample: 3,
  heatMatchToleranceMi: 1.5,
  minOperationalMi: 6,
  minMatchedHeat: 3,
  recoveryLoadMi: 12,
  recoveryThermalMinMi: 8,
  recoveryMaxGapDays: 2,
  minRecoveryPairs: 3,
  minLoadHistoryDays: 27,
  resilienceMiles: 10,
  resilienceEnergyMin: 7,
  resilienceSorenessMax: 2,
  resilienceTrajectoryN: 20,
  resilienceTrajectoryMinN: 8,
  heatToleranceN: 5,
  heatToleranceMinN: 3,
} as const;

type DatedDispatch = PublicFieldDispatch & {
  odometerBefore: number;
  odometerAfter: number;
};

function byDateThenId(a: PublicFieldDispatch, b: PublicFieldDispatch): number {
  const dateCmp = a.date.localeCompare(b.date);
  if (dateCmp !== 0) return dateCmp;
  return a.id.localeCompare(b.id);
}

function withOdometer(dispatches: PublicFieldDispatch[]): DatedDispatch[] {
  const sorted = [...dispatches].sort(byDateThenId);
  let running = 0;
  return sorted.map((dispatch) => {
    const odometerBefore = round1(running);
    running = round1(running + dispatch.milesWalked);
    return { ...dispatch, odometerBefore, odometerAfter: running };
  });
}

function meanRound1(values: number[]): number | null {
  if (values.length === 0) return null;
  return round1(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function percentChange(recent: number | null, early: number | null): number | null {
  if (recent === null || early === null || early === 0) return null;
  return round1(((recent - early) / Math.abs(early)) * 100);
}

function waterOzPerMi(dispatch: PublicFieldDispatch): number | null {
  if (
    dispatch.waterOz === undefined ||
    !Number.isFinite(dispatch.waterOz) ||
    dispatch.milesWalked <= 0
  ) {
    return null;
  }
  return dispatch.waterOz / dispatch.milesWalked;
}

function kcalPerMi(dispatch: PublicFieldDispatch): number | null {
  if (
    dispatch.estLocomotionKcal === undefined ||
    !Number.isFinite(dispatch.estLocomotionKcal) ||
    dispatch.milesWalked <= 0
  ) {
    return null;
  }
  return dispatch.estLocomotionKcal / dispatch.milesWalked;
}

function pooledOzPerMi(dispatches: PublicFieldDispatch[]): number | null {
  const eligible = dispatches.filter((dispatch) => waterOzPerMi(dispatch) !== null);
  const miles = eligible.reduce((sum, dispatch) => sum + dispatch.milesWalked, 0);
  if (miles <= 0) return null;
  const ounces = eligible.reduce((sum, dispatch) => sum + (dispatch.waterOz ?? 0), 0);
  return round1(ounces / miles);
}

function channelAverages(dispatches: PublicFieldDispatch[]): AdaptationChannelAverages {
  const waterRates = dispatches
    .map(waterOzPerMi)
    .filter((value): value is number => value !== null);
  return {
    energy: meanRound1(dispatches.map((d) => d.energy)),
    soreness: meanRound1(dispatches.map((d) => d.soreness)),
    waterOzPerMi: meanRound1(waterRates),
  };
}

function inBand(miles: number, min: number, max: number): boolean {
  return miles >= min && miles <= max;
}

function isModerateWeather(dispatch: PublicFieldDispatch): boolean {
  return !isDerivedHeatDay(dispatch);
}

function hasMeasuredNonHeat(dispatch: PublicFieldDispatch): boolean {
  return Number.isFinite(effectiveHeatF(dispatch)) && !isDerivedHeatDay(dispatch);
}

type MileWindow = {
  early: DatedDispatch[];
  recent: DatedDispatch[];
  windowMiles: number;
  totalMiles: number;
};

function splitByMileWindow(rows: DatedDispatch[], windowMiles: number): MileWindow | null {
  if (rows.length === 0) return null;
  const totalMiles = rows[rows.length - 1].odometerAfter;
  if (totalMiles <= 0) return null;

  const recentCutoff = Math.max(0, round1(totalMiles - windowMiles));
  const earlyAll = rows.filter((row) => row.odometerBefore < windowMiles);
  const recentAll = rows.filter((row) => row.odometerAfter > recentCutoff);

  const earlyIds = new Set(earlyAll.map((row) => row.id));
  const overlapIds = new Set(recentAll.filter((row) => earlyIds.has(row.id)).map((row) => row.id));

  const early = overlapIds.size > 0 ? earlyAll.filter((row) => !overlapIds.has(row.id)) : earlyAll;
  const recent =
    overlapIds.size > 0 ? recentAll.filter((row) => !overlapIds.has(row.id)) : recentAll;

  if (early.length === 0 || recent.length === 0) return null;
  return { early, recent, windowMiles, totalMiles };
}

function pickComparable(
  early: DatedDispatch[],
  recent: DatedDispatch[],
  band: { min: number; max: number },
  moderateOnly: boolean
): { early: DatedDispatch[]; recent: DatedDispatch[] } {
  const filter = (row: DatedDispatch) =>
    inBand(row.milesWalked, band.min, band.max) && (!moderateOnly || isModerateWeather(row));
  return {
    early: early.filter(filter),
    recent: recent.filter(filter),
  };
}

function computeConditioningDelta(dispatches: PublicFieldDispatch[]): ConditioningDelta | null {
  const rows = withOdometer(dispatches);
  const bands = [ADAPTATION.comparableBandPrimary, ADAPTATION.comparableBandFallback];
  const weatherModes = [true, false];

  for (const windowMiles of ADAPTATION.windowMiles) {
    const split = splitByMileWindow(rows, windowMiles);
    if (!split) continue;

    for (const moderateOnly of weatherModes) {
      for (const band of bands) {
        const picked = pickComparable(split.early, split.recent, band, moderateOnly);
        if (
          picked.early.length < ADAPTATION.minSample ||
          picked.recent.length < ADAPTATION.minSample
        ) {
          continue;
        }

        const early = channelAverages(picked.early);
        const recent = channelAverages(picked.recent);
        return {
          bandMinMi: band.min,
          bandMaxMi: band.max,
          moderateWeatherOnly: moderateOnly,
          windowMiles: split.windowMiles,
          totalMiles: split.totalMiles,
          earlySampleSize: picked.early.length,
          recentSampleSize: picked.recent.length,
          earlyAtMi: meanRound1(picked.early.map((row) => row.odometerAfter)) ?? 0,
          recentAtMi: meanRound1(picked.recent.map((row) => row.odometerAfter)) ?? 0,
          early,
          recent,
          energyDeltaPct: percentChange(recent.energy, early.energy),
          sorenessDeltaPct: percentChange(recent.soreness, early.soreness),
          coolantDeltaPct: percentChange(recent.waterOzPerMi, early.waterOzPerMi),
        };
      }
    }
  }

  return null;
}

type HeatMatch = {
  heat: PublicFieldDispatch;
  normalEnergy: number;
  normalSoreness: number;
  heatWater: number | null;
  normalWater: number | null;
  heatKcal: number | null;
  normalKcal: number | null;
};

function computeThermalPenalty(dispatches: PublicFieldDispatch[]): ThermalPenalty | null {
  const operational = dispatches.filter((d) => d.milesWalked >= ADAPTATION.minOperationalMi);
  const heatDays = operational.filter(isDerivedHeatDay);
  const normalDays = operational.filter(hasMeasuredNonHeat);
  if (heatDays.length < ADAPTATION.minMatchedHeat || normalDays.length === 0) return null;

  const matches: HeatMatch[] = [];
  for (const heat of heatDays) {
    const normals = normalDays.filter(
      (normal) => Math.abs(normal.milesWalked - heat.milesWalked) <= ADAPTATION.heatMatchToleranceMi
    );
    if (normals.length === 0) continue;

    const heatWater = waterOzPerMi(heat);
    const heatKcal = kcalPerMi(heat);
    const normalWaterValues = normals
      .map(waterOzPerMi)
      .filter((value): value is number => value !== null);
    const normalKcalValues = normals
      .map(kcalPerMi)
      .filter((value): value is number => value !== null);
    const normalEnergy =
      normals.reduce((sum, day) => sum + day.energy, 0) / normals.length;
    const normalSoreness =
      normals.reduce((sum, day) => sum + day.soreness, 0) / normals.length;
    const normalWater =
      normalWaterValues.length > 0
        ? normalWaterValues.reduce((sum, value) => sum + value, 0) / normalWaterValues.length
        : null;
    const normalKcal =
      normalKcalValues.length > 0
        ? normalKcalValues.reduce((sum, value) => sum + value, 0) / normalKcalValues.length
        : null;

    matches.push({
      heat,
      normalEnergy,
      normalSoreness,
      heatWater,
      normalWater,
      heatKcal,
      normalKcal,
    });
  }

  if (matches.length < ADAPTATION.minMatchedHeat) return null;

  const waterPairs = matches.filter(
    (match) => match.heatWater !== null && match.normalWater !== null
  );
  const kcalPairs = matches.filter(
    (match) => match.heatKcal !== null && match.normalKcal !== null
  );

  const heatAvgs = channelAverages(matches.map((match) => match.heat));
  const normal: AdaptationChannelAverages = {
    energy: meanRound1(matches.map((match) => match.normalEnergy)),
    soreness: meanRound1(matches.map((match) => match.normalSoreness)),
    waterOzPerMi: meanRound1(
      matches
        .map((match) => match.normalWater)
        .filter((value): value is number => value !== null)
    ),
  };

  return {
    matchedHeatDays: matches.length,
    energyDelta: meanRound1(matches.map((match) => match.heat.energy - match.normalEnergy)),
    sorenessDelta: meanRound1(
      matches.map((match) => match.heat.soreness - match.normalSoreness)
    ),
    waterOzPerMiDelta:
      waterPairs.length >= ADAPTATION.minMatchedHeat
        ? meanRound1(
            waterPairs.map(
              (match) => (match.heatWater as number) - (match.normalWater as number)
            )
          )
        : null,
    kcalPerMiDelta:
      kcalPairs.length >= ADAPTATION.minMatchedHeat
        ? meanRound1(
            kcalPairs.map((match) => (match.heatKcal as number) - (match.normalKcal as number))
          )
        : null,
    heat: heatAvgs,
    normal,
    heatKcalPerMi: meanRound1(
      matches.map((match) => match.heatKcal).filter((value): value is number => value !== null)
    ),
    normalKcalPerMi: meanRound1(
      matches.map((match) => match.normalKcal).filter((value): value is number => value !== null)
    ),
  };
}

function nextLoggedWithinGap(
  ordered: PublicFieldDispatch[],
  index: number
): PublicFieldDispatch | null {
  const current = ordered[index];
  for (let i = index + 1; i < ordered.length; i += 1) {
    const candidate = ordered[i];
    const gap = differenceInCalendarDays(candidate.date, current.date);
    if (gap <= 0) continue;
    if (gap > ADAPTATION.recoveryMaxGapDays) return null;
    return candidate;
  }
  return null;
}

function recoveryFromTriggers(
  ordered: PublicFieldDispatch[],
  isTrigger: (dispatch: PublicFieldDispatch) => boolean
): {
  pairCount: number;
  energyDelta: number | null;
  sorenessDelta: number | null;
  energyPctOfBaseline: number | null;
  post: { energy: number | null; soreness: number | null };
  baseline: { energy: number | null; soreness: number | null };
} | null {
  const postDays: PublicFieldDispatch[] = [];
  const postDates = new Set<string>();

  for (let i = 0; i < ordered.length; i += 1) {
    if (!isTrigger(ordered[i])) continue;
    const next = nextLoggedWithinGap(ordered, i);
    if (!next || postDates.has(next.date)) continue;
    postDays.push(next);
    postDates.add(next.date);
  }

  if (postDays.length < ADAPTATION.minRecoveryPairs) return null;

  const baselineDays = ordered.filter((dispatch) => !postDates.has(dispatch.date));
  const baselinePool = baselineDays.length >= ADAPTATION.minRecoveryPairs ? baselineDays : ordered;
  const post = {
    energy: meanRound1(postDays.map((d) => d.energy)),
    soreness: meanRound1(postDays.map((d) => d.soreness)),
  };
  const baseline = {
    energy: meanRound1(baselinePool.map((d) => d.energy)),
    soreness: meanRound1(baselinePool.map((d) => d.soreness)),
  };

  return {
    pairCount: postDays.length,
    energyDelta:
      post.energy !== null && baseline.energy !== null ? round1(post.energy - baseline.energy) : null,
    sorenessDelta:
      post.soreness !== null && baseline.soreness !== null
        ? round1(post.soreness - baseline.soreness)
        : null,
    energyPctOfBaseline:
      post.energy !== null && baseline.energy !== null && baseline.energy !== 0
        ? round1((post.energy / baseline.energy) * 100)
        : null,
    post,
    baseline,
  };
}

function computeRecoveryResponse(dispatches: PublicFieldDispatch[]): RecoveryResponse | null {
  const ordered = [...dispatches].sort(byDateThenId);
  const distance = recoveryFromTriggers(
    ordered,
    (dispatch) => dispatch.milesWalked >= ADAPTATION.recoveryLoadMi
  );
  if (!distance) return null;

  const thermalRaw = recoveryFromTriggers(
    ordered,
    (dispatch) => isDerivedHeatDay(dispatch) && dispatch.milesWalked >= ADAPTATION.recoveryThermalMinMi
  );

  return {
    loadMilesThreshold: ADAPTATION.recoveryLoadMi,
    pairCount: distance.pairCount,
    energyDelta: distance.energyDelta,
    sorenessDelta: distance.sorenessDelta,
    energyPctOfBaseline: distance.energyPctOfBaseline,
    post: distance.post,
    baseline: distance.baseline,
    thermal: thermalRaw
      ? {
          pairCount: thermalRaw.pairCount,
          energyDelta: thermalRaw.energyDelta,
          sorenessDelta: thermalRaw.sorenessDelta,
        }
      : null,
  };
}

function milesInWindow(
  dispatches: PublicFieldDispatch[],
  start: string,
  end: string
): number {
  return round1(
    dispatches
      .filter((dispatch) => dispatch.date >= start && dispatch.date <= end)
      .reduce((sum, dispatch) => sum + dispatch.milesWalked, 0)
  );
}

function computeLoadDelta(dispatches: PublicFieldDispatch[]): LoadDelta | null {
  if (dispatches.length === 0) return null;
  const ordered = [...dispatches].sort(byDateThenId);
  const asOf = ordered[ordered.length - 1].date;
  const first = ordered[0].date;
  if (differenceInCalendarDays(asOf, first) < ADAPTATION.minLoadHistoryDays) return null;

  const start7 = addCalendarDays(asOf, -6);
  const start28 = addCalendarDays(asOf, -27);
  const current7dMi = milesInWindow(dispatches, start7, asOf);
  const miles28 = milesInWindow(dispatches, start28, asOf);
  if (miles28 <= 0) return null;

  const weeklyBaselineMi = round1(miles28 / 4);
  if (weeklyBaselineMi <= 0) return null;

  return {
    current7dMi,
    weeklyBaselineMi,
    deltaPct: round1((current7dMi / weeklyBaselineMi - 1) * 100),
    asOf,
  };
}

function isResilientDay(dispatch: PublicFieldDispatch): boolean {
  return (
    dispatch.milesWalked >= ADAPTATION.resilienceMiles &&
    dispatch.energy >= ADAPTATION.resilienceEnergyMin &&
    dispatch.soreness <= ADAPTATION.resilienceSorenessMax
  );
}

function windowResilience(days: PublicFieldDispatch[]): { size: number; resilientPct: number | null } {
  const resilient = days.filter(isResilientDay).length;
  return {
    size: days.length,
    resilientPct: days.length > 0 ? round1((resilient / days.length) * 100) : null,
  };
}

function computeSystemResilience(dispatches: PublicFieldDispatch[]): SystemResilience | null {
  const tenPlus = [...dispatches]
    .filter((dispatch) => dispatch.milesWalked >= ADAPTATION.resilienceMiles)
    .sort(byDateThenId);
  if (tenPlus.length === 0) return null;

  const resilientDays = tenPlus.filter(isResilientDay).length;
  const n = Math.min(ADAPTATION.resilienceTrajectoryN, Math.floor(tenPlus.length / 2));
  const trajectory =
    n >= ADAPTATION.resilienceTrajectoryMinN
      ? {
          firstWindow: windowResilience(tenPlus.slice(0, n)),
          recentWindow: windowResilience(tenPlus.slice(-n)),
        }
      : { firstWindow: null, recentWindow: null };

  return {
    resilientDays,
    tenPlusDays: tenPlus.length,
    resilientPct: round1((resilientDays / tenPlus.length) * 100),
    firstWindow: trajectory.firstWindow,
    recentWindow: trajectory.recentWindow,
  };
}

function computeHeatTolerance(dispatches: PublicFieldDispatch[]): HeatTolerance | null {
  const heatDays = [...dispatches]
    .filter((dispatch) => isDerivedHeatDay(dispatch) && dispatch.milesWalked >= ADAPTATION.minOperationalMi)
    .sort(byDateThenId);
  const n = Math.min(ADAPTATION.heatToleranceN, Math.floor(heatDays.length / 2));
  if (n < ADAPTATION.heatToleranceMinN) return null;

  const earlyDays = heatDays.slice(0, n);
  const recentDays = heatDays.slice(-n);
  const early = channelAverages(earlyDays);
  const recent = channelAverages(recentDays);

  return {
    sampleSize: n,
    early,
    recent,
    energyDelta:
      recent.energy !== null && early.energy !== null ? round1(recent.energy - early.energy) : null,
    sorenessDelta:
      recent.soreness !== null && early.soreness !== null
        ? round1(recent.soreness - early.soreness)
        : null,
    coolantDeltaPct: percentChange(recent.waterOzPerMi, early.waterOzPerMi),
  };
}

function coolantBandOf(
  dispatch: PublicFieldDispatch
): "cool" | "warm" | "hot" | null {
  if (isDerivedHeatDay(dispatch)) return "hot";
  const heat = effectiveHeatF(dispatch);
  if (!Number.isFinite(heat)) return null;
  if (heat < 80) return "cool";
  if (heat < 90) return "warm";
  return "hot";
}

function computeCoolantDemand(dispatches: PublicFieldDispatch[]): CoolantDemand | null {
  const walking = dispatches.filter((dispatch) => dispatch.milesWalked > 0);
  const grouped = {
    cool: walking.filter((dispatch) => coolantBandOf(dispatch) === "cool"),
    warm: walking.filter((dispatch) => coolantBandOf(dispatch) === "warm"),
    hot: walking.filter((dispatch) => coolantBandOf(dispatch) === "hot"),
  };

  const bands = (
    [
      { key: "cool" as const, label: "<80°F", days: grouped.cool },
      { key: "warm" as const, label: "80–89°F", days: grouped.warm },
      { key: "hot" as const, label: "90°F+ HI", days: grouped.hot },
    ] as const
  ).map((band) => {
    const withWater = band.days.filter((dispatch) => waterOzPerMi(dispatch) !== null);
    return {
      key: band.key,
      label: band.label,
      ozPerMi: pooledOzPerMi(band.days),
      sampleSize: withWater.length,
    };
  });

  if (bands.every((band) => band.ozPerMi === null)) return null;

  const heatHydration = grouped.hot.filter(
    (dispatch) =>
      dispatch.waterOz !== undefined &&
      dispatch.hydrationGoalOz !== undefined &&
      Number.isFinite(dispatch.waterOz) &&
      Number.isFinite(dispatch.hydrationGoalOz)
  );
  const heatHydrationHits = heatHydration.filter(
    (dispatch) => (dispatch.waterOz ?? 0) >= (dispatch.hydrationGoalOz ?? 0)
  ).length;

  return {
    bands,
    heatHydrationHitPct:
      heatHydration.length > 0
        ? round1((heatHydrationHits / heatHydration.length) * 100)
        : null,
    heatHydrationHits,
    heatHydrationEligible: heatHydration.length,
  };
}

function computeOperatorOutput(dispatches: PublicFieldDispatch[]): OperatorOutput | null {
  const walking = dispatches.filter((dispatch) => dispatch.milesWalked > 0);
  if (walking.length === 0) return null;

  const defs = [
    {
      key: "<8" as const,
      label: "<8 MI",
      include: (miles: number) => miles < 8,
    },
    {
      key: "8-10" as const,
      label: "8–10 MI",
      include: (miles: number) => miles >= 8 && miles < 10,
    },
    {
      key: "10-12" as const,
      label: "10–12 MI",
      include: (miles: number) => miles >= 10 && miles < 12,
    },
    {
      key: "12+" as const,
      label: "12+ MI",
      include: (miles: number) => miles >= 12,
    },
  ];

  const bands = defs.map((def) => {
    const days = walking.filter((dispatch) => def.include(dispatch.milesWalked));
    return {
      key: def.key,
      label: def.label,
      sampleSize: days.length,
      energy: meanRound1(days.map((day) => day.energy)),
      soreness: meanRound1(days.map((day) => day.soreness)),
    };
  });

  if (bands.every((band) => band.sampleSize === 0)) return null;
  return { bands };
}

export function computePublicAdaptationTelemetry(
  dispatches: PublicFieldDispatch[]
): PublicAdaptationTelemetry {
  return {
    conditioning: computeConditioningDelta(dispatches),
    thermalPenalty: computeThermalPenalty(dispatches),
    recovery: computeRecoveryResponse(dispatches),
    loadDelta: computeLoadDelta(dispatches),
    resilience: computeSystemResilience(dispatches),
    heatTolerance: computeHeatTolerance(dispatches),
    coolantDemand: computeCoolantDemand(dispatches),
    operatorOutput: computeOperatorOutput(dispatches),
  };
}

export function formatSignedDelta(
  value: number | null,
  suffix = "",
  digits = 1
): string {
  if (value === null) return CARRIER_KPI_EMPTY;
  const body = Math.abs(value).toFixed(digits);
  if (value > 0) return `+${body}${suffix}`;
  if (value < 0) return `-${body}${suffix}`;
  return `${body}${suffix}`;
}
