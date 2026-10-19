/**
 * Readable Field Journal dashboard.
 * Prefer raw, recognizable numbers over invented composite telemetry.
 *
 * milesLast7Days is the rolling 7 calendar days ending on the latest logged
 * date. It is not the current Monday–Sunday week.
 */

import { effectiveHeatF, isDerivedHeatDay } from "@/lib/carrier-journal/weather-signals";
import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";
import { addCalendarDays, differenceInCalendarDays, round1 } from "@/lib/data/carrier-journal-dates";
import { meanObserved, milesForSum } from "@/lib/data/carrier-measurements";
import {
  EMPTY_DASHBOARD_TELEMETRY,
  type PublicDashboardTelemetry,
  type PublicHottestWorkday,
} from "@/lib/types/carrier-public-telemetry";

const FOUR_WEEK_HISTORY_DAYS = 27;
const RECENT_HEAT_WINDOW_DAYS = 29;

function byDateThenId(a: PublicFieldDispatch, b: PublicFieldDispatch): number {
  const dateCmp = a.date.localeCompare(b.date);
  if (dateCmp !== 0) return dateCmp;
  return a.id.localeCompare(b.id);
}

function inWindow(dispatch: PublicFieldDispatch, start: string, end: string): boolean {
  return dispatch.date >= start && dispatch.date <= end;
}

function milesInWindow(dispatches: PublicFieldDispatch[], start: string, end: string): number {
  return round1(
    dispatches
      .filter((dispatch) => inWindow(dispatch, start, end))
      .reduce((sum, dispatch) => sum + milesForSum(dispatch.milesWalked), 0)
  );
}

function meanRound1(values: Array<number | undefined>): number | null {
  return meanObserved(values, 1);
}

function windowDays(dispatches: PublicFieldDispatch[], start: string, end: string): PublicFieldDispatch[] {
  return dispatches.filter((dispatch) => inWindow(dispatch, start, end));
}

function isWorkday(dispatch: PublicFieldDispatch): boolean {
  return milesForSum(dispatch.milesWalked) > 0;
}

function workdayFluids(dispatches: PublicFieldDispatch[]): number[] {
  return dispatches
    .filter(
      (dispatch) =>
        isWorkday(dispatch) &&
        dispatch.waterOz !== undefined &&
        Number.isFinite(dispatch.waterOz)
    )
    .map((dispatch) => dispatch.waterOz as number);
}

function hottestWorkday(
  dispatches: PublicFieldDispatch[]
): PublicHottestWorkday | null {
  const ranked = dispatches
    .map((dispatch) => ({ dispatch, heat: effectiveHeatF(dispatch) }))
    .filter((row) => Number.isFinite(row.heat) && isWorkday(row.dispatch))
    .sort((a, b) => {
      if (b.heat !== a.heat) return b.heat - a.heat;
      return a.dispatch.date.localeCompare(b.dispatch.date);
    });
  const winner = ranked[0];
  if (!winner) return null;
  return { date: winner.dispatch.date, heatF: Math.round(winner.heat) };
}

export function weeklyWalkingComparison(pct: number | null): string | null {
  if (pct === null) return null;
  const abs = Math.abs(pct);
  const label = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  if (pct > 0) return `${label}% above recent average`;
  if (pct < 0) return `${label}% below recent average`;
  return "In line with recent average";
}

export function computePublicDashboard(
  dispatches: PublicFieldDispatch[]
): PublicDashboardTelemetry {
  if (dispatches.length === 0) return EMPTY_DASHBOARD_TELEMETRY;

  const ordered = [...dispatches].sort(byDateThenId);
  const asOf = ordered[ordered.length - 1].date;
  const first = ordered[0].date;
  const totalMiles = round1(
    ordered.reduce((sum, dispatch) => sum + milesForSum(dispatch.milesWalked), 0)
  );

  const start7 = addCalendarDays(asOf, -6);
  const start28 = addCalendarDays(asOf, -27);
  const start30 = addCalendarDays(asOf, -RECENT_HEAT_WINDOW_DAYS);
  const monthKey = asOf.slice(0, 7);

  const milesLast7Days = milesInWindow(dispatches, start7, asOf);
  const historyDays = differenceInCalendarDays(asOf, first);
  const miles28 = milesInWindow(dispatches, start28, asOf);
  const fourWeekAvgMilesPerWeek =
    historyDays >= FOUR_WEEK_HISTORY_DAYS && miles28 > 0 ? round1(miles28 / 4) : null;
  const vsRecentAvgPct =
    fourWeekAvgMilesPerWeek !== null && fourWeekAvgMilesPerWeek > 0
      ? round1((milesLast7Days / fourWeekAvgMilesPerWeek - 1) * 100)
      : null;

  const days7 = windowDays(dispatches, start7, asOf);
  const days30 = windowDays(dispatches, start30, asOf);
  const monthDays = dispatches.filter((dispatch) => dispatch.date.startsWith(monthKey));

  return {
    asOf,
    workload: {
      totalMiles,
      milesLast7Days,
      fourWeekAvgMilesPerWeek,
      vsRecentAvgPct,
    },
    recovery: {
      soreness7d: meanRound1(days7.map((d) => d.soreness)),
      energy7d: meanRound1(days7.map((d) => d.energy)),
      soreness30d: meanRound1(days30.map((d) => d.soreness)),
      energy30d: meanRound1(days30.map((d) => d.energy)),
    },
    environment: {
      heatDaysThisMonth: monthDays.filter(isDerivedHeatDay).length,
      monthKey,
      hottestRecent: hottestWorkday(windowDays(dispatches, start30, asOf)),
    },
    hydration: {
      avgWorkdayOz: meanRound1(workdayFluids(dispatches)),
      avgLast30dOz: meanRound1(workdayFluids(days30)),
    },
  };
}
