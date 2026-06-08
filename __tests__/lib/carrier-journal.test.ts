import {
  CARRIER_KPI_EMPTY,
  computeTotalsFromDispatches,
  formatPublicWeightTrend,
  type CarrierDispatch,
} from "@/lib/data/carrier-journal";
import { getCarrierLevel, getCarrierMilestones } from "@/lib/data/carrier-milestones";
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
    expect(totals.dogEncounterDays).toBe(0);
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

  it("counts dog encounter days correctly", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A", dogEncounter: true }),
      dispatch({ id: "b", date: "2026-05-02", title: "B" }),
      dispatch({ id: "c", date: "2026-05-03", title: "C", dogEncounter: true }),
    ];
    const totals = computeTotalsFromDispatches(dispatches);
    expect(totals.dogEncounterDays).toBe(2);
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
  it("returns Recruit Walker at 0 miles", () => {
    const level = getCarrierLevel([]);
    expect(level.title).toBe("Recruit Walker");
    expect(level.level).toBe(1);
  });

  it("returns First Loop between 25 and 49 miles", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 30 }),
    ]);
    expect(level.title).toBe("First Loop");
    expect(level.level).toBe(2);
  });

  it("returns Foot Patrol at exactly 100 miles", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 100 }),
    ]);
    expect(level.title).toBe("Foot Patrol");
    expect(level.level).toBe(4);
  });

  it("returns Route Veteran at 1000+ miles with no next rank", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 1200 }),
    ]);
    expect(level.title).toBe("Route Veteran");
    expect(level.nextTitle).toBe("Relay Commander");
  });

  it("returns Carrier Legend at max rank with no next rank", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 10001 }),
    ]);
    expect(level.title).toBe("Carrier Legend");
    expect(level.progressToNext).toBe(100);
    expect(level.nextTitle).toBeUndefined();
  });

  it("computes progressToNext as a percentage", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 37.5 }),
    ]);
    // 37.5 miles → First Loop (25–50 range). Progress = (37.5-25)/(50-25)*100 = 50%
    expect(level.title).toBe("First Loop");
    expect(level.progressToNext).toBe(50);
  });
});

describe("getCarrierMilestones", () => {
  it("unlocks day-one when one dispatch exists", () => {
    const milestones = getCarrierMilestones([
      dispatch({ id: "a", date: "2026-05-01", title: "A" }),
    ]);
    const badge = milestones.find((m) => m.id === "day-one");
    expect(badge?.unlocked).toBe(true);
    expect(badge?.unlockedAt).toBe("2026-05-01");
  });

  it("does not unlock five-logged-days with only 3 dispatches", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A" }),
      dispatch({ id: "b", date: "2026-05-02", title: "B" }),
      dispatch({ id: "c", date: "2026-05-03", title: "C" }),
    ];
    const badge = getCarrierMilestones(dispatches).find((m) => m.id === "five-logged-days");
    expect(badge?.unlocked).toBe(false);
    expect(badge?.progress).toBe(3);
  });

  it("unlocks hundred-miles badge when total miles >= 100", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 60 }),
      dispatch({ id: "b", date: "2026-05-02", title: "B", milesWalked: 50 }),
    ];
    const badge = getCarrierMilestones(dispatches).find((m) => m.id === "hundred-miles");
    expect(badge?.unlocked).toBe(true);
  });

  it("unlocks first-heat-day badge via heatDay flag", () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-05-01",
        title: "A",
        heatDay: true,
      }),
    ];
    const badge = getCarrierMilestones(dispatches).find((m) => m.id === "first-heat-day");
    expect(badge?.unlocked).toBe(true);
  });

  it("unlocks first-heat-day badge when heatIndexF >= 90", () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-05-01",
        title: "A",
        temperatureF: 85,
        heatIndexF: 92,
      }),
    ];
    const badge = getCarrierMilestones(dispatches).find((m) => m.id === "first-heat-day");
    expect(badge?.unlocked).toBe(true);
  });

  it("does not unlock first-heat-day when heatDay is false and temp/heatIndex below 90", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A", temperatureF: 85, heatIndexF: 88 }),
    ];
    const badge = getCarrierMilestones(dispatches).find((m) => m.id === "first-heat-day");
    expect(badge?.unlocked).toBe(false);
  });

  it("unlocks Good Samaritan badge from tags", () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-05-01",
        title: "A",
        tags: ["good-samaritan"],
      }),
    ];
    const badge = getCarrierMilestones(dispatches).find(
      (m) => m.id === "first-good-samaritan"
    );
    expect(badge?.unlocked).toBe(true);
  });

  it("unlocks Good Samaritan badge from goodSamaritanAct flag", () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-05-01",
        title: "A",
        goodSamaritanAct: true,
      }),
    ];
    const badge = getCarrierMilestones(dispatches).find(
      (m) => m.id === "first-good-samaritan"
    );
    expect(badge?.unlocked).toBe(true);
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
