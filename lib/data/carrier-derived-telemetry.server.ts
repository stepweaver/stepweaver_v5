import "server-only";

import { estimateLocomotionEnergyFromDispatches, computeMassDistanceLbMi } from "@/lib/carrier-journal/walking-energy";
import { isDerivedHeatDay } from "@/lib/carrier-journal/weather-signals";
import type { CarrierDispatch } from "@/lib/data/carrier-journal";
import { round1 } from "@/lib/data/carrier-journal-dates";
import type {
  PublicDerivedTelemetry,
  PublicMassDeltaSeries,
} from "@/lib/types/carrier-public-telemetry";

const US_FL_OZ_PER_GALLON = 128;
const MARATHON_MILES = 26.2;
const FIVE_K_MILES = 3.10686;
const TEN_MILE_THRESHOLD = 10;

function massDroppedLbs(currentDelta: number | null): number | null {
  if (currentDelta === null || currentDelta >= 0) return null;
  const lost = Math.abs(currentDelta);
  return lost > 0 ? lost : null;
}

export function computePublicDerivedTelemetry(
  dispatches: CarrierDispatch[],
  massDelta: PublicMassDeltaSeries
): PublicDerivedTelemetry {
  const totalMiles = round1(dispatches.reduce((sum, d) => sum + d.milesWalked, 0));
  const lostLbs = massDroppedLbs(massDelta.currentDelta);

  const milesPerLbDelta =
    lostLbs !== null && totalMiles > 0 ? round1(totalMiles / lostLbs) : null;
  const lbDeltaPer100Mi =
    lostLbs !== null && totalMiles > 0 ? round1((lostLbs / totalMiles) * 100) : null;

  const hydrationDays = dispatches.filter(
    (d) => d.waterOz !== undefined && Number.isFinite(d.waterOz)
  );
  const totalWaterOz = hydrationDays.reduce((sum, d) => sum + (d.waterOz ?? 0), 0);
  const totalCoolantGal =
    hydrationDays.length > 0 ? round1(totalWaterOz / US_FL_OZ_PER_GALLON) : null;

  const coolantAndMiles = dispatches.filter(
    (d) =>
      d.waterOz !== undefined &&
      Number.isFinite(d.waterOz) &&
      d.milesWalked > 0
  );
  const coolantOzSum = coolantAndMiles.reduce((sum, d) => sum + (d.waterOz ?? 0), 0);
  const coolantMilesSum = coolantAndMiles.reduce((sum, d) => sum + d.milesWalked, 0);
  const avgCoolantOzPerMi =
    coolantMilesSum > 0 ? round1(coolantOzSum / coolantMilesSum) : null;

  const tenPlusMileDays = dispatches.filter((d) => d.milesWalked >= TEN_MILE_THRESHOLD).length;
  const tenPlusMileDayPct =
    dispatches.length > 0 ? round1((tenPlusMileDays / dispatches.length) * 100) : null;

  const highHeatMiles = round1(
    dispatches.filter(isDerivedHeatDay).reduce((sum, d) => sum + d.milesWalked, 0)
  );

  const marathonEquivalents = totalMiles > 0 ? round1(totalMiles / MARATHON_MILES) : null;
  const fiveKEquivalents = totalMiles > 0 ? round1(totalMiles / FIVE_K_MILES) : null;

  const locomotion = estimateLocomotionEnergyFromDispatches(dispatches);

  return {
    milesPerLbDelta,
    lbDeltaPer100Mi,
    totalCoolantGal,
    avgCoolantOzPerMi,
    tenPlusMileDays,
    tenPlusMileDayPct,
    highHeatMiles,
    marathonEquivalents,
    fiveKEquivalents,
    estLocomotionKcal: locomotion.kcal,
    locomotionMethod: locomotion.method,
    totalMassDistanceLbMi: computeMassDistanceLbMi(dispatches),
  };
}
