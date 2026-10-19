import { buildCarrierDaybookProperties } from "@/lib/carrier-journal/daybook-write";
import { validateWorkAllocationSplit } from "@/lib/footwear/mileage";

describe("daybook writes", () => {
  it("updates miles without touching optional measurements", () => {
    const properties = buildCarrierDaybookProperties({
      date: "2026-10-17",
      miles: 9.4,
      published: true,
    });

    expect(properties).toEqual({
      "Publish Public": { checkbox: true },
      "Miles Walked": { number: 9.4 },
    });
    expect(properties).not.toHaveProperty("Soreness (1-10)");
    expect(properties).not.toHaveProperty("Energy (1-10)");
    expect(properties).not.toHaveProperty("Mood (1-10)");
    expect(properties).not.toHaveProperty("Water Oz");
    expect(properties).not.toHaveProperty("Hydration Goal Oz");
    expect(properties).not.toHaveProperty("Weight Lbs");
    expect(properties).not.toHaveProperty("Public Note");
    expect(properties).not.toHaveProperty("Private Note");
    expect(properties).not.toHaveProperty("Rain");
    expect(properties).not.toHaveProperty("Fuel Score");
  });

  it("writes an optional measurement only when it is provided", () => {
    const properties = buildCarrierDaybookProperties({
      date: "2026-10-17",
      miles: 8,
      published: true,
      waterOz: 96,
      soreness: 3,
      publicNote: "Hot afternoon.",
    });

    expect(properties["Water Oz"]).toEqual({ number: 96 });
    expect(properties["Soreness (1-10)"]).toEqual({ number: 3 });
    expect(properties["Public Note"]).toEqual({
      rich_text: [{ text: { content: "Hot afternoon." } }],
    });
    expect(properties).not.toHaveProperty("Energy (1-10)");
    expect(properties).not.toHaveProperty("Mood (1-10)");
  });
});

describe("footwear allocation from a daily log", () => {
  it("accepts assigning the full day's miles to one shoe", () => {
    const split = validateWorkAllocationSplit({
      daybookMiles: 11.2,
      allocations: [{ shoeId: "primary", miles: 11.2 }],
    });
    expect(split.ok).toBe(true);
  });
});
