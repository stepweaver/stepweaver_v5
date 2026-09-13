import {
  computePublicDashboard,
  weeklyWalkingComparison,
} from "@/lib/data/carrier-dashboard";
import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";
import { addCalendarDays } from "@/lib/data/carrier-journal-dates";

function dispatch(
  overrides: Partial<PublicFieldDispatch> & Pick<PublicFieldDispatch, "id" | "date">
): PublicFieldDispatch {
  return {
    title: overrides.title ?? overrides.id,
    milesWalked: 0,
    soreness: 5,
    energy: 5,
    mood: 5,
    publicNote: "",
    ...overrides,
  };
}

function stretch(
  asOf: string,
  days: number
): PublicFieldDispatch[] {
  return Array.from({ length: days }, (_, i) => {
    const date = addCalendarDays(asOf, -(days - 1 - i));
    const isRecent = i >= days - 7;
    return dispatch({
      id: `d-${date}`,
      date,
      milesWalked: isRecent ? 10 : 8,
      soreness: isRecent ? 2 : 4,
      energy: isRecent ? 8 : 6,
      waterOz: isRecent ? 90 : 70,
      heatIndexF: date.startsWith("2026-08") ? 95 : 72,
    });
  });
}

describe("weeklyWalkingComparison", () => {
  it("uses plain English instead of load-delta labels", () => {
    expect(weeklyWalkingComparison(7.5)).toBe("7.5% above recent average");
    expect(weeklyWalkingComparison(-3)).toBe("3% below recent average");
    expect(weeklyWalkingComparison(0)).toBe("In line with recent average");
    expect(weeklyWalkingComparison(null)).toBeNull();
  });
});

describe("computePublicDashboard", () => {
  it("returns empty telemetry when there are no dispatches", () => {
    const dashboard = computePublicDashboard([]);
    expect(dashboard.asOf).toBeNull();
    expect(dashboard.workload.totalMiles).toBe(0);
    expect(dashboard.workload.milesLast7Days).toBeNull();
    expect(dashboard.environment.heatDaysThisMonth).toBe(0);
  });

  it("answers weekly walking with miles this week vs a 4-week average", () => {
    const days = stretch("2026-09-01", 28);
    const dashboard = computePublicDashboard(days);
    expect(dashboard.asOf).toBe("2026-09-01");
    expect(dashboard.workload.milesLast7Days).toBe(70);
    expect(dashboard.workload.fourWeekAvgMilesPerWeek).toBe(59.5);
    expect(dashboard.workload.vsRecentAvgPct).toBe(17.6);
    expect(weeklyWalkingComparison(dashboard.workload.vsRecentAvgPct)).toBe(
      "17.6% above recent average"
    );
  });

  it("does not invent a 4-week average before 28 days of history", () => {
    const days = stretch("2026-09-01", 14);
    const dashboard = computePublicDashboard(days);
    expect(dashboard.workload.milesLast7Days).toBe(70);
    expect(dashboard.workload.fourWeekAvgMilesPerWeek).toBeNull();
    expect(dashboard.workload.vsRecentAvgPct).toBeNull();
  });

  it("uses 7-day and 30-day recovery averages instead of lifetime means", () => {
    const days = [
      ...stretch("2026-08-20", 20).map((d) => ({ ...d, soreness: 8, energy: 3 })),
      dispatch({
        id: "recent-1",
        date: "2026-09-01",
        milesWalked: 10,
        soreness: 2,
        energy: 8,
      }),
    ];
    const dashboard = computePublicDashboard(days);
    expect(dashboard.recovery.soreness7d).toBeLessThan(dashboard.recovery.soreness30d ?? 99);
    expect(dashboard.recovery.energy7d).toBeGreaterThan(dashboard.recovery.energy30d ?? 0);
  });

  it("counts 90°F+ days in the current journal month and the hottest recent workday", () => {
    const days = [
      dispatch({
        id: "july-hot",
        date: "2026-07-15",
        milesWalked: 10,
        heatIndexF: 110,
      }),
      dispatch({
        id: "aug-hot",
        date: "2026-08-12",
        milesWalked: 11,
        heatIndexF: 104,
      }),
      dispatch({
        id: "aug-cool",
        date: "2026-08-20",
        milesWalked: 9,
        temperatureF: 72,
      }),
      dispatch({
        id: "aug-hot-2",
        date: "2026-08-28",
        milesWalked: 10,
        heatIndexF: 98,
      }),
    ];
    const dashboard = computePublicDashboard(days);
    expect(dashboard.environment.monthKey).toBe("2026-08");
    expect(dashboard.environment.heatDaysThisMonth).toBe(2);
    expect(dashboard.environment.hottestRecent).toEqual({
      date: "2026-08-12",
      heatF: 104,
    });
  });

  it("averages fluids on workdays and over the last 30 days", () => {
    const days = [
      dispatch({ id: "old", date: "2026-07-01", milesWalked: 10, waterOz: 40 }),
      dispatch({ id: "off", date: "2026-08-01", milesWalked: 0, waterOz: 200 }),
      dispatch({ id: "a", date: "2026-08-10", milesWalked: 10, waterOz: 80 }),
      dispatch({ id: "b", date: "2026-08-20", milesWalked: 10, waterOz: 100 }),
      dispatch({ id: "c", date: "2026-09-01", milesWalked: 10, waterOz: 90 }),
    ];
    const dashboard = computePublicDashboard(days);
    expect(dashboard.hydration.avgWorkdayOz).toBe(77.5);
    expect(dashboard.hydration.avgLast30dOz).toBe(90);
  });
});
