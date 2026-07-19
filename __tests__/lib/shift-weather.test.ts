import {
  computeShiftWeatherMetrics,
  heatIndexF,
  isRainDay,
  RAIN_DAY_PRECIP_IN,
} from "@/lib/carrier-journal/shift-weather";
import { deriveWeatherSignals } from "@/lib/carrier-journal/weather-signals";
import type { CarrierDispatch } from "@/lib/data/carrier-journal";

function dispatch(partial: Partial<CarrierDispatch> & Pick<CarrierDispatch, "id" | "date" | "title">): CarrierDispatch {
  return {
    milesWalked: 8,
    soreness: 5,
    energy: 5,
    mood: 5,
    publicNote: "",
    ...partial,
  };
}

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

  it("flags rain days at the precip threshold", () => {
    expect(isRainDay(RAIN_DAY_PRECIP_IN)).toBe(true);
    expect(isRainDay(0.04)).toBe(false);
    expect(isRainDay(undefined)).toBe(false);
  });
});

describe("deriveWeatherSignals precip", () => {
  it("marks rain from precipitationIn without note text", () => {
    const signals = deriveWeatherSignals(
      dispatch({
        id: "a",
        date: "2026-07-18",
        title: "A",
        temperatureF: 85,
        heatIndexF: 92,
        precipitationIn: 0.17,
      })
    );
    expect(signals.rain).toBe(true);
    expect(signals.heat).toBe(true);
  });

  it("does not mark rain below threshold without note text", () => {
    const signals = deriveWeatherSignals(
      dispatch({
        id: "a",
        date: "2026-07-18",
        title: "A",
        temperatureF: 85,
        precipitationIn: 0.02,
      })
    );
    expect(signals.rain).toBe(false);
  });
});
