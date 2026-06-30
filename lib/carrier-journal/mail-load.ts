import {
  classifyDpsLoad,
  DPS_BASELINE_MAX_SAMPLES,
  DPS_BASELINE_MIN_SAMPLES,
  DPS_HEAVY_RATIO_MIN,
  type DpsClassification,
} from "@/lib/dps";

/** Below this composite ratio vs your baseline → light day. */
export const MAIL_LOAD_LIGHT_MAX = 0.9;

export type MailLoadTier = "light" | "medium" | "heavy";

export type MailVolumeHistoryEntry = {
  date: string;
  id?: string;
  dpsCount?: number | null;
  parcels?: number | null;
};

export type MailLoadClassification = {
  tier: MailLoadTier | null;
  compositeRatio: number | null;
  dps: DpsClassification;
  parcels: DpsClassification;
};

function cleanPositive(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function getHistoricalValues(
  entries: MailVolumeHistoryEntry[],
  field: "dpsCount" | "parcels",
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

  const values: number[] = [];
  for (const entry of sorted) {
    if (values.length >= maxSamples) break;
    const value = cleanPositive(entry[field]);
    if (value != null) values.push(value);
  }

  return values;
}

export function tierFromCompositeRatio(ratio: number | null | undefined): MailLoadTier | null {
  if (ratio == null || !Number.isFinite(ratio)) return null;
  if (ratio < MAIL_LOAD_LIGHT_MAX) return "light";
  if (ratio > DPS_HEAVY_RATIO_MIN) return "heavy";
  return "medium";
}

function compositeRatio(dpsRatio: number | null, parcelRatio: number | null): number | null {
  const ratios = [dpsRatio, parcelRatio].filter((value): value is number => value != null);
  if (ratios.length === 0) return null;
  return ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
}

export function classifyMailLoad(input: {
  dpsCount?: number | null;
  parcels?: number | null;
  historicalDpsCounts: number[];
  historicalParcels: number[];
  minimumSamples?: number;
}): MailLoadClassification {
  const minimumSamples = input.minimumSamples ?? DPS_BASELINE_MIN_SAMPLES;

  const dps = classifyDpsLoad({
    currentCount: input.dpsCount,
    historicalCounts: input.historicalDpsCounts,
    minimumSamples,
  });

  const parcels = classifyDpsLoad({
    currentCount: input.parcels,
    historicalCounts: input.historicalParcels,
    minimumSamples,
  });

  const composite = compositeRatio(dps.ratio, parcels.ratio);

  return {
    tier: tierFromCompositeRatio(composite),
    compositeRatio: composite,
    dps,
    parcels,
  };
}

export function classifyMailLoadForEntry(
  entries: MailVolumeHistoryEntry[],
  current: MailVolumeHistoryEntry
): MailLoadClassification {
  return classifyMailLoad({
    dpsCount: current.dpsCount,
    parcels: current.parcels,
    historicalDpsCounts: getHistoricalValues(entries, "dpsCount", {
      excludeDate: current.date,
      excludeId: current.id,
    }),
    historicalParcels: getHistoricalValues(entries, "parcels", {
      excludeDate: current.date,
      excludeId: current.id,
    }),
  });
}

export function formatPublicMailLoadLine(input: {
  tier?: MailLoadTier | null;
  compositeRatio?: number | null;
}): string | null {
  const { tier, compositeRatio: ratio } = input;

  if (!tier) {
    if (ratio == null) return null;
    return "Mail load: Calibrating";
  }

  const tierLabel = tier === "light" ? "Light" : tier === "medium" ? "Medium" : "Heavy";

  if (ratio == null) {
    return `Mail load: ${tierLabel}`;
  }

  return `Mail load: ${tierLabel} · ${Math.round(ratio * 100)}% of baseline`;
}

export function formatPrivateMailLoadLine(input: {
  dpsCount?: number;
  parcels?: number;
  classification: MailLoadClassification;
}): string | null {
  const { dpsCount, parcels, classification } = input;
  const hasDps = cleanPositive(dpsCount) != null;
  const hasParcels = cleanPositive(parcels) != null;

  if (!hasDps && !hasParcels) return null;

  const parts: string[] = [];
  if (hasDps && dpsCount != null) {
    parts.push(`DPS ${dpsCount.toLocaleString("en-US")}`);
  }
  if (hasParcels && parcels != null) {
    parts.push(`${parcels.toLocaleString("en-US")} parcels`);
  }

  if (!classification.tier) {
    return `${parts.join(" · ")} · Calibrating baseline`;
  }

  const tierLabel =
    classification.tier === "light"
      ? "Light"
      : classification.tier === "medium"
        ? "Medium"
        : "Heavy";

  const ratioPart =
    classification.compositeRatio != null
      ? `${Math.round(classification.compositeRatio * 100)}% of baseline`
      : tierLabel;

  return `${parts.join(" · ")} · ${tierLabel} (${ratioPart})`;
}
