import {
  CARRIER_KPI_EMPTY,
  computeTotalsFromDispatches,
  computeDpsStats,
  enrichDispatchesDpsFields,
  formatPublicWeightTrend,
  type CarrierDispatch,
} from "@/lib/data/carrier-journal";
import {
  getCarrierLevel,
} from "@/lib/data/carrier-milestones";
import { splitPublicNoteParagraphs } from "@/lib/data/carrier-note-formatting";

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

describe("carrier's log totals", () => {
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
  });

  it("counts derived heat days from temperature", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A", temperatureF: 92, heatIndexF: 106 }),
      dispatch({ id: "b", date: "2026-05-02", title: "B", temperatureF: 72 }),
    ];
    const totals = computeTotalsFromDispatches(dispatches);
    expect(totals.heatDays).toBe(1);
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

describe("getCarrierLevel", () => {
  it("returns INITIAL ISSUE at 0 miles", () => {
    const level = getCarrierLevel([]);
    expect(level.title).toBe("INITIAL ISSUE");
    expect(level.level).toBe(1);
  });

  it("returns SHAKEDOWN between 25 and 49 miles", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 30 }),
    ]);
    expect(level.title).toBe("SHAKEDOWN");
    expect(level.level).toBe(2);
  });

  it("returns ROAD CONDITIONED at exactly 100 miles", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 100 }),
    ]);
    expect(level.title).toBe("ROAD CONDITIONED");
    expect(level.level).toBe(4);
  });

  it("returns DISTANCE VETERAN at 1000+ miles with next rank", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 1200 }),
    ]);
    expect(level.title).toBe("DISTANCE VETERAN");
    expect(level.nextTitle).toBe("HARDENED");
  });

  it("returns ENDURANCE CLASS at max rank with no next rank", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 10001 }),
    ]);
    expect(level.title).toBe("ENDURANCE CLASS");
    expect(level.progressToNext).toBe(100);
    expect(level.nextTitle).toBeUndefined();
  });

  it("computes progressToNext as a percentage", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 37.5 }),
    ]);
    // 37.5 miles → SHAKEDOWN (25–50 range). Progress = (37.5-25)/(50-25)*100 = 50%
    expect(level.title).toBe("SHAKEDOWN");
    expect(level.progressToNext).toBe(50);
  });
});

describe("splitPublicNoteParagraphs", () => {
  it("splits blank-line-separated paragraphs", () => {
    const text = "First paragraph.\n\nSecond paragraph.";
    expect(splitPublicNoteParagraphs(text)).toEqual([
      "First paragraph.",
      "Second paragraph.",
    ]);
  });

  it("preserves single line breaks within a paragraph", () => {
    const text = "Line one.\nLine two.";
    expect(splitPublicNoteParagraphs(text)).toEqual(["Line one.\nLine two."]);
  });

  it("trims leading and trailing whitespace from each paragraph", () => {
    const text = "  First.  \n\n  Second.  ";
    expect(splitPublicNoteParagraphs(text)).toEqual(["First.", "Second."]);
  });

  it("filters out blank-only paragraphs", () => {
    const text = "First.\n\n\n\nSecond.";
    expect(splitPublicNoteParagraphs(text)).toEqual(["First.", "Second."]);
  });

  it("returns empty array for empty string", () => {
    expect(splitPublicNoteParagraphs("")).toEqual([]);
  });

  it("returns a single paragraph when there are no blank lines", () => {
    const text = "Just one paragraph here.";
    expect(splitPublicNoteParagraphs(text)).toEqual(["Just one paragraph here."]);
  });
});

describe("formatPublicWeightTrend", () => {
  it("shows n/a when no weight data exists", () => {
    const totals = computeTotalsFromDispatches([
      dispatch({ id: "a", date: "2026-05-01", title: "A" }),
    ]);
    expect(formatPublicWeightTrend(totals).value).toBe(CARRIER_KPI_EMPTY);
  });

  it("shows pounds lost without raw current weight", () => {
    const totals = computeTotalsFromDispatches([
      dispatch({
        id: "a",
        date: "2026-05-01",
        title: "A",
        weightLbs: 248,
      }),
      dispatch({
        id: "b",
        date: "2026-05-10",
        title: "B",
        weightLbs: 243.8,
      }),
    ]);
    const trend = formatPublicWeightTrend(totals);
    expect(trend.value).toBe("4.2 lbs lost");
    expect(trend.value).not.toMatch(/243/);
  });
});

describe("DPS stats", () => {
  it("computes DPS aggregates when counts are logged", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A", dpsCount: 2000, milesWalked: 8 }),
      dispatch({ id: "b", date: "2026-05-02", title: "B", dpsCount: 2100, milesWalked: 8 }),
      dispatch({ id: "c", date: "2026-05-03", title: "C", dpsCount: 2200, milesWalked: 8 }),
      dispatch({ id: "d", date: "2026-05-04", title: "D", dpsCount: 2300, milesWalked: 8 }),
      dispatch({ id: "e", date: "2026-05-05", title: "E", dpsCount: 2400, milesWalked: 8 }),
      dispatch({ id: "f", date: "2026-05-06", title: "F", dpsCount: 2800, milesWalked: 8 }),
    ];

    const totals = computeTotalsFromDispatches(dispatches);
    expect(totals.avgDpsCount).toBe(2300);
    expect(totals.medianDpsCount).toBe(2250);
    expect(totals.highestDpsCount).toBe(2800);
    expect(totals.heavyDaysCount).toBe(1);
    expect(totals.latestDpsRatio).toBeCloseTo(2800 / 2200, 2);
    expect(totals.latestDpsPerMile).toBe(350);
  });

  it("leaves legacy dispatches without DPS fields untouched", () => {
    const dispatches = [dispatch({ id: "a", date: "2026-05-01", title: "A" })];
    const enriched = enrichDispatchesDpsFields(dispatches);
    expect(enriched[0].dpsCount).toBeUndefined();
    expect(computeDpsStats(dispatches)).toEqual({});
  });
});
