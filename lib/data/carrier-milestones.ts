import type { CarrierDispatch, PublicFieldDispatch } from "./carrier-journal";

type MilestoneDispatch = PublicFieldDispatch | CarrierDispatch;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CarrierLevel = {
  title: string;
  level: number;
  totalLevels: number;
  totalMiles: number;
  nextTitle?: string;
  nextMiles?: number;
  progressToNext: number;
};

export type CarrierRank = {
  level: number;
  title: string;
  miles: number;
  status: "reached" | "current" | "locked";
  milesRemaining: number;
};

// ---------------------------------------------------------------------------
// Distance class ladder
// ---------------------------------------------------------------------------

const LEVEL_THRESHOLDS: { miles: number; title: string; level: number }[] = [
  { miles: 0, title: "BOOT SEQUENCE", level: 1 },
  { miles: 25, title: "CALIBRATION", level: 2 },
  { miles: 50, title: "WALK CYCLE", level: 3 },
  { miles: 100, title: "FIELD UNIT", level: 4 },
  { miles: 250, title: "LOAD-BEARING", level: 5 },
  { miles: 500, title: "LONG WALKER", level: 6 },
  { miles: 1000, title: "DISTANCE PROVEN", level: 7 },
  { miles: 2500, title: "HARDENED", level: 8 },
  { miles: 5000, title: "IRON FRAME", level: 9 },
  { miles: 10000, title: "ENDURANCE CLASS", level: 10 },
];

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

export function getCarrierLevel(dispatches: MilestoneDispatch[]): CarrierLevel {
  const totalMiles = dispatches.reduce((s, d) => s + d.milesWalked, 0);
  const rounded = Math.round(totalMiles * 10) / 10;

  let currentIdx = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalMiles >= LEVEL_THRESHOLDS[i].miles) {
      currentIdx = i;
      break;
    }
  }

  const current = LEVEL_THRESHOLDS[currentIdx];
  const next = LEVEL_THRESHOLDS[currentIdx + 1] ?? null;

  let progressToNext = 100;
  if (next) {
    const span = next.miles - current.miles;
    const progress = totalMiles - current.miles;
    progressToNext = Math.min(100, Math.round((progress / span) * 100));
  }

  return {
    title: current.title,
    level: current.level,
    totalLevels: LEVEL_THRESHOLDS.length,
    totalMiles: rounded,
    ...(next ? { nextTitle: next.title, nextMiles: next.miles } : {}),
    progressToNext,
  };
}

export function getCarrierRankLadder(totalMiles: number): CarrierRank[] {
  const rounded = Math.round(totalMiles * 10) / 10;

  let currentIdx = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalMiles >= LEVEL_THRESHOLDS[i].miles) {
      currentIdx = i;
      break;
    }
  }

  return LEVEL_THRESHOLDS.map((threshold, idx) => {
    const reached = totalMiles >= threshold.miles;
    const status: CarrierRank["status"] =
      idx === currentIdx ? "current" : reached ? "reached" : "locked";

    const milesRemaining =
      status === "reached"
        ? 0
        : Math.max(0, Math.round((threshold.miles - rounded) * 10) / 10);

    return {
      level: threshold.level,
      title: threshold.title,
      miles: threshold.miles,
      status,
      milesRemaining,
    };
  });
}
