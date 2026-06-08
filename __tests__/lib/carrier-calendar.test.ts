import {
  groupDispatchesByDate,
  getCalendarIntensity,
  getWeatherMarkers,
  formatCalendarDate,
  buildCalendarGrid,
  type DaySummary,
} from "@/lib/data/carrier-calendar";
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

function emptyDay(date: string): DaySummary {
  return {
    date,
    hasDispatch: false,
    totalMiles: 0,
    totalSteps: 0,
    rain: false,
    storm: false,
    snow: false,
    heat80: false,
    heat90: false,
    freezing: false,
    belowZero: false,
    dogEncounter: false,
    heavyLoad: false,
    hydrationGoalMet: false,
    dispatchIds: [],
    noteExcerpt: "",
  };
}

// ---------------------------------------------------------------------------
// groupDispatchesByDate
// ---------------------------------------------------------------------------

describe("groupDispatchesByDate", () => {
  it("groups dispatches by date", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-20", title: "A" }),
      dispatch({ id: "b", date: "2026-05-21", title: "B" }),
      dispatch({ id: "c", date: "2026-05-20", title: "C" }),
    ];
    const map = groupDispatchesByDate(dispatches);
    expect(map.get("2026-05-20")).toHaveLength(2);
    expect(map.get("2026-05-21")).toHaveLength(1);
  });

  it("returns an empty map for no dispatches", () => {
    expect(groupDispatchesByDate([]).size).toBe(0);
  });

  it("aggregates miles and steps for multiple dispatches on the same date", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-20", title: "A", milesWalked: 5.5, steps: 11000 }),
      dispatch({ id: "b", date: "2026-05-20", title: "B", milesWalked: 3.2, steps: 6800 }),
    ];
    // Verify grouping yields 2 entries on the same date
    const map = groupDispatchesByDate(dispatches);
    const group = map.get("2026-05-20") ?? [];
    const totalMiles = Math.round(group.reduce((s, d) => s + d.milesWalked, 0) * 10) / 10;
    const totalSteps = group.reduce((s, d) => s + (d.steps ?? 0), 0);
    expect(totalMiles).toBe(8.7);
    expect(totalSteps).toBe(17800);
  });
});

// ---------------------------------------------------------------------------
// getCalendarIntensity
// ---------------------------------------------------------------------------

