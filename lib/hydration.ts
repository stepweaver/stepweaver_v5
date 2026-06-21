/**
 * Hydration goal calculator for outdoor mail carriers.
 *
 * Formula basis:
 * - OSHA heat guidance: 24–32 oz/hr during hot outdoor work
 * - CDC/NIOSH working-heat range: up to 48 oz/hr upper safe limit
 * - NWS heat-index bands: caution / extreme caution / danger / extreme danger
 * - NWS sun adjustment: direct sun raises effective heat index ~10–15°F
 * - Pre-shift hydration: ~6 ml/kg body weight before extended activity
 * - Mail carrier walk rate modeled at ~1.25 mph (slower than exercise due to stops)
 */

export type HydrationInputs = {
  weightLbs?: number | null;
  peakTempF: number;
  peakHeatIndexF: number;
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
  effectiveHeatF: number;
  routeHours: number;
  heatBand: HeatBand;
  routeWaterGoalOz: number;
  preShiftWaterOz: number | null;
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

function estimateRouteHours(
  milesWalked?: number | null,
  routeHours?: number | null
): number {
  if (routeHours && routeHours > 0) {
    return clamp(routeHours, 1, 12);
  }

  if (milesWalked && milesWalked > 0) {
    // Mail delivery walking is slower than exercise walking because of stops,
    // relays, porches, stairs, parcels, and mounted sections.
    return clamp(milesWalked / 1.25, 4, 10);
  }

  return 8;
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

  const rawEffectiveHeat = Math.max(input.peakTempF, input.peakHeatIndexF);
  const effectiveHeatF = input.directSun ? rawEffectiveHeat + 10 : rawEffectiveHeat;

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
