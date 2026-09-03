/** Public Field Journal telemetry DTOs. Safe to serialize into client components. */

import type { LocomotionEnergyMethod } from "@/lib/carrier-journal/walking-energy";

export type { LocomotionEnergyMethod };

export type PublicMassPoint = {
  date: string;
  deltaFromBaseline: number;
  deltaFromPrevious: number | null;
};

export type PublicMassDeltaSeries = {
  points: PublicMassPoint[];
  currentDelta: number | null;
  last30DayDelta: number | null;
  averageWeeklyDelta: number | null;
};

export const EMPTY_MASS_DELTA_SERIES: PublicMassDeltaSeries = {
  points: [],
  currentDelta: null,
  last30DayDelta: null,
  averageWeeklyDelta: null,
};

export type PublicDerivedTelemetry = {
  milesPerLbDelta: number | null;
  lbDeltaPer100Mi: number | null;
  totalCoolantGal: number | null;
  avgCoolantOzPerMi: number | null;
  tenPlusMileDays: number;
  tenPlusMileDayPct: number | null;
  highHeatMiles: number;
  marathonEquivalents: number | null;
  fiveKEquivalents: number | null;
  /** Estimated walking energy. Absolute body mass never leaves the server. */
  estLocomotionKcal: number | null;
  locomotionMethod: LocomotionEnergyMethod | null;
};

export const EMPTY_DERIVED_TELEMETRY: PublicDerivedTelemetry = {
  milesPerLbDelta: null,
  lbDeltaPer100Mi: null,
  totalCoolantGal: null,
  avgCoolantOzPerMi: null,
  tenPlusMileDays: 0,
  tenPlusMileDayPct: null,
  highHeatMiles: 0,
  marathonEquivalents: null,
  fiveKEquivalents: null,
  estLocomotionKcal: null,
  locomotionMethod: null,
};

export type PublicFieldRecordKey =
  | "longest-range"
  | "best-7-day"
  | "hottest-operation"
  | "max-coolant"
  | "hydration-log-streak"
  | "heat-range";

export type PublicFieldRecord = {
  key: PublicFieldRecordKey;
  label: string;
  value: string;
  unit?: string;
  date: string | null;
  dispatchId?: string;
};

export type PublicFieldRecords = PublicFieldRecord[];
