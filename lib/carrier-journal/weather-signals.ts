import type { CarrierDispatch } from "@/lib/data/carrier-journal";

/** Effective peak heat (°F) from logged shift weather. */
export const HEAT_DAY_THRESHOLD_F = 90;
export const FREEZING_THRESHOLD_F = 32;

export type DerivedWeatherSignals = {
  heat: boolean;
  rain: boolean;
  storm: boolean;
  snow: boolean;
};

export function effectiveHeatF(dispatch: CarrierDispatch): number {
  return Math.max(
    dispatch.temperatureF ?? -Infinity,
    dispatch.heatIndexF ?? -Infinity,
    dispatch.avgHeatIndexF ?? -Infinity
  );
}

function narrativeText(dispatch: CarrierDispatch): string {
  return [dispatch.weather, dispatch.publicNote].filter(Boolean).join(" ");
}

const STORM_PATTERN =
  /\b(storm|stormy|thunder|lightning|hail|tornado|wind gust|gusty)\b/i;
const SNOW_PATTERN =
  /\b(snow|snowing|snowy|sleet|blizzard|icy|ice|slush|freezing rain)\b/i;

/**
 * Weather condition flags.
 * Rain is manual only (`dispatch.rain` from the daybook checkbox / Notion).
 * Storm/snow can still be inferred from notes; heat from temps.
 * Grid precipitation is informational and does not set the rain flag.
 */
export function deriveWeatherSignals(dispatch: CarrierDispatch): DerivedWeatherSignals {
  const text = narrativeText(dispatch);

  const stormFromText = STORM_PATTERN.test(text);
  const snowFromText = SNOW_PATTERN.test(text);
  const snowFromTemp =
    dispatch.temperatureF !== undefined && dispatch.temperatureF <= FREEZING_THRESHOLD_F;

  return {
    heat:
      effectiveHeatF(dispatch) >= HEAT_DAY_THRESHOLD_F || !!dispatch.heatDay,
    rain: !!dispatch.rain,
    storm: !!dispatch.storm || stormFromText,
    snow: !!dispatch.snow || snowFromText || snowFromTemp,
  };
}

export function isDerivedWeatherDay(dispatch: CarrierDispatch): boolean {
  const signals = deriveWeatherSignals(dispatch);
  return signals.rain || signals.storm || signals.snow || signals.heat;
}

export function isDerivedHeatDay(dispatch: CarrierDispatch): boolean {
  return deriveWeatherSignals(dispatch).heat;
}
