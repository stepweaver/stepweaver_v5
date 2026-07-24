/** Letter carrier field log data. No addresses, route numbers, coworker/customer names, scanner data, or official mail volume. */

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
  isDerivedHeatDay,
  isDerivedWeatherDay,
} from "@/lib/carrier-journal/weather-signals";

export const CARRIER_KPI_EMPTY = "n/a";

export type { MailLoadTier } from "@/lib/carrier-journal/mail-load";

export type MailLoad = "light" | "normal" | "heavy" | "brutal";

export type WeightPublicMode = "hidden" | "change-only" | "current-and-change";

export type CarrierPhase = "break-in" | "adapting" | "building" | "regular";

/** Private sentiment toward a worked route. Never rendered in public display. */
export type RoutePreference = "prefer" | "like" | "dislike";

export type CarrierDispatch = {
  id: string;
  date: string;
  title: string;
  milesWalked: number;
  /** Steps are logged internally but not surfaced in public UI or KPIs. */
  steps?: number;
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
  /** @deprecated Legacy seed mail-load only; no longer stored in Notion. */
  mailLoad?: MailLoad;
  heatDay?: boolean;
  /** Manual checkbox: got rained on during the route. */
  rain?: boolean;
  storm?: boolean;
  snow?: boolean;
  dogEncounter?: boolean;
  publicNote: string;
  waterOz?: number;
  hydrationGoalOz?: number;
  weightLbs?: number;
  weightPublicMode?: WeightPublicMode;
  bodyNote?: string;
  recoveryNote?: string;
  phase?: CarrierPhase;
  /** Semantic tags for milestone evaluation and reflection filtering. */
  tags?: string[];
  /** Optional flag for a Good Samaritan act logged during the dispatch. */
  goodSamaritanAct?: boolean;
  /** Compact route identifier, e.g. "SB-013" or "CW-015". Shown as a bare code, no label. */
  routeCode?: string;
  /** Private sentiment toward this route. Never rendered in public-facing UI. */
  routePreference?: RoutePreference;
  /** Manually entered DPS piece count for the day. */
  dpsCount?: number;
  /** App-calculated ratio vs recent DPS baseline. Never manually entered. */
  dpsRatio?: number;
  /** Manually entered parcel count for the day. */
  parcels?: number;
  /** App-calculated ratio vs recent parcel baseline. */
  parcelRatio?: number;
  /** Computed from DPS + parcel volume vs personal baseline. */
  mailLoadTier?: MailLoadTier;
  /** Blended DPS/parcel ratio used for mailLoadTier. */
  mailLoadCompositeRatio?: number;
  /** Optional tags explaining why a day felt heavier or lighter. */
  mailDayContext?: string[];
};

