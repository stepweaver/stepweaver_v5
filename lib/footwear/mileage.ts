/** Mileage aggregation for Carrier Footwear Lab. */

export type MileageAllocationInput = {
  date: string;
  miles: number;
  mileageType: "work" | "personal" | "estimated" | "adjustment";
};

export type MileageBreakdown = {
  totalMiles: number;
  workMiles: number;
  personalMiles: number;
  estimatedMiles: number;
  adjustmentMiles: number;
  daysWorn: number;
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
  let workMiles = 0;
  let personalMiles = 0;
  let estimatedMiles = 0;
  let adjustmentMiles = 0;
  const dates = new Set<string>();

  for (const a of allocations) {
    const miles = toMilesNumber(a.miles);
    if (miles === 0 && a.mileageType !== "adjustment") continue;
    dates.add(a.date);
    switch (a.mileageType) {
      case "work":
        workMiles += miles;
        break;
      case "personal":
        personalMiles += miles;
        break;
      case "estimated":
        estimatedMiles += miles;
        break;
      case "adjustment":
        adjustmentMiles += miles;
        break;
    }
  }

  const totalMiles = round1(
    workMiles + personalMiles + estimatedMiles + adjustmentMiles
  );

  return {
    totalMiles,
    workMiles: round1(workMiles),
    personalMiles: round1(personalMiles),
    estimatedMiles: round1(estimatedMiles),
    adjustmentMiles: round1(adjustmentMiles),
    daysWorn: dates.size,
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
