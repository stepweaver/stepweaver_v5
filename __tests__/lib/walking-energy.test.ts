import {
  estimateLocomotionEnergyFromDispatches,
  estimateLocomotionEnergyForDispatch,
  estimateWalkingEnergy,
  formatLocomotionKcal,
  locomotionMethodDetail,
  type WalkingEnergyInput,
} from "@/lib/carrier-journal/walking-energy";
import type { CarrierDispatch } from "@/lib/data/carrier-journal";

const LB_PER_KG = 2.2046226218;

function kcalPerLbMile(
  input: WalkingEnergyInput,
  weightLb: number,
  miles: number
): number {
  const { kcal } = estimateWalkingEnergy(input);
  return kcal / weightLb / miles;
}

function dispatch(
  overrides: Partial<CarrierDispatch> & Pick<CarrierDispatch, "id" | "date" | "title">
): CarrierDispatch {
  return {
    milesWalked: 0,
    steps: 0,
    soreness: 5,
    energy: 5,
    mood: 5,
    weather: "Clear",
    publicNote: "",
    ...overrides,
  };
}

describe("estimateWalkingEnergy", () => {
  it("returns zero for non-positive mass or distance", () => {
    expect(
      estimateWalkingEnergy({ weightKg: 0, distanceMiles: 10 }).kcal
    ).toBe(0);
    expect(
      estimateWalkingEnergy({ weightKg: 90, distanceMiles: 0 }).kcal
    ).toBe(0);
  });

  it("falls back to 0.5 kcal/lb/mile when moving time is missing", () => {
    const weightKg = 200 / LB_PER_KG;
    const result = estimateWalkingEnergy({
      weightKg,
      distanceMiles: 10,
    });
    expect(result.method).toBe("distance-fallback");
    expect(result.kcal).toBe(1000);
  });

  it("falls back when moving time is zero or negative", () => {
    const result = estimateWalkingEnergy({
      weightKg: 90,
      distanceMiles: 8,
      movingMinutes: 0,
    });
    expect(result.method).toBe("distance-fallback");
  });

  it("approximates 0.504 kcal/lb/mile at 3 mph on level ground with no load", () => {
    const weightLb = 200;
    const miles = 3;
    const ratio = kcalPerLbMile(
      {
        weightKg: weightLb / LB_PER_KG,
        distanceMiles: miles,
        movingMinutes: 60,
      },
      weightLb,
      miles
    );
    expect(ratio).toBeCloseTo(0.504, 2);
  });

  it.each([
    [2.0, 0.575],
    [2.5, 0.525],
    [3.0, 0.504],
    [3.5, 0.499],
    [4.0, 0.505],
  ])(
    "tracks Minimum Mechanics kcal/lb/mile at %s mph on level ground",
    (mph, expected) => {
      const weightLb = 180;
      const miles = 6;
      const movingMinutes = (miles / mph) * 60;
      const ratio = kcalPerLbMile(
        {
          weightKg: weightLb / LB_PER_KG,
          distanceMiles: miles,
          movingMinutes,
        },
        weightLb,
        miles
      );
      expect(ratio).toBeCloseTo(expected, 2);
    }
  );

  it("uses the Minimum Mechanics method when moving time is present", () => {
    const result = estimateWalkingEnergy({
      weightKg: 90,
      distanceMiles: 3,
      movingMinutes: 60,
    });
    expect(result.method).toBe("minimum-mechanics");
    expect(result.kcal).toBeGreaterThan(0);
  });

  it("increases energy with carried load", () => {
    const base = estimateWalkingEnergy({
      weightKg: 90,
      distanceMiles: 4,
      movingMinutes: 80,
    });
    const loaded = estimateWalkingEnergy({
      weightKg: 90,
      distanceMiles: 4,
      movingMinutes: 80,
      loadKg: 15,
    });
    expect(loaded.kcal).toBeGreaterThan(base.kcal);
  });

  it("increases energy on an uphill grade versus level ground", () => {
    const level = estimateWalkingEnergy({
      weightKg: 90,
      distanceMiles: 4,
      movingMinutes: 80,
      gradePercent: 0,
    });
    const uphill = estimateWalkingEnergy({
      weightKg: 90,
      distanceMiles: 4,
      movingMinutes: 80,
      gradePercent: 5,
    });
    expect(uphill.kcal).toBeGreaterThan(level.kcal);
  });

  it("reduces energy on a downhill grade versus treating it as level", () => {
    const level = estimateWalkingEnergy({
      weightKg: 90,
      distanceMiles: 4,
      movingMinutes: 80,
      gradePercent: 0,
    });
    const downhill = estimateWalkingEnergy({
      weightKg: 90,
      distanceMiles: 4,
      movingMinutes: 80,
      gradePercent: -8,
    });
    expect(downhill.kcal).toBeLessThan(level.kcal);
    expect(downhill.kcal).toBeGreaterThan(0);
  });

  it("does not apply the uphill grade terms to negative grades", () => {
    const naiveNegative = estimateWalkingEnergy({
      weightKg: 90,
      distanceMiles: 2,
      movingMinutes: 40,
      gradePercent: 0,
    });
    const downhill = estimateWalkingEnergy({
      weightKg: 90,
      distanceMiles: 2,
      movingMinutes: 40,
      gradePercent: -20,
    });
    // A naive plug-in of G = -20 into the uphill formula can collapse VO2.
    expect(downhill.kcal).toBeGreaterThan(naiveNegative.kcal * 0.5);
  });
});

