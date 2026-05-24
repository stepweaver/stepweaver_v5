import {
  CARRIER_KPI_EMPTY,
  computeTotalsFromDispatches,
  formatPublicWeightTrend,
  type CarrierDispatch,
} from "@/lib/data/carrier-journal";

function dispatch(overrides: Partial<CarrierDispatch> & Pick<CarrierDispatch, "id" | "date" | "title">): CarrierDispatch {
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

describe("carrier journal totals", () => {
  it("returns empty totals for no dispatches", () => {
    const totals = computeTotalsFromDispatches([]);
    expect(totals.daysLogged).toBe(0);
    expect(totals.totalMiles).toBe(0);
    expect(totals.totalSteps).toBe(0);
    expect(totals.avgWaterOz).toBe(0);
    expect(totals.hydrationGoalHitRate).toBe(0);
    expect(totals.startingWeightLbs).toBeUndefined();
    expect(totals.latestWeightLbs).toBeUndefined();
    expect(totals.weightChangeLbs).toBeUndefined();
    expect(totals.phaseCounts).toEqual({
      "break-in": 0,
      adapting: 0,
      building: 0,
      regular: 0,
    });
  });

  it("computes total miles and steps", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 8.5, steps: 18000 }),
      dispatch({ id: "b", date: "2026-05-02", title: "B", milesWalked: 9.1, steps: 19000 }),
    ];
    const totals = computeTotalsFromDispatches(dispatches);
    expect(totals.totalMiles).toBe(17.6);
    expect(totals.totalSteps).toBe(37000);
  });

  it("computes average water on logged hydration days", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A", waterOz: 64 }),
      dispatch({ id: "b", date: "2026-05-02", title: "B", waterOz: 80 }),
      dispatch({ id: "c", date: "2026-05-03", title: "C" }),
    ];
    const totals = computeTotalsFromDispatches(dispatches);
    expect(totals.totalWaterOz).toBe(144);
    expect(totals.avgWaterOz).toBe(72);
  });

  it("computes hydration goal hit rate", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A", waterOz: 80, hydrationGoalOz: 80 }),
      dispatch({ id: "b", date: "2026-05-02", title: "B", waterOz: 64, hydrationGoalOz: 80 }),
      dispatch({ id: "c", date: "2026-05-03", title: "C", waterOz: 96, hydrationGoalOz: 88 }),
    ];
    const totals = computeTotalsFromDispatches(dispatches);
    expect(totals.hydrationGoalHitDays).toBe(2);
    expect(totals.hydrationGoalHitRate).toBe(66.7);
  });

  it("computes weight change from earliest to latest logged entry", () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-05-01",
        title: "A",
        weightLbs: 248,
        weightPublicMode: "change-only",
      }),
      dispatch({
        id: "b",
        date: "2026-05-10",
        title: "B",
        weightLbs: 243.8,
        weightPublicMode: "change-only",
      }),
    ];
    const totals = computeTotalsFromDispatches(dispatches);
    expect(totals.startingWeightLbs).toBe(248);
    expect(totals.latestWeightLbs).toBe(243.8);
    expect(totals.weightChangeLbs).toBe(-4.2);
  });
});

describe("formatPublicWeightTrend", () => {
  it('shows em dash when no weight data exists', () => {
    const dispatches = [dispatch({ id: "a", date: "2026-05-01", title: "A" })];
    const totals = computeTotalsFromDispatches(dispatches);
    expect(formatPublicWeightTrend(totals, dispatches).value).toBe(CARRIER_KPI_EMPTY);
  });

  it('shows "tracking privately" when all weight entries are hidden', () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-05-01",
        title: "A",
        weightLbs: 250,
        weightPublicMode: "hidden",
      }),
      dispatch({
        id: "b",
        date: "2026-05-10",
        title: "B",
        weightLbs: 245,
        weightPublicMode: "hidden",
      }),
    ];
    const totals = computeTotalsFromDispatches(dispatches);
    expect(formatPublicWeightTrend(totals, dispatches).value).toBe("tracking privately");
  });

  it("shows change-only summary without raw current weight", () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-05-01",
        title: "A",
        weightLbs: 248,
        weightPublicMode: "change-only",
      }),
      dispatch({
        id: "b",
        date: "2026-05-10",
        title: "B",
        weightLbs: 243.8,
        weightPublicMode: "change-only",
      }),
    ];
    const totals = computeTotalsFromDispatches(dispatches);
    const trend = formatPublicWeightTrend(totals, dispatches);
    expect(trend.value).toBe("-4.2 lbs");
    expect(trend.value).not.toMatch(/243/);
  });

  it("shows current weight plus change in current-and-change mode", () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-05-01",
        title: "A",
        weightLbs: 248,
        weightPublicMode: "change-only",
      }),
      dispatch({
        id: "b",
        date: "2026-05-10",
        title: "B",
        weightLbs: 244,
        weightPublicMode: "current-and-change",
      }),
    ];
    const totals = computeTotalsFromDispatches(dispatches);
    const trend = formatPublicWeightTrend(totals, dispatches);
    expect(trend.value).toBe("244 lbs (-4.0 lbs)");
  });
});
