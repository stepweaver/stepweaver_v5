/** Mileage aggregation for Carrier Footwear Lab. */

export type MileageAllocationInput = {
  date: string;
  miles: number;
  mileageType: "work" | "personal" | "estimated" | "adjustment";
};

export type MileageBreakdown = {
  totalMiles: number;
  /** Miles assigned from the field log (and any legacy "personal" rows). */
  loggedMiles: number;
  /** Baseline / prior miles seeded before daybook tracking. */
  priorMiles: number;
  adjustmentMiles: number;
  daysWorn: number;
  /** @deprecated Use loggedMiles — kept for older callers. */
  workMiles: number;
  /** @deprecated Personal is no longer distinguished; always 0. */
  personalMiles: number;
  /** @deprecated Use priorMiles. */
  estimatedMiles: number;
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function toMilesNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function aggregateMileage(
  allocations: MileageAllocationInput[]
): MileageBreakdown {
  let loggedMiles = 0;
  let priorMiles = 0;
  let adjustmentMiles = 0;
  const dates = new Set<string>();

  for (const a of allocations) {
    const miles = toMilesNumber(a.miles);
    if (miles === 0 && a.mileageType !== "adjustment") continue;
    dates.add(a.date);
    switch (a.mileageType) {
      case "work":
      case "personal":
        // All footwear mileage is occupational; fold legacy personal into logged.
        loggedMiles += miles;
        break;
      case "estimated":
        priorMiles += miles;
        break;
      case "adjustment":
        adjustmentMiles += miles;
        break;
    }
  }

  const totalMiles = round1(loggedMiles + priorMiles + adjustmentMiles);
  const logged = round1(loggedMiles);
  const prior = round1(priorMiles);
  const adjustment = round1(adjustmentMiles);

  return {
    totalMiles,
    loggedMiles: logged,
    priorMiles: prior,
    adjustmentMiles: adjustment,
    daysWorn: dates.size,
    workMiles: logged,
    personalMiles: 0,
    estimatedMiles: prior,
  };
}

/** Work allocations for a single day must not exceed daybook miles. */
export function validateWorkAllocationSplit(input: {
  daybookMiles: number;
  allocations: { shoeId: string; miles: number }[];
}): { ok: true } | { ok: false; error: string; sum: number } {
  if (input.daybookMiles < 0) {
    return { ok: false, error: "Daybook miles cannot be negative.", sum: 0 };
  }

  let sum = 0;
  for (const a of input.allocations) {
    if (!Number.isFinite(a.miles) || a.miles < 0) {
      return {
        ok: false,
        error: "Allocation miles cannot be negative.",
        sum,
      };
    }
    if (!a.shoeId) {
      return { ok: false, error: "Each allocation needs a shoeId.", sum };
    }
    sum += a.miles;
  }

  sum = round1(sum);
  const limit = round1(input.daybookMiles);

  if (sum > limit) {
    return {
      ok: false,
      error: `Work allocations (${sum} mi) exceed daybook mileage (${limit} mi).`,
      sum,
    };
  }

  return { ok: true };
}

export function costPerMile(
  amountPaid: number | null | undefined,
  totalMiles: number
): number | null {
  if (amountPaid == null || !Number.isFinite(amountPaid) || amountPaid < 0) {
    return null;
  }
  if (totalMiles <= 0) return null;
  return Math.round((amountPaid / totalMiles) * 100) / 100;
}

export function costPer100Miles(
  amountPaid: number | null | undefined,
  totalMiles: number
): number | null {
  const perMile = costPerMile(amountPaid, totalMiles);
  if (perMile == null) return null;
  return Math.round(perMile * 100 * 100) / 100;
}