describe("getCalendarIntensity", () => {
  it("returns 0 for a day with no dispatch", () => {
    expect(getCalendarIntensity(emptyDay("2026-05-20"))).toBe(0);
  });

  it("returns 1 for < 7 miles", () => {
    const day: DaySummary = { ...emptyDay("2026-05-20"), hasDispatch: true, totalMiles: 6.9 };
    expect(getCalendarIntensity(day)).toBe(1);
  });

  it("returns 2 for 7–8.9 miles", () => {
    const day: DaySummary = { ...emptyDay("2026-05-20"), hasDispatch: true, totalMiles: 8.5 };
    expect(getCalendarIntensity(day)).toBe(2);
  });

  it("returns 3 for 9–10.9 miles", () => {
    const day: DaySummary = { ...emptyDay("2026-05-20"), hasDispatch: true, totalMiles: 10.0 };
    expect(getCalendarIntensity(day)).toBe(3);
  });

  it("returns 4 for 11+ miles", () => {
    const day: DaySummary = { ...emptyDay("2026-05-20"), hasDispatch: true, totalMiles: 11.3 };
    expect(getCalendarIntensity(day)).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// getWeatherMarkers
// ---------------------------------------------------------------------------

describe("getWeatherMarkers", () => {
  it("detects rain, storm, snow from boolean flags", () => {
    const d = dispatch({ id: "a", date: "2026-05-20", title: "A", rain: true, storm: true, snow: true });
    const m = getWeatherMarkers(d);
    expect(m.rain).toBe(true);
    expect(m.storm).toBe(true);
    expect(m.snow).toBe(true);
  });

  it("detects heat80 from temperatureF >= 80", () => {
    const d = dispatch({ id: "a", date: "2026-05-20", title: "A", temperatureF: 82 });
    const m = getWeatherMarkers(d);
    expect(m.heat80).toBe(true);
    expect(m.heat90).toBe(false);
  });

  it("detects heat90 from temperatureF >= 90", () => {
    const d = dispatch({ id: "a", date: "2026-05-20", title: "A", temperatureF: 91 });
    const m = getWeatherMarkers(d);
    expect(m.heat80).toBe(true);
    expect(m.heat90).toBe(true);
  });

  it("detects heat80 from heatIndexF even when temperatureF is below 80", () => {
    const d = dispatch({ id: "a", date: "2026-05-20", title: "A", temperatureF: 76, heatIndexF: 83 });
    const m = getWeatherMarkers(d);
    expect(m.heat80).toBe(true);
    expect(m.heat90).toBe(false);
  });

  it("detects heat90 from heatIndexF even when temperatureF is below 90", () => {
    const d = dispatch({ id: "a", date: "2026-05-20", title: "A", temperatureF: 85, heatIndexF: 93 });
    const m = getWeatherMarkers(d);
    expect(m.heat90).toBe(true);
  });

  it("does not flag heat80 when both temperatureF and heatIndexF are below 80", () => {
    const d = dispatch({ id: "a", date: "2026-05-20", title: "A", temperatureF: 72, heatIndexF: 74 });
    const m = getWeatherMarkers(d);
    expect(m.heat80).toBe(false);
    expect(m.heat90).toBe(false);
  });

  it("detects freezing when temperatureF <= 32", () => {
    const d = dispatch({ id: "a", date: "2026-01-05", title: "A", temperatureF: 28 });
    const m = getWeatherMarkers(d);
    expect(m.freezing).toBe(true);
    expect(m.belowZero).toBe(false);
  });

  it("detects belowZero when temperatureF < 0", () => {
    const d = dispatch({ id: "a", date: "2026-01-15", title: "A", temperatureF: -5 });
    const m = getWeatherMarkers(d);
    expect(m.freezing).toBe(true);
    expect(m.belowZero).toBe(true);
  });

  it("does not flag freezing or belowZero when no temperature is provided", () => {
    const d = dispatch({ id: "a", date: "2026-05-20", title: "A" });
    const m = getWeatherMarkers(d);
    expect(m.freezing).toBe(false);
    expect(m.belowZero).toBe(false);
  });

  it("does not flag any weather markers when all fields are absent or false", () => {
    const d = dispatch({ id: "a", date: "2026-05-20", title: "A" });
    const m = getWeatherMarkers(d);
    expect(Object.values(m).every((v) => v === false)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// formatCalendarDate
// ---------------------------------------------------------------------------

describe("formatCalendarDate", () => {
  it("formats a date string as 'Mon DD'", () => {
    expect(formatCalendarDate("2026-05-20")).toBe("May 20");
  });

  it("formats January correctly", () => {
    expect(formatCalendarDate("2026-01-01")).toBe("Jan 1");
  });

  it("formats December correctly", () => {
    expect(formatCalendarDate("2026-12-31")).toBe("Dec 31");
  });
});

// ---------------------------------------------------------------------------
// buildCalendarGrid: structure and content
// ---------------------------------------------------------------------------

describe("buildCalendarGrid", () => {
  it("returns weeks with 7 days each", () => {
    const dispatches = [dispatch({ id: "a", date: "2026-05-20", title: "A" })];
    const { weeks } = buildCalendarGrid(dispatches);
    expect(weeks.length).toBeGreaterThan(0);
    for (const week of weeks) {
      expect(week).toHaveLength(7);
    }
  });

  it("marks dispatch dates as hasDispatch:true and empty dates as false", () => {
    const dispatches = [dispatch({ id: "a", date: "2026-05-20", title: "A", milesWalked: 9.2, steps: 19800 })];
    const { weeks } = buildCalendarGrid(dispatches);
    const allDays = weeks.flat();
    const loggedDay = allDays.find((d) => d.date === "2026-05-20");
    expect(loggedDay?.hasDispatch).toBe(true);
    expect(loggedDay?.totalMiles).toBe(9.2);
    // Confirm a non-dispatch date in the grid has no dispatch
    const emptyDays = allDays.filter((d) => d.date !== "2026-05-20");
    expect(emptyDays.every((d) => !d.hasDispatch)).toBe(true);
  });

  it("aggregates multiple dispatches on the same date", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-20", title: "A", milesWalked: 5.0, steps: 10000 }),
      dispatch({ id: "b", date: "2026-05-20", title: "B", milesWalked: 4.5, steps: 9000 }),
    ];
    const { weeks } = buildCalendarGrid(dispatches);
    const day = weeks.flat().find((d) => d.date === "2026-05-20");
    expect(day?.hasDispatch).toBe(true);
    expect(day?.totalMiles).toBe(9.5);
    expect(day?.totalSteps).toBe(19000);
    expect(day?.dispatchIds).toEqual(expect.arrayContaining(["a", "b"]));
  });

  it("returns an empty day when no dispatches exist for a grid cell", () => {
    const dispatches = [dispatch({ id: "a", date: "2026-05-20", title: "A" })];
    const { weeks } = buildCalendarGrid(dispatches);
    const allDays = weeks.flat();
    const noLogDay = allDays.find((d) => d.date !== "2026-05-20" && !d.hasDispatch);
    expect(noLogDay).toBeDefined();
    expect(noLogDay?.totalMiles).toBe(0);
    expect(noLogDay?.totalSteps).toBe(0);
    expect(noLogDay?.dispatchIds).toHaveLength(0);
  });

  it("does not depend on a fixed five-day workweek; logs on any day pattern are valid", () => {
    // Dispatches on Monday, Wednesday, Sunday, an irregular pattern
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-18", title: "Mon", milesWalked: 8.0, steps: 17000 }), // Monday
      dispatch({ id: "b", date: "2026-05-20", title: "Wed", milesWalked: 9.5, steps: 20000 }), // Wednesday
      dispatch({ id: "c", date: "2026-05-24", title: "Sun", milesWalked: 7.0, steps: 15000 }), // Sunday
    ];
    const { weeks } = buildCalendarGrid(dispatches);
    const allDays = weeks.flat();
    const monDay = allDays.find((d) => d.date === "2026-05-18");
    const wedDay = allDays.find((d) => d.date === "2026-05-20");
    const sunDay = allDays.find((d) => d.date === "2026-05-24");
    expect(monDay?.hasDispatch).toBe(true);
    expect(wedDay?.hasDispatch).toBe(true);
    expect(sunDay?.hasDispatch).toBe(true);
    // Tue and Thu have no dispatch
    const tueDay = allDays.find((d) => d.date === "2026-05-19");
    const thuDay = allDays.find((d) => d.date === "2026-05-21");
    expect(tueDay?.hasDispatch).toBe(false);
    expect(thuDay?.hasDispatch).toBe(false);
  });

  it("shows a minimum of 4 weeks even with no dispatch data", () => {
    const { weeks } = buildCalendarGrid([]);
    expect(weeks.length).toBeGreaterThanOrEqual(4);
  });

  it("grid start is always a Sunday (day index 0)", () => {
    const dispatches = [dispatch({ id: "a", date: "2026-05-20", title: "A" })];
    const { gridStart } = buildCalendarGrid(dispatches);
    const [y, mo, d] = gridStart.split("-").map(Number);
    const date = new Date(y, mo - 1, d);
    expect(date.getDay()).toBe(0); // Sunday
  });

  it("aggregates weather markers across multiple dispatches on the same date", () => {
    const dispatches = [
      dispatch({ id: "a", date: "2026-05-20", title: "A", rain: true }),
      dispatch({ id: "b", date: "2026-05-20", title: "B", temperatureF: 92 }),
    ];
    const { weeks } = buildCalendarGrid(dispatches);
    const day = weeks.flat().find((d) => d.date === "2026-05-20");
    expect(day?.rain).toBe(true);
    expect(day?.heat80).toBe(true);
    expect(day?.heat90).toBe(true);
  });
});
