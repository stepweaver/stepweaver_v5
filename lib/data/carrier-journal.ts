/** Field Journal personal fitness data. Operational volume and raw biometrics stay private. */

import {
  classifyDpsForEntry,
  computeDpsPerMile,
  isVeryHeavyDpsRatio,
  type DpsHistoryEntry,
} from "@/lib/dps";
import {
  classifyMailLoadForEntry,
  type MailLoadTier,
} from "@/lib/carrier-journal/mail-load";
import {
  estimateLocomotionEnergyForDispatch,
  type WalkingEnergyMethod,
} from "@/lib/carrier-journal/walking-energy";
import {
  isDerivedHeatDay,
  isDerivedWeatherDay,
} from "@/lib/carrier-journal/weather-signals";

export type { WalkingEnergyMethod };

export const CARRIER_KPI_EMPTY = "n/a";

export type { MailLoadTier } from "@/lib/carrier-journal/mail-load";

export type MailLoad = "light" | "normal" | "heavy" | "brutal";

export type WeightPublicMode = "hidden" | "change-only" | "current-and-change";

export type CarrierPhase = "break-in" | "adapting" | "building" | "regular";

/** Private sentiment toward a worked route. Never rendered in public display. */
export type RoutePreference = "prefer" | "like" | "dislike";

/**
 * Keys that must never cross the RSC → client boundary on the public Field Journal.
 * Used by toPublicFieldDispatch and regression tests.
 */
export const PRIVATE_FIELD_DISPATCH_KEYS = [
  "weightLbs",
  "weightPublicMode",
  "dpsCount",
  "dpsRatio",
  "parcels",
  "parcelRatio",
  "mailDayContext",
  "mailLoad",
  "mailLoadTier",
  "mailLoadCompositeRatio",
  "routeCode",
  "routePreference",
  "steps",
  "bodyNote",
  "recoveryNote",
  "phase",
  "tags",
  "goodSamaritanAct",
  "movingMinutes",
  "loadKg",
  "gradePercent",
  "terrainFactor",
] as const;

export type PrivateFieldDispatchKey = (typeof PRIVATE_FIELD_DISPATCH_KEYS)[number];

/** Public fitness projection safe to serialize into client components. */
export type PublicFieldDispatch = {
  id: string;
  date: string;
  title: string;
  milesWalked: number;
  soreness: number; // 1–10
  energy: number; // 1–10
  mood: number; // 1–10
  weather?: string;
  /** Peak air temperature (°F) during shift window (9 AM–7 PM). */
  temperatureF?: number;
  /** Peak heat index (°F) during shift window (9 AM–7 PM). */
  heatIndexF?: number;
  /** Average heat index (°F) across shift hours. */
  avgHeatIndexF?: number;
  /** Precipitation inches during shift window (informational; does not set rain flag). */
  precipitationIn?: number;
  heatDay?: boolean;
  /** Manual checkbox: got rained on during the walking day. */
  rain?: boolean;
  storm?: boolean;
  snow?: boolean;
  dogEncounter?: boolean;
  /**
   * Manual incident only: stepped in dog poop on this day.
   * Leave unset/false on clean days. Clean-streak badges count logged days without this flag.
   */
  steppedInDogPoop?: boolean;
  publicNote: string;
  waterOz?: number;
  hydrationGoalOz?: number;
  /** Estimated walking energy for this day. Derived server-side; mass stays private. */
  estLocomotionKcal?: number;
  locomotionMethod?: WalkingEnergyMethod;
};

