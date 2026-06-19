import {
  classifyDpsForEntry,
  classifyDpsLoad,
  formatPrivateDpsLine,
  formatPublicDpsLoadLine,
  getBaselineHistoricalCounts,
  isHeavyDpsRatio,
  isVeryHeavyDpsRatio,
  median,
} from "@/lib/dps";
import { enrichDispatchesDpsFields, type CarrierDispatch } from "@/lib/data/carrier-journal";

const BASELINE = [2000, 2100, 2200, 2300, 2400];

describe("median", () => {
  it("ignores invalid, zero, negative, nullish, and non-finite values via classifyDpsLoad", () => {
    const result = classifyDpsLoad({
      currentCount: 300,
      historicalCounts: [100, null, 0, -5, undefined, Number.NaN, 300, 300, 300, 300],
    });
    expect(result.baseline).toBe(300);
    expect(result.ratio).toBe(1);
  });

  it("returns null for empty usable input", () => {
    expect(median([])).toBeNull();
  });
});

describe("classifyDpsLoad", () => {
  it("returns null ratio when current DPS count is missing", () => {
    const result = classifyDpsLoad({
      currentCount: undefined,
      historicalCounts: BASELINE,
    });
    expect(result.ratio).toBeNull();
  });

  it("returns null ratio when fewer than 5 historical entries exist", () => {
    const result = classifyDpsLoad({
      currentCount: 2400,
      historicalCounts: [2000, 2100, 2200, 2300],
    });
    expect(result.ratio).toBeNull();
    expect(result.sampleSize).toBe(4);
  });

  it("returns ratio below 70% of median", () => {
    const result = classifyDpsLoad({
      currentCount: 1500,
      historicalCounts: BASELINE,
    });
    expect(result.ratio).toBeCloseTo(1500 / 2200, 5);
  });

  it("returns ratio from 70% to below 85%", () => {
    const result = classifyDpsLoad({
      currentCount: 1700,
      historicalCounts: BASELINE,
    });
    expect(result.ratio).toBeCloseTo(1700 / 2200, 5);
  });

  it("returns ratio from 85% to 115%", () => {
    const result = classifyDpsLoad({
      currentCount: 2200,
      historicalCounts: BASELINE,
    });
    expect(result.ratio).toBe(1);
  });

  it("returns ratio above 115% to 140%", () => {
    const result = classifyDpsLoad({
      currentCount: 2800,
      historicalCounts: BASELINE,
    });
    expect(result.ratio).toBeCloseTo(2800 / 2200, 5);
    expect(isHeavyDpsRatio(result.ratio)).toBe(true);
  });

  it("returns ratio above 140%", () => {
    const result = classifyDpsLoad({
      currentCount: 3200,
      historicalCounts: BASELINE,
    });
    expect(result.ratio).toBeCloseTo(3200 / 2200, 5);
    expect(isVeryHeavyDpsRatio(result.ratio)).toBe(true);
  });

  it("does not let one outlier distort the median baseline as severely as the mean", () => {
    const withOutlier = classifyDpsLoad({
      currentCount: 2200,
      historicalCounts: [...BASELINE, 9000],
    });
    const withoutOutlier = classifyDpsLoad({
      currentCount: 2200,
      historicalCounts: BASELINE,
    });

    const meanWithOutlier =
      [...BASELINE, 9000].reduce((sum, value) => sum + value, 0) / 6;

    expect(withOutlier.baseline).toBe(2250);
    expect(withoutOutlier.baseline).toBe(2200);
    expect(withOutlier.baseline).toBeLessThan(meanWithOutlier);
    expect(withOutlier.ratio).toBeCloseTo(2200 / 2250, 5);
  });
});

describe("getBaselineHistoricalCounts", () => {
  it("uses only the 30 most recent valid counts and excludes the current entry", () => {
    const entries = Array.from({ length: 40 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 0, 1));
      date.setUTCDate(date.getUTCDate() + index);
      return {
        date: date.toISOString().slice(0, 10),
        dpsCount: 1000 + index,
      };
    });

    const excludeDate = entries[39]?.date;
    const counts = getBaselineHistoricalCounts(entries, {
      excludeDate,
      maxSamples: 30,
    });

    expect(excludeDate).toBeDefined();
    expect(counts).toHaveLength(30);
    expect(counts[0]).toBe(1038);
    expect(counts[29]).toBe(1009);
    expect(counts).not.toContain(1039);
  });
});

describe("classifyDpsForEntry", () => {
  it("excludes the current entry from its own baseline", () => {
    const entries = [...BASELINE, 2500].map((count, index) => ({
      date: `2026-05-${String(index + 1).padStart(2, "0")}`,
      id: `cj-${index}`,
      dpsCount: count,
    }));

    const result = classifyDpsForEntry(entries, {
      date: "2026-05-03",
      id: "cj-2",
      dpsCount: 2800,
    });

    expect(result.ratio).toBeCloseTo(2800 / 2300, 5);
    expect(result.sampleSize).toBe(5);
  });
});

describe("DPS display formatting", () => {
  it("formats private lines with count and ratio", () => {
    expect(formatPrivateDpsLine({ dpsCount: 2740, dpsRatio: 1.28 })).toBe(
      "DPS: 2,740 · 128% of baseline"
    );
    expect(formatPrivateDpsLine({ dpsCount: 2740, dpsRatio: null })).toBe(
      "DPS: 2,740 · Calibrating"
    );
  });

  it("formats public load line from ratio only", () => {
    expect(formatPublicDpsLoadLine(1.28)).toBe("DPS load: 128% of recent baseline");
    expect(formatPublicDpsLoadLine(null)).toBeNull();
  });
});

describe("carrier dispatch compatibility", () => {
  it("parses and renders entries without DPS fields", () => {
    const dispatch: CarrierDispatch = {
      id: "cj-legacy",
      date: "2026-05-01",
      title: "Legacy day",
      milesWalked: 8,
      soreness: 5,
      energy: 5,
      mood: 5,
      mailLoad: "normal",
      publicNote: "No DPS data yet.",
    };

    const enriched = enrichDispatchesDpsFields([dispatch])[0];
    expect(enriched.dpsCount).toBeUndefined();
    expect(enriched.dpsRatio).toBeUndefined();
  });
});

describe("ratio thresholds", () => {
  it.each([
    [1.16, true, false],
    [1.4, true, false],
    [1.41, false, true],
  ] as const)("ratio %s heavy=%s veryHeavy=%s", (ratio, heavy, veryHeavy) => {
    expect(isHeavyDpsRatio(ratio)).toBe(heavy);
    expect(isVeryHeavyDpsRatio(ratio)).toBe(veryHeavy);
  });
});
