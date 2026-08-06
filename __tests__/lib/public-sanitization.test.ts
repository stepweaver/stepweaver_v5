import { buildPublicSummary } from "@/lib/carrier-journal/helpers";

describe("buildPublicSummary", () => {
  it("never injects DPS or parcel volume into auto-generated text", () => {
    const summary = buildPublicSummary({
      miles: 12.3,
      temperatureF: 88,
      dpsCount: 2400,
      dpsPerMile: 195,
    });
    expect(summary).toContain("12.3");
    expect(summary).not.toMatch(/DPS/i);
    expect(summary).not.toMatch(/parcel/i);
    expect(summary).not.toMatch(/2400/);
  });

  it("uses explicit publicNote as-is", () => {
    expect(
      buildPublicSummary({ publicNote: "Walked hard. Hip felt better." })
    ).toBe("Walked hard. Hip felt better.");
  });
});
