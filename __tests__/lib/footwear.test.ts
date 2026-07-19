import {
  buildCheckpointProgress,
  getLevelForMiles,
  getNextCheckpoint,
  milesRemainingToNext,
  progressToNextPercent,
  getPendingCheckpoints,
  getSuggestedCheckpoint,
} from "@/lib/footwear/checkpoints";
import {
  aggregateMileage,
  validateWorkAllocationSplit,
  costPerMile,
  costPer100Miles,
} from "@/lib/footwear/mileage";
import {
  deriveConditionLabel,
  getCurrentCondition,
  milesBeforeFirstDecline,
  buildRatingTrends,
} from "@/lib/footwear/stats";
import {
  buildLegacyTimeline,
  labelCheckpointForTimeline,
  LEGACY_PUBLIC_DISCLAIMER,
} from "@/lib/footwear/legacy";
import { slugifyShoe } from "@/lib/footwear/id";
import { normalizeFootwearDate } from "@/lib/footwear/dates";
import { createShoeSchema } from "@/lib/validation/footwear.schema";

describe("footwear dates", () => {
  it("normalizes MM/DD/YYYY to ISO", () => {
    expect(normalizeFootwearDate("05/15/2026")).toBe("2026-05-15");
    expect(normalizeFootwearDate("5/18/2026")).toBe("2026-05-18");
    expect(normalizeFootwearDate("2026-05-15")).toBe("2026-05-15");
  });

  it("accepts MM/DD/YYYY on create shoe schema", () => {
    const parsed = createShoeSchema.safeParse({
      logSecret: "test-secret",
      brand: "HOKA",
      model: "Bondi 9",
      size: "10.5",
      width: "2E",
      purchaseDate: "05/15/2026",
      firstWearDate: "05/18/2026",
      amountPaid: 175,
      estimatedWorkMiles: 283.2,
      isLegacyRecord: true,
      status: "active",
      public: true,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.purchaseDate).toBe("2026-05-15");
      expect(parsed.data.firstWearDate).toBe("2026-05-18");
    }
  });
});

describe("footwear checkpoints", () => {
  it("resolves Battle Tested at 261.8 miles", () => {
    const level = getLevelForMiles(261.8);
    expect(level.title).toBe("Battle Tested");
    expect(level.miles).toBe(250);
  });

  it("computes next checkpoint and remaining miles", () => {
    expect(getNextCheckpoint(261.8)?.miles).toBe(300);
    expect(milesRemainingToNext(261.8)).toBe(38.2);
    expect(progressToNextPercent(261.8)).toBeGreaterThan(0);
    expect(progressToNextPercent(261.8)).toBeLessThan(100);
  });

  it("marks assessment pending when mileage crossed without review", () => {
    const progress = buildCheckpointProgress({
      totalMiles: 261.8,
      completedCheckpoints: [
        { checkpointMiles: 0 },
        { checkpointMiles: 50 },
        { checkpointMiles: 100 },
        { checkpointMiles: 150 },
        { checkpointMiles: 200 },
      ],
    });
    const battle = progress.find((p) => p.miles === 250);
    expect(battle?.status).toBe("assessment_pending");
    const longHauler = progress.find((p) => p.miles === 300);
    expect(longHauler?.status).toBe("locked");
    expect(getPendingCheckpoints({
      totalMiles: 261.8,
      completedCheckpoints: progress
        .filter((p) => p.status === "completed")
        .map((p) => ({ checkpointMiles: p.miles })),
    }).some((p) => p.miles === 250)).toBe(true);
  });

  it("labels legacy early checkpoints as not_recorded", () => {
    const progress = buildCheckpointProgress({
      totalMiles: 261.8,
      isLegacyRecord: true,
      completedCheckpoints: [{ checkpointMiles: 250 }],
    });
    expect(progress.find((p) => p.miles === 0)?.status).toBe("not_recorded");
    expect(progress.find((p) => p.miles === 100)?.status).toBe("not_recorded");
    expect(progress.find((p) => p.miles === 250)?.status).toBe("completed");
  });

  it("adds unnamed milestones after 500", () => {
    const level = getLevelForMiles(650);
    expect(level.miles).toBe(600);
    expect(getNextCheckpoint(650)?.miles).toBe(700);
  });

  it("suggests the highest pending checkpoint, not the lowest", () => {
    const pending = getPendingCheckpoints({
      totalMiles: 308,
      completedCheckpoints: [],
    });
    const suggested = getSuggestedCheckpoint({
      totalMiles: 308,
      pendingCheckpoints: pending.map((p) => ({
        miles: p.miles,
        title: p.title,
      })),
    });
    expect(suggested.miles).toBe(300);
    expect(suggested.title).toBe("Long Hauler");
  });

  it("falls back to rounded service mileage when caught up", () => {
    const suggested = getSuggestedCheckpoint({
      totalMiles: 308.4,
      pendingCheckpoints: [],
    });
    expect(suggested.miles).toBe(308);
  });
});

