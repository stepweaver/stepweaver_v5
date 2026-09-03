import { computePublicDerivedTelemetry } from "@/lib/data/carrier-derived-telemetry.server";
import { toPublicMassDeltaSeries } from "@/lib/data/carrier-mass-delta.server";
import type { CarrierDispatch } from "@/lib/data/carrier-journal";
import type { PublicMassDeltaSeries } from "@/lib/types/carrier-public-telemetry";

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
    mailLoad: "normal",
    publicNote: "",
    ...overrides,
  };
}

const emptyMass: PublicMassDeltaSeries = {
  points: [],
  currentDelta: null,
  last30DayDelta: null,
  averageWeeklyDelta: null,
};

describe("computePublicDerivedTelemetry", () => {
  it("computes coolant gallons from the actual waterOz sum, not avg × days", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-04", title: "A", waterOz: 100, milesWalked: 8 }),
      dispatch({ id: "b", date: "2026-05-05", title: "B", waterOz: 50, milesWalked: 8 }),
      dispatch({ id: "c", date: "2026-05-06", title: "C", milesWalked: 8 }),
    ];
    const derived = computePublicDerivedTelemetry(dispatches, emptyMass);
    // sum = 150 oz / 128 = 1.171... → 1.2 gal
    // avg on hydration days = 75; 75 × 3 logged days / 128 = 1.8 — must not use that
    expect(derived.totalCoolantGal).toBe(1.2);
    expect(derived.totalCoolantGal).not.toBe(1.8);
  });

  it("computes mi/lb and lb/100 mi only when mass dropped", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-04", title: "A", milesWalked: 100, weightLbs: 250 }),
      dispatch({ id: "b", date: "2026-05-18", title: "B", milesWalked: 100, weightLbs: 230 }),
    ];
    const mass = toPublicMassDeltaSeries(dispatches);
    expect(mass.currentDelta).toBe(-20);
    const derived = computePublicDerivedTelemetry(dispatches, mass);
    expect(derived.milesPerLbDelta).toBe(10);
    expect(derived.lbDeltaPer100Mi).toBe(10);
  });

  it("returns n/a mass ratios when mass did not drop", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-04", title: "A", milesWalked: 100, weightLbs: 230 }),
      dispatch({ id: "b", date: "2026-05-18", title: "B", milesWalked: 100, weightLbs: 235 }),
    ];
    const mass = toPublicMassDeltaSeries(dispatches);
    const derived = computePublicDerivedTelemetry(dispatches, mass);
    expect(derived.milesPerLbDelta).toBeNull();
    expect(derived.lbDeltaPer100Mi).toBeNull();
  });

  it("sums high-heat miles from derived heat days", () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-06-10",
        title: "Hot",
        milesWalked: 11.2,
        heatIndexF: 103,
      }),
      dispatch({
        id: "b",
        date: "2026-06-11",
        title: "Cool",
        milesWalked: 12,
        temperatureF: 72,
      }),
    ];
    const derived = computePublicDerivedTelemetry(dispatches, emptyMass);
    expect(derived.highHeatMiles).toBe(11.2);
  });

  it("counts 10+ mile days and percentage of logged days", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-04", title: "A", milesWalked: 10 }),
      dispatch({ id: "b", date: "2026-05-05", title: "B", milesWalked: 9.9 }),
      dispatch({ id: "c", date: "2026-05-06", title: "C", milesWalked: 15.5 }),
    ];
    const derived = computePublicDerivedTelemetry(dispatches, emptyMass);
    expect(derived.tenPlusMileDays).toBe(2);
    expect(derived.tenPlusMileDayPct).toBe(66.7);
  });

  it("computes coolant oz per mile on days with both water and miles", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-04", title: "A", waterOz: 100, milesWalked: 10 }),
      dispatch({ id: "b", date: "2026-05-05", title: "B", waterOz: 50, milesWalked: 5 }),
      dispatch({ id: "c", date: "2026-05-06", title: "C", milesWalked: 20 }),
    ];
    const derived = computePublicDerivedTelemetry(dispatches, emptyMass);
    expect(derived.avgCoolantOzPerMi).toBe(10);
  });

  it("computes marathon and 5K equivalencies from total miles", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-04", title: "A", milesWalked: 639.1 }),
    ];
    const derived = computePublicDerivedTelemetry(dispatches, emptyMass);
    expect(derived.marathonEquivalents).toBe(24.4);
    expect(derived.fiveKEquivalents).toBe(205.7);
  });

  it("estimates locomotion energy from carried-forward mass without exposing it", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-04", title: "A", milesWalked: 10, weightLbs: 200 }),
      dispatch({ id: "b", date: "2026-05-05", title: "B", milesWalked: 10 }),
    ];
    const derived = computePublicDerivedTelemetry(dispatches, emptyMass);
    expect(derived.estLocomotionKcal).toBe(2000);
    expect(derived.locomotionMethod).toBe("distance-fallback");
  });

  it("promotes to Minimum Mechanics when moving time is logged", () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-05-04",
        title: "A",
        milesWalked: 3,
        weightLbs: 200,
        movingMinutes: 60,
      }),
    ];
    const derived = computePublicDerivedTelemetry(dispatches, emptyMass);
    expect(derived.locomotionMethod).toBe("minimum-mechanics");
    expect(derived.estLocomotionKcal).toBeGreaterThan(0);
  });
});
