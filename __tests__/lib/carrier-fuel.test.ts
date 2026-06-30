import {
  computeFuelScore,
  FUEL_SCORE_MAX,
  FUEL_SCORE_WIN,
  formatFuelScore,
} from "@/lib/carrier-journal/fuel";

describe("computeFuelScore", () => {
  it("returns zero for empty input", () => {
    const result = computeFuelScore({});
    expect(result.score).toBe(0);
    expect(result.max).toBe(FUEL_SCORE_MAX);
    expect(result.isWin).toBe(false);
  });

  it("awards a perfect score when all criteria are met", () => {
    const result = computeFuelScore({
      breakfastProtein: true,
      routeFoodPacked: true,
      routeFoodEaten: "all",
      proteinAnchors: 3,
      fruitVegServings: 2,
      mountainDewOz: 12,
    });
    expect(result.score).toBe(6);
    expect(result.isWin).toBe(true);
  });

  it("counts partial route food as eaten", () => {
    const result = computeFuelScore({
      routeFoodEaten: "partial",
    });
    expect(result.breakdown.routeFoodEaten).toBe(true);
  });

  it("does not count none for route food eaten", () => {
    const result = computeFuelScore({
      routeFoodEaten: "none",
    });
    expect(result.breakdown.routeFoodEaten).toBe(false);
  });

  it("requires 3+ protein anchors", () => {
    expect(computeFuelScore({ proteinAnchors: 2 }).breakdown.proteinAnchors).toBe(false);
    expect(computeFuelScore({ proteinAnchors: 3 }).breakdown.proteinAnchors).toBe(true);
    expect(computeFuelScore({ proteinAnchors: 4 }).breakdown.proteinAnchors).toBe(true);
  });

  it("requires 2+ fruit/veg servings", () => {
    expect(computeFuelScore({ fruitVegServings: 1 }).breakdown.fruitVegServings).toBe(false);
    expect(computeFuelScore({ fruitVegServings: 2 }).breakdown.fruitVegServings).toBe(true);
    expect(computeFuelScore({ fruitVegServings: 3 }).breakdown.fruitVegServings).toBe(true);
  });

  it("counts mountain dew when oz is logged including zero", () => {
    expect(computeFuelScore({ mountainDewOz: 0 }).breakdown.mountainDewMeasured).toBe(true);
    expect(computeFuelScore({ mountainDewOz: 20 }).breakdown.mountainDewMeasured).toBe(true);
  });

  it("treats 4/6 as a win", () => {
    const result = computeFuelScore({
      breakfastProtein: true,
      routeFoodPacked: true,
      routeFoodEaten: "all",
      proteinAnchors: 3,
    });
    expect(result.score).toBe(4);
    expect(result.isWin).toBe(true);
    expect(FUEL_SCORE_WIN).toBe(4);
  });

  it("does not score gatorade or post-shift meal quality", () => {
    const withExtras = computeFuelScore({
      gatorade: 2,
      postShiftMealQuality: "solid",
    });
    expect(withExtras.score).toBe(0);
  });
});

describe("formatFuelScore", () => {
  it("formats score out of max", () => {
    expect(formatFuelScore(4)).toBe("4/6");
  });
});
