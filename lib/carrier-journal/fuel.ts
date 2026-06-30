export const FUEL_SCORE_MAX = 6;
export const FUEL_SCORE_WIN = 4;

export type RouteFoodEaten = "none" | "partial" | "all";
export type MealQuality = "poor" | "okay" | "solid";

export type FuelLogInput = {
  breakfastProtein?: boolean;
  routeFoodPacked?: boolean;
  routeFoodEaten?: RouteFoodEaten;
  proteinAnchors?: 0 | 1 | 2 | 3 | 4;
  fruitVegServings?: 0 | 1 | 2 | 3;
  gatorade?: 0 | 1 | 2;
  mountainDewOz?: number;
  postShiftMealQuality?: MealQuality;
};

export type FuelScoreBreakdown = {
  breakfastProtein: boolean;
  routeFoodPacked: boolean;
  routeFoodEaten: boolean;
  proteinAnchors: boolean;
  fruitVegServings: boolean;
  mountainDewMeasured: boolean;
};

export type FuelScoreResult = {
  score: number;
  max: typeof FUEL_SCORE_MAX;
  isWin: boolean;
  breakdown: FuelScoreBreakdown;
};

export function computeFuelScore(input: FuelLogInput): FuelScoreResult {
  const breakdown: FuelScoreBreakdown = {
    breakfastProtein: input.breakfastProtein === true,
    routeFoodPacked: input.routeFoodPacked === true,
    routeFoodEaten:
      input.routeFoodEaten === "partial" || input.routeFoodEaten === "all",
    proteinAnchors: (input.proteinAnchors ?? 0) >= 3,
    fruitVegServings: (input.fruitVegServings ?? 0) >= 2,
    mountainDewMeasured:
      input.mountainDewOz !== undefined &&
      Number.isFinite(input.mountainDewOz) &&
      input.mountainDewOz >= 0,
  };

  const score = Object.values(breakdown).filter(Boolean).length;

  return {
    score,
    max: FUEL_SCORE_MAX,
    isWin: score >= FUEL_SCORE_WIN,
    breakdown,
  };
}

export function formatFuelScore(score: number): string {
  return `${score}/${FUEL_SCORE_MAX}`;
}