describe("estimateLocomotionEnergyFromDispatches", () => {
  it("returns null when no walking days have a resolvable mass", () => {
    const result = estimateLocomotionEnergyFromDispatches([
      dispatch({ id: "a", date: "2026-05-04", title: "A", milesWalked: 10 }),
    ]);
    expect(result.kcal).toBeNull();
    expect(result.method).toBeNull();
  });

  it("carries the last known weight forward onto later walking days", () => {
    const result = estimateLocomotionEnergyFromDispatches([
      dispatch({
        id: "mon",
        date: "2026-05-04",
        title: "Mon",
        milesWalked: 10,
        weightLbs: 200,
      }),
      dispatch({
        id: "tue",
        date: "2026-05-05",
        title: "Tue",
        milesWalked: 10,
      }),
    ]);
    expect(result.method).toBe("distance-fallback");
    expect(result.kcal).toBe(2000);
  });

  it("backfills weight onto days before the first weigh-in", () => {
    const result = estimateLocomotionEnergyFromDispatches([
      dispatch({
        id: "sun",
        date: "2026-05-03",
        title: "Sun",
        milesWalked: 8,
      }),
      dispatch({
        id: "mon",
        date: "2026-05-04",
        title: "Mon",
        milesWalked: 8,
        weightLbs: 180,
      }),
    ]);
    expect(result.kcal).toBe(Math.round(180 * 8 * 0.5) * 2);
  });

  it("uses Minimum Mechanics on days with moving time and fallback on the rest", () => {
    const result = estimateLocomotionEnergyFromDispatches([
      dispatch({
        id: "a",
        date: "2026-05-04",
        title: "A",
        milesWalked: 9,
        weightLbs: 200,
        movingMinutes: 180,
      }),
      dispatch({
        id: "b",
        date: "2026-05-05",
        title: "B",
        milesWalked: 9,
        weightLbs: 200,
      }),
    ]);
    expect(result.method).toBe("mixed");
    expect(result.kcal).toBeGreaterThan(0);
  });

  it("reports minimum-mechanics when every contributing day has moving time", () => {
    const result = estimateLocomotionEnergyFromDispatches([
      dispatch({
        id: "a",
        date: "2026-05-04",
        title: "A",
        milesWalked: 3,
        weightLbs: 200,
        movingMinutes: 60,
      }),
    ]);
    expect(result.method).toBe("minimum-mechanics");
  });

  it("estimates a single day using carried-forward mass", () => {
    const series = [
      dispatch({
        id: "mon",
        date: "2026-05-04",
        title: "Mon",
        milesWalked: 10,
        weightLbs: 200,
      }),
      dispatch({
        id: "tue",
        date: "2026-05-05",
        title: "Tue",
        milesWalked: 8,
      }),
    ];
    const tuesday = estimateLocomotionEnergyForDispatch(series, series[1]);
    expect(tuesday).toEqual({ kcal: 800, method: "distance-fallback" });
  });
});

describe("locomotion display helpers", () => {
  it("formats public Calories with grouping and a unit", () => {
    expect(formatLocomotionKcal(1842)).toBe("1,842 Calories");
    expect(formatLocomotionKcal(null)).toBe("n/a");
  });

  it("labels fallback vs modeled provenance", () => {
    expect(locomotionMethodDetail("distance-fallback")).toMatch(/APPROX/i);
    expect(locomotionMethodDetail("minimum-mechanics")).toMatch(/MODELED/i);
    expect(locomotionMethodDetail("mixed")).toMatch(/MODELED/i);
    expect(locomotionMethodDetail(null)).toMatch(/REQUIRES/i);
  });
});
