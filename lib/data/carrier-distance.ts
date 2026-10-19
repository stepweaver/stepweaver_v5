/**
 * Public distance history for Field Journal.
 *
 * Week boundary: Monday through Sunday, taken from the YYYY-MM-DD date in UTC.
 * A week is partial when the first walking day falls after that Monday, or the
 * latest record falls before that Sunday.
 *
 * Missing dates are omitted. They are not zero-mile days.
 * A walking day is a record with mileage greater than zero.
 * An explicit 0 is a zero-mile entry.
 * A record with no mileage — including a weight-only baseline — is neither.
 */

import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";
import { addCalendarDays, differenceInCalendarDays, round1 } from "@/lib/data/carrier-journal-dates";
import {
  isExplicitZeroMileage,
  isMissingMileage,
  isWalkingMileage,
  milesForSum,
  recordedMiles,
} from "@/lib/data/carrier-measurements";

export const RECENT_WALKING_AVERAGE_DAYS = 28;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type DistanceBucket = {
  key: string;
  label: string;
  axisLabel: string;
  miles: number;
  walkingDays: number;
  zeroMileDays: number;
  daysWithoutMileage: number;
  partial: boolean;
  start: string;
  end: string;
};

export type RecentWalkingAverage = {
  milesPerWalkingDay: number | null;
  walkingDays: number;
  windowStart: string | null;
  windowEnd: string | null;
  /** Inclusive calendar days in the window actually used. */
  windowDays: number;
  label: string;
};

export type DistanceJournal = {
  recordCount: number;
  walkingDays: number;
  zeroMileDays: number;
  daysWithoutMileage: number;
  totalMiles: number;
  recentAverage: RecentWalkingAverage;
  months: DistanceBucket[];
  weeks: DistanceBucket[];
};

type MileageRecord = Pick<PublicFieldDispatch, "date" | "milesWalked">;

function byDate(a: MileageRecord, b: MileageRecord): number {
  return a.date.localeCompare(b.date);
}

