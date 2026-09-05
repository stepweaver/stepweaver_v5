import {
  addCalendarDays,
} from "@/lib/data/carrier-journal-dates";
import {
  computePublicAdaptationTelemetry,
  formatSignedDelta,
} from "@/lib/data/carrier-adaptation";
import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";

function dispatch(
  overrides: Partial<PublicFieldDispatch> & Pick<PublicFieldDispatch, "id" | "date" | "title">
): PublicFieldDispatch {
  return {
    milesWalked: 0,
    soreness: 5,
    energy: 5,
    mood: 5,
    publicNote: "",
    ...overrides,
  };
}

function seriesFrom(
  startDate: string,
  specs: Array<Partial<PublicFieldDispatch> & Pick<PublicFieldDispatch, "milesWalked">>,
  idPrefix = "d"
): PublicFieldDispatch[] {
  return specs.map((spec, index) =>
    dispatch({
      id: `${idPrefix}-${index + 1}`,
      date: addCalendarDays(startDate, index),
      title: `Day ${index + 1}`,
      energy: 7,
      soreness: 2,
      mood: 7,
      temperatureF: 72,
      ...spec,
    })
  );
}

describe("computePublicAdaptationTelemetry", () => {
  it("returns empty metrics for an empty journal", () => {
    expect(computePublicAdaptationTelemetry([])).toEqual({
      conditioning: null,
      thermalPenalty: null,
      recovery: null,
      loadDelta: null,
      resilience: null,
      heatTolerance: null,
      coolantDemand: null,
      operatorOutput: null,
    });
  });

  it("computes conditioning delta on comparable 9–11 mi moderate days in first vs last 150 mi", () => {
    const early = seriesFrom(
      "2026-05-01",
      Array.from({ length: 15 }, () => ({
        milesWalked: 10,
        energy: 6.2,
        soreness: 3.7,
        waterOz: 128,
        temperatureF: 72,
      })),
      "early"
    );
    const filler = seriesFrom(
      "2026-05-16",
      Array.from({ length: 40 }, () => ({
        milesWalked: 10,
        energy: 7,
        soreness: 2,
        waterOz: 110,
        temperatureF: 78,
      })),
      "fill"
    );
    const recent = seriesFrom(
      "2026-06-25",
      Array.from({ length: 15 }, () => ({
        milesWalked: 10,
        energy: 7.8,
        soreness: 1.6,
        waterOz: 109,
        temperatureF: 74,
      })),
      "recent"
    );

    const { conditioning } = computePublicAdaptationTelemetry([
      ...early,
      ...filler,
      ...recent,
    ]);

    expect(conditioning).not.toBeNull();
    expect(conditioning?.bandMinMi).toBe(9);
    expect(conditioning?.bandMaxMi).toBe(11);
    expect(conditioning?.moderateWeatherOnly).toBe(true);
    expect(conditioning?.earlySampleSize).toBe(15);
    expect(conditioning?.recentSampleSize).toBe(15);
    expect(conditioning?.early.energy).toBe(6.2);
    expect(conditioning?.recent.energy).toBe(7.8);
    expect(conditioning?.early.soreness).toBe(3.7);
    expect(conditioning?.recent.soreness).toBe(1.6);
    expect(conditioning?.early.waterOzPerMi).toBe(12.8);
    expect(conditioning?.recent.waterOzPerMi).toBe(10.9);
    expect(conditioning?.energyDeltaPct).toBe(25.8);
    expect(conditioning?.sorenessDeltaPct).toBe(-56.8);
    expect(conditioning?.coolantDeltaPct).toBe(-14.8);
    expect(conditioning?.earlyAtMi).toBeLessThan(conditioning?.recentAtMi ?? 0);
  });

  it("falls back to an 8–12 mi band when 9–11 has too few samples", () => {
    const early = seriesFrom(
      "2026-05-01",
      Array.from({ length: 18 }, () => ({
        milesWalked: 8.5,
        energy: 6,
        soreness: 4,
        temperatureF: 70,
      })),
      "early"
    );
    const filler = seriesFrom(
      "2026-05-19",
      Array.from({ length: 40 }, () => ({
        milesWalked: 8.5,
        energy: 7,
        soreness: 2,
        temperatureF: 70,
      })),
      "fill"
    );
    const recent = seriesFrom(
      "2026-06-28",
      Array.from({ length: 18 }, () => ({
        milesWalked: 8.5,
        energy: 8,
        soreness: 2,
        temperatureF: 70,
      })),
      "recent"
    );

    const { conditioning } = computePublicAdaptationTelemetry([
      ...early,
      ...filler,
      ...recent,
    ]);
    expect(conditioning?.bandMinMi).toBe(8);
    expect(conditioning?.bandMaxMi).toBe(12);
    expect(conditioning?.energyDeltaPct).toBe(33.3);
  });

  it("does not compute conditioning with fewer than 3 comparable days per window", () => {
    const days = seriesFrom("2026-05-01", [
      { milesWalked: 10, energy: 6, soreness: 4, temperatureF: 70 },
      { milesWalked: 10, energy: 6, soreness: 4, temperatureF: 70 },
      { milesWalked: 10, energy: 8, soreness: 2, temperatureF: 70 },
      { milesWalked: 10, energy: 8, soreness: 2, temperatureF: 70 },
    ]);
    expect(computePublicAdaptationTelemetry(days).conditioning).toBeNull();
  });

  it("computes thermal penalty against similar-distance moderate days", () => {
    const normals = seriesFrom(
      "2026-06-01",
      Array.from({ length: 5 }, () => ({
        milesWalked: 10,
        energy: 7.8,
        soreness: 1.7,
        waterOz: 110,
        temperatureF: 72,
        heatIndexF: 74,
      }))
    );
    const heat = seriesFrom(
      "2026-07-01",
      Array.from({ length: 5 }, () => ({
        milesWalked: 10.2,
        energy: 6.4,
        soreness: 2.4,
        waterOz: 147,
        temperatureF: 94,
        heatIndexF: 102,
      }))
    );

    const { thermalPenalty } = computePublicAdaptationTelemetry([...normals, ...heat]);
    expect(thermalPenalty?.matchedHeatDays).toBe(5);
    expect(thermalPenalty?.energyDelta).toBe(-1.4);
    expect(thermalPenalty?.sorenessDelta).toBe(0.7);
    expect(thermalPenalty?.heat.energy).toBe(6.4);
    expect(thermalPenalty?.normal.energy).toBe(7.8);
    expect(thermalPenalty?.waterOzPerMiDelta).toBe(3.4);
  });

  it("ignores unmatched heat days outside the mileage tolerance", () => {
    const normals = seriesFrom("2026-06-01", [
      { milesWalked: 6, energy: 8, soreness: 2, temperatureF: 70, heatIndexF: 70 },
      { milesWalked: 6, energy: 8, soreness: 2, temperatureF: 70, heatIndexF: 70 },
      { milesWalked: 6, energy: 8, soreness: 2, temperatureF: 70, heatIndexF: 70 },
    ]);
    const heat = seriesFrom("2026-07-01", [
      { milesWalked: 12, energy: 5, soreness: 4, heatIndexF: 98 },
      { milesWalked: 12, energy: 5, soreness: 4, heatIndexF: 98 },
      { milesWalked: 12, energy: 5, soreness: 4, heatIndexF: 98 },
    ]);
    expect(computePublicAdaptationTelemetry([...normals, ...heat]).thermalPenalty).toBeNull();
  });

  it("computes next-day recovery after 12+ mile operations", () => {
    const days = seriesFrom("2026-06-01", [
      { milesWalked: 12, energy: 7, soreness: 3, temperatureF: 72 },
      { milesWalked: 8, energy: 6, soreness: 4, temperatureF: 72 },
      { milesWalked: 9, energy: 8, soreness: 2, temperatureF: 72 },
      { milesWalked: 12, energy: 7, soreness: 3, temperatureF: 72 },
      { milesWalked: 8, energy: 6, soreness: 4, temperatureF: 72 },
      { milesWalked: 9, energy: 8, soreness: 2, temperatureF: 72 },
      { milesWalked: 12, energy: 7, soreness: 3, temperatureF: 72 },
      { milesWalked: 8, energy: 6, soreness: 4, temperatureF: 72 },
      { milesWalked: 9, energy: 8, soreness: 2, temperatureF: 72 },
    ]);

    const { recovery } = computePublicAdaptationTelemetry(days);
    expect(recovery?.pairCount).toBe(3);
    expect(recovery?.post.energy).toBe(6);
    expect(recovery?.post.soreness).toBe(4);
    expect(recovery?.baseline.energy).toBe(7.5);
    expect(recovery?.energyDelta).toBe(-1.5);
    expect(recovery?.sorenessDelta).toBe(1.5);
    expect(recovery?.energyPctOfBaseline).toBe(80);
  });

  it("skips recovery pairs when the next log is more than 2 days later", () => {
    const isolated = [
      dispatch({
        id: "a",
        date: "2026-06-01",
        title: "A",
        milesWalked: 12,
        energy: 7,
        soreness: 3,
      }),
      dispatch({
        id: "b",
        date: "2026-06-05",
        title: "B",
        milesWalked: 8,
        energy: 4,
        soreness: 6,
      }),
    ];
    const padded = seriesFrom(
      "2026-06-10",
      Array.from({ length: 6 }, (_, i) => ({
        milesWalked: i % 2 === 0 ? 12 : 8,
        energy: i % 2 === 0 ? 7 : 6,
        soreness: i % 2 === 0 ? 3 : 4,
      }))
    );
    // 3 load/recovery pairs from padded (12,8,12,8,12,8) — isolated gap must not join
    const { recovery } = computePublicAdaptationTelemetry([...isolated, ...padded]);
    expect(recovery?.pairCount).toBe(3);
    expect(recovery?.post.energy).toBe(6);
  });

  it("computes 7d load versus 28d weekly baseline", () => {
    const days = [
      dispatch({
        id: "history",
        date: "2026-08-01",
        title: "History",
        milesWalked: 5,
        energy: 7,
        soreness: 2,
      }),
      dispatch({
        id: "base",
        date: "2026-08-10",
        title: "Baseline window",
        milesWalked: 149.4,
        energy: 7,
        soreness: 2,
      }),
      dispatch({
        id: "current",
        date: "2026-09-01",
        title: "Current 7d",
        milesWalked: 67.4,
        energy: 7,
        soreness: 2,
      }),
    ];

    const { loadDelta } = computePublicAdaptationTelemetry(days);
    expect(loadDelta?.asOf).toBe("2026-09-01");
    expect(loadDelta?.current7dMi).toBe(67.4);
    expect(loadDelta?.weeklyBaselineMi).toBe(54.2);
    expect(loadDelta?.deltaPct).toBe(24.4);
  });

  it("does not compute load delta until 28 calendar days of history exist", () => {
    const days = seriesFrom("2026-09-01", [
      { milesWalked: 10 },
      { milesWalked: 10 },
      { milesWalked: 10 },
    ]);
    expect(computePublicAdaptationTelemetry(days).loadDelta).toBeNull();
  });

  it("counts resilient 10+ mi days and first vs recent trajectory", () => {
    const first = seriesFrom(
      "2026-05-01",
      Array.from({ length: 20 }, () => ({
        milesWalked: 10,
        energy: 5,
        soreness: 4,
        temperatureF: 70,
      })),
      "first"
    );
    const recent = seriesFrom(
      "2026-05-21",
      Array.from({ length: 20 }, () => ({
        milesWalked: 10,
        energy: 8,
        soreness: 1,
        temperatureF: 70,
      })),
      "recent"
    );
    const { resilience } = computePublicAdaptationTelemetry([...first, ...recent]);
    expect(resilience?.tenPlusDays).toBe(40);
    expect(resilience?.resilientDays).toBe(20);
    expect(resilience?.resilientPct).toBe(50);
    expect(resilience?.firstWindow).toEqual({ size: 20, resilientPct: 0 });
    expect(resilience?.recentWindow).toEqual({ size: 20, resilientPct: 100 });
  });

  it("does not treat sub-10 mile days as resilient operations", () => {
    const days = seriesFrom("2026-05-01", [
      { milesWalked: 9.9, energy: 9, soreness: 1, temperatureF: 70 },
      { milesWalked: 10, energy: 7, soreness: 2, temperatureF: 70 },
    ]);
    const { resilience } = computePublicAdaptationTelemetry(days);
    expect(resilience?.tenPlusDays).toBe(1);
    expect(resilience?.resilientDays).toBe(1);
    expect(resilience?.firstWindow).toBeNull();
  });

  it("compares first vs recent heat days as observed heat tolerance", () => {
    const earlyHeat = seriesFrom(
      "2026-06-01",
      Array.from({ length: 5 }, () => ({
        milesWalked: 10,
        energy: 6.2,
        soreness: 3,
        waterOz: 100,
        heatIndexF: 96,
      })),
      "early-heat"
    );
    const recentHeat = seriesFrom(
      "2026-08-01",
      Array.from({ length: 5 }, () => ({
        milesWalked: 10,
        energy: 7.3,
        soreness: 2.3,
        waterOz: 118,
        heatIndexF: 97,
      })),
      "recent-heat"
    );
    const { heatTolerance } = computePublicAdaptationTelemetry([...earlyHeat, ...recentHeat]);
    expect(heatTolerance?.sampleSize).toBe(5);
    expect(heatTolerance?.energyDelta).toBe(1.1);
    expect(heatTolerance?.sorenessDelta).toBe(-0.7);
    expect(heatTolerance?.coolantDeltaPct).toBe(18);
  });

  it("stratifies coolant demand by temperature and heat-day hydration compliance", () => {
    const days = [
      ...seriesFrom(
        "2026-05-01",
        [
          { milesWalked: 10, waterOz: 94, hydrationGoalOz: 90, temperatureF: 72 },
          { milesWalked: 10, waterOz: 94, hydrationGoalOz: 90, temperatureF: 74 },
        ],
        "cool"
      ),
      ...seriesFrom(
        "2026-06-01",
        [
          { milesWalked: 10, waterOz: 118, hydrationGoalOz: 90, temperatureF: 84, heatIndexF: 86 },
          { milesWalked: 10, waterOz: 118, hydrationGoalOz: 90, temperatureF: 85, heatIndexF: 87 },
        ],
        "warm"
      ),
      ...seriesFrom(
        "2026-07-01",
        [
          { milesWalked: 10, waterOz: 147, hydrationGoalOz: 120, heatIndexF: 98 },
          { milesWalked: 10, waterOz: 100, hydrationGoalOz: 120, heatIndexF: 99 },
        ],
        "hot"
      ),
    ];
    const { coolantDemand } = computePublicAdaptationTelemetry(days);
    expect(coolantDemand?.bands.find((band) => band.key === "cool")?.ozPerMi).toBe(9.4);
    expect(coolantDemand?.bands.find((band) => band.key === "warm")?.ozPerMi).toBe(11.8);
    expect(coolantDemand?.bands.find((band) => band.key === "hot")?.ozPerMi).toBe(12.4);
    expect(coolantDemand?.heatHydrationHits).toBe(1);
    expect(coolantDemand?.heatHydrationEligible).toBe(2);
    expect(coolantDemand?.heatHydrationHitPct).toBe(50);
  });

  it("reports energy and soreness by distance band", () => {
    const days = seriesFrom("2026-05-01", [
      { milesWalked: 6, energy: 8.1, soreness: 1.2, temperatureF: 70 },
      { milesWalked: 6, energy: 8.1, soreness: 1.2, temperatureF: 70 },
      { milesWalked: 9, energy: 7.6, soreness: 1.8, temperatureF: 70 },
      { milesWalked: 9, energy: 7.6, soreness: 1.8, temperatureF: 70 },
      { milesWalked: 11, energy: 7.2, soreness: 2.1, temperatureF: 70 },
      { milesWalked: 11, energy: 7.2, soreness: 2.1, temperatureF: 70 },
      { milesWalked: 13, energy: 6.8, soreness: 2.4, temperatureF: 70 },
      { milesWalked: 13, energy: 6.8, soreness: 2.4, temperatureF: 70 },
    ]);
    const { operatorOutput } = computePublicAdaptationTelemetry(days);
    expect(operatorOutput?.bands.map((band) => [band.key, band.energy, band.soreness])).toEqual([
      ["<8", 8.1, 1.2],
      ["8-10", 7.6, 1.8],
      ["10-12", 7.2, 2.1],
      ["12+", 6.8, 2.4],
    ]);
  });
});

describe("formatSignedDelta", () => {
  it("formats signed values with an explicit plus", () => {
    expect(formatSignedDelta(24.4, "%")).toBe("+24.4%");
    expect(formatSignedDelta(-1.4)).toBe("-1.4");
    expect(formatSignedDelta(0, "", 1)).toBe("0.0");
    expect(formatSignedDelta(null)).toBe("n/a");
  });
});