export type CarrierDispatch = PublicFieldDispatch & {
  /** Steps are logged internally but not surfaced in public UI or KPIs. */
  steps?: number;
  /** @deprecated Legacy internal mail-load label; not stored for public reads. */
  mailLoad?: MailLoad;
  weightLbs?: number;
  weightPublicMode?: WeightPublicMode;
  bodyNote?: string;
  recoveryNote?: string;
  phase?: CarrierPhase;
  /** Semantic tags for milestone evaluation and reflection filtering. */
  tags?: string[];
  /** Optional flag for a Good Samaritan act logged during the dispatch. */
  goodSamaritanAct?: boolean;
  /** Compact route identifier. Private; never sent to public clients. */
  routeCode?: string;
  /** Private sentiment toward this route. Never rendered in public-facing UI. */
  routePreference?: RoutePreference;
  /** Manually entered DPS piece count for the day. Private. */
  dpsCount?: number;
  /** App-calculated ratio vs recent DPS baseline. Private. */
  dpsRatio?: number;
  /** Manually entered parcel count for the day. Private. */
  parcels?: number;
  /** App-calculated ratio vs recent parcel baseline. Private. */
  parcelRatio?: number;
  /** Computed from DPS + parcel volume vs personal baseline. Private. */
  mailLoadTier?: MailLoadTier;
  /** Blended DPS/parcel ratio used for mailLoadTier. Private. */
  mailLoadCompositeRatio?: number;
  /** Optional tags explaining why a day felt heavier or lighter. Private. */
  mailDayContext?: string[];
  /** Walking/moving minutes on route, not the whole shift. Private model input. */
  movingMinutes?: number;
  /** External carried load in kg. Private model input. */
  loadKg?: number;
  /** Average route grade in percent. Negative is downhill. Private model input. */
  gradePercent?: number;
  /** Terrain factor; 1.0 = hard surface. Private model input. */
  terrainFactor?: number;
};

/**
 * Allowlist projection: only expressly public fitness fields survive.
 * Call this before any Field Journal payload reaches a client component.
 */
export function toPublicFieldDispatch(
  dispatch: CarrierDispatch,
  series: CarrierDispatch[] = [dispatch]
): PublicFieldDispatch {
  const locomotion = estimateLocomotionEnergyForDispatch(series, dispatch);

  return {
    id: dispatch.id,
    date: dispatch.date,
    title: dispatch.title,
    milesWalked: dispatch.milesWalked,
    soreness: dispatch.soreness,
    energy: dispatch.energy,
    mood: dispatch.mood,
    ...(dispatch.weather !== undefined && { weather: dispatch.weather }),
    ...(dispatch.temperatureF !== undefined && { temperatureF: dispatch.temperatureF }),
    ...(dispatch.heatIndexF !== undefined && { heatIndexF: dispatch.heatIndexF }),
    ...(dispatch.avgHeatIndexF !== undefined && { avgHeatIndexF: dispatch.avgHeatIndexF }),
    ...(dispatch.precipitationIn !== undefined && {
      precipitationIn: dispatch.precipitationIn,
    }),
    ...(dispatch.heatDay !== undefined && { heatDay: dispatch.heatDay }),
    ...(dispatch.rain !== undefined && { rain: dispatch.rain }),
    ...(dispatch.storm !== undefined && { storm: dispatch.storm }),
    ...(dispatch.snow !== undefined && { snow: dispatch.snow }),
    ...(dispatch.dogEncounter !== undefined && { dogEncounter: dispatch.dogEncounter }),
    ...(dispatch.steppedInDogPoop !== undefined && {
      steppedInDogPoop: dispatch.steppedInDogPoop,
    }),
    publicNote: dispatch.publicNote,
    ...(dispatch.waterOz !== undefined && { waterOz: dispatch.waterOz }),
    ...(dispatch.hydrationGoalOz !== undefined && {
      hydrationGoalOz: dispatch.hydrationGoalOz,
    }),
    ...(locomotion && {
      estLocomotionKcal: locomotion.kcal,
      locomotionMethod: locomotion.method,
    }),
  };
}

export function toPublicFieldDispatches(
  dispatches: CarrierDispatch[]
): PublicFieldDispatch[] {
  return dispatches.map((dispatch) => toPublicFieldDispatch(dispatch, dispatches));
}

export type CarrierKpi = {
  systemLabel: string;
  label: string;
  value: string;
  detail?: string;
};

