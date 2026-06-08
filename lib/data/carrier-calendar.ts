/**
 * Calendar helpers for the Carrier Field Calendar.
 * Derives logged field days from CarrierDispatch entries. No schedule claims.
 */

import type { CarrierDispatch } from "./carrier-journal";

export type WeatherMarkers = {
  rain: boolean;
  storm: boolean;
  snow: boolean;
  /** Effective temperature (temperatureF or heatIndexF) >= 80°F */
  heat80: boolean;
  /** Effective temperature (temperatureF or heatIndexF) >= 90°F */
  heat90: boolean;
  /** Temperature at or below 32°F */
  freezing: boolean;
  /** Temperature below 0°F */
  belowZero: boolean;
};

export type DaySummary = WeatherMarkers & {
  date: string;
  hasDispatch: boolean;
  totalMiles: number;
  totalSteps: number;
  dogEncounter: boolean;
  heavyLoad: boolean;
  hydrationGoalMet: boolean;
  dispatchIds: string[];
  noteExcerpt: string;
};

/** One week = 7 DaySummary entries, index 0 = Sunday through 6 = Saturday */
export type CalendarWeek = DaySummary[];

export type CalendarGrid = {
  weeks: CalendarWeek[];
  /** ISO date string for the first cell in the grid (always a Sunday) */
  gridStart: string;
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Groups dispatches by their date string ("YYYY-MM-DD").
 * Multiple dispatches on the same date are collected together.
 */
export function groupDispatchesByDate(
  dispatches: CarrierDispatch[]
): Map<string, CarrierDispatch[]> {
  const map = new Map<string, CarrierDispatch[]>();
  for (const d of dispatches) {
    const bucket = map.get(d.date) ?? [];
    bucket.push(d);
    map.set(d.date, bucket);
  }
  return map;
}

/**
 * Returns a 0–4 intensity level for heatmap shading.
 * 0 = no logged day, 1–4 = increasing mileage.
 */
export function getCalendarIntensity(day: DaySummary): 0 | 1 | 2 | 3 | 4 {
  if (!day.hasDispatch) return 0;
  const miles = day.totalMiles;
  if (miles < 7) return 1;
  if (miles < 9) return 2;
  if (miles < 11) return 3;
  return 4;
}

/**
 * Derives weather/condition markers from a single CarrierDispatch.
 * Heat is detected from temperatureF or heatIndexF (whichever is higher).
 * Freezing/belowZero use temperatureF only.
 */
export function getWeatherMarkers(d: CarrierDispatch): WeatherMarkers {
  const temp = d.temperatureF;
  const heatIndex = d.heatIndexF;
  const effective = Math.max(temp ?? -Infinity, heatIndex ?? -Infinity);
  const hasEffective = effective !== -Infinity;

  return {
    rain: !!d.rain,
    storm: !!d.storm,
    snow: !!d.snow,
    heat80: hasEffective && effective >= 80,
    heat90: hasEffective && effective >= 90,
    freezing: temp !== undefined && temp <= 32,
    belowZero: temp !== undefined && temp < 0,
  };
}

/**
 * Formats a "YYYY-MM-DD" date string as a short human label, e.g. "May 20".
 * Uses the local date constructor to avoid UTC offset drift.
 */
export function formatCalendarDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Returns the full weekday name for a "YYYY-MM-DD" date string.
 */
export function formatCalendarWeekday(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildDaySummary(date: string, dispatches: CarrierDispatch[]): DaySummary {
  if (dispatches.length === 0) {
    return {
      date,
      hasDispatch: false,
      totalMiles: 0,
      totalSteps: 0,
      rain: false,
      storm: false,
      snow: false,
      heat80: false,
      heat90: false,
      freezing: false,
      belowZero: false,
      dogEncounter: false,
      heavyLoad: false,
      hydrationGoalMet: false,
      dispatchIds: [],
      noteExcerpt: "",
    };
  }

  const totalMiles = Math.round(dispatches.reduce((s, d) => s + d.milesWalked, 0) * 10) / 10;
  // Steps are retained internally but not surfaced in public UI.
  const totalSteps = dispatches.reduce((s, d) => s + (d.steps ?? 0), 0);

  let rain = false;
  let storm = false;
  let snow = false;
  let heat80 = false;
  let heat90 = false;
  let freezing = false;
  let belowZero = false;
  let dogEncounter = false;
  let heavyLoad = false;

  for (const d of dispatches) {
    const m = getWeatherMarkers(d);
    rain = rain || m.rain;
    storm = storm || m.storm;
    snow = snow || m.snow;
    heat80 = heat80 || m.heat80;
    heat90 = heat90 || m.heat90;
    freezing = freezing || m.freezing;
    belowZero = belowZero || m.belowZero;
    dogEncounter = dogEncounter || !!d.dogEncounter;
    heavyLoad = heavyLoad || d.mailLoad === "heavy" || d.mailLoad === "brutal";
  }

  // hydrationGoalMet: every dispatch with logged hydration data met its goal
  const hydrationEligible = dispatches.filter(
    (d) => d.waterOz !== undefined && d.hydrationGoalOz !== undefined
  );
  const hydrationGoalMet =
    hydrationEligible.length > 0 &&
    hydrationEligible.every((d) => (d.waterOz ?? 0) >= (d.hydrationGoalOz ?? 0));

  const noteExcerpt = dispatches[0]?.publicNote?.slice(0, 120) ?? "";

  return {
    date,
    hasDispatch: true,
    totalMiles,
    totalSteps,
    rain,
    storm,
    snow,
    heat80,
    heat90,
    freezing,
    belowZero,
    dogEncounter,
    heavyLoad,
    hydrationGoalMet,
    dispatchIds: dispatches.map((d) => d.id),
    noteExcerpt,
  };
}

/**
 * Builds a weekly calendar grid from dispatches.
 * Weeks run Sunday–Saturday. The grid spans from the Sunday of the first
 * dispatch's week to the Saturday of today's week (minimum 4 weeks shown).
 */
export function buildCalendarGrid(dispatches: CarrierDispatch[]): CalendarGrid {
  const byDate = groupDispatchesByDate(dispatches);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Determine start: Sunday of the week containing the earliest dispatch (or 4 weeks ago)
  const dispatchDates = [...byDate.keys()].sort();
  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 27);

  let anchorStart =
    dispatchDates.length > 0
      ? (() => {
          const [y, mo, d] = dispatchDates[0].split("-").map(Number);
          return new Date(y, mo - 1, d);
        })()
      : fourWeeksAgo;

  if (anchorStart > fourWeeksAgo) anchorStart = fourWeeksAgo;

  // Back up to Sunday
  const calStart = new Date(anchorStart);
  calStart.setDate(calStart.getDate() - calStart.getDay());

  // End: Saturday of the week containing today
  const calEnd = new Date(today);
  calEnd.setDate(calEnd.getDate() + (6 - calEnd.getDay()));

  const weeks: CalendarWeek[] = [];
  const cursor = new Date(calStart);

  while (cursor <= calEnd) {
    const week: DaySummary[] = [];
    for (let i = 0; i < 7; i++) {
      const key = dateKey(cursor);
      const dayDispatches = byDate.get(key) ?? [];
      week.push(buildDaySummary(key, dayDispatches));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, gridStart: dateKey(calStart) };
}
