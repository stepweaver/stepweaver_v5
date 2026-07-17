/** Checkpoint levels for Carrier Footwear Lab. Miles = experience. */

export type CheckpointThreshold = {
  miles: number;
  title: string;
};

export type CheckpointReviewStatus =
  | "locked"
  | "mileage_reached"
  | "assessment_pending"
  | "completed"
  | "not_recorded"
  | "retrospective";

export type CheckpointProgressItem = {
  miles: number;
  title: string;
  status: CheckpointReviewStatus;
  milesRemaining: number;
  progressPercent: number;
};

const NAMED_THRESHOLDS: CheckpointThreshold[] = [
  { miles: 0, title: "Unboxed" },
  { miles: 10, title: "First Contact" },
  { miles: 25, title: "Broken In" },
  { miles: 50, title: "Route Ready" },
  { miles: 100, title: "Field Tested" },
  { miles: 150, title: "Seasoned" },
  { miles: 200, title: "Veteran" },
  { miles: 250, title: "Battle Tested" },
  { miles: 300, title: "Long Hauler" },
  { miles: 400, title: "Iron Sole" },
  { miles: 500, title: "Legendary Pair" },
];

export function getNamedCheckpointThresholds(): CheckpointThreshold[] {
  return [...NAMED_THRESHOLDS];
}

/** Named ladder plus +100-mile milestones after 500. */
export function getCheckpointThresholds(totalMiles: number): CheckpointThreshold[] {
  const thresholds = [...NAMED_THRESHOLDS];
  if (totalMiles <= 500) return thresholds;

  let next = 600;
  while (next <= Math.ceil(totalMiles / 100) * 100 + 100) {
    thresholds.push({ miles: next, title: `${next} Mile Marker` });
    next += 100;
  }
  return thresholds;
}

export function getLevelForMiles(totalMiles: number): CheckpointThreshold {
  const thresholds = getCheckpointThresholds(totalMiles);
  let current = thresholds[0];
  for (const t of thresholds) {
    if (totalMiles >= t.miles) current = t;
    else break;
  }
  return current;
}

export function getNextCheckpoint(
  totalMiles: number
): CheckpointThreshold | null {
  const thresholds = getCheckpointThresholds(Math.max(totalMiles, 500));
  return thresholds.find((t) => t.miles > totalMiles) ?? null;
}

export function milesRemainingToNext(totalMiles: number): number | null {
  const next = getNextCheckpoint(totalMiles);
  if (!next) return null;
  return Math.round((next.miles - totalMiles) * 10) / 10;
}

export function progressToNextPercent(totalMiles: number): number {
  const current = getLevelForMiles(totalMiles);
  const next = getNextCheckpoint(totalMiles);
  if (!next) return 100;
  const span = next.miles - current.miles;
  if (span <= 0) return 100;
  const progress = ((totalMiles - current.miles) / span) * 100;
  return Math.min(100, Math.max(0, Math.round(progress * 10) / 10));
}

export type CompletedCheckpointRef = {
  checkpointMiles: number;
  retrospective?: boolean;
};

/**
 * Build unlock path distinguishing mileage reached vs assessment completed.
 * Legacy shoes: thresholds below first documented checkpoint with no observation
 * are NOT_RECORDED; retrospective observations are labeled RETROSPECTIVE.
 */
export function buildCheckpointProgress(input: {
  totalMiles: number;
  completedCheckpoints: CompletedCheckpointRef[];
  isLegacyRecord?: boolean;
}): CheckpointProgressItem[] {
  const thresholds = getCheckpointThresholds(input.totalMiles);
  const completedByMiles = new Map(
    input.completedCheckpoints.map((c) => [c.checkpointMiles, c])
  );
  const documentedMiles = input.completedCheckpoints
    .filter((c) => !c.retrospective)
    .map((c) => c.checkpointMiles);
  const firstDocumented =
    documentedMiles.length > 0 ? Math.min(...documentedMiles) : null;

  return thresholds.map((t) => {
    const completed = completedByMiles.get(t.miles);
    const milesRemaining = Math.max(
      0,
      Math.round((t.miles - input.totalMiles) * 10) / 10
    );
    const progressPercent =
      input.totalMiles >= t.miles
        ? 100
        : t.miles === 0
          ? 100
          : Math.min(
              100,
              Math.max(0, Math.round((input.totalMiles / t.miles) * 1000) / 10)
            );

    if (completed) {
      return {
        miles: t.miles,
        title: t.title,
        status: completed.retrospective ? "retrospective" : "completed",
        milesRemaining: 0,
        progressPercent: 100,
      };
    }

    if (input.totalMiles >= t.miles) {
      if (
        input.isLegacyRecord &&
        firstDocumented != null &&
        t.miles < firstDocumented
      ) {
        return {
          miles: t.miles,
          title: t.title,
          status: "not_recorded",
          milesRemaining: 0,
          progressPercent: 100,
        };
      }
      return {
        miles: t.miles,
        title: t.title,
        status: "assessment_pending",
        milesRemaining: 0,
        progressPercent: 100,
      };
    }

    if (
      input.isLegacyRecord &&
      firstDocumented != null &&
      t.miles < firstDocumented
    ) {
      return {
        miles: t.miles,
        title: t.title,
        status: "not_recorded",
        milesRemaining,
        progressPercent,
      };
    }

    return {
      miles: t.miles,
      title: t.title,
      status: "locked",
      milesRemaining,
      progressPercent,
    };
  });
}

export function getPendingCheckpoints(input: {
  totalMiles: number;
  completedCheckpoints: CompletedCheckpointRef[];
  isLegacyRecord?: boolean;
}): CheckpointProgressItem[] {
  return buildCheckpointProgress(input).filter(
    (c) => c.status === "assessment_pending"
  );
}
