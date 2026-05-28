import type { CarrierDispatch } from "./carrier-journal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CarrierMilestoneCategory =
  | "days"
  | "distance"
  | "steps"
  | "weather"
  | "load"
  | "safety"
  | "service"
  | "hydration";

export type CarrierMilestoneTier = "bronze" | "silver" | "gold" | "legendary";

export type CarrierMilestone = {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  category: CarrierMilestoneCategory;
  tier: CarrierMilestoneTier;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  progressLabel: string;
  unlockedAt?: string;
};

export type CarrierLevel = {
  title: string;
  level: number;
  xp: number;
  totalMiles: number;
  nextTitle?: string;
  nextMiles?: number;
  progressToNext: number;
};

// ---------------------------------------------------------------------------
// Level thresholds
// ---------------------------------------------------------------------------

const LEVEL_THRESHOLDS: { miles: number; title: string; level: number }[] = [
  { miles: 0, title: "Academy Walker", level: 1 },
  { miles: 10, title: "Block Rookie", level: 2 },
  { miles: 25, title: "Loop Learner", level: 3 },
  { miles: 50, title: "Route Walker", level: 4 },
  { miles: 100, title: "Pavement Regular", level: 5 },
  { miles: 250, title: "Satchel Veteran", level: 6 },
  { miles: 500, title: "Iron Loop Carrier", level: 7 },
  { miles: 1000, title: "Thousand-Mile Carrier", level: 8 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortedChronologically(dispatches: CarrierDispatch[]): CarrierDispatch[] {
  return [...dispatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/** Find the date of the Nth dispatch matching a predicate (1-indexed). */
function dateAtNthMatch(
  sorted: CarrierDispatch[],
  predicate: (dispatch: CarrierDispatch) => boolean,
  n: number
): string | undefined {
  let count = 0;
  for (const d of sorted) {
    if (predicate(d)) {
      count++;
      if (count >= n) return d.date;
    }
  }
  return undefined;
}

/** Find the date at which the cumulative sum of getValue() first hits threshold. */
function dateAtCumulativeThreshold(
  sorted: CarrierDispatch[],
  getValue: (dispatch: CarrierDispatch) => number,
  threshold: number
): string | undefined {
  let cumulative = 0;
  for (const d of sorted) {
    cumulative += getValue(d);
    if (cumulative >= threshold) return d.date;
  }
  return undefined;
}

function isGoodSamaritanAct(d: CarrierDispatch): boolean {
  if (d.goodSamaritanAct === true) return true;
  return (d.tags ?? []).some(
    (t) =>
      t === "good-samaritan" ||
      t === "good_samaritan" ||
      t.toLowerCase() === "good samaritan"
  );
}

function effectiveTemp(d: CarrierDispatch): number {
  return Math.max(d.temperatureF ?? -Infinity, d.heatIndexF ?? -Infinity);
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

export function getCarrierLevel(dispatches: CarrierDispatch[]): CarrierLevel {
  const totalMiles = dispatches.reduce((s, d) => s + d.milesWalked, 0);
  const xp = Math.round(totalMiles * 10);

  let currentIdx = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalMiles >= LEVEL_THRESHOLDS[i].miles) {
      currentIdx = i;
      break;
    }
  }

  const current = LEVEL_THRESHOLDS[currentIdx];
  const next = LEVEL_THRESHOLDS[currentIdx + 1] ?? null;

  let progressToNext = 100;
  if (next) {
    const span = next.miles - current.miles;
    const progress = totalMiles - current.miles;
    progressToNext = Math.min(100, Math.round((progress / span) * 100));
  }

  return {
    title: current.title,
    level: current.level,
    xp,
    totalMiles: Math.round(totalMiles * 10) / 10,
    ...(next ? { nextTitle: next.title, nextMiles: next.miles } : {}),
    progressToNext,
  };
}

export function getCarrierMilestones(dispatches: CarrierDispatch[]): CarrierMilestone[] {
  const sorted = sortedChronologically(dispatches);
  const totalMiles = dispatches.reduce((s, d) => s + d.milesWalked, 0);
  const totalSteps = dispatches.reduce((s, d) => s + d.steps, 0);
  const daysLogged = dispatches.length;

  const rainDays = dispatches.filter((d) => d.rain);
  const stormDays = dispatches.filter((d) => d.storm);
  const snowDays = dispatches.filter((d) => d.snow);
  const heat80Days = dispatches.filter((d) => effectiveTemp(d) >= 80);
  const heat90Days = dispatches.filter((d) => effectiveTemp(d) >= 90);
  const freezeDays = dispatches.filter((d) => (d.temperatureF ?? Infinity) <= 32);
  const belowZeroDays = dispatches.filter((d) => (d.temperatureF ?? Infinity) <= 0);
  const heavyLoadDays = dispatches.filter(
    (d) => d.mailLoad === "heavy" || d.mailLoad === "brutal"
  );
  const dogDays = dispatches.filter((d) => d.dogEncounter);
  const hydrationGoalDays = dispatches.filter(
    (d) =>
      d.waterOz !== undefined &&
      d.hydrationGoalOz !== undefined &&
      d.waterOz >= d.hydrationGoalOz
  );
  const goodSamaritanDays = dispatches.filter(isGoodSamaritanAct);

  function milestone(
    id: string,
    title: string,
    shortLabel: string,
    description: string,
    category: CarrierMilestoneCategory,
    tier: CarrierMilestoneTier,
    icon: string,
    current: number,
    target: number,
    unlockedAt: string | undefined,
    unit = ""
  ): CarrierMilestone {
    const unlocked = current >= target;
    const progress = Math.min(current, target);
    const progressLabel =
      unit
        ? `${progress.toLocaleString()} / ${target.toLocaleString()} ${unit}`
        : `${progress.toLocaleString()} / ${target.toLocaleString()}`;
    return {
      id,
      title,
      shortLabel,
      description,
      category,
      tier,
      icon,
      unlocked,
      progress,
      target,
      progressLabel,
      ...(unlocked && unlockedAt ? { unlockedAt } : {}),
    };
  }

  return [
    // ------- Days -------
    milestone(
      "first-dispatch",
      "First Field Day",
      "Day 1",
      "Logged your first dispatch. The route starts here.",
      "days", "bronze", "calendar",
      daysLogged, 1,
      dateAtNthMatch(sorted, () => true, 1),
      "days"
    ),
    milestone(
      "five-dispatches",
      "Five-Day Carrier",
      "5 Days",
      "Five shifts in. The soreness is real. So is the routine.",
      "days", "bronze", "calendar",
      daysLogged, 5,
      dateAtNthMatch(sorted, () => true, 5),
      "days"
    ),
    milestone(
      "ten-dispatches",
      "Ten-Day Loop",
      "10 Days",
      "Ten logged field days. The route is becoming second nature.",
      "days", "silver", "calendar",
      daysLogged, 10,
      dateAtNthMatch(sorted, () => true, 10),
      "days"
    ),
    milestone(
      "twenty-five-dispatches",
      "Quarter Hundred",
      "25 Days",
      "Twenty-five shifts. You have built a real track record.",
      "days", "silver", "calendar",
      daysLogged, 25,
      dateAtNthMatch(sorted, () => true, 25),
      "days"
    ),
    milestone(
      "fifty-dispatches",
      "Fifty-Day Field Carrier",
      "50 Days",
      "Fifty full field days. You are not a rookie anymore.",
      "days", "gold", "calendar",
      daysLogged, 50,
      dateAtNthMatch(sorted, () => true, 50),
      "days"
    ),
    milestone(
      "hundred-dispatches",
      "Century Carrier",
      "100 Days",
      "One hundred logged dispatches. A genuine career milestone.",
      "days", "legendary", "calendar",
      daysLogged, 100,
      dateAtNthMatch(sorted, () => true, 100),
      "days"
    ),

    // ------- Miles -------
    milestone(
      "first-mile",
      "First Mile",
      "1 mi",
      "One mile on the books. Every route starts somewhere.",
      "distance", "bronze", "map-pin",
      totalMiles, 1,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 1),
      "mi"
    ),
    milestone(
      "ten-miles",
      "Ten-Mile Mark",
      "10 mi",
      "Ten miles accumulated. The body is learning what this job costs.",
      "distance", "bronze", "map-pin",
      totalMiles, 10,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 10),
      "mi"
    ),
    milestone(
      "twenty-five-miles",
      "Quarter Century Miles",
      "25 mi",
      "Twenty-five miles walked. You are earning your pavement.",
      "distance", "silver", "map-pin",
      totalMiles, 25,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 25),
      "mi"
    ),
    milestone(
      "fifty-miles",
      "Fifty-Mile Walker",
      "50 mi",
      "Fifty miles. Half a hundred. The route is yours now.",
      "distance", "silver", "map-pin",
      totalMiles, 50,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 50),
      "mi"
    ),
    milestone(
      "hundred-miles",
      "Hundred-Mile Carrier",
      "100 mi",
      "One hundred miles on foot. A real carrier's badge.",
      "distance", "gold", "map-pin",
      totalMiles, 100,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 100),
      "mi"
    ),
    milestone(
      "two-fifty-miles",
      "Quarter-Thousand Miles",
      "250 mi",
      "Two hundred fifty miles. You have walked a small state.",
      "distance", "gold", "map-pin",
      totalMiles, 250,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 250),
      "mi"
    ),
    milestone(
      "five-hundred-miles",
      "Iron Loop 500",
      "500 mi",
      "Five hundred miles of field work. Legendary durability.",
      "distance", "legendary", "map-pin",
      totalMiles, 500,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 500),
      "mi"
    ),

    // ------- Steps -------
    milestone(
      "twenty-five-k-steps",
      "25K Steps",
      "25K",
      "Twenty-five thousand steps logged in total.",
      "steps", "bronze", "activity",
      totalSteps, 25_000,
      dateAtCumulativeThreshold(sorted, (d) => d.steps, 25_000),
      "steps"
    ),
    milestone(
      "hundred-k-steps",
      "100K Steps",
      "100K",
      "A hundred thousand cumulative steps. That is not nothing.",
      "steps", "silver", "activity",
      totalSteps, 100_000,
      dateAtCumulativeThreshold(sorted, (d) => d.steps, 100_000),
      "steps"
    ),
    milestone(
      "quarter-million-steps",
      "Quarter Million",
      "250K",
      "Two hundred fifty thousand steps. Built one route at a time.",
      "steps", "silver", "activity",
      totalSteps, 250_000,
      dateAtCumulativeThreshold(sorted, (d) => d.steps, 250_000),
      "steps"
    ),
    milestone(
      "half-million-steps",
      "Half Million Steps",
      "500K",
      "Five hundred thousand steps. A certified pavement warrior.",
      "steps", "gold", "activity",
      totalSteps, 500_000,
      dateAtCumulativeThreshold(sorted, (d) => d.steps, 500_000),
      "steps"
    ),
    milestone(
      "million-steps",
      "Million-Step Carrier",
      "1M",
      "One million steps. Legendary endurance.",
      "steps", "legendary", "activity",
      totalSteps, 1_000_000,
      dateAtCumulativeThreshold(sorted, (d) => d.steps, 1_000_000),
      "steps"
    ),

    // ------- Weather -------
    milestone(
      "first-rain",
      "First Rain Day",
      "Rain",
      "Walked a full route in the rain. Gear tested.",
      "weather", "bronze", "cloud-rain",
      rainDays.length, 1,
      rainDays.length >= 1 ? sortedChronologically(rainDays)[0]?.date : undefined
    ),
    milestone(
      "first-storm",
      "First Storm Day",
      "Storm",
      "Weathered a storm route. Conditions were real.",
      "weather", "bronze", "zap",
      stormDays.length, 1,
      stormDays.length >= 1 ? sortedChronologically(stormDays)[0]?.date : undefined
    ),
    milestone(
      "first-snow",
      "First Snow Day",
      "Snow",
      "Walked the route in snow. A different kind of challenge.",
      "weather", "bronze", "snowflake",
      snowDays.length, 1,
      snowDays.length >= 1 ? sortedChronologically(snowDays)[0]?.date : undefined
    ),
    milestone(
      "first-heat-80",
      "First 80° Day",
      "80°F",
      "First shift where the heat index or temp hit 80°F or higher.",
      "weather", "bronze", "sun",
      heat80Days.length, 1,
      heat80Days.length >= 1 ? sortedChronologically(heat80Days)[0]?.date : undefined
    ),
    milestone(
      "first-heat-90",
      "First 90° Day",
      "90°F",
      "Heat index or temp hit 90°F. Hydration became survival.",
      "weather", "silver", "flame",
      heat90Days.length, 1,
      heat90Days.length >= 1 ? sortedChronologically(heat90Days)[0]?.date : undefined
    ),
    milestone(
      "first-freeze",
      "First Freeze Day",
      "≤32°F",
      "Temperature at or below freezing. The route does not pause for winter.",
      "weather", "silver", "thermometer",
      freezeDays.length, 1,
      freezeDays.length >= 1 ? sortedChronologically(freezeDays)[0]?.date : undefined
    ),
    milestone(
      "first-below-zero",
      "Below Zero",
      "≤0°F",
      "Temperature at or below zero. Rare and legendary field conditions.",
      "weather", "legendary", "thermometer",
      belowZeroDays.length, 1,
      belowZeroDays.length >= 1 ? sortedChronologically(belowZeroDays)[0]?.date : undefined
    ),

    // ------- Load -------
    milestone(
      "first-heavy-load",
      "First Heavy Load",
      "Heavy",
      "First shift logged as heavy or brutal mail load.",
      "load", "bronze", "package",
      heavyLoadDays.length, 1,
      heavyLoadDays.length >= 1 ? sortedChronologically(heavyLoadDays)[0]?.date : undefined
    ),
    milestone(
      "ten-heavy-loads",
      "Ten Heavy Days",
      "10 Heavy",
      "Ten heavy or brutal load days. The work builds character.",
      "load", "silver", "package",
      heavyLoadDays.length, 10,
      dateAtNthMatch(sorted, (d) => d.mailLoad === "heavy" || d.mailLoad === "brutal", 10)
    ),

    // ------- Dogs -------
    milestone(
      "first-dog-encounter",
      "First Dog Day",
      "Dog",
      "First logged dog encounter. Redirected cleanly.",
      "safety", "bronze", "shield",
      dogDays.length, 1,
      dogDays.length >= 1 ? sortedChronologically(dogDays)[0]?.date : undefined
    ),
    milestone(
      "five-dog-days",
      "Five Dog Days",
      "5 Dogs",
      "Five days with dog encounters. You are reading the route now.",
      "safety", "silver", "shield",
      dogDays.length, 5,
      dateAtNthMatch(sorted, (d) => !!d.dogEncounter, 5)
    ),

    // ------- Hydration -------
    milestone(
      "first-hydration-goal",
      "Hydration Goal Hit",
      "Goal",
      "First day hitting the full hydration target. Discipline pays off.",
      "hydration", "bronze", "droplets",
      hydrationGoalDays.length, 1,
      hydrationGoalDays.length >= 1
        ? sortedChronologically(hydrationGoalDays)[0]?.date
        : undefined
    ),
    milestone(
      "five-hydration-goals",
      "Five Hydration Days",
      "5x Goal",
      "Five days hitting the hydration goal. A real system now.",
      "hydration", "silver", "droplets",
      hydrationGoalDays.length, 5,
      dateAtNthMatch(
        sorted,
        (d) =>
          d.waterOz !== undefined &&
          d.hydrationGoalOz !== undefined &&
          d.waterOz >= d.hydrationGoalOz,
        5
      )
    ),
    milestone(
      "ten-hydration-goals",
      "Ten Hydration Days",
      "10x Goal",
      "Ten hydration goal days. Safety and performance locked in.",
      "hydration", "gold", "droplets",
      hydrationGoalDays.length, 10,
      dateAtNthMatch(
        sorted,
        (d) =>
          d.waterOz !== undefined &&
          d.hydrationGoalOz !== undefined &&
          d.waterOz >= d.hydrationGoalOz,
        10
      )
    ),

    // ------- Good Samaritan -------
    milestone(
      "first-good-samaritan",
      "Good Samaritan Act",
      "Samaritan",
      "First logged Good Samaritan act on the route.",
      "service", "gold", "heart",
      goodSamaritanDays.length, 1,
      goodSamaritanDays.length >= 1
        ? sortedChronologically(goodSamaritanDays)[0]?.date
        : undefined
    ),
  ];
}
