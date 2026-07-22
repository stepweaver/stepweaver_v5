/** Current condition and lifecycle rating trends from checkpoint observations. */

export type PerformanceRatings = {
  cushioning?: number | null;
  stability?: number | null;
  tractionDry?: number | null;
  tractionWet?: number | null;
  comfort?: number | null;
  fitSecurity?: number | null;
  breathability?: number | null;
  durability?: number | null;
};

export type BodyResponseRatings = {
  footComfort?: number | null;
  kneeComfort?: number | null;
  hipBackComfort?: number | null;
  endOfShiftSupport?: number | null;
};

export type WearRatings = {
  outsoleWear?: number | null;
  midsoleWear?: number | null;
  upperWear?: number | null;
  heelWear?: number | null;
  insoleWear?: number | null;
  structuralDeformation?: number | null;
};

export type CheckpointObservation = {
  checkpointMiles: number;
  date: string;
  retrospective?: boolean;
} & PerformanceRatings &
  BodyResponseRatings &
  WearRatings;

export type CurrentCondition = {
  checkpointMiles: number;
  date: string;
  performance: {
    cushioning: number;
    stability: number;
    tractionDry: number;
    tractionWet: number;
    comfort: number;
    fitSecurity: number;
    breathability: number;
    durability: number;
  };
  body: {
    footComfort: number;
    kneeComfort: number;
    hipBackComfort: number;
    endOfShiftSupport: number;
  };
  wear: {
    outsoleWear: number;
    midsoleWear: number;
    upperWear: number;
    heelWear: number;
    insoleWear: number;
    structuralDeformation: number;
  };
};

export type RatingTrendPoint = {
  checkpointMiles: number;
  value: number | null;
  retrospective: boolean;
};

export type RatingTrends = {
  cushioning: RatingTrendPoint[];
  stability: RatingTrendPoint[];
  tractionDry: RatingTrendPoint[];
  tractionWet: RatingTrendPoint[];
  comfort: RatingTrendPoint[];
  fitSecurity: RatingTrendPoint[];
  breathability: RatingTrendPoint[];
  durability: RatingTrendPoint[];
  footComfort: RatingTrendPoint[];
  kneeComfort: RatingTrendPoint[];
  hipBackComfort: RatingTrendPoint[];
  endOfShiftSupport: RatingTrendPoint[];
};

const PERF_KEYS = [
  "cushioning",
  "stability",
  "tractionDry",
  "tractionWet",
  "comfort",
  "fitSecurity",
  "breathability",
  "durability",
] as const;

const BODY_KEYS = [
  "footComfort",
  "kneeComfort",
  "hipBackComfort",
  "endOfShiftSupport",
] as const;

const WEAR_KEYS = [
  "outsoleWear",
  "midsoleWear",
  "upperWear",
  "heelWear",
  "insoleWear",
  "structuralDeformation",
] as const;

function numOrNull(v: number | null | undefined): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function sortByMiles(obs: CheckpointObservation[]): CheckpointObservation[] {
  return [...obs].sort((a, b) => a.checkpointMiles - b.checkpointMiles);
}

export function getLatestCompletedAssessment(
  observations: CheckpointObservation[]
): CheckpointObservation | null {
  const sorted = sortByMiles(observations);
  return sorted.length ? sorted[sorted.length - 1] : null;
}

