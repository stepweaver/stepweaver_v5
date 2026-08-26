/** Calendar helpers for YYYY-MM-DD journal dates. No biometric data. */

const MS_PER_DAY = 86_400_000;

/** Noon-local parse, matching the daybook Monday check. */
export function parseJournalDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00`);
}

export function isMonday(isoDate: string): boolean {
  return parseJournalDate(isoDate).getDay() === 1;
}

function utcMidnight(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function differenceInCalendarDays(later: string, earlier: string): number {
  return Math.round((utcMidnight(later) - utcMidnight(earlier)) / MS_PER_DAY);
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day + days));
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Field-log stamp, e.g. 2026.08.21 */
export function formatFieldDateStamp(isoDate: string): string {
  return isoDate.replace(/-/g, ".");
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
