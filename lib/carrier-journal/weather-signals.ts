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
  return Math.max(dispatch.temperatureF ?? -Infinity, dispatch.heatIndexF ?? -Infinity);
}

function narrativeText(dispatch: CarrierDispatch): string {
  return [dispatch.weather, dispatch.publicNote].filter(Boolean).join(" ");
}

const RAIN_PATTERN =
  /\b(rain|raining|rainy|drizzle|downpour|wet route|puddles)\b/i;
const STORM_PATTERN =
  /\b(storm|stormy|thunder|lightning|hail|tornado|wind gust|gusty)\b/i;
const SNOW_PATTERN =
  /\b(snow|snowing|snowy|sleet|blizzard|icy|ice|slush|freezing rain)\b/i;

/**
 * Weather condition flags derived from temperature/heat index and narrative text.
 * Replaces manual Notion checkboxes (Heat Day, Rain, Storm, Snow).
 */
export function deriveWeatherSignals(dispatch: CarrierDispatch): DerivedWeatherSignals {
  const text = narrativeText(dispatch);

  const rainFromText = RAIN_PATTERN.test(text);
  const stormFromText = STORM_PATTERN.test(text);
  const snowFromText = SNOW_PATTERN.test(text);
  const snowFromTemp =
    dispatch.temperatureF !== undefined && dispatch.temperatureF <= FREEZING_THRESHOLD_F;

  return {
    heat:
      effectiveHeatF(dispatch) >= HEAT_DAY_THRESHOLD_F || !!dispatch.heatDay,
    rain: !!dispatch.rain || (rainFromText && !snowFromText),
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
