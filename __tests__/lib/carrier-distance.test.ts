import { buildDistanceJournal, weekEndSunday, weekStartMonday } from "@/lib/data/carrier-distance";
import { toPublicFieldDispatch, type CarrierDispatch } from "@/lib/data/carrier-journal";

function day(
  date: string,
  miles?: number,
  extra: Partial<CarrierDispatch> = {}
): CarrierDispatch {
  return {
    id: date,
    date,
    title: date,
    publicNote: "",
    ...(miles !== undefined ? { milesWalked: miles } : {}),
    ...extra,
  };
}

describe("distance journal", () => {
  const records = [
    day("2026-05-08", undefined, { weightLbs: 250 }),
    day("2026-05-10", 5.4),
    day("2026-05-11", 6),
    day("2026-06-02", 0),
    day("2026-06-03", 10),
    day("2026-08-03", 8),
    day("2026-10-17", 9.2),
  ];

  const journal = buildDistanceJournal(records);

  it("sums recorded miles and ignores a weight-only record", () => {
    expect(journal.totalMiles).toBe(38.6);
    expect(journal.recordCount).toBe(7);
    expect(journal.walkingDays).toBe(5);
    expect(journal.zeroMileDays).toBe(1);
    expect(journal.daysWithoutMileage).toBe(1);
  });

  it("does not treat a missing date as a zero-mile day", () => {
    const june = journal.months.find((month) => month.key === "2026-06");
    expect(june).toMatchObject({
      miles: 10,
      walkingDays: 1,
      zeroMileDays: 1,
      daysWithoutMileage: 0,
    });
    const july = journal.months.find((month) => month.key === "2026-07");
    expect(july).toMatchObject({
      miles: 0,
      walkingDays: 0,
      zeroMileDays: 0,
      daysWithoutMileage: 0,
      partial: false,
    });
  });

  it("includes every month from the first walking day and marks the open month", () => {
    expect(journal.months.map((month) => month.key)).toEqual([
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
    ]);
    expect(journal.months[0].partial).toBe(false);
    expect(journal.months.find((month) => month.key === "2026-10")?.partial).toBe(true);
    expect(journal.months.find((month) => month.key === "2026-05")?.miles).toBe(11.4);
  });

  it("groups weeks Monday through Sunday and flags incomplete weeks", () => {
    expect(weekStartMonday("2026-10-17")).toBe("2026-10-12");
    expect(weekEndSunday("2026-10-17")).toBe("2026-10-18");

    const first = journal.weeks[0];
    const last = journal.weeks[journal.weeks.length - 1];
    const firstStart = weekStartMonday("2026-05-10");
    expect(first.start).toBe(firstStart);
    expect(first.partial).toBe(firstStart < "2026-05-10");
    expect(last.start).toBe("2026-10-12");
    expect(last.end).toBe("2026-10-18");
    expect(last.partial).toBe(true);
    expect(last.miles).toBe(9.2);
    expect(last.walkingDays).toBe(1);

    const closed = journal.weeks.find((week) => week.start === weekStartMonday("2026-06-03"));
    expect(closed?.partial).toBe(false);
    expect(closed?.miles).toBe(10);
    expect(closed?.zeroMileDays).toBe(1);
  });

  it("averages only walking days inside a labeled window", () => {
    const average = buildDistanceJournal([
      day("2026-09-04", 10),
      day("2026-09-05", 0),
      day("2026-09-06", undefined, { weightLbs: 200 }),
      day("2026-10-01", 8),
    ]);
    expect(average.recentAverage.label).toBe("Last 28 days");
    expect(average.recentAverage.walkingDays).toBe(2);
    expect(average.recentAverage.milesPerWalkingDay).toBe(9);
    expect(average.recentAverage.windowEnd).toBe("2026-10-01");
  });

  it("labels a short journal from the first walking day", () => {
    const average = buildDistanceJournal([day("2026-10-15", 4), day("2026-10-16", 6)]);
    expect(average.recentAverage.label).toBe("Since Oct 15");
    expect(average.recentAverage.milesPerWalkingDay).toBe(5);
    expect(average.recentAverage.windowDays).toBe(2);
  });
});

describe("missing body scores", () => {
  it("leaves soreness, energy, and mood unset instead of inventing a 5", () => {
    const source = day("2026-10-17", 9);
    expect(source.soreness).toBeUndefined();
    expect(source.energy).toBeUndefined();
    expect(source.mood).toBeUndefined();

    const publicDay = toPublicFieldDispatch(source);
    expect(publicDay).not.toHaveProperty("soreness");
    expect(publicDay).not.toHaveProperty("energy");
    expect(publicDay).not.toHaveProperty("mood");
    expect(publicDay.milesWalked).toBe(9);
  });

  it("keeps an explicit zero mile entry distinct from a missing mileage field", () => {
    const zero = toPublicFieldDispatch(day("2026-06-02", 0));
    const missing = toPublicFieldDispatch(day("2026-05-08"));
    expect(zero.milesWalked).toBe(0);
    expect(missing).not.toHaveProperty("milesWalked");
  });
});
