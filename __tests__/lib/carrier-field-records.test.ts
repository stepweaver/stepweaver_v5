import { computePublicFieldRecords } from "@/lib/data/carrier-field-records";
import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";

function dispatch(
  overrides: Partial<PublicFieldDispatch> & Pick<PublicFieldDispatch, "id" | "date" | "title">
): PublicFieldDispatch {
  return {
    milesWalked: 0,
    soreness: 5,
    energy: 5,
    mood: 5,
    publicNote: "",
    ...overrides,
  };
}

function record(
  records: ReturnType<typeof computePublicFieldRecords>,
  key: string
) {
  return records.find((r) => r.key === key);
}

describe("computePublicFieldRecords", () => {
  it("returns n/a rows for an empty journal", () => {
    const records = computePublicFieldRecords([]);
    expect(records).toHaveLength(6);
    for (const row of records) {
      expect(row.value).toBe("n/a");
      expect(row.date).toBeNull();
    }
  });

  it("records the longest range day", () => {
    const records = computePublicFieldRecords([
      dispatch({ id: "a", date: "2026-08-20", title: "A", milesWalked: 12.2 }),
      dispatch({
        id: "b",
        date: "2026-08-21",
        title: "B",
        milesWalked: 15.5,
        publicNote: "Long day.",
      }),
    ]);
    const longest = record(records, "longest-range");
    expect(longest).toMatchObject({
      value: "15.5",
      unit: "MI",
      date: "2026-08-21",
      dispatchId: "b",
    });
  });

  it("uses a rolling 7 calendar-day window for best range", () => {
    const records = computePublicFieldRecords([
      dispatch({ id: "a", date: "2026-08-01", title: "A", milesWalked: 10 }),
      dispatch({ id: "b", date: "2026-08-03", title: "B", milesWalked: 10 }),
      dispatch({ id: "c", date: "2026-08-07", title: "C", milesWalked: 10 }),
      dispatch({ id: "d", date: "2026-08-20", title: "D", milesWalked: 15 }),
    ]);
    const best = record(records, "best-7-day");
    // Aug 1–7 sums to 30; the isolated 15-mile day is lower
    expect(best?.value).toBe("30");
    expect(best?.date).toBe("2026-08-07");
  });

  it("records hottest operation from effectiveHeatF", () => {
    const records = computePublicFieldRecords([
      dispatch({
        id: "a",
        date: "2026-06-10",
        title: "A",
        milesWalked: 8,
        heatIndexF: 103,
        publicNote: "Brutal.",
      }),
      dispatch({
        id: "b",
        date: "2026-06-11",
        title: "B",
        milesWalked: 12,
        temperatureF: 91,
      }),
    ]);
    const hottest = record(records, "hottest-operation");
    expect(hottest).toMatchObject({
      value: "103",
      unit: "°F HI",
      date: "2026-06-10",
      dispatchId: "a",
    });
  });

  it("records max coolant ounces", () => {
    const records = computePublicFieldRecords([
      dispatch({ id: "a", date: "2026-07-01", title: "A", waterOz: 96 }),
      dispatch({ id: "b", date: "2026-07-16", title: "B", waterOz: 197 }),
    ]);
    expect(record(records, "max-coolant")).toMatchObject({
      value: "197",
      unit: "OZ",
      date: "2026-07-16",
    });
  });

  it("counts a logged-day hydration streak across rest-day gaps", () => {
    const records = computePublicFieldRecords([
      dispatch({
        id: "a",
        date: "2026-08-01",
        title: "A",
        waterOz: 90,
        hydrationGoalOz: 80,
      }),
      dispatch({
        id: "b",
        date: "2026-08-02",
        title: "B",
        waterOz: 90,
        hydrationGoalOz: 80,
      }),
      dispatch({
        id: "c",
        date: "2026-08-07",
        title: "C",
        waterOz: 90,
        hydrationGoalOz: 80,
      }),
      dispatch({
        id: "d",
        date: "2026-08-12",
        title: "D",
        waterOz: 90,
        hydrationGoalOz: 80,
      }),
    ]);
    const streak = record(records, "hydration-log-streak");
    expect(streak?.value).toBe("4");
    expect(streak?.unit).toBe("DAYS");
    expect(streak?.label).toBe("LONGEST HYDRATION LOG STREAK");
    expect(streak?.date).toBe("2026-08-12");
  });

  it("resets the hydration log streak on a logged miss", () => {
    const records = computePublicFieldRecords([
      dispatch({
        id: "a",
        date: "2026-08-01",
        title: "A",
        waterOz: 90,
        hydrationGoalOz: 80,
      }),
      dispatch({
        id: "b",
        date: "2026-08-02",
        title: "B",
        waterOz: 40,
        hydrationGoalOz: 80,
      }),
      dispatch({
        id: "c",
        date: "2026-08-03",
        title: "C",
        waterOz: 90,
        hydrationGoalOz: 80,
      }),
    ]);
    expect(record(records, "hydration-log-streak")?.value).toBe("1");
  });

  it("records heat range as the highest-mileage heat day", () => {
    const records = computePublicFieldRecords([
      dispatch({
        id: "a",
        date: "2026-06-10",
        title: "A",
        milesWalked: 8,
        heatIndexF: 103,
      }),
      dispatch({
        id: "b",
        date: "2026-07-04",
        title: "B",
        milesWalked: 12.4,
        temperatureF: 94,
      }),
      dispatch({
        id: "c",
        date: "2026-07-05",
        title: "C",
        milesWalked: 15,
        temperatureF: 72,
      }),
    ]);
    expect(record(records, "heat-range")).toMatchObject({
      value: "12.4",
      unit: "MI",
      date: "2026-07-04",
    });
  });
});
