import { computeDpsPerMile } from "@/lib/dps";

/**
 * DPS pieces per mile walked. Returns null if inputs are invalid or miles is zero.
 * Delegates to `computeDpsPerMile` which rounds to one decimal.
 */
export function calculateDpsRatio(dpsCount: number, miles: number): number | null {
  if (!Number.isFinite(dpsCount) || !Number.isFinite(miles) || miles <= 0) {
    return null;
  }
  return computeDpsPerMile(dpsCount, miles);
}

/** "9.4 mi" */
export function formatMileage(miles: number): string {
  return `${miles.toFixed(1)} mi`;
}

/** "87°F" */
export function formatTemperature(f: number): string {
  return `${Math.round(f)}°F`;
}

export interface PublicSummaryInput {
  miles?: number;
  dpsCount?: number;
  dpsPerMile?: number | null;
  temperatureF?: number;
  heatIndexF?: number;
  publicNote?: string;
}

/**
 * Builds a plain-text public summary sentence from logged data.
 * If a public note is provided it is used as-is.
 * Otherwise a summary is generated from the numeric stats.
 */
export function buildPublicSummary(input: PublicSummaryInput): string {
  if (input.publicNote?.trim()) {
    return input.publicNote.trim();
  }

  const parts: string[] = [];

  if (input.miles !== undefined) {
    let lead = `Walked ${formatMileage(input.miles)} today`;
    if (input.temperatureF !== undefined) {
      const tempPart = `a peak temperature of ${formatTemperature(input.temperatureF)}`;
      const heatPart =
        input.heatIndexF !== undefined
          ? ` and heat index of ${formatTemperature(input.heatIndexF)}`
          : "";
      lead += ` with ${tempPart}${heatPart}`;
    }
    parts.push(lead);
  } else if (input.temperatureF !== undefined) {
    const heatPart =
      input.heatIndexF !== undefined
        ? `, heat index ${formatTemperature(input.heatIndexF)}`
        : "";
    parts.push(`Temperature today: ${formatTemperature(input.temperatureF)}${heatPart}`);
  }

  if (input.dpsCount !== undefined && input.dpsCount > 0) {
    const countStr = input.dpsCount.toLocaleString("en-US");
    const perMilePart =
      input.dpsPerMile != null ? `, about ${input.dpsPerMile.toLocaleString("en-US")} DPS per mile` : "";
    parts.push(`DPS volume came in at ${countStr} pieces${perMilePart}`);
  }

  return parts.length > 0 ? parts.join(". ") + "." : "";
}