export type CarrierTotals = {
  daysLogged: number;
  totalMiles: number;
  avgMilesPerDay: number;
  totalSteps: number;
  heatDays: number;
  weatherDays: number;
  heavyMailDays: number;
  avgSoreness: number;
  avgEnergy: number;
  avgMood: number;
  totalWaterOz: number;
  avgWaterOz: number;
  hydrationGoalHitDays: number;
  hydrationGoalHitRate: number;
  startingWeightLbs?: number;
  latestWeightLbs?: number;
  weightChangeLbs?: number;
  avgDpsCount?: number;
  medianDpsCount?: number;
  highestDpsCount?: number;
  heavyDaysCount?: number;
  veryHeavyDaysCount?: number;
  latestDpsRatio?: number;
  latestDpsPerMile?: number;
};

export type PublicWeightTrend = {
  value: string;
  detail?: string;
};

export function computeTotalsFromDispatches(dispatches: CarrierDispatch[]): CarrierTotals {
  const count = dispatches.length;
  if (count === 0) {
    return {
      daysLogged: 0,
      totalMiles: 0,
      avgMilesPerDay: 0,
      totalSteps: 0,
      heatDays: 0,
      weatherDays: 0,
      heavyMailDays: 0,
      avgSoreness: 0,
      avgEnergy: 0,
      avgMood: 0,
      totalWaterOz: 0,
      avgWaterOz: 0,
      hydrationGoalHitDays: 0,
      hydrationGoalHitRate: 0,
    };
  }

  const enriched = enrichDispatchesFields(dispatches);
  const totalMiles = dispatches.reduce((s, d) => s + d.milesWalked, 0);
  const totalSteps = dispatches.reduce((s, d) => s + (d.steps ?? 0), 0);
  const heatDays = enriched.filter(isDerivedHeatDay).length;
  const weatherDays = enriched.filter(isDerivedWeatherDay).length;
  const heavyMailDays = enriched.filter((d) => d.mailLoadTier === "heavy").length;
  const avgSoreness = dispatches.reduce((s, d) => s + d.soreness, 0) / count;
  const avgEnergy = dispatches.reduce((s, d) => s + d.energy, 0) / count;
  const avgMood = dispatches.reduce((s, d) => s + d.mood, 0) / count;

  const waterEntries = dispatches.filter((d) => d.waterOz !== undefined);
  const totalWaterOz = waterEntries.reduce((s, d) => s + (d.waterOz ?? 0), 0);
  const avgWaterOz =
    waterEntries.length > 0
      ? Math.round((totalWaterOz / waterEntries.length) * 10) / 10
      : 0;

  const hydrationEligible = dispatches.filter(
    (d) => d.waterOz !== undefined && d.hydrationGoalOz !== undefined
  );
  const hydrationGoalHitDays = hydrationEligible.filter(
    (d) => (d.waterOz ?? 0) >= (d.hydrationGoalOz ?? 0)
  ).length;
  const hydrationGoalHitRate =
    hydrationEligible.length > 0
      ? Math.round((hydrationGoalHitDays / hydrationEligible.length) * 1000) / 10
      : 0;

  const weightEntries = [...dispatches]
    .filter((d) => d.weightLbs !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let startingWeightLbs: number | undefined;
  let latestWeightLbs: number | undefined;
  let weightChangeLbs: number | undefined;
  if (weightEntries.length > 0) {
    startingWeightLbs = weightEntries[0].weightLbs;
    latestWeightLbs = weightEntries[weightEntries.length - 1].weightLbs;
    weightChangeLbs =
      Math.round(((latestWeightLbs ?? 0) - (startingWeightLbs ?? 0)) * 10) / 10;
  }

  const dpsStats = computeDpsStats(enriched);

  return {
    daysLogged: count,
    totalMiles: Math.round(totalMiles * 10) / 10,
    avgMilesPerDay: Math.round((totalMiles / count) * 10) / 10,
    totalSteps,
    heatDays,
    weatherDays,
    heavyMailDays,
    avgSoreness: Math.round(avgSoreness * 10) / 10,
    avgEnergy: Math.round(avgEnergy * 10) / 10,
    avgMood: Math.round(avgMood * 10) / 10,
    totalWaterOz,
    avgWaterOz,
    hydrationGoalHitDays,
    hydrationGoalHitRate,
    ...(startingWeightLbs !== undefined && { startingWeightLbs }),
    ...(latestWeightLbs !== undefined && { latestWeightLbs }),
    ...(weightChangeLbs !== undefined && { weightChangeLbs }),
    ...dpsStats,
  };
}

function isValidDpsCount(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function enrichDispatchFields(
  dispatches: CarrierDispatch[],
  dispatch: CarrierDispatch
): CarrierDispatch {
  const history: DpsHistoryEntry[] = dispatches.map((entry) => ({
    date: entry.date,
    id: entry.id,
    dpsCount: entry.dpsCount,
  }));

  let enriched: CarrierDispatch = dispatch;

  if (isValidDpsCount(dispatch.dpsCount) && dispatch.dpsRatio === undefined) {
    const classification = classifyDpsForEntry(history, {
      date: dispatch.date,
      id: dispatch.id,
      dpsCount: dispatch.dpsCount,
    });

    enriched = {
      ...enriched,
      ...(classification.ratio != null && {
        dpsRatio: Math.round(classification.ratio * 1000) / 1000,
      }),
    };
  }

  const mailHistory = dispatches.map((entry) => ({
    date: entry.date,
    id: entry.id,
    dpsCount: entry.dpsCount,
    parcels: entry.parcels,
  }));

  const mailLoad = classifyMailLoadForEntry(mailHistory, {
    date: dispatch.date,
    id: dispatch.id,
    dpsCount: dispatch.dpsCount,
    parcels: dispatch.parcels,
  });

  return {
    ...enriched,
    ...(mailLoad.parcels.ratio != null && {
      parcelRatio: Math.round(mailLoad.parcels.ratio * 1000) / 1000,
    }),
    ...(mailLoad.compositeRatio != null && {
      mailLoadCompositeRatio: Math.round(mailLoad.compositeRatio * 1000) / 1000,
    }),
    ...(mailLoad.tier && { mailLoadTier: mailLoad.tier }),
  };
}

/** @deprecated Use enrichDispatchFields */
export function enrichDispatchDpsFields(
  dispatches: CarrierDispatch[],
  dispatch: CarrierDispatch
): CarrierDispatch {
  return enrichDispatchFields(dispatches, dispatch);
}

export function enrichDispatchesFields(dispatches: CarrierDispatch[]): CarrierDispatch[] {
  return dispatches.map((dispatch) => enrichDispatchFields(dispatches, dispatch));
}

/** @deprecated Use enrichDispatchesFields */
export function enrichDispatchesDpsFields(dispatches: CarrierDispatch[]): CarrierDispatch[] {
  return enrichDispatchesFields(dispatches);
}

export function computeDpsStats(dispatches: CarrierDispatch[]): Partial<CarrierTotals> {
  const dpsEntries = dispatches.filter((d) => isValidDpsCount(d.dpsCount));
  if (dpsEntries.length === 0) {
    return {};
  }

  const counts = dpsEntries.map((d) => d.dpsCount as number);
  const sortedCounts = [...counts].sort((a, b) => a - b);
  const middle = Math.floor(sortedCounts.length / 2);
  const medianDpsCount =
    sortedCounts.length % 2 === 0
      ? Math.round(((sortedCounts[middle - 1] + sortedCounts[middle]) / 2) * 10) / 10
      : sortedCounts[middle];

  const enriched = enrichDispatchesFields(dispatches);
  const heavyDaysCount = enriched.filter((d) => d.mailLoadTier === "heavy").length;
  const veryHeavyDaysCount = enriched.filter((d) => isVeryHeavyDpsRatio(d.dpsRatio)).length;

  const latestWithDps = [...enriched]
    .filter((d) => isValidDpsCount(d.dpsCount))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const latestDpsPerMile = latestWithDps
    ? computeDpsPerMile(latestWithDps.dpsCount, latestWithDps.milesWalked) ?? undefined
    : undefined;

  return {
    avgDpsCount: Math.round((counts.reduce((sum, value) => sum + value, 0) / counts.length) * 10) / 10,
    medianDpsCount,
    highestDpsCount: Math.max(...counts),
    heavyDaysCount,
    veryHeavyDaysCount,
    ...(latestWithDps?.dpsRatio != null && { latestDpsRatio: latestWithDps.dpsRatio }),
    ...(latestDpsPerMile !== undefined && { latestDpsPerMile }),
  };
}

export function formatPublicWeightTrend(totals: CarrierTotals): PublicWeightTrend {
  const change = totals.weightChangeLbs;
  if (change === undefined || totals.startingWeightLbs === undefined) {
    return { value: CARRIER_KPI_EMPTY, detail: "Log weight on Monday weigh-ins" };
  }

  if (change === 0) {
    return { value: "No net change", detail: "Since first Monday weigh-in" };
  }

  const lost = -change;
  if (lost > 0) {
    return {
      value: `${lost.toFixed(1)} lbs lost`,
      detail: "Since first Monday weigh-in",
    };
  }

  return {
    value: `${Math.abs(lost).toFixed(1)} lbs gained`,
    detail: "Since first Monday weigh-in",
  };
}


export function totalsToKpis(t: CarrierTotals): CarrierKpi[] {
  const weightTrend = formatPublicWeightTrend(t);

  const kpis: CarrierKpi[] = [
    {
      systemLabel: "ODOMETER",
      label: "Total miles",
      value: `${t.totalMiles} mi`,
      detail: "Cumulative walking distance",
    },
    {
      systemLabel: "DAILY RANGE",
      label: "Avg miles / day",
      value: `${t.avgMilesPerDay} mi`,
      detail: "Per logged day",
    },
    {
      systemLabel: "COOLANT",
      label: "Avg water / day",
      value: t.avgWaterOz > 0 ? `${t.avgWaterOz} oz` : CARRIER_KPI_EMPTY,
      detail: "Average intake on logged hydration days",
    },
    {
      systemLabel: "MASS DELTA",
      label: "Weight lost",
      value: weightTrend.value,
      detail: weightTrend.detail,
    },
    {
      systemLabel: "SYSTEM LOAD",
      label: "Avg soreness",
      value: `${t.avgSoreness} / 10`,
      detail: "Physical load marker",
    },
    {
      systemLabel: "POWER",
      label: "Avg energy",
      value: `${t.avgEnergy} / 10`,
      detail: "Self-reported end-of-day",
    },
    {
      systemLabel: "MORALE",
      label: "Avg mood",
      value: `${t.avgMood} / 10`,
      detail: "Morale signal",
    },
    {
      systemLabel: "ENVIRONMENT",
      label: "Heat days",
      value: String(t.heatDays),
      detail: `Peak HI ≥ 90°F · ${t.weatherDays} weather days`,
    },
    {
      systemLabel: "LOG DAYS",
      label: "Days logged",
      value: String(t.daysLogged),
      detail: "Active walking days",
    },
    {
      systemLabel: "COOLANT HIT RATE",
      label: "Hydration goal hit rate",
      value: t.hydrationGoalHitRate > 0 ? `${t.hydrationGoalHitRate}%` : CARRIER_KPI_EMPTY,
      detail: `${t.hydrationGoalHitDays} of ${t.daysLogged} days met goal`,
    },
  ];

  // Raw DPS / mail-volume figures stay private; not shown on the public journal.
  return kpis;
}

export function dispatchHasPublicKpiData(d: CarrierDispatch): boolean {
  return d.milesWalked > 0 || d.waterOz !== undefined || d.weightLbs !== undefined;
}

export function isDispatchFeedWorthy(
  d: Pick<PublicFieldDispatch, "publicNote">
): boolean {
  return !!d.publicNote?.trim();
}