export function getCurrentCondition(
  observations: CheckpointObservation[]
): CurrentCondition | null {
  const latest = getLatestCompletedAssessment(observations);
  if (!latest) return null;

  return {
    checkpointMiles: latest.checkpointMiles,
    date: latest.date,
    performance: {
      cushioning: numOrNull(latest.cushioning) ?? 0,
      stability: numOrNull(latest.stability) ?? 0,
      tractionDry: numOrNull(latest.tractionDry) ?? 0,
      tractionWet: numOrNull(latest.tractionWet) ?? 0,
      comfort: numOrNull(latest.comfort) ?? 0,
      fitSecurity: numOrNull(latest.fitSecurity) ?? 0,
      breathability: numOrNull(latest.breathability) ?? 0,
      durability: numOrNull(latest.durability) ?? 0,
    },
    body: {
      footComfort: numOrNull(latest.footComfort) ?? 0,
      kneeComfort: numOrNull(latest.kneeComfort) ?? 0,
      hipBackComfort: numOrNull(latest.hipBackComfort) ?? 0,
      endOfShiftSupport: numOrNull(latest.endOfShiftSupport) ?? 0,
    },
    wear: {
      outsoleWear: numOrNull(latest.outsoleWear) ?? 0,
      midsoleWear: numOrNull(latest.midsoleWear) ?? 0,
      upperWear: numOrNull(latest.upperWear) ?? 0,
      heelWear: numOrNull(latest.heelWear) ?? 0,
      insoleWear: numOrNull(latest.insoleWear) ?? 0,
      structuralDeformation: numOrNull(latest.structuralDeformation) ?? 0,
    },
  };
}

export function buildRatingTrends(
  observations: CheckpointObservation[]
): RatingTrends {
  const sorted = sortByMiles(observations);
  const trends = {} as RatingTrends;

  for (const key of [...PERF_KEYS, ...BODY_KEYS]) {
    trends[key] = sorted.map((o) => ({
      checkpointMiles: o.checkpointMiles,
      value: numOrNull(o[key]),
      retrospective: !!o.retrospective,
    }));
  }

  return trends;
}

export function buildWearTrends(
  observations: CheckpointObservation[]
): Record<(typeof WEAR_KEYS)[number], RatingTrendPoint[]> {
  const sorted = sortByMiles(observations);
  const trends = {} as Record<(typeof WEAR_KEYS)[number], RatingTrendPoint[]>;
  for (const key of WEAR_KEYS) {
    trends[key] = sorted.map((o) => ({
      checkpointMiles: o.checkpointMiles,
      value: numOrNull(o[key]),
      retrospective: !!o.retrospective,
    }));
  }
  return trends;
}

/**
 * Miles at first checkpoint where cushioning or durability drops vs prior
 * documented (non-retrospective) assessment. Null if no decline found.
 */
export function milesBeforeFirstDecline(
  observations: CheckpointObservation[]
): number | null {
  const sorted = sortByMiles(observations).filter((o) => !o.retrospective);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const cushionDrop =
      numOrNull(prev.cushioning) != null &&
      numOrNull(curr.cushioning) != null &&
      (curr.cushioning as number) < (prev.cushioning as number);
    const durabilityDrop =
      numOrNull(prev.durability) != null &&
      numOrNull(curr.durability) != null &&
      (curr.durability as number) < (prev.durability as number);
    if (cushionDrop || durabilityDrop) return curr.checkpointMiles;
  }
  return null;
}

export type ConditionLabel =
  | "UNASSESSED"
  | "EXCELLENT"
  | "STRONG"
  | "SERVICEABLE"
  | "DECLINING"
  | "CRITICAL";

export function deriveConditionLabel(
  condition: CurrentCondition | null
): ConditionLabel {
  if (!condition) return "UNASSESSED";
  const scores = [
    condition.performance.cushioning,
    condition.performance.comfort,
    condition.performance.durability,
    condition.body.endOfShiftSupport,
  ].filter((n): n is number => typeof n === "number" && n > 0);
  if (!scores.length) return "UNASSESSED";
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const maxWear = Math.max(
    condition.wear.outsoleWear,
    condition.wear.midsoleWear,
    condition.wear.upperWear,
    condition.wear.heelWear,
    condition.wear.insoleWear,
    condition.wear.structuralDeformation
  );
  if (maxWear >= 5 || avg <= 3) return "CRITICAL";
  if (maxWear >= 4 || avg <= 5) return "DECLINING";
  if (avg >= 8.5 && maxWear <= 1) return "EXCELLENT";
  if (avg >= 8) return "STRONG";
  return "SERVICEABLE";
}
