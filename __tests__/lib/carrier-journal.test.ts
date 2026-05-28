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
  it("returns Academy Walker at 0 miles", () => {
    const level = getCarrierLevel([]);
    expect(level.title).toBe("Academy Walker");
    expect(level.level).toBe(1);
    expect(level.xp).toBe(0);
  });

  it("returns Block Rookie between 10 and 24 miles", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 15 }),
    ]);
    expect(level.title).toBe("Block Rookie");
    expect(level.level).toBe(2);
  });

  it("returns Pavement Regular at exactly 100 miles", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 100 }),
    ]);
    expect(level.title).toBe("Pavement Regular");
    expect(level.level).toBe(5);
  });

  it("returns Thousand-Mile Carrier at 1000+ miles", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 1200 }),
    ]);
    expect(level.title).toBe("Thousand-Mile Carrier");
    expect(level.progressToNext).toBe(100);
    expect(level.nextTitle).toBeUndefined();
  });

  it("computes XP as round(totalMiles * 10)", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 9.5 }),
    ]);
    expect(level.xp).toBe(95);
  });

  it("computes progressToNext as a percentage", () => {
    const level = getCarrierLevel([
      dispatch({ id: "a", date: "2026-05-01", title: "A", milesWalked: 17.5 }),
    ]);
    // 17.5 miles → Block Rookie (10–25 range). Progress = (17.5-10)/(25-10)*100 = 50%
    expect(level.title).toBe("Block Rookie");
    expect(level.progressToNext).toBe(50);
  });
});

describe("getCarrierMilestones", () => {
  it("unlocks first-dispatch when one dispatch exists", () => {
    const milestones = getCarrierMilestones([
      dispatch({ id: "a", date: "2026-05-01", title: "A" }),
    ]);
    const badge = milestones.find((m) => m.id === "first-dispatch");
    expect(badge?.unlocked).toBe(true);
    expect(badge?.unlockedAt).toBe("2026-05-01");
  });

  it("does not unlock five-dispatches with only 3 dispatches", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A" }),
      dispatch({ id: "b", date: "2026-05-02", title: "B" }),
      dispatch({ id: "c", date: "2026-05-03", title: "C" }),
    ];
    const badge = getCarrierMilestones(dispatches).find((m) => m.id === "five-dispatches");
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

  it("uses heatIndexF for first-heat-80 badge when heatIndexF >= 80", () => {
    const dispatches = [
      dispatch({
        id: "a",
        date: "2026-05-01",
        title: "A",
        temperatureF: 75,
        heatIndexF: 82,
      }),
    ];
    const badge = getCarrierMilestones(dispatches).find((m) => m.id === "first-heat-80");
    expect(badge?.unlocked).toBe(true);
  });

  it("does not unlock first-heat-80 when temp and heatIndex are both below 80", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-01", title: "A", temperatureF: 75 }),
    ];
    const badge = getCarrierMilestones(dispatches).find((m) => m.id === "first-heat-80");
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
