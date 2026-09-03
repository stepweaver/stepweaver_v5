/**
 * Walking energy expenditure.
 *
 * Canonical model: Minimum Mechanics (Ludlow & Weyand, J Appl Physiol 2017),
 * field-validated for real-world walking by Weyand et al. 2021.
 *
 * Level / uphill:
 *   VO2 = 3.05 + ((W+L)/W) * T * [0.32G + 3.28 + (1 + 0.19G)(2.66 S^2)]
 *
 * Downhill uses the published Cdecline = 0.73 applied to *level* non-resting
 * metabolism rather than plugging a negative grade into the uphill terms.
 *
 * When moving time is missing, fall back to 0.5 kcal/lb/mile — the level,
 * ordinary-speed approximation of the same model.
 */

export type WalkingEnergyMethod = "minimum-mechanics" | "distance-fallback";

export type LocomotionEnergyMethod = WalkingEnergyMethod | "mixed";

export type WalkingEnergyInput = {
  weightKg: number;
  distanceMiles: number;
  movingMinutes?: number;
  loadKg?: number;
  gradePercent?: number;
  terrainFactor?: number;
};

export type WalkingEnergyEstimate = {
  kcal: number;
  method: WalkingEnergyMethod;
};

export type LocomotionEnergySeries = {
  kcal: number | null;
  method: LocomotionEnergyMethod | null;
};

type WeightDated = {
  date: string;
  milesWalked: number;
  weightLbs?: number;
  movingMinutes?: number;
  loadKg?: number;
  gradePercent?: number;
  terrainFactor?: number;
};

const LB_PER_KG = 2.2046226218;
const METERS_PER_MILE = 1609.344;
const KCAL_PER_LITER_O2 = 5;
const VO2_REST_ML_KG_MIN = 3.05;
const FALLBACK_KCAL_PER_LB_MILE = 0.5;
const DECLINE_COEFFICIENT = 0.73;

export function estimateWalkingEnergy({
  weightKg,
  distanceMiles,
  movingMinutes,
  loadKg = 0,
  gradePercent = 0,
  terrainFactor = 1,
}: WalkingEnergyInput): WalkingEnergyEstimate {
  if (weightKg <= 0 || distanceMiles <= 0) {
    return { kcal: 0, method: "distance-fallback" };
  }

  if (!movingMinutes || movingMinutes <= 0) {
    const weightLb = weightKg * LB_PER_KG;
    return {
      kcal: Math.round(weightLb * distanceMiles * FALLBACK_KCAL_PER_LB_MILE),
      method: "distance-fallback",
    };
  }

  const kcal = minimumMechanicsKcal({
    weightKg,
    distanceMiles,
    movingMinutes,
    loadKg,
    gradePercent,
    terrainFactor,
  });

  return {
    kcal: Math.round(kcal),
    method: "minimum-mechanics",
  };
}

export function kgFromLbs(weightLbs: number): number {
  return weightLbs / LB_PER_KG;
}

export function estimateLocomotionEnergyForDispatch(
  series: WeightDated[],
  day: WeightDated
): WalkingEnergyEstimate | null {
  if (day.milesWalked <= 0) return null;
  const weightLbs = weightLbsAsOf(series, day.date);
  if (weightLbs === undefined || weightLbs <= 0) return null;

  const estimate = estimateWalkingEnergy({
    weightKg: kgFromLbs(weightLbs),
    distanceMiles: day.milesWalked,
    movingMinutes: day.movingMinutes,
    loadKg: day.loadKg,
    gradePercent: day.gradePercent,
    terrainFactor: day.terrainFactor,
  });

  return estimate.kcal > 0 ? estimate : null;
}

export function estimateLocomotionEnergyFromDispatches(
  dispatches: WeightDated[]
): LocomotionEnergySeries {
  const walkingDays = dispatches.filter((d) => d.milesWalked > 0);
  if (walkingDays.length === 0) {
    return { kcal: null, method: null };
  }

  let totalKcal = 0;
  let contributing = 0;
  let mechanicsDays = 0;
  let fallbackDays = 0;

  for (const day of walkingDays) {
    const estimate = estimateLocomotionEnergyForDispatch(dispatches, day);
    if (!estimate) continue;

    totalKcal += estimate.kcal;
    contributing += 1;
    if (estimate.method === "minimum-mechanics") mechanicsDays += 1;
    else fallbackDays += 1;
  }

  if (contributing === 0) {
    return { kcal: null, method: null };
  }

  const method: LocomotionEnergyMethod =
    mechanicsDays > 0 && fallbackDays > 0
      ? "mixed"
      : mechanicsDays > 0
        ? "minimum-mechanics"
        : "distance-fallback";

  return {
    kcal: Math.round(totalKcal),
    method,
  };
}

export function formatLocomotionKcal(kcal: number | null): string {
  if (kcal === null) return "n/a";
  return `${kcal.toLocaleString("en-US")} Calories`;
}

export function locomotionMethodDetail(
  method: LocomotionEnergyMethod | null
): string {
  if (method === "distance-fallback") {
    return "APPROX. FROM DISTANCE & BODY MASS";
  }
  if (method === "minimum-mechanics" || method === "mixed") {
    return "MODELED FROM DISTANCE, BODY MASS & MOVEMENT";
  }
  return "REQUIRES DISTANCE & BODY MASS";
}

function minimumMechanicsKcal({
  weightKg,
  distanceMiles,
  movingMinutes,
  loadKg,
  gradePercent,
  terrainFactor,
}: Required<
  Pick<
    WalkingEnergyInput,
    | "weightKg"
    | "distanceMiles"
    | "movingMinutes"
    | "loadKg"
    | "gradePercent"
    | "terrainFactor"
  >
>): number {
  const distanceMeters = distanceMiles * METERS_PER_MILE;
  const durationSeconds = movingMinutes * 60;
  const speedMps = distanceMeters / durationSeconds;
  const loadRatio = (weightKg + loadKg) / weightKg;

  const vo2MlKgMin =
    gradePercent < 0
      ? downhillVo2(loadRatio, terrainFactor, speedMps)
      : uphillVo2(loadRatio, terrainFactor, gradePercent, speedMps);

  const oxygenLitersPerMinute = (vo2MlKgMin * weightKg) / 1000;
  const kcalPerMinute = oxygenLitersPerMinute * KCAL_PER_LITER_O2;
  return kcalPerMinute * movingMinutes;
}

function uphillVo2(
  loadRatio: number,
  terrainFactor: number,
  gradePercent: number,
  speedMps: number
): number {
  return (
    VO2_REST_ML_KG_MIN +
    loadRatio *
      terrainFactor *
      (0.32 * gradePercent +
        3.28 +
        (1 + 0.19 * gradePercent) * 2.66 * speedMps ** 2)
  );
}

function downhillVo2(
  loadRatio: number,
  terrainFactor: number,
  speedMps: number
): number {
  const levelWalking =
    loadRatio * terrainFactor * (3.28 + 2.66 * speedMps ** 2);
  return VO2_REST_ML_KG_MIN + DECLINE_COEFFICIENT * levelWalking;
}

function weightLbsAsOf(
  dispatches: WeightDated[],
  date: string
): number | undefined {
  const weights = dispatches
    .filter(
      (d): d is WeightDated & { weightLbs: number } =>
        d.weightLbs !== undefined && Number.isFinite(d.weightLbs) && d.weightLbs > 0
    )
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  let last: number | undefined;
  for (const entry of weights) {
    if (entry.date <= date) last = entry.weightLbs;
    else break;
  }
  if (last !== undefined) return last;
  return weights.find((entry) => entry.date > date)?.weightLbs;
}
