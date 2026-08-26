import "server-only";

import type { CarrierDispatch } from "@/lib/data/carrier-journal";
import {
  addCalendarDays,
  differenceInCalendarDays,
  isMonday,
  round1,
} from "@/lib/data/carrier-journal-dates";
import {
  EMPTY_MASS_DELTA_SERIES,
  type PublicMassDeltaSeries,
  type PublicMassPoint,
} from "@/lib/types/carrier-public-telemetry";

const LAST_30D_WINDOW_DAYS = 30;
const LAST_30D_PROXIMITY_DAYS = 7;

function mondayWeightEntries(dispatches: CarrierDispatch[]): { date: string; weightLbs: number }[] {
  return [...dispatches]
    .filter(
      (d): d is CarrierDispatch & { weightLbs: number } =>
        d.weightLbs !== undefined && Number.isFinite(d.weightLbs) && isMonday(d.date)
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date, weightLbs: d.weightLbs }));
}

function averageWeeklyDelta(
  firstDate: string,
  lastDate: string,
  currentDelta: number
): number | null {
  const elapsedWeeks = differenceInCalendarDays(lastDate, firstDate) / 7;
  if (elapsedWeeks <= 0) return null;
  return round1(currentDelta / elapsedWeeks);
}

function last30DayDelta(points: PublicMassPoint[]): number | null {
  if (points.length < 2) return null;

  const latest = points[points.length - 1];
  const cutoff = addCalendarDays(latest.date, -LAST_30D_WINDOW_DAYS);
  const comparison = [...points].reverse().find((p) => p.date <= cutoff);
  if (!comparison) return null;

  const proximity = differenceInCalendarDays(cutoff, comparison.date);
  if (proximity > LAST_30D_PROXIMITY_DAYS) return null;

  return round1(latest.deltaFromBaseline - comparison.deltaFromBaseline);
}

/**
 * Transform Monday weigh-ins into a relative public series.
 * Absolute lbs never leave this module.
 */
export function toPublicMassDeltaSeries(
  dispatches: CarrierDispatch[]
): PublicMassDeltaSeries {
  const entries = mondayWeightEntries(dispatches);
  if (entries.length === 0) return EMPTY_MASS_DELTA_SERIES;

  const baseline = entries[0].weightLbs;
  const points: PublicMassPoint[] = entries.map((entry, index) => {
    const prev = index > 0 ? entries[index - 1] : null;
    return {
      date: entry.date,
      deltaFromBaseline: round1(entry.weightLbs - baseline),
      deltaFromPrevious: prev === null ? null : round1(entry.weightLbs - prev.weightLbs),
    };
  });

  const currentDelta = points[points.length - 1].deltaFromBaseline;
  const firstDate = points[0].date;
  const lastDate = points[points.length - 1].date;

  return {
    points,
    currentDelta,
    last30DayDelta: last30DayDelta(points),
    averageWeeklyDelta:
      points.length >= 2 ? averageWeeklyDelta(firstDate, lastDate, currentDelta) : null,
  };
}