export function formatMiles(value: number): string {
  const [whole, frac] = (Math.round(value * 10) / 10).toFixed(1).split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${withCommas}.${frac}`;
}

export function formatWalkDate(isoDate: string): string {
  const month = MONTHS[Number(isoDate.slice(5, 7)) - 1] ?? isoDate.slice(5, 7);
  const day = Number(isoDate.slice(8, 10));
  return `${month} ${day}`;
}

/** Monday of the UTC week containing isoDate. */
export function weekStartMonday(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const delta = weekday === 0 ? -6 : 1 - weekday;
  return addCalendarDays(isoDate, delta);
}

export function weekEndSunday(isoDate: string): string {
  return addCalendarDays(weekStartMonday(isoDate), 6);
}

function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

function addMonth(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const next = new Date(Date.UTC(year, month, 1));
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function eachMonth(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  let key = startKey;
  while (key <= endKey && keys.length < 240) {
    keys.push(key);
    key = addMonth(key);
  }
  return keys;
}

function lastDayOfMonth(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const last = new Date(Date.UTC(year, month, 0));
  const y = last.getUTCFullYear();
  const m = String(last.getUTCMonth() + 1).padStart(2, "0");
  const d = String(last.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function monthLabel(key: string): string {
  const month = MONTHS[Number(key.slice(5, 7)) - 1] ?? key;
  return month;
}

function emptyAverage(): RecentWalkingAverage {
  return {
    milesPerWalkingDay: null,
    walkingDays: 0,
    windowStart: null,
    windowEnd: null,
    windowDays: 0,
    label: `Last ${RECENT_WALKING_AVERAGE_DAYS} days`,
  };
}

function recentAverage(records: MileageRecord[]): RecentWalkingAverage {
  const walking = records.filter((record) => isWalkingMileage(record.milesWalked));
  if (walking.length === 0) return emptyAverage();

  const end = records[records.length - 1].date;
  const firstWalking = walking[0].date;
  const windowFloor = addCalendarDays(end, -(RECENT_WALKING_AVERAGE_DAYS - 1));
  const windowStart = windowFloor > firstWalking ? windowFloor : firstWalking;
  const inWindow = walking.filter(
    (record) => record.date >= windowStart && record.date <= end
  );
  const windowDays = differenceInCalendarDays(end, windowStart) + 1;
  const miles = round1(inWindow.reduce((sum, record) => sum + milesForSum(record.milesWalked), 0));

  return {
    milesPerWalkingDay: inWindow.length > 0 ? round1(miles / inWindow.length) : null,
    walkingDays: inWindow.length,
    windowStart,
    windowEnd: end,
    windowDays,
    label:
      windowDays >= RECENT_WALKING_AVERAGE_DAYS
        ? `Last ${RECENT_WALKING_AVERAGE_DAYS} days`
        : `Since ${formatWalkDate(windowStart)}`,
  };
}

function tally(records: MileageRecord[]) {
  let miles = 0;
  let walkingDays = 0;
  let zeroMileDays = 0;
  let daysWithoutMileage = 0;
  for (const record of records) {
    if (isMissingMileage(record.milesWalked)) {
      daysWithoutMileage += 1;
      continue;
    }
    miles += recordedMiles(record.milesWalked) ?? 0;
    if (isWalkingMileage(record.milesWalked)) walkingDays += 1;
    else if (isExplicitZeroMileage(record.milesWalked)) zeroMileDays += 1;
  }
  return {
    miles: round1(miles),
    walkingDays,
    zeroMileDays,
    daysWithoutMileage,
  };
}

export function buildDistanceJournal(dispatches: MileageRecord[]): DistanceJournal {
  const records = [...dispatches].sort(byDate);
  const counts = tally(records);
  const walking = records.filter((record) => isWalkingMileage(record.milesWalked));

  if (walking.length === 0) {
    return {
      recordCount: records.length,
      walkingDays: counts.walkingDays,
      zeroMileDays: counts.zeroMileDays,
      daysWithoutMileage: counts.daysWithoutMileage,
      totalMiles: counts.miles,
      recentAverage: emptyAverage(),
      months: [],
      weeks: [],
    };
  }

  const firstWalking = walking[0].date;
  const latest = records[records.length - 1].date;
  const latestMonth = monthKey(latest);

  const months = eachMonth(monthKey(firstWalking), latestMonth).map((key) => {
    const inMonth = records.filter((record) => record.date.startsWith(key));
    const stats = tally(inMonth);
    const start = `${key}-01`;
    const end = lastDayOfMonth(key);
    return {
      key,
      label: monthLabel(key),
      axisLabel: monthLabel(key),
      ...stats,
      partial: key === latestMonth && latest < end,
      start,
      end,
    };
  });

  const weeks: DistanceBucket[] = [];
  for (
    let start = weekStartMonday(firstWalking);
    start <= weekStartMonday(latest) && weeks.length < 520;
    start = addCalendarDays(start, 7)
  ) {
    const end = addCalendarDays(start, 6);
    const inWeek = records.filter((record) => record.date >= start && record.date <= end);
    const stats = tally(inWeek);
    const [month, day] = [Number(start.slice(5, 7)), Number(start.slice(8, 10))];
    weeks.push({
      key: start,
      label: `${formatWalkDate(start)}–${formatWalkDate(end)}`,
      axisLabel: `${month}/${day}`,
      ...stats,
      partial: start < firstWalking || end > latest,
      start,
      end,
    });
  }

  return {
    recordCount: records.length,
    walkingDays: counts.walkingDays,
    zeroMileDays: counts.zeroMileDays,
    daysWithoutMileage: counts.daysWithoutMileage,
    totalMiles: counts.miles,
    recentAverage: recentAverage(records),
    months,
    weeks,
  };
}