describe("footwear mileage", () => {
  it("aggregates logged, prior, and adjustment miles", () => {
    const result = aggregateMileage([
      { date: "2026-05-01", miles: 10.4, mileageType: "work" },
      { date: "2026-05-01", miles: 2, mileageType: "personal" },
      { date: "2026-04-01", miles: 200, mileageType: "estimated" },
      { date: "2026-05-02", miles: -5, mileageType: "adjustment" },
    ]);
    expect(result.loggedMiles).toBe(12.4);
    expect(result.priorMiles).toBe(200);
    expect(result.adjustmentMiles).toBe(-5);
    expect(result.totalMiles).toBe(207.4);
    expect(result.personalMiles).toBe(0);
    expect(result.workMiles).toBe(12.4);
    expect(result.estimatedMiles).toBe(200);
    expect(result.daysWorn).toBe(3);
  });

  it("validates split allocations against daybook miles", () => {
    const ok = validateWorkAllocationSplit({
      daybookMiles: 10.4,
      allocations: [
        { shoeId: "a", miles: 6.2 },
        { shoeId: "b", miles: 4.2 },
      ],
    });
    expect(ok.ok).toBe(true);

    const bad = validateWorkAllocationSplit({
      daybookMiles: 10.4,
      allocations: [
        { shoeId: "a", miles: 6.2 },
        { shoeId: "b", miles: 5 },
      ],
    });
    expect(bad.ok).toBe(false);
  });

  it("rejects negative allocation miles", () => {
    const bad = validateWorkAllocationSplit({
      daybookMiles: 10,
      allocations: [{ shoeId: "a", miles: -1 }],
    });
    expect(bad.ok).toBe(false);
  });

  it("computes cost per mile", () => {
    expect(costPerMile(140, 280)).toBe(0.5);
    expect(costPer100Miles(140, 280)).toBe(50);
    expect(costPerMile(null, 100)).toBeNull();
  });
});

describe("footwear stats", () => {
  const obs = [
    {
      checkpointMiles: 50,
      date: "2026-04-01",
      cushioning: 9,
      durability: 9,
      comfort: 9,
      endOfShiftSupport: 9,
      outsoleWear: 0,
      midsoleWear: 0,
      upperWear: 0,
      heelWear: 0,
      insoleWear: 0,
      structuralDeformation: 0,
    },
    {
      checkpointMiles: 250,
      date: "2026-07-01",
      cushioning: 6,
      durability: 6,
      comfort: 7,
      endOfShiftSupport: 6,
      outsoleWear: 4,
      midsoleWear: 3,
      upperWear: 2,
      heelWear: 2,
      insoleWear: 2,
      structuralDeformation: 1,
    },
  ];

  it("uses latest checkpoint for current condition", () => {
    const condition = getCurrentCondition(obs);
    expect(condition?.checkpointMiles).toBe(250);
    expect(condition?.performance.cushioning).toBe(6);
    expect(deriveConditionLabel(condition)).toBe("DECLINING");
  });

  it("builds rating trends and finds first decline", () => {
    const trends = buildRatingTrends(obs);
    expect(trends.cushioning.map((p) => p.value)).toEqual([9, 6]);
    expect(milesBeforeFirstDecline(obs)).toBe(250);
  });
});

describe("footwear legacy", () => {
  it("exposes public disclaimer copy", () => {
    expect(LEGACY_PUBLIC_DISCLAIMER).toContain("Footwear Lab");
  });

  it("labels timeline entries correctly", () => {
    expect(
      labelCheckpointForTimeline({
        isLegacyRecord: true,
        checkpointMiles: 50,
        hasObservation: false,
        observationRetrospective: false,
        firstDocumentedCheckpointMiles: 250,
      })
    ).toBe("NOT_RECORDED");

    expect(
      labelCheckpointForTimeline({
        isLegacyRecord: true,
        checkpointMiles: 150,
        hasObservation: true,
        observationRetrospective: true,
        firstDocumentedCheckpointMiles: 250,
      })
    ).toBe("RETROSPECTIVE");

    expect(
      labelCheckpointForTimeline({
        isLegacyRecord: true,
        checkpointMiles: 250,
        hasObservation: true,
        observationRetrospective: false,
        firstDocumentedCheckpointMiles: 250,
      })
    ).toBe("DOCUMENTED");
  });

  it("builds legacy timeline", () => {
    const timeline = buildLegacyTimeline({
      isLegacyRecord: true,
      thresholds: [
        { miles: 0, title: "Unboxed" },
        { miles: 250, title: "Battle Tested" },
      ],
      observations: [{ checkpointMiles: 250, retrospective: false }],
    });
    expect(timeline[0].label).toBe("NOT_RECORDED");
    expect(timeline[1].label).toBe("DOCUMENTED");
  });
});

describe("footwear id", () => {
  it("slugifies pair names", () => {
    expect(slugifyShoe("HOKA", "Bondi 9", 1)).toBe("hoka-bondi-9-pair-01");
    expect(slugifyShoe("Brooks", "Addiction Walker", 2)).toBe(
      "brooks-addiction-walker-pair-02"
    );
  });
});
