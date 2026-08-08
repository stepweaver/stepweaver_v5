import type { CarrierDispatch, PublicFieldDispatch } from "./carrier-journal";
import { enrichDispatchesFields } from "./carrier-journal";
import {
  deriveWeatherSignals,
  isDerivedHeatDay,
  isDerivedWeatherDay,
} from "@/lib/carrier-journal/weather-signals";

type MilestoneDispatch = PublicFieldDispatch | CarrierDispatch;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CarrierMilestoneCategory =
  | "days"
  | "distance"
  | "weather"
  | "safety"
  | "service"
  | "hydration";

export type CarrierMilestoneTier =
  | "basic"
  | "field"
  | "campaign"
  | "veteran";

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
  totalLevels: number;
  totalMiles: number;
  nextTitle?: string;
  nextMiles?: number;
  progressToNext: number;
};

export type CarrierRank = {
  level: number;
  title: string;
  miles: number;
  status: "reached" | "current" | "locked";
  milesRemaining: number;
};

// ---------------------------------------------------------------------------
// Mileage rank ladder
// ---------------------------------------------------------------------------

const LEVEL_THRESHOLDS: { miles: number; title: string; level: number }[] = [
  { miles: 0,     title: "Starting Miles",   level: 1 },
  { miles: 25,    title: "First 25",         level: 2 },
  { miles: 50,    title: "Steady Walker",    level: 3 },
  { miles: 100,   title: "Road Legs",        level: 4 },
  { miles: 250,   title: "Quarter Thousand", level: 5 },
  { miles: 500,   title: "Half Thousand",    level: 6 },
  { miles: 1000,  title: "Thousand Club",    level: 7 },
  { miles: 2500,  title: "Long Haul",        level: 8 },
  { miles: 5000,  title: "Iron Miles",       level: 9 },
  { miles: 10000, title: "Ten Thousand",     level: 10 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortedChronologically(dispatches: MilestoneDispatch[]): MilestoneDispatch[] {
  return [...dispatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/** Find the date of the Nth dispatch matching a predicate (1-indexed). */
function dateAtNthMatch(
  sorted: MilestoneDispatch[],
  predicate: (dispatch: MilestoneDispatch) => boolean,
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
  sorted: MilestoneDispatch[],
  getValue: (dispatch: MilestoneDispatch) => number,
  threshold: number
): string | undefined {
  let cumulative = 0;
  for (const d of sorted) {
    cumulative += getValue(d);
    if (cumulative >= threshold) return d.date;
  }
  return undefined;
}

/** Consecutive logged days without a dog-poop incident, ending at the latest dispatch. */
export function currentDogPoopCleanStreak(dispatches: MilestoneDispatch[]): number {
  const sorted = sortedChronologically(dispatches);
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].steppedInDogPoop) break;
    streak++;
  }
  return streak;
}

/** Longest run of logged days without stepping in dog poop. */
export function bestDogPoopCleanStreak(dispatches: MilestoneDispatch[]): number {
  const sorted = sortedChronologically(dispatches);
  let best = 0;
  let current = 0;
  for (const d of sorted) {
    if (d.steppedInDogPoop) {
      current = 0;
    } else {
      current++;
      if (current > best) best = current;
    }
  }
  return best;
}

/** Date when a clean streak first reached `target` consecutive logged days. */
function dateAtCleanStreak(
  sorted: MilestoneDispatch[],
  target: number
): string | undefined {
  let current = 0;
  for (const d of sorted) {
    if (d.steppedInDogPoop) {
      current = 0;
    } else {
      current++;
      if (current >= target) return d.date;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

export function getCarrierLevel(dispatches: MilestoneDispatch[]): CarrierLevel {
  const totalMiles = dispatches.reduce((s, d) => s + d.milesWalked, 0);
  const rounded = Math.round(totalMiles * 10) / 10;

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
    totalLevels: LEVEL_THRESHOLDS.length,
    totalMiles: rounded,
    ...(next ? { nextTitle: next.title, nextMiles: next.miles } : {}),
    progressToNext,
  };
}

export function getCarrierRankLadder(totalMiles: number): CarrierRank[] {
  const rounded = Math.round(totalMiles * 10) / 10;

  let currentIdx = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalMiles >= LEVEL_THRESHOLDS[i].miles) {
      currentIdx = i;
      break;
    }
  }

  return LEVEL_THRESHOLDS.map((threshold, idx) => {
    const reached = totalMiles >= threshold.miles;
    const status: CarrierRank["status"] =
      idx === currentIdx ? "current" : reached ? "reached" : "locked";

    const milesRemaining =
      status === "reached"
        ? 0
        : Math.max(0, Math.round((threshold.miles - rounded) * 10) / 10);

    return {
      level: threshold.level,
      title: threshold.title,
      miles: threshold.miles,
      status,
      milesRemaining,
    };
  });
}

export function getCarrierMilestones(dispatches: MilestoneDispatch[]): CarrierMilestone[] {
  // Public DTOs have no operational volume fields; enrich is a no-op for them.
  const enriched = enrichDispatchesFields(dispatches as CarrierDispatch[]);
  const sorted = sortedChronologically(enriched);
  const totalMiles = enriched.reduce((s, d) => s + d.milesWalked, 0);
  const daysLogged = enriched.length;

  const rainDays = enriched.filter((d) => deriveWeatherSignals(d).rain);
  const stormDays = enriched.filter((d) => deriveWeatherSignals(d).storm);
  const snowDays = enriched.filter((d) => deriveWeatherSignals(d).snow);
  const heatDays = enriched.filter(isDerivedHeatDay);
  const weatherDays = enriched.filter(isDerivedWeatherDay);
  const twelveMileDays = enriched.filter((d) => d.milesWalked >= 12);
  const hydrationGoalDays = enriched.filter(
    (d) =>
      d.waterOz !== undefined &&
      d.hydrationGoalOz !== undefined &&
      d.waterOz >= d.hydrationGoalOz
  );
  const cleanStreakBest = bestDogPoopCleanStreak(enriched);

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
    // ===================================================================
    // FOUNDATION
    // ===================================================================

    // --- Days ---
    milestone(
      "day-one",
      "Day One",
      "Day 1",
      "First walking day logged. The personal record starts here.",
      "days", "basic", "calendar",
      daysLogged, 1,
      dateAtNthMatch(sorted, () => true, 1),
      "days"
    ),
    milestone(
      "five-logged-days",
      "5 Logged Days",
      "5 Days",
      "Five walking days on the record. The soreness is real. So is the routine.",
      "days", "basic", "calendar",
      daysLogged, 5,
      dateAtNthMatch(sorted, () => true, 5),
      "days"
    ),
    milestone(
      "ten-logged-days",
      "10 Logged Days",
      "10 Days",
      "Ten logged days. Walking rhythm is starting to take shape.",
      "days", "basic", "calendar",
      daysLogged, 10,
      dateAtNthMatch(sorted, () => true, 10),
      "days"
    ),

    // --- Distance ---
    milestone(
      "first-mile",
      "First Mile",
      "1 mi",
      "One mile on the record. Every fitness arc starts somewhere.",
      "distance", "basic", "map-pin",
      totalMiles, 1,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 1),
      "mi"
    ),
    milestone(
      "ten-miles",
      "10 Miles",
      "10 mi",
      "Ten miles accumulated. The body is learning what long walking days cost.",
      "distance", "basic", "map-pin",
      totalMiles, 10,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 10),
      "mi"
    ),
    milestone(
      "first-twelve-mile-day",
      "First 12-Mile Day",
      "12 mi day",
      "First single day with twelve or more walking miles.",
      "distance", "basic", "map-pin",
      twelveMileDays.length, 1,
      twelveMileDays.length >= 1
        ? sortedChronologically(twelveMileDays)[0]?.date
        : undefined
    ),

    // --- Weather ---
    milestone(
      "first-rain",
      "First Rain",
      "Rain",
      "First rainy walking day. Gear tested.",
      "weather", "basic", "cloud-rain",
      rainDays.length, 1,
      rainDays.length >= 1 ? sortedChronologically(rainDays)[0]?.date : undefined
    ),

    // --- Hydration ---
    milestone(
      "first-hydration-goal",
      "First Hydration Goal",
      "Goal",
      "First day hitting the full hydration target.",
      "hydration", "basic", "droplets",
      hydrationGoalDays.length, 1,
      hydrationGoalDays.length >= 1
        ? sortedChronologically(hydrationGoalDays)[0]?.date
        : undefined
    ),

    // --- Safety (clean boots streak; incident flag only when broken) ---
    milestone(
      "seven-clean-boots",
      "7 Clean Days",
      "7 Clean",
      "Seven logged days without stepping in dog poop. Boots still respectable.",
      "safety", "basic", "shield",
      cleanStreakBest, 7,
      dateAtCleanStreak(sorted, 7),
      "days"
    ),

    // ===================================================================
    // ENDURANCE
    // ===================================================================

    // --- Days ---
    milestone(
      "twenty-five-logged-days",
      "25 Logged Days",
      "25 Days",
      "Twenty-five walking days. A real track record is forming.",
      "days", "field", "calendar",
      daysLogged, 25,
      dateAtNthMatch(sorted, () => true, 25),
      "days"
    ),

    // --- Distance ---
    milestone(
      "fifty-miles",
      "50 Miles",
      "50 mi",
      "Fifty walking miles under your boots.",
      "distance", "field", "map-pin",
      totalMiles, 50,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 50),
      "mi"
    ),
    milestone(
      "hundred-miles",
      "100 Miles",
      "100 mi",
      "One hundred walking miles on foot.",
      "distance", "field", "map-pin",
      totalMiles, 100,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 100),
      "mi"
    ),

    // --- Hydration ---
    milestone(
      "five-hydration-goals",
      "5 Hydration Goals",
      "5x Goal",
      "Five days hitting the hydration target. A system is forming.",
      "hydration", "field", "droplets",
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

    // --- Weather ---
    milestone(
      "first-heat-day",
      "First Heat Day",
      "Heat",
      "First walking day with peak heat index ≥ 90°F. Hydration becomes survival.",
      "weather", "field", "flame",
      heatDays.length, 1,
      heatDays.length >= 1 ? sortedChronologically(heatDays)[0]?.date : undefined
    ),
    milestone(
      "five-heat-days",
      "5 Heat Days",
      "5 Heat",
      "Five high-heat walking days logged.",
      "weather", "field", "flame",
      heatDays.length, 5,
      dateAtNthMatch(sorted, isDerivedHeatDay, 5)
    ),
    milestone(
      "first-storm",
      "First Storm",
      "Storm",
      "First walking day completed in storm conditions.",
      "weather", "field", "zap",
      stormDays.length, 1,
      stormDays.length >= 1 ? sortedChronologically(stormDays)[0]?.date : undefined
    ),

    // --- Safety ---
    milestone(
      "twenty-five-clean-boots",
      "25 Clean Days",
      "25 Clean",
      "Twenty-five logged days without stepping in it. Situational awareness holds.",
      "safety", "field", "shield",
      cleanStreakBest, 25,
      dateAtCleanStreak(sorted, 25),
      "days"
    ),

    // ===================================================================
    // LONG-HAUL
    // ===================================================================

    // --- Days ---
    milestone(
      "fifty-logged-days",
      "50 Logged Days",
      "50 Days",
      "Fifty walking days. The habit is sticking.",
      "days", "campaign", "calendar",
      daysLogged, 50,
      dateAtNthMatch(sorted, () => true, 50),
      "days"
    ),

    // --- Distance ---
    milestone(
      "two-fifty-miles",
      "250 Miles",
      "250 mi",
      "Two hundred fifty walking miles. Endurance is compounding.",
      "distance", "campaign", "map-pin",
      totalMiles, 250,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 250),
      "mi"
    ),
    milestone(
      "five-hundred-miles",
      "500 Miles",
      "500 mi",
      "Five hundred walking miles on foot.",
      "distance", "campaign", "map-pin",
      totalMiles, 500,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 500),
      "mi"
    ),

    // --- Weather ---
    milestone(
      "ten-heat-days",
      "10 Heat Days",
      "10 Heat",
      "Ten heat days walked and logged. The body has adapted.",
      "weather", "campaign", "flame",
      heatDays.length, 10,
      dateAtNthMatch(sorted, isDerivedHeatDay, 10)
    ),
    milestone(
      "ten-weather-days",
      "10 Weather Days",
      "10 Wx",
      "Ten days in meaningful weather: rain, storm, snow, or heat.",
      "weather", "campaign", "cloud-rain",
      weatherDays.length, 10,
      dateAtNthMatch(sorted, isDerivedWeatherDay, 10)
    ),
    milestone(
      "first-snow",
      "First Snow",
      "Snow",
      "First walking day completed in snow. A different kind of challenge.",
      "weather", "campaign", "snowflake",
      snowDays.length, 1,
      snowDays.length >= 1 ? sortedChronologically(snowDays)[0]?.date : undefined
    ),

    // --- Hydration ---
    milestone(
      "twenty-five-hydration-goals",
      "25 Hydration Goals",
      "25x Goal",
      "Twenty-five hydration goal days. Consistency on record.",
      "hydration", "campaign", "droplets",
      hydrationGoalDays.length, 25,
      dateAtNthMatch(
        sorted,
        (d) =>
          d.waterOz !== undefined &&
          d.hydrationGoalOz !== undefined &&
          d.waterOz >= d.hydrationGoalOz,
        25
      )
    ),

    // --- Safety ---
    milestone(
      "fifty-clean-boots",
      "50 Clean Days",
      "50 Clean",
      "Fifty logged days clean. The lawn hazard has not claimed you yet.",
      "safety", "campaign", "shield",
      cleanStreakBest, 50,
      dateAtCleanStreak(sorted, 50),
      "days"
    ),

    // ===================================================================
    // LIFETIME RECORD
    // ===================================================================

    // --- Days ---
    milestone(
      "hundred-logged-days",
      "100 Logged Days",
      "100 Days",
      "One hundred logged walking days. A genuine personal milestone.",
      "days", "veteran", "calendar",
      daysLogged, 100,
      dateAtNthMatch(sorted, () => true, 100),
      "days"
    ),

    // --- Distance ---
    milestone(
      "thousand-miles",
      "1,000 Miles",
      "1K mi",
      "One thousand walking miles. Distance earned.",
      "distance", "veteran", "map-pin",
      totalMiles, 1000,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 1000),
      "mi"
    ),
    milestone(
      "twenty-five-hundred-miles",
      "2,500 Miles",
      "2.5K mi",
      "Twenty-five hundred walking miles. Long-haul territory.",
      "distance", "veteran", "map-pin",
      totalMiles, 2500,
      dateAtCumulativeThreshold(sorted, (d) => d.milesWalked, 2500),
      "mi"
    ),

    // --- Hydration ---
    milestone(
      "hundred-hydration-goals",
      "100 Hydration Goals",
      "100x Goal",
      "One hundred hydration goal days. A documented commitment to recovery.",
      "hydration", "veteran", "droplets",
      hydrationGoalDays.length, 100,
      dateAtNthMatch(
        sorted,
        (d) =>
          d.waterOz !== undefined &&
          d.hydrationGoalOz !== undefined &&
          d.waterOz >= d.hydrationGoalOz,
        100
      )
    ),

    // --- Weather ---
    milestone(
      "twenty-five-heat-days",
      "25 Heat Days",
      "25 Heat",
      "Twenty-five heat days walked. Heat-tested.",
      "weather", "veteran", "flame",
      heatDays.length, 25,
      dateAtNthMatch(sorted, isDerivedHeatDay, 25)
    ),
    milestone(
      "twenty-five-weather-days",
      "25 Weather Days",
      "25 Wx",
      "Twenty-five weather days on record. Conditions are never a surprise.",
      "weather", "veteran", "cloud-rain",
      weatherDays.length, 25,
      dateAtNthMatch(sorted, isDerivedWeatherDay, 25)
    ),

    // --- Safety ---
    milestone(
      "hundred-clean-boots",
      "100 Clean Days",
      "100 Clean",
      "One hundred logged days without a dog-poop incident. Legendary tread hygiene.",
      "safety", "veteran", "shield",
      cleanStreakBest, 100,
      dateAtCleanStreak(sorted, 100),
      "days"
    ),
  ];
}
