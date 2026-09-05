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
  /** 30-day mass change as % of mass at the comparison weigh-in. */
  last30DayDeltaPct: number | null;
  /** Average weekly mass change as % of latest weigh-in. */
  averageWeeklyDeltaPct: number | null;
};

export const EMPTY_MASS_DELTA_SERIES: PublicMassDeltaSeries = {
  points: [],
  currentDelta: null,
  last30DayDelta: null,
  averageWeeklyDelta: null,
  last30DayDeltaPct: null,
  averageWeeklyDeltaPct: null,
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
  /**
   * Cumulative body-mass × miles (lb-mi). Derived field telemetry.
   * Absolute mass never leaves the server.
   */
  totalMassDistanceLbMi: number | null;
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
  totalMassDistanceLbMi: null,
};

/** Mean operator channels on a comparable set of days. */
export type AdaptationChannelAverages = {
  energy: number | null;
  soreness: number | null;
  waterOzPerMi: number | null;
};

export type ConditioningDelta = {
  bandMinMi: number;
  bandMaxMi: number;
  moderateWeatherOnly: boolean;
  windowMiles: number;
  totalMiles: number;
  earlySampleSize: number;
  recentSampleSize: number;
  /** Mean odometer (mi) of the early comparable operations. */
  earlyAtMi: number;
  /** Mean odometer (mi) of the recent comparable operations. */
  recentAtMi: number;
  early: AdaptationChannelAverages;
  recent: AdaptationChannelAverages;
  energyDeltaPct: number | null;
  sorenessDeltaPct: number | null;
  coolantDeltaPct: number | null;
};

export type ThermalPenalty = {
  matchedHeatDays: number;
  energyDelta: number | null;
  sorenessDelta: number | null;
  waterOzPerMiDelta: number | null;
  kcalPerMiDelta: number | null;
  heat: AdaptationChannelAverages;
  normal: AdaptationChannelAverages;
  heatKcalPerMi: number | null;
  normalKcalPerMi: number | null;
};

export type RecoveryResponse = {
  loadMilesThreshold: number;
  pairCount: number;
  energyDelta: number | null;
  sorenessDelta: number | null;
  energyPctOfBaseline: number | null;
  post: { energy: number | null; soreness: number | null };
  baseline: { energy: number | null; soreness: number | null };
  thermal: {
    pairCount: number;
    energyDelta: number | null;
    sorenessDelta: number | null;
  } | null;
};

export type LoadDelta = {
  current7dMi: number;
  weeklyBaselineMi: number;
  deltaPct: number | null;
  asOf: string;
};

export type ResilienceWindow = {
  size: number;
  resilientPct: number | null;
};

export type SystemResilience = {
  resilientDays: number;
  tenPlusDays: number;
  resilientPct: number | null;
  firstWindow: ResilienceWindow | null;
  recentWindow: ResilienceWindow | null;
};

export type HeatTolerance = {
  sampleSize: number;
  early: AdaptationChannelAverages;
  recent: AdaptationChannelAverages;
  energyDelta: number | null;
  sorenessDelta: number | null;
  coolantDeltaPct: number | null;
};

export type CoolantDemandBand = {
  key: "cool" | "warm" | "hot";
  label: string;
  ozPerMi: number | null;
  sampleSize: number;
};

export type CoolantDemand = {
  bands: CoolantDemandBand[];
  heatHydrationHitPct: number | null;
  heatHydrationHits: number;
  heatHydrationEligible: number;
};

export type OperatorOutputBand = {
  key: "<8" | "8-10" | "10-12" | "12+";
  label: string;
  sampleSize: number;
  energy: number | null;
  soreness: number | null;
};

export type OperatorOutput = {
  bands: OperatorOutputBand[];
};

export type PublicAdaptationTelemetry = {
  conditioning: ConditioningDelta | null;
  thermalPenalty: ThermalPenalty | null;
  recovery: RecoveryResponse | null;
  loadDelta: LoadDelta | null;
  resilience: SystemResilience | null;
  heatTolerance: HeatTolerance | null;
  coolantDemand: CoolantDemand | null;
  operatorOutput: OperatorOutput | null;
};

export const EMPTY_ADAPTATION_TELEMETRY: PublicAdaptationTelemetry = {
  conditioning: null,
  thermalPenalty: null,
  recovery: null,
  loadDelta: null,
  resilience: null,
  heatTolerance: null,
  coolantDemand: null,
  operatorOutput: null,
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
