/** Public-safe letter carrier field log data. No addresses, route numbers, coworker/customer names, scanner data, or official mail volume. */

export const CARRIER_KPI_EMPTY = "n/a";

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
  steps: number;
  soreness: number; // 1–10
  energy: number; // 1–10
  mood: number; // 1–10
  weather: string;
  temperatureF?: number;
  heatIndexF?: number;
  mailLoad: MailLoad;
  heatDay?: boolean;
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
  /** Public-safe semantic tags for milestone evaluation and reflection filtering. */
  tags?: string[];
  /** Optional flag for a Good Samaritan act logged during the dispatch. */
  goodSamaritanAct?: boolean;
  /** Compact route identifier, e.g. "SB-013" or "CW-015". Shown as a bare code — no label. */
  routeCode?: string;
  /** Private sentiment toward this route. Never rendered in public-facing UI. */
  routePreference?: RoutePreference;
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
  heavyBrutalDays: number;
  dogEncounterDays: number;
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
  phaseCounts: Record<CarrierPhase, number>;
  latestPhase?: CarrierPhase;
};

export type PublicWeightTrend = {
  value: string;
  detail?: string;
};

const EMPTY_PHASE_COUNTS: Record<CarrierPhase, number> = {
  "break-in": 0,
  adapting: 0,
  building: 0,
  regular: 0,
};

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
      heavyBrutalDays: 0,
      dogEncounterDays: 0,
      avgSoreness: 0,
      avgEnergy: 0,
      avgMood: 0,
      totalWaterOz: 0,
      avgWaterOz: 0,
      hydrationGoalHitDays: 0,
      hydrationGoalHitRate: 0,
      phaseCounts: { ...EMPTY_PHASE_COUNTS },
    };
  }

  const totalMiles = dispatches.reduce((s, d) => s + d.milesWalked, 0);
  const totalSteps = dispatches.reduce((s, d) => s + d.steps, 0);
  const heatDays = dispatches.filter((d) => d.heatDay).length;
  const weatherDays = dispatches.filter((d) => d.rain || d.storm || d.snow).length;
  const heavyBrutalDays = dispatches.filter(
    (d) => d.mailLoad === "heavy" || d.mailLoad === "brutal"
  ).length;
  const dogEncounterDays = dispatches.filter((d) => d.dogEncounter).length;
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

  const phaseCounts = { ...EMPTY_PHASE_COUNTS };
  for (const d of dispatches) {
    if (d.phase) phaseCounts[d.phase]++;
  }

  const latestWithPhase = [...dispatches]
    .filter((d) => d.phase)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestPhase = latestWithPhase?.phase;

  return {
    daysLogged: count,
    totalMiles: Math.round(totalMiles * 10) / 10,
    avgMilesPerDay: Math.round((totalMiles / count) * 10) / 10,
    totalSteps,
    heatDays,
    weatherDays,
    heavyBrutalDays,
    dogEncounterDays,
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
    phaseCounts,
    ...(latestPhase && { latestPhase }),
  };
}

export function formatPublicWeightTrend(
  totals: CarrierTotals,
  dispatches: CarrierDispatch[]
): PublicWeightTrend {
  const withWeight = dispatches.filter((d) => d.weightLbs !== undefined);
  if (withWeight.length === 0) {
    return { value: CARRIER_KPI_EMPTY, detail: "No weight data logged" };
  }

  const hasPublicMode = withWeight.some(
    (d) => d.weightPublicMode && d.weightPublicMode !== "hidden"
  );
  if (!hasPublicMode) {
    return { value: "tracking privately", detail: "Weight logged but not shared publicly" };
  }

  const change = totals.weightChangeLbs;
  if (change === undefined) {
    return { value: CARRIER_KPI_EMPTY, detail: "Insufficient weight history" };
  }

  const changeStr = change >= 0 ? `+${change.toFixed(1)} lbs` : `${change.toFixed(1)} lbs`;

  const publicEntries = withWeight.filter(
    (d) =>
      d.weightPublicMode === "change-only" || d.weightPublicMode === "current-and-change"
  );
  const latestPublic = [...publicEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  if (
    latestPublic?.weightPublicMode === "current-and-change" &&
    totals.latestWeightLbs !== undefined
  ) {
    return {
      value: `${totals.latestWeightLbs} lbs (${changeStr})`,
      detail: "Current weight with cumulative change",
    };
  }

  return {
    value: changeStr,
    detail: "Cumulative change since first logged entry",
  };
}

const PHASE_LABEL: Record<CarrierPhase, string> = {
  "break-in": "Break-In",
  adapting: "Adapting",
  building: "Building",
  regular: "Regular",
};

export function totalsToKpis(t: CarrierTotals, dispatches: CarrierDispatch[] = []): CarrierKpi[] {
  const weightTrend = formatPublicWeightTrend(t, dispatches);

  return [
    { label: "Days Logged", value: String(t.daysLogged), detail: "Active field days" },
    { label: "Total Miles", value: `${t.totalMiles} mi`, detail: "Cumulative walking distance" },
    { label: "Avg Miles / Day", value: `${t.avgMilesPerDay} mi`, detail: "Per logged shift" },
    { label: "Total Steps", value: t.totalSteps.toLocaleString(), detail: "Cumulative step count" },
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
      label: "Weight Trend",
      value: weightTrend.value,
      detail: weightTrend.detail,
    },
    {
      label: "Current Phase",
      value: t.latestPhase ? PHASE_LABEL[t.latestPhase] : CARRIER_KPI_EMPTY,
      detail: t.latestPhase ? "Most recent logged phase" : "No phase logged yet",
    },
    { label: "Heat Days", value: String(t.heatDays), detail: "High heat index shifts" },
    { label: "Weather Days", value: String(t.weatherDays), detail: "Rain, storm, or snow" },
    { label: "Heavy / Brutal Load", value: String(t.heavyBrutalDays), detail: "High mail volume shifts" },
    { label: "Avg Soreness", value: `${t.avgSoreness} / 10`, detail: "Physical load marker" },
    { label: "Avg Energy", value: `${t.avgEnergy} / 10`, detail: "Self-reported end-of-shift" },
    { label: "Avg Mood", value: `${t.avgMood} / 10`, detail: "Morale signal" },
  ];
}

export function getCarrierKpis(): CarrierKpi[] {
  const dispatches = getCarrierDispatches();
  return totalsToKpis(getCarrierJournalTotals(), dispatches);
}

export function getMailLoadSummary(): Record<MailLoad, number> {
  const summary: Record<MailLoad, number> = {
    light: 0,
    normal: 0,
    heavy: 0,
    brutal: 0,
  };
  for (const d of DISPATCHES) {
    summary[d.mailLoad]++;
  }
  return summary;
}

export function dispatchHasPublicKpiData(d: CarrierDispatch): boolean {
  return (
    d.milesWalked > 0 ||
    d.steps > 0 ||
    d.waterOz !== undefined ||
    d.weightLbs !== undefined ||
    !!d.bodyNote?.trim() ||
    !!d.recoveryNote?.trim() ||
    !!d.phase
  );
}

// A dispatch earns a card in the feed only when the carrier has actually written something,
// or flagged a notable event. Pure numeric rows (miles, steps, temp) flow silently into
// aggregates (KPIs, calendar, milestones) without cluttering the feed.
export function isDispatchFeedWorthy(d: CarrierDispatch): boolean {
  return !!(
    d.publicNote?.trim() ||
    d.bodyNote?.trim() ||
    d.recoveryNote?.trim() ||
    d.goodSamaritanAct
  );
}
