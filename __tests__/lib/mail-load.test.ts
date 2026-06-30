import {
  classifyMailLoad,
  classifyMailLoadForEntry,
  formatPublicMailLoadLine,
  tierFromCompositeRatio,
} from "@/lib/carrier-journal/mail-load";

const DPS_BASELINE = [1800, 1900, 2000, 2100, 2200];
const PARCEL_BASELINE = [20, 22, 24, 26, 28];

describe("tierFromCompositeRatio", () => {
  it("returns light below 90% of baseline", () => {
    expect(tierFromCompositeRatio(0.85)).toBe("light");
  });

  it("returns medium between 90% and 115%", () => {
    expect(tierFromCompositeRatio(1)).toBe("medium");
  });

  it("returns heavy above 115%", () => {
    expect(tierFromCompositeRatio(1.2)).toBe("heavy");
  });

  it("returns null while calibrating", () => {
    expect(tierFromCompositeRatio(null)).toBeNull();
  });
});

describe("classifyMailLoad", () => {
  it("uses DPS only when parcels are missing", () => {
    const result = classifyMailLoad({
      dpsCount: 2500,
      historicalDpsCounts: DPS_BASELINE,
      historicalParcels: [],
    });

    expect(result.tier).toBe("heavy");
    expect(result.compositeRatio).toBeCloseTo(2500 / 2000, 5);
  });

  it("uses parcels only when DPS is missing", () => {
    const result = classifyMailLoad({
      parcels: 40,
      historicalDpsCounts: [],
      historicalParcels: PARCEL_BASELINE,
    });

    expect(result.tier).toBe("heavy");
    expect(result.compositeRatio).toBeCloseTo(40 / 24, 5);
  });

  it("averages DPS and parcel ratios when both are present", () => {
    const result = classifyMailLoad({
      dpsCount: 2200,
      parcels: 40,
      historicalDpsCounts: DPS_BASELINE,
      historicalParcels: PARCEL_BASELINE,
    });

    const dpsRatio = 2200 / 2000;
    const parcelRatio = 40 / 24;
    expect(result.compositeRatio).toBeCloseTo((dpsRatio + parcelRatio) / 2, 5);
    expect(result.tier).toBe("heavy");
  });

  it("returns null tier while baseline is calibrating", () => {
    const result = classifyMailLoad({
      dpsCount: 2200,
      historicalDpsCounts: [1800, 1900, 2000, 2100],
      historicalParcels: [],
    });

    expect(result.tier).toBeNull();
    expect(result.compositeRatio).toBeNull();
  });
});

describe("classifyMailLoadForEntry", () => {
  it("excludes the current date from baseline history", () => {
    const entries = [
      { date: "2026-06-01", dpsCount: 2000, parcels: 24 },
      { date: "2026-06-02", dpsCount: 2100, parcels: 25 },
      { date: "2026-06-03", dpsCount: 2050, parcels: 23 },
      { date: "2026-06-04", dpsCount: 2080, parcels: 26 },
      { date: "2026-06-05", dpsCount: 2120, parcels: 24 },
      { date: "2026-06-06", dpsCount: 2800, parcels: 50 },
    ];

    const result = classifyMailLoadForEntry(entries, {
      date: "2026-06-06",
      dpsCount: 2800,
      parcels: 50,
    });

    expect(result.tier).toBe("heavy");
  });
});

describe("formatPublicMailLoadLine", () => {
  it("formats a classified heavy day", () => {
    expect(
      formatPublicMailLoadLine({ tier: "heavy", compositeRatio: 1.24 })
    ).toBe("Mail load: Heavy · 124% of baseline");
  });

  it("shows calibrating when ratio exists but tier does not", () => {
    expect(formatPublicMailLoadLine({ tier: null, compositeRatio: null })).toBeNull();
  });
});
