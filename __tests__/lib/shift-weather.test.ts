import {
  computeShiftWeatherMetrics,
  heatIndexF,
  mergeHourlyPoints,
} from "@/lib/carrier-journal/shift-weather";

describe("shift-weather", () => {
  it("computes Rothfusz heat index above 80°F", () => {
    expect(heatIndexF(75, 90)).toBe(75);
    expect(heatIndexF(92, 55)).toBeGreaterThan(92);
  });

  it("computes peak temp, peak HI, avg HI, and precip in the shift window", () => {
    const metrics = computeShiftWeatherMetrics([
      { hour: 8, tempF: 95, humidity: 70, precipIn: 1 }, // outside window
      { hour: 9, tempF: 80, humidity: 60, precipIn: 0.02 },
      { hour: 14, tempF: 90, humidity: 50, precipIn: 0 },
      { hour: 16, tempF: 88, humidity: 70, precipIn: 0.04 },
      { hour: 20, tempF: 99, humidity: 80, precipIn: 0.5 }, // outside window
    ]);

    expect(metrics).not.toBeNull();
    expect(metrics!.peakTempF).toBe(90);
    expect(metrics!.peakTempHour).toBe(14);
    expect(metrics!.peakHeatIndexF).toBe(heatIndexF(88, 70));
    expect(metrics!.peakHeatIndexHour).toBe(16);
    expect(metrics!.precipIn).toBe(0.06);
    expect(metrics!.rainyHours).toBe(2);
    expect(metrics!.avgHeatIndexF).toBeGreaterThan(0);
  });

  it("merges dual-ZIP hours by hotter temp", () => {
    const merged = mergeHourlyPoints(
      [{ hour: 12, tempF: 80, humidity: 40, precipIn: 0 }],
      [{ hour: 12, tempF: 83, humidity: 55, precipIn: 0.1 }]
    );
    expect(merged[0]).toMatchObject({ tempF: 83, humidity: 55, precipIn: 0.1 });
  });
});
