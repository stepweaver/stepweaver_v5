/** Honest numeric observations. Missing stays missing. */

export function recordedNumber(value: number | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Recorded mileage, including an explicit 0. Undefined when the field was empty. */
export function recordedMiles(miles: number | undefined): number | undefined {
  return recordedNumber(miles);
}

/**
 * Contribution to a mileage sum.
 * Missing mileage adds nothing. An explicit 0 stays 0.
 */
export function milesForSum(miles: number | undefined): number {
  return recordedMiles(miles) ?? 0;
}

export function isWalkingMileage(miles: number | undefined): boolean {
  const value = recordedMiles(miles);
  return value !== undefined && value > 0;
}

export function isExplicitZeroMileage(miles: number | undefined): boolean {
  return recordedMiles(miles) === 0;
}

export function isMissingMileage(miles: number | undefined): boolean {
  return recordedMiles(miles) === undefined;
}

export function meanObserved(
  values: Array<number | undefined>,
  digits = 1
): number | null {
  const nums = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value)
  );
  if (nums.length === 0) return null;
  const factor = 10 ** digits;
  return Math.round((nums.reduce((sum, value) => sum + value, 0) / nums.length) * factor) / factor;
}
