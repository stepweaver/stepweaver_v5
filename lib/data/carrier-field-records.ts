import { effectiveHeatF, isDerivedHeatDay } from "@/lib/carrier-journal/weather-signals";
import { addCalendarDays, round1 } from "@/lib/data/carrier-journal-dates";
import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";
import { isDispatchFeedWorthy } from "@/lib/data/carrier-journal";
import type {
  PublicFieldRecord,
  PublicFieldRecordKey,
  PublicFieldRecords,
} from "@/lib/types/carrier-public-telemetry";

function emptyRecord(
  key: PublicFieldRecordKey,
  label: string
): PublicFieldRecord {
  return { key, label, value: "n/a", date: null };
}

function noteLinkId(dispatch: PublicFieldDispatch | undefined): string | undefined {
  if (!dispatch || !isDispatchFeedWorthy(dispatch)) return undefined;
  return dispatch.id;
}

function byDate(dispatches: PublicFieldDispatch[]): PublicFieldDispatch[] {
  return [...dispatches].sort((a, b) => a.date.localeCompare(b.date));
}

function longestRange(dispatches: PublicFieldDispatch[]): PublicFieldRecord {
  const label = "LONGEST RANGE";
  const ranked = [...dispatches].sort((a, b) => {
    if (b.milesWalked !== a.milesWalked) return b.milesWalked - a.milesWalked;
    return a.date.localeCompare(b.date);
  });
  const winner = ranked[0];
  if (!winner || winner.milesWalked <= 0) return emptyRecord("longest-range", label);
  return {
    key: "longest-range",
    label,
    value: String(round1(winner.milesWalked)),
    unit: "MI",
    date: winner.date,
    dispatchId: noteLinkId(winner),
  };
}

function milesByDate(dispatches: PublicFieldDispatch[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of dispatches) {
    map.set(d.date, (map.get(d.date) ?? 0) + d.milesWalked);
  }
  return map;
}

function bestSevenDayRange(dispatches: PublicFieldDispatch[]): PublicFieldRecord {
  const label = "BEST 7-DAY RANGE";
  const daily = milesByDate(dispatches);
  if (daily.size === 0) return emptyRecord("best-7-day", label);

  const dates = [...daily.keys()].sort();
  const min = dates[0];
  const max = dates[dates.length - 1];

  let bestMiles = 0;
  let bestEnd = min;
  let bestStart = min;

  for (let start = min; start <= max; start = addCalendarDays(start, 1)) {
    const end = addCalendarDays(start, 6);
    let sum = 0;
    for (let day = start; day <= end; day = addCalendarDays(day, 1)) {
      sum += daily.get(day) ?? 0;
    }
    if (sum > bestMiles) {
      bestMiles = sum;
      bestStart = start;
      bestEnd = end;
    }
  }

  if (bestMiles <= 0) return emptyRecord("best-7-day", label);

  const endDispatch = [...dispatches]
    .filter((d) => d.date >= bestStart && d.date <= bestEnd)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  return {
    key: "best-7-day",
    label,
    value: String(round1(bestMiles)),
    unit: "MI",
    date: bestEnd,
    dispatchId: noteLinkId(endDispatch),
  };
}

function hottestOperation(dispatches: PublicFieldDispatch[]): PublicFieldRecord {
  const label = "HOTTEST OPERATION";
  const withHeat = dispatches
    .map((d) => ({ dispatch: d, heat: effectiveHeatF(d) }))
    .filter((d) => Number.isFinite(d.heat));
  if (withHeat.length === 0) return emptyRecord("hottest-operation", label);

  withHeat.sort((a, b) => {
    if (b.heat !== a.heat) return b.heat - a.heat;
    return a.dispatch.date.localeCompare(b.dispatch.date);
  });
  const winner = withHeat[0];
  return {
    key: "hottest-operation",
    label,
    value: String(Math.round(winner.heat)),
    unit: "°F HI",
    date: winner.dispatch.date,
    dispatchId: noteLinkId(winner.dispatch),
  };
}

function maxCoolant(dispatches: PublicFieldDispatch[]): PublicFieldRecord {
  const label = "MAX COOLANT";
  const withWater = dispatches.filter(
    (d) => d.waterOz !== undefined && Number.isFinite(d.waterOz)
  );
  if (withWater.length === 0) return emptyRecord("max-coolant", label);

  withWater.sort((a, b) => {
    const diff = (b.waterOz ?? 0) - (a.waterOz ?? 0);
    if (diff !== 0) return diff;
    return a.date.localeCompare(b.date);
  });
  const winner = withWater[0];
  return {
    key: "max-coolant",
    label,
    value: String(Math.round(winner.waterOz ?? 0)),
    unit: "OZ",
    date: winner.date,
    dispatchId: noteLinkId(winner),
  };
}

function hydrationQualifies(d: PublicFieldDispatch): boolean {
  return (
    d.waterOz !== undefined &&
    d.hydrationGoalOz !== undefined &&
    d.waterOz >= d.hydrationGoalOz
  );
}

function longestHydrationLogStreak(dispatches: PublicFieldDispatch[]): PublicFieldRecord {
  const label = "LONGEST HYDRATION LOG STREAK";
  const ordered = byDate(dispatches);
  if (ordered.length === 0) return emptyRecord("hydration-log-streak", label);

  let best = 0;
  let bestEnd: PublicFieldDispatch | undefined;
  let current = 0;
  let currentEnd: PublicFieldDispatch | undefined;

  for (const d of ordered) {
    if (hydrationQualifies(d)) {
      current += 1;
      currentEnd = d;
      if (current > best) {
        best = current;
        bestEnd = currentEnd;
      }
    } else {
      current = 0;
      currentEnd = undefined;
    }
  }

  if (best <= 0) return emptyRecord("hydration-log-streak", label);

  return {
    key: "hydration-log-streak",
    label,
    value: String(best),
    unit: best === 1 ? "DAY" : "DAYS",
    date: bestEnd?.date ?? null,
    dispatchId: noteLinkId(bestEnd),
  };
}

function heatRange(dispatches: PublicFieldDispatch[]): PublicFieldRecord {
  const label = "HEAT RANGE";
  const heatDays = dispatches.filter(isDerivedHeatDay);
  if (heatDays.length === 0) return emptyRecord("heat-range", label);

  heatDays.sort((a, b) => {
    if (b.milesWalked !== a.milesWalked) return b.milesWalked - a.milesWalked;
    return a.date.localeCompare(b.date);
  });
  const winner = heatDays[0];
  if (winner.milesWalked <= 0) return emptyRecord("heat-range", label);

  return {
    key: "heat-range",
    label,
    value: String(round1(winner.milesWalked)),
    unit: "MI",
    date: winner.date,
    dispatchId: noteLinkId(winner),
  };
}

export function computePublicFieldRecords(
  dispatches: PublicFieldDispatch[]
): PublicFieldRecords {
  return [
    longestRange(dispatches),
    bestSevenDayRange(dispatches),
    hottestOperation(dispatches),
    maxCoolant(dispatches),
    longestHydrationLogStreak(dispatches),
    heatRange(dispatches),
  ];
}
