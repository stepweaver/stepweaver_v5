import {
  PRIVATE_FIELD_DISPATCH_KEYS,
  toPublicFieldDispatch,
  toPublicFieldDispatches,
  type CarrierDispatch,
} from "@/lib/data/carrier-journal";
import { buildPublicSummary } from "@/lib/carrier-journal/helpers";
import { computePublicAdaptationTelemetry } from "@/lib/data/carrier-adaptation";
import { computePublicDerivedTelemetry } from "@/lib/data/carrier-derived-telemetry.server";
import { toPublicMassDeltaSeries } from "@/lib/data/carrier-mass-delta.server";

function fullPrivateDispatch(): CarrierDispatch {
  return {
    id: "cj-leak-test",
    date: "2026-08-01",
    title: "Leak probe",
    milesWalked: 11.4,
    steps: 24000,
    soreness: 6,
    energy: 5,
    mood: 7,
    weather: "Hot",
    temperatureF: 91,
    heatIndexF: 98,
    avgHeatIndexF: 94,
    precipitationIn: 0.1,
    mailLoad: "heavy",
    heatDay: true,
    rain: true,
    storm: false,
    snow: false,
    dogEncounter: true,
    steppedInDogPoop: false,
    publicNote: "Walked hard. Hip felt better.",
    waterOz: 96,
    hydrationGoalOz: 90,
    weightLbs: 241.2,
    weightPublicMode: "change-only",
    movingMinutes: 187,
    loadKg: 6.4,
    gradePercent: 2.5,
    terrainFactor: 1.1,
    bodyNote: "private body",
    recoveryNote: "private recovery",
    phase: "building",
    tags: ["private-tag"],
    goodSamaritanAct: true,
    routeCode: "SB-013",
    routePreference: "dislike",
    dpsCount: 2740,
    dpsRatio: 1.28,
    parcels: 48,
    parcelRatio: 1.4,
    mailLoadTier: "heavy",
    mailLoadCompositeRatio: 1.35,
    mailDayContext: ["Amazon Day", "Collections"],
  };
}

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

describe("toPublicFieldDispatch", () => {
  it("keeps expressly public fitness fields", () => {
    const publicDto = toPublicFieldDispatch(fullPrivateDispatch());
    expect(publicDto).toMatchObject({
      id: "cj-leak-test",
      date: "2026-08-01",
      title: "Leak probe",
      milesWalked: 11.4,
      soreness: 6,
      energy: 5,
      mood: 7,
      weather: "Hot",
      temperatureF: 91,
      heatIndexF: 98,
      avgHeatIndexF: 94,
      precipitationIn: 0.1,
      heatDay: true,
      rain: true,
      dogEncounter: true,
      steppedInDogPoop: false,
      publicNote: "Walked hard. Hip felt better.",
      waterOz: 96,
      hydrationGoalOz: 90,
    });
    expect(publicDto.estLocomotionKcal).toEqual(expect.any(Number));
    expect(publicDto.locomotionMethod).toBe("minimum-mechanics");
  });

  it("omits every private operational and raw biometric key from the DTO object", () => {
    const publicDto = toPublicFieldDispatch(fullPrivateDispatch());
    for (const key of PRIVATE_FIELD_DISPATCH_KEYS) {
      expect(publicDto).not.toHaveProperty(key);
    }
  });

  it("serializes without private keys (RSC → client payload regression)", () => {
    const payload = toPublicFieldDispatches([fullPrivateDispatch()]);
    const serialized = JSON.stringify(payload);
    const parsed = JSON.parse(serialized) as Record<string, unknown>[];

    expect(parsed).toHaveLength(1);
    for (const key of PRIVATE_FIELD_DISPATCH_KEYS) {
      expect(parsed[0]).not.toHaveProperty(key);
      expect(serialized).not.toContain(`"${key}"`);
    }

    // Specific leak values must not appear as JSON numbers/strings either.
    expect(serialized).not.toContain("241.2");
    expect(serialized).not.toContain("2740");
    expect(serialized).not.toContain("SB-013");
    expect(serialized).not.toContain("Amazon Day");
    expect(serialized).not.toContain("private body");
    expect(serialized).not.toContain("movingMinutes");
    expect(serialized).not.toContain("loadKg");
    expect(parsed[0]).toHaveProperty("estLocomotionKcal");
    expect(parsed[0]).toHaveProperty("locomotionMethod", "minimum-mechanics");
  });
});

describe("public mass-delta and derived telemetry payloads", () => {
  it("serialize relative deltas without absolute weight literals", () => {
    const start = fullPrivateDispatch();
    start.date = "2026-06-01";
    start.weightLbs = 248;
    start.id = "week-0";

    const latest = fullPrivateDispatch();
    latest.date = "2026-07-06";
    latest.weightLbs = 241.2;
    latest.id = "week-5";

    const mass = toPublicMassDeltaSeries([start, latest]);
    const derived = computePublicDerivedTelemetry([start, latest], mass);
    const adaptation = computePublicAdaptationTelemetry(
      toPublicFieldDispatches([start, latest])
    );
    const serialized = JSON.stringify({ mass, derived, adaptation });

    expect(serialized).not.toContain("248");
    expect(serialized).not.toContain("241.2");
    expect(serialized).not.toMatch(/percent/i);
    expect(serialized).not.toContain("weightLbs");
    expect(mass.points.every((p) => !("weight" in p) && !("weightLbs" in p))).toBe(true);
    expect(mass.currentDelta).toBe(-6.8);
    expect(derived.estLocomotionKcal).not.toBeNull();
    expect(derived.locomotionMethod).toBe("minimum-mechanics");
    expect(typeof derived.estLocomotionKcal).toBe("number");
    expect(serialized).not.toContain("movingMinutes");
    expect(adaptation.conditioning).toBeNull();
    expect(derived.totalMassDistanceLbMi).not.toBeNull();
    expect(typeof mass.last30DayDeltaPct).toBe("number");
    expect(typeof mass.averageWeeklyDeltaPct).toBe("number");
  });
});
