/** Mileage aggregation for Carrier Footwear Lab (occupational miles only). */

export type MileageAllocationInput = {
  date: string;
  miles: number;
  mileageType: "work" | "estimated" | "adjustment";
};

export type MileageBreakdown = {
  totalMiles: number;
  /** Miles assigned from the Carrier Journal daybook. */
  loggedMiles: number;
  /** Baseline / prior miles seeded before daybook tracking. */
  priorMiles: number;
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

/** Normalize legacy DB values; anything non-prior/non-adjustment counts as work. */
export function normalizeMileageType(
  value: string
): MileageAllocationInput["mileageType"] {
  if (value === "estimated") return "estimated";
  if (value === "adjustment") return "adjustment";
  return "work";
}

export function aggregateMileage(
  allocations: MileageAllocationInput[]
): MileageBreakdown {
  let loggedMiles = 0;
  let priorMiles = 0;
  let adjustmentMiles = 0;
  /** Days the shoe was assigned on the daybook — not prior-seed lump dates. */
  const wornDates = new Set<string>();

  for (const a of allocations) {
    const miles = toMilesNumber(a.miles);
    const mileageType = normalizeMileageType(a.mileageType);
    if (miles === 0 && mileageType !== "adjustment") continue;
    switch (mileageType) {
      case "work":
        loggedMiles += miles;
        wornDates.add(a.date);
        break;
      case "estimated":
        priorMiles += miles;
        break;
      case "adjustment":
        adjustmentMiles += miles;
        break;
    }
  }

  return {
    totalMiles: round1(loggedMiles + priorMiles + adjustmentMiles),
    loggedMiles: round1(loggedMiles),
    priorMiles: round1(priorMiles),
    adjustmentMiles: round1(adjustmentMiles),
    daysWorn: wornDates.size,
  };
}

/**
 * Days worn = unique daybook assignment dates, plus Carrier Journal days in the
 * shoe's service window when prior/legacy mileage was seeded as a lump sum.
 * Prior seed rows do not count as a single "day worn."
 */
export function resolveDaysWorn(input: {
  allocations: MileageAllocationInput[];
  firstWearDate: string | null | undefined;
  retirementDate?: string | null;
  /** Carrier Journal days with miles (date + milesWalked). */
  carrierDays?: { date: string; miles: number }[];
}): number {
  const base = aggregateMileage(input.allocations);
  const dates = new Set<string>();

  for (const a of input.allocations) {
    if (normalizeMileageType(a.mileageType) !== "work") continue;
    if (toMilesNumber(a.miles) === 0) continue;
    dates.add(a.date);
  }

  const needsCarrierBackfill = base.priorMiles > 0;
  const start = input.firstWearDate ?? null;
  if (!needsCarrierBackfill || !start || !input.carrierDays?.length) {
    return dates.size || base.daysWorn;
  }

  const end =
    input.retirementDate ??
    new Date().toISOString().slice(0, 10);

  for (const day of input.carrierDays) {
    if (day.miles <= 0) continue;
    if (day.date < start || day.date > end) continue;
    dates.add(day.date);
  }

  return dates.size;
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
