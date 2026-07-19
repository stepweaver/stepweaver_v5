import {
  blendedEffectiveHeatF,
  calculateHydrationGoal,
} from "@/lib/hydration";
import {
  computeShiftWeatherMetrics,
  mergeHourlyPoints,
} from "@/lib/carrier-journal/shift-weather";
import { deriveWeatherSignals } from "@/lib/carrier-journal/weather-signals";
import type { CarrierDispatch } from "@/lib/data/carrier-journal";

function dispatch(
  partial: Partial<CarrierDispatch> & Pick<CarrierDispatch, "id" | "date" | "title">
): CarrierDispatch {
  return {
    milesWalked: 8,
    soreness: 5,
    energy: 5,
    mood: 5,
    publicNote: "",
    ...partial,
  };
}

describe("hydration model (revised)", () => {
  it("blends avg HI with peak so spikes do not dominate", () => {
    expect(blendedEffectiveHeatF(85, 92, 82)).toBe(Math.round(0.7 * 82 + 0.3 * 92));
  });

  it("uses miles/1.5 hours and route-only scoring goal", () => {
    const rec = calculateHydrationGoal({
      weightLbs: 297,
      peakTempF: 85,
      peakHeatIndexF: 92,
      avgHeatIndexF: 82,
      milesWalked: 13,
    });
    // 13/1.5 = 8.67 → clamp stays ~8.67; blended heat ~85 → caution → 16 oz/h
    expect(rec.heatBand).toBe("caution");
    expect(rec.routeHours).toBeCloseTo(13 / 1.5, 5);
    expect(rec.routeWaterGoalOz).toBe(136);
    expect(rec.preShiftWaterOz).toBe(24);
    expect(rec.totalSuggestedOz).toBe(160);
  });

  it("Jul 17 style long hot day stays achievable vs 216 oz intake", () => {
    const rec = calculateHydrationGoal({
      weightLbs: 297,
      peakTempF: 87,
      peakHeatIndexF: 93,
      avgHeatIndexF: 88,
      milesWalked: 12.5,
    });
    expect(rec.routeWaterGoalOz).toBeLessThanOrEqual(216);
  });
});

describe("weather signals rain is manual only", () => {
  it("does not flag rain from precip or note text alone", () => {
    const signals = deriveWeatherSignals(
      dispatch({
        id: "a",
        date: "2026-07-18",
        title: "A",
        precipitationIn: 0.17,
        publicNote: "It was raining hard all afternoon",
      })
    );
    expect(signals.rain).toBe(false);
  });

  it("flags rain only from the checkbox", () => {
    const signals = deriveWeatherSignals(
      dispatch({
        id: "a",
        date: "2026-07-18",
        title: "A",
        rain: true,
      })
    );
    expect(signals.rain).toBe(true);
  });
});

describe("weather signals storm text", () => {
  it("ignores storm door mentions", () => {
    const signals = deriveWeatherSignals(
      dispatch({
        id: "a",
        date: "2026-06-15",
        title: "A",
        publicNote:
          "Two dogs jumped on the storm door. Ideal weather day otherwise.",
      })
    );
    expect(signals.storm).toBe(false);
  });

  it("still flags real storm language", () => {
    const signals = deriveWeatherSignals(
      dispatch({
        id: "a",
        date: "2026-06-15",
        title: "A",
        publicNote: "Thunder and lightning rolled through mid-route.",
      })
    );
    expect(signals.storm).toBe(true);
  });
});

describe("dual-ZIP hourly merge", () => {
  it("keeps the hotter hour and max precip", () => {
    const merged = mergeHourlyPoints(
      [{ hour: 14, tempF: 84, humidity: 50, precipIn: 0.01 }],
      [{ hour: 14, tempF: 88, humidity: 60, precipIn: 0.05 }]
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]!.tempF).toBe(88);
    expect(merged[0]!.humidity).toBe(60);
    expect(merged[0]!.precipIn).toBe(0.05);

    const metrics = computeShiftWeatherMetrics(merged);
    expect(metrics?.peakTempF).toBe(88);
  });
});
