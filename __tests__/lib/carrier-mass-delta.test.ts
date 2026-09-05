import { toPublicMassDeltaSeries } from "@/lib/data/carrier-mass-delta.server";
import type { CarrierDispatch } from "@/lib/data/carrier-journal";

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

describe("toPublicMassDeltaSeries", () => {
  it("returns an empty series when there are no Monday weigh-ins", () => {
    const series = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-05-05", title: "Tue", weightLbs: 248 }),
    ]);
    expect(series.points).toEqual([]);
    expect(series.currentDelta).toBeNull();
    expect(series.last30DayDelta).toBeNull();
    expect(series.averageWeeklyDelta).toBeNull();
    expect(series.last30DayDeltaPct).toBeNull();
    expect(series.averageWeeklyDeltaPct).toBeNull();
  });

  it("ignores non-Monday weight entries", () => {
    const series = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-05-04", title: "Mon", weightLbs: 248 }),
      dispatch({ id: "b", date: "2026-05-06", title: "Wed", weightLbs: 240 }),
    ]);
    expect(series.points).toHaveLength(1);
    expect(series.points[0].deltaFromBaseline).toBe(0);
    expect(series.currentDelta).toBe(0);
  });

  it("normalizes the first Monday to 0.0 and keeps signed deltas", () => {
    const series = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-05-04", title: "A", weightLbs: 248 }),
      dispatch({ id: "b", date: "2026-05-11", title: "B", weightLbs: 243.8 }),
    ]);
    expect(series.points[0]).toEqual({
      date: "2026-05-04",
      deltaFromBaseline: 0,
      deltaFromPrevious: null,
    });
    expect(series.points[1]).toEqual({
      date: "2026-05-11",
      deltaFromBaseline: -4.2,
      deltaFromPrevious: -4.2,
    });
    expect(series.currentDelta).toBe(-4.2);
  });

  it("keeps a positive delta when mass increases", () => {
    const series = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-05-04", title: "A", weightLbs: 240 }),
      dispatch({ id: "b", date: "2026-05-11", title: "B", weightLbs: 242.5 }),
    ]);
    expect(series.currentDelta).toBe(2.5);
    expect(series.points[1].deltaFromPrevious).toBe(2.5);
  });

  it("returns n/a weekly and 30-day rates for a single Monday", () => {
    const series = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-05-04", title: "A", weightLbs: 248 }),
    ]);
    expect(series.points).toHaveLength(1);
    expect(series.points[0].deltaFromBaseline).toBe(0);
    expect(series.currentDelta).toBe(0);
    expect(series.averageWeeklyDelta).toBeNull();
    expect(series.last30DayDelta).toBeNull();
  });

  it("uses elapsed calendar days / 7 for AVG/WEEK, not observation count", () => {
    const series = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-05-04", title: "A", weightLbs: 248 }),
      dispatch({ id: "b", date: "2026-05-18", title: "B", weightLbs: 241 }),
    ]);
    // 14 calendar days = 2 weeks, delta -7 → -3.5 lb/week
    // Observation-count (1 interval) would incorrectly yield -7
    expect(series.averageWeeklyDelta).toBe(-3.5);
    expect(series.averageWeeklyDelta).not.toBe(-7);
  });

  it("does not inflate AVG/WEEK when a Monday is missed", () => {
    const withGap = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-05-04", title: "A", weightLbs: 248 }),
      dispatch({ id: "c", date: "2026-05-18", title: "C", weightLbs: 241 }),
    ]);
    const weekly = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-05-04", title: "A", weightLbs: 248 }),
      dispatch({ id: "b", date: "2026-05-11", title: "B", weightLbs: 244.5 }),
      dispatch({ id: "c", date: "2026-05-18", title: "C", weightLbs: 241 }),
    ]);
    expect(withGap.averageWeeklyDelta).toBe(weekly.averageWeeklyDelta);
    expect(withGap.averageWeeklyDelta).toBe(-3.5);
  });

  it("publishes LAST 30D when the comparison Monday is within 7 days of the cutoff", () => {
    const series = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-06-01", title: "A", weightLbs: 250 }),
      dispatch({ id: "b", date: "2026-07-06", title: "B", weightLbs: 242 }),
    ]);
    // Latest 2026-07-06; cutoff 2026-06-06; comparison 2026-06-01 is 5 days before cutoff
    expect(series.last30DayDelta).toBe(-8);
    expect(series.last30DayDeltaPct).toBe(-3.2);
    // 35 calendar days = 5 weeks, -8 lb → -1.6 lb/week; -1.6 / 242 = -0.7%
    expect(series.averageWeeklyDeltaPct).toBe(-0.7);
  });

  it("returns n/a LAST 30D when the previous point is far from the cutoff", () => {
    const series = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-05-04", title: "A", weightLbs: 250 }),
      dispatch({ id: "b", date: "2026-06-15", title: "B", weightLbs: 240 }),
    ]);
    // 42-day gap. Cutoff is 2026-05-16; May 4 is 12 days before cutoff (> 7)
    expect(series.last30DayDelta).toBeNull();
  });

  it("returns n/a LAST 30D when the series is shorter than 30 days", () => {
    const series = toPublicMassDeltaSeries([
      dispatch({ id: "a", date: "2026-05-04", title: "A", weightLbs: 248 }),
      dispatch({ id: "b", date: "2026-05-18", title: "B", weightLbs: 241 }),
    ]);
    expect(series.last30DayDelta).toBeNull();
  });
});