export type CarrierKpi = {
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


// Legacy seed data - static fallbacks when Notion is not configured.
const DISPATCHES: CarrierDispatch[] = [
  {
    id: "cj-001",
    date: "2026-05-20",
    title: "First full solo day",
    milesWalked: 9.2,
    steps: 19800,
    soreness: 6,
    energy: 7,
    mood: 8,
    weather: "Partly cloudy",
    temperatureF: 68,
    mailLoad: "heavy",
    waterOz: 72,
    hydrationGoalOz: 80,
    weightLbs: 248,
    weightPublicMode: "change-only",
    phase: "break-in",
    bodyNote: "Feet and hips doing most of the talking.",
    recoveryNote: "Elevated legs, early sleep.",
    publicNote:
      "First day running a full route without a trainer. Longer than expected. Feet held up better than anticipated. Learned that pacing matters more than rushing.",
  },
  {
    id: "cj-002",
    date: "2026-05-21",
    title: "Rain day, gear test",
    milesWalked: 8.6,
    steps: 18400,
    soreness: 5,
    energy: 6,
    mood: 7,
    weather: "Light rain",
    temperatureF: 58,
    mailLoad: "normal",
    rain: true,
    waterOz: 64,
    hydrationGoalOz: 80,
    phase: "break-in",
    bodyNote: "Left ankle tight but not worse.",
    publicNote:
      "Light rain most of the morning. Rain gear worked. Wet shoes by hour three, and that is the weak point. Route rhythm felt more natural today.",
  },
  {
    id: "cj-003",
    date: "2026-05-22",
    title: "Hot load day, hydration check",
    milesWalked: 10.1,
    steps: 21600,
    soreness: 7,
    energy: 5,
    mood: 6,
    weather: "Clear, humid",
    temperatureF: 82,
    heatIndexF: 89,
    mailLoad: "brutal",
    heatDay: true,
    dogEncounter: true,
    waterOz: 96,
    hydrationGoalOz: 96,
    phase: "break-in",
    bodyNote: "Quads and lower back carrying the load.",
    recoveryNote: "Extra water at home, no heroics.",
    publicNote:
      "Heaviest load so far. Heat index climbed through the afternoon. Drank more water than I thought I needed, but still felt low by the last stretch. Dog encounter on a residential block; no contact, redirected cleanly.",
  },
  {
    id: "cj-004",
    date: "2026-05-23",
    title: "Recovery pace, lighter load",
    milesWalked: 7.8,
    steps: 16700,
    soreness: 4,
    energy: 7,
    mood: 8,
    weather: "Overcast, cool",
    temperatureF: 63,
    mailLoad: "light",
    waterOz: 80,
    hydrationGoalOz: 80,
    weightLbs: 246,
    weightPublicMode: "change-only",
    phase: "adapting",
    bodyNote: "Ankle soreness tracking down, not up.",
    recoveryNote: "Stretching before bed.",
    publicNote:
      "Lighter day. Used it to work on technique: posture, bag position, walking economy. Noticed the soreness in the left ankle from earlier days is tracking down, not up.",
  },
  {
    id: "cj-005",
    date: "2026-05-24",
    title: "Saturday volume, the long one",
    milesWalked: 11.3,
    steps: 24100,
    soreness: 8,
    energy: 4,
    mood: 6,
    weather: "Sunny, warm",
    temperatureF: 76,
    mailLoad: "heavy",
    waterOz: 88,
    hydrationGoalOz: 88,
    weightLbs: 244,
    weightPublicMode: "current-and-change",
    phase: "adapting",
    bodyNote: "Cumulative week showing up in the legs.",
    recoveryNote: "Ice on feet, protein-heavy dinner.",
    publicNote:
      "Saturdays have more volume. This one ran long. Body felt the cumulative week by hour five. Took every water stop seriously. Route completion felt like a real win.",
  },
];

export function getCarrierDispatches(): CarrierDispatch[] {
  return [...DISPATCHES].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getCarrierJournalTotals(): CarrierTotals {
  return computeTotalsFromDispatches(DISPATCHES);
}

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
    { label: "Days Logged", value: String(t.daysLogged), detail: "Active field days" },
    { label: "Total Miles", value: `${t.totalMiles} mi`, detail: "Cumulative walking distance" },
    { label: "Avg Miles / Day", value: `${t.avgMilesPerDay} mi`, detail: "Per logged shift" },
    {
      label: "Avg Water / Day",
      value: t.avgWaterOz > 0 ? `${t.avgWaterOz} oz` : CARRIER_KPI_EMPTY,
      detail: "Average intake on logged hydration days",
    },
    {
      label: "Hydration Goal Hit Rate",
      value: t.hydrationGoalHitRate > 0 ? `${t.hydrationGoalHitRate}%` : CARRIER_KPI_EMPTY,
      detail: `${t.hydrationGoalHitDays} of ${t.daysLogged} days met goal`,
    },
    {
      label: "Weight Lost",
      value: weightTrend.value,
      detail: weightTrend.detail,
    },
    { label: "Heat Days", value: String(t.heatDays), detail: "Shift peak heat index ≥ 90°F" },
    {
      label: "Weather Days",
      value: String(t.weatherDays),
      detail: "Rain, storm, or snow (from temp + notes)",
    },
    {
      label: "Heavy Mail Days",
      value: String(t.heavyMailDays),
      detail: "DPS + parcels above 115% of your baseline",
    },
    { label: "Avg Soreness", value: `${t.avgSoreness} / 10`, detail: "Physical load marker" },
    { label: "Avg Energy", value: `${t.avgEnergy} / 10`, detail: "Self-reported end-of-shift" },
    { label: "Avg Mood", value: `${t.avgMood} / 10`, detail: "Morale signal" },
  ];

  if (t.avgDpsCount !== undefined) {
    kpis.push(
      {
        label: "Avg DPS Count",
        value: t.avgDpsCount.toLocaleString("en-US"),
        detail: "Average logged DPS pieces per day",
      },
      {
        label: "Median DPS Count",
        value:
          t.medianDpsCount !== undefined
            ? t.medianDpsCount.toLocaleString("en-US")
            : CARRIER_KPI_EMPTY,
        detail: "Middle value across logged DPS days",
      },
      {
        label: "Highest DPS Count",
        value: (t.highestDpsCount ?? CARRIER_KPI_EMPTY).toLocaleString("en-US"),
        detail: "Peak logged DPS day",
      },
      {
        label: "Heavy DPS Days",
        value: String(t.heavyDaysCount ?? 0),
        detail: "Days above 115% of recent baseline",
      },
      {
        label: "Very Heavy DPS Days",
        value: String(t.veryHeavyDaysCount ?? 0),
        detail: "Days above 140% of recent baseline",
      },
      {
        label: "Latest DPS Ratio",
        value:
          t.latestDpsRatio != null
            ? `${Math.round(t.latestDpsRatio * 100)}%`
            : CARRIER_KPI_EMPTY,
        detail: "Most recent day vs recent baseline",
      }
    );

    if (t.latestDpsPerMile !== undefined) {
      kpis.push({
        label: "Latest DPS / Mile",
        value: String(t.latestDpsPerMile),
        detail: "DPS count divided by miles walked",
      });
    }
  }

  return kpis;
}

export function getCarrierKpis(): CarrierKpi[] {
  return totalsToKpis(getCarrierJournalTotals());
}

export function getMailLoadSummary(): Record<MailLoad, number> {
  const summary: Record<MailLoad, number> = {
    light: 0,
    normal: 0,
    heavy: 0,
    brutal: 0,
  };
  for (const d of DISPATCHES) {
    summary[d.mailLoad ?? "normal"]++;
  }
  return summary;
}

export function dispatchHasPublicKpiData(d: CarrierDispatch): boolean {
  return d.milesWalked > 0 || d.waterOz !== undefined || d.weightLbs !== undefined;
}

export function isDispatchFeedWorthy(d: CarrierDispatch): boolean {
  return !!d.publicNote?.trim();
}
