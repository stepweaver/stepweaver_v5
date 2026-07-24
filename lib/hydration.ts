/**
 * Hydration goal calculator for outdoor mail carriers.
 *
 * Tuned for achievable route targets (not OSHA peak rates applied all day):
 * - Heat input blends sustained load (avg HI) with spike (peak HI)
 * - Route hours from miles ÷ 1.5, clamped 5–9
 * - Saved / scored goal is route water only; pre-shift is advice, not part of hit/miss
 * - Hourly rates still follow NWS heat-index bands (caution → extreme danger)
 */

export type HydrationInputs = {
  weightLbs?: number | null;
  peakTempF: number;
  peakHeatIndexF: number;
  /** Average heat index across the shift; used in the blended heat model. */
  avgHeatIndexF?: number | null;
  milesWalked?: number | null;
  routeHours?: number | null;
  directSun?: boolean;
};

export type HeatBand =
  | "normal"
  | "caution"
  | "extreme-caution"
  | "danger"
  | "extreme-danger";

export type HydrationRecommendation = {
  /** Blended effective heat used for band selection (°F). */
  effectiveHeatF: number;
  routeHours: number;
  heatBand: HeatBand;
  /** Route drinking target - this is what gets saved as Hydration Goal Oz. */
  routeWaterGoalOz: number;
  preShiftWaterOz: number | null;
  /** Route + pre-shift advisory total (not used for hit/miss scoring). */
  totalSuggestedOz: number;
  electrolyteRecommended: boolean;
  maxSafeRouteWaterOz: number;
  warnings: string[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundToNearest8(value: number): number {
  return Math.round(value / 8) * 8;
}

/**
 * Estimate on-street exposure hours from mileage.
 * 1.5 mi/h effective pace reflects relays, porches, parcels, and mounted segments.
 */
function estimateRouteHours(
  milesWalked?: number | null,
  routeHours?: number | null
): number {
  if (routeHours && routeHours > 0) {
    return clamp(routeHours, 1, 12);
  }

  if (milesWalked && milesWalked > 0) {
    return clamp(milesWalked / 1.5, 5, 9);
  }

  return 7;
}

/**
 * 70% average HI + 30% peak HI so a short spike does not price the whole day.
 * Falls back to peak when avg is missing.
 */
export function blendedEffectiveHeatF(
  peakTempF: number,
  peakHeatIndexF: number,
  avgHeatIndexF?: number | null
): number {
  const peak = Math.max(peakTempF, peakHeatIndexF);
  const avg = avgHeatIndexF != null && Number.isFinite(avgHeatIndexF) ? avgHeatIndexF : peak;
  return Math.round(0.7 * avg + 0.3 * peak);
}

function getHeatBand(effectiveHeatF: number): HeatBand {
  if (effectiveHeatF >= 125) return "extreme-danger";
  if (effectiveHeatF >= 103) return "danger";
  if (effectiveHeatF >= 90) return "extreme-caution";
  if (effectiveHeatF >= 80) return "caution";
  return "normal";
}

function getOzPerHour(heatBand: HeatBand): number {
  switch (heatBand) {
    case "normal":
      return 12;
    case "caution":
      return 16;
    case "extreme-caution":
      return 24;
    case "danger":
      return 32;
    case "extreme-danger":
      return 40;
  }
}

function getPreShiftWaterOz(weightLbs?: number | null): number | null {
  if (!weightLbs || weightLbs <= 0) return null;
  const weightKg = weightLbs / 2.20462;
  const ml = weightKg * 6;
  const oz = ml / 29.5735;
  return roundToNearest8(oz);
}

export function calculateHydrationGoal(
  input: HydrationInputs
): HydrationRecommendation {
  const routeHours = estimateRouteHours(input.milesWalked, input.routeHours);

  const blended = blendedEffectiveHeatF(
    input.peakTempF,
    input.peakHeatIndexF,
    input.avgHeatIndexF
  );
  const effectiveHeatF = input.directSun ? blended + 10 : blended;

  const heatBand = getHeatBand(effectiveHeatF);
  const ozPerHour = getOzPerHour(heatBand);

  const routeWaterGoalOz = roundToNearest8(routeHours * ozPerHour);
  const preShiftWaterOz = getPreShiftWaterOz(input.weightLbs);
  const maxSafeRouteWaterOz = routeHours * 48;

  const cappedRouteGoal = Math.min(routeWaterGoalOz, maxSafeRouteWaterOz);
  const totalSuggestedOz = preShiftWaterOz
    ? cappedRouteGoal + preShiftWaterOz
    : cappedRouteGoal;

  const warnings: string[] = [];

  if (heatBand === "danger") {
    warnings.push(
      "Danger-level heat. Prioritize shade, cooling breaks, and electrolytes."
    );
  }
  if (heatBand === "extreme-danger") {
    warnings.push(
      "Extreme-danger heat. Hydration alone is not enough. Reduce heat exposure."
    );
  }
  if (routeWaterGoalOz > maxSafeRouteWaterOz) {
    warnings.push(
      "Calculated goal exceeds safe hourly intake guidance. Route goal capped."
    );
  }

  const electrolyteRecommended = routeHours >= 2 && effectiveHeatF >= 80;

  return {
    effectiveHeatF,
    routeHours,
    heatBand,
    routeWaterGoalOz: cappedRouteGoal,
    preShiftWaterOz,
    totalSuggestedOz,
    electrolyteRecommended,
    maxSafeRouteWaterOz,
    warnings,
  };
}

export const HEAT_BAND_LABEL: Record<HeatBand, string> = {
  "normal": "NORMAL",
  "caution": "CAUTION",
  "extreme-caution": "EXTREME CAUTION",
  "danger": "DANGER",
  "extreme-danger": "EXTREME DANGER",
};
