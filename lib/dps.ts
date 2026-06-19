export interface DpsBaselineInput {
  currentCount?: number | null;
  historicalCounts: Array<number | null | undefined>;
  minimumSamples?: number;
}

export interface DpsClassification {
  baseline: number | null;
  ratio: number | null;
  sampleSize: number;
}

export const DPS_BASELINE_MAX_SAMPLES = 30;
export const DPS_BASELINE_MIN_SAMPLES = 5;

export const DPS_HEAVY_RATIO_MIN = 1.15;
export const DPS_VERY_HEAVY_RATIO_MIN = 1.4;

export const MAIL_DAY_CONTEXT_OPTIONS = [
  "Monday",
  "Day after holiday",
  "Holiday week",
  "Advo/WSS",
  "Political mail",
  "Heavy parcels",
  "Light parcels",
  "Rain",
  "Heat",
  "Snow",
  "New route",
  "Pivot/split",
  "Undertime",
  "Overtime",
  "Amazon-heavy",
  "Recovery day",
] as const;

export type MailDayContext = (typeof MAIL_DAY_CONTEXT_OPTIONS)[number];

function cleanCounts(values: Array<number | null | undefined>): number[] {
  return values.filter(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value) && value > 0
  );
}

export function median(values: number[]): number | null {
  const cleaned = cleanCounts(values).sort((a, b) => a - b);

  if (cleaned.length === 0) {
    return null;
  }

  const middle = Math.floor(cleaned.length / 2);

  if (cleaned.length % 2 === 0) {
    return (cleaned[middle - 1] + cleaned[middle]) / 2;
  }

  return cleaned[middle];
}

export function classifyDpsLoad(input: DpsBaselineInput): DpsClassification {
  const minimumSamples = input.minimumSamples ?? DPS_BASELINE_MIN_SAMPLES;

  const currentCount =
    typeof input.currentCount === "number" &&
    Number.isFinite(input.currentCount) &&
    input.currentCount > 0
      ? input.currentCount
      : null;

  const historicalCounts = cleanCounts(input.historicalCounts);

  if (!currentCount || historicalCounts.length < minimumSamples) {
    return {
      baseline: null,
      ratio: null,
      sampleSize: historicalCounts.length,
    };
  }

  const baseline = median(historicalCounts);

  if (!baseline || baseline <= 0) {
    return {
      baseline: null,
      ratio: null,
      sampleSize: historicalCounts.length,
    };
  }

  return {
    baseline,
    ratio: currentCount / baseline,
    sampleSize: historicalCounts.length,
  };
}

export type DpsHistoryEntry = {
  date: string;
  id?: string;
  dpsCount?: number | null;
};

export function getBaselineHistoricalCounts(
  entries: DpsHistoryEntry[],
  options: {
    excludeDate?: string;
    excludeId?: string;
    maxSamples?: number;
  } = {}
): number[] {
  const { excludeDate, excludeId, maxSamples = DPS_BASELINE_MAX_SAMPLES } = options;

  const sorted = [...entries]
    .filter((entry) => {
      if (excludeDate && entry.date === excludeDate) return false;
      if (excludeId && entry.id === excludeId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const counts: number[] = [];
  for (const entry of sorted) {
    if (counts.length >= maxSamples) break;
    if (
      typeof entry.dpsCount === "number" &&
      Number.isFinite(entry.dpsCount) &&
      entry.dpsCount > 0
    ) {
      counts.push(entry.dpsCount);
    }
  }

  return counts;
}

export function classifyDpsForEntry(
  entries: DpsHistoryEntry[],
  current: DpsHistoryEntry
): DpsClassification {
  return classifyDpsLoad({
    currentCount: current.dpsCount,
    historicalCounts: getBaselineHistoricalCounts(entries, {
      excludeDate: current.date,
      excludeId: current.id,
    }),
  });
}

export function isHeavyDpsRatio(ratio: number | null | undefined): boolean {
  return (
    typeof ratio === "number" &&
    Number.isFinite(ratio) &&
    ratio > DPS_HEAVY_RATIO_MIN &&
    ratio <= DPS_VERY_HEAVY_RATIO_MIN
  );
}

export function isVeryHeavyDpsRatio(ratio: number | null | undefined): boolean {
  return typeof ratio === "number" && Number.isFinite(ratio) && ratio > DPS_VERY_HEAVY_RATIO_MIN;
}

export function formatDpsCount(count: number): string {
  return count.toLocaleString("en-US");
}

export function formatDpsRatioPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function formatPrivateDpsLine(input: {
  dpsCount?: number;
  dpsRatio?: number | null;
}): string | null {
  if (typeof input.dpsCount !== "number" || !Number.isFinite(input.dpsCount) || input.dpsCount <= 0) {
    return null;
  }

  const count = formatDpsCount(input.dpsCount);

  if (input.dpsRatio == null) {
    return `DPS: ${count} · Calibrating`;
  }

  return `DPS: ${count} · ${formatDpsRatioPercent(input.dpsRatio)} of baseline`;
}

export function formatPublicDpsLoadLine(dpsRatio?: number | null): string | null {
  if (dpsRatio == null) {
    return null;
  }

  return `DPS load: ${formatDpsRatioPercent(dpsRatio)} of recent baseline`;
}

export function computeDpsPerMile(dpsCount?: number, milesWalked?: number): number | null {
  if (
    typeof dpsCount !== "number" ||
    !Number.isFinite(dpsCount) ||
    dpsCount <= 0 ||
    typeof milesWalked !== "number" ||
    !Number.isFinite(milesWalked) ||
    milesWalked <= 0
  ) {
    return null;
  }

  return Math.round((dpsCount / milesWalked) * 10) / 10;
}
