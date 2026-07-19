/**
 * Carrier shift weather: peak air temp, peak/avg heat index, and precip
 * over the working window (default 9 AM–7 PM local).
 */

export const CARRIER_TZ = "America/Indiana/Indianapolis";
/** Inclusive local hours for route exposure (9 AM–7 PM). */
export const SHIFT_START_HOUR = 9;
export const SHIFT_END_HOUR = 19;
/** Inches during shift at/above this count as a rain day. */
export const RAIN_DAY_PRECIP_IN = 0.05;

export const CARRIER_WEATHER_LAT = 41.6764;
export const CARRIER_WEATHER_LON = -86.252;

export type HourlyWeatherPoint = {
  hour: number;
  tempF: number;
  humidity: number | null;
  precipIn?: number;
};

export type ShiftWeatherMetrics = {
  peakTempF: number;
  peakHeatIndexF: number;
  avgHeatIndexF: number;
  precipIn: number;
  rainyHours: number;
  peakTempHour: number | null;
  peakHeatIndexHour: number | null;
};

/** Rothfusz heat index (°F). Returns temp unchanged below 80°F. */
export function heatIndexF(tempF: number, humidity: number): number {
  if (tempF < 80) return Math.round(tempF);
  const T = tempF;
  const R = humidity;
  return Math.round(
    -42.379 +
      2.04901523 * T +
      10.14333127 * R -
      0.22475541 * T * R -
      0.00683783 * T * T -
      0.05481717 * R * R +
      0.00122874 * T * T * R +
      0.00085282 * T * R * R -
      0.00000199 * T * T * R * R
  );
}

export function isRainDay(precipIn: number | undefined | null): boolean {
  return (precipIn ?? 0) >= RAIN_DAY_PRECIP_IN;
}

/**
 * Peak temp, peak HI, average HI, and precip over the shift window.
 * Peak HI is the max Rothfusz value in-window (not HI at peak temp hour).
 */
export function computeShiftWeatherMetrics(
  points: HourlyWeatherPoint[],
  window: { start: number; end: number } = {
    start: SHIFT_START_HOUR,
    end: SHIFT_END_HOUR,
  }
): ShiftWeatherMetrics | null {
  const inWindow = points.filter(
    (p) => p.hour >= window.start && p.hour <= window.end && Number.isFinite(p.tempF)
  );
  if (!inWindow.length) return null;

  let peakTemp: number | null = null;
  let peakTempHour: number | null = null;
  let peakHi: number | null = null;
  let peakHiHour: number | null = null;
  let hiSum = 0;
  let hiCount = 0;
  let precipIn = 0;
  let rainyHours = 0;

  for (const p of inWindow) {
    const precip = p.precipIn ?? 0;
    precipIn += precip;
    if (precip >= 0.01) rainyHours += 1;

    if (peakTemp === null || p.tempF > peakTemp) {
      peakTemp = p.tempF;
      peakTempHour = p.hour;
    }

    const hi =
      p.humidity != null && Number.isFinite(p.humidity)
        ? heatIndexF(p.tempF, p.humidity)
        : Math.round(p.tempF);
    hiSum += hi;
    hiCount += 1;
    if (peakHi === null || hi > peakHi) {
      peakHi = hi;
      peakHiHour = p.hour;
    }
  }

  if (peakTemp === null || peakHi === null || hiCount === 0) return null;

  return {
    peakTempF: Math.round(peakTemp),
    peakHeatIndexF: peakHi,
    avgHeatIndexF: Math.round(hiSum / hiCount),
    precipIn: Math.round(precipIn * 100) / 100,
    rainyHours,
    peakTempHour,
    peakHeatIndexHour: peakHiHour,
  };
}

export function localToday(timeZone: string = CARRIER_TZ): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

type OpenMeteoHourly = {
  time?: string[];
  temperature_2m?: number[];
  relative_humidity_2m?: number[];
  relativehumidity_2m?: number[];
  precipitation?: number[];
};

function pointsFromHourly(hourly: OpenMeteoHourly | undefined): HourlyWeatherPoint[] {
  const times = hourly?.time ?? [];
  const temps = hourly?.temperature_2m ?? [];
  const hums = hourly?.relative_humidity_2m ?? hourly?.relativehumidity_2m ?? [];
  const precips = hourly?.precipitation ?? [];
  const points: HourlyWeatherPoint[] = [];

  for (let i = 0; i < times.length; i++) {
    const hour = parseInt(times[i]?.split("T")[1]?.slice(0, 2) ?? "-1", 10);
    const temp = temps[i];
    if (!Number.isFinite(hour) || typeof temp !== "number") continue;
    points.push({
      hour,
      tempF: temp,
      humidity: typeof hums[i] === "number" ? hums[i]! : null,
      precipIn: typeof precips[i] === "number" ? precips[i] : 0,
    });
  }
  return points;
}

async function fetchOpenMeteoJson(
  baseUrl: string,
  lat: number,
  lon: number,
  date: string
): Promise<OpenMeteoHourly | undefined> {
  const url = new URL(baseUrl);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "hourly",
    "temperature_2m,relative_humidity_2m,precipitation"
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("precipitation_unit", "inch");
  url.searchParams.set("timezone", CARRIER_TZ);
  url.searchParams.set("start_date", date);
  url.searchParams.set("end_date", date);

  const res = await fetch(url.toString());
  if (!res.ok) return undefined;
  const data = (await res.json()) as { hourly?: OpenMeteoHourly };
  return data.hourly;
}

/**
 * Fetch shift metrics for a calendar date at lat/lon.
 * Uses forecast endpoint for today (includes recent observations + near-term hours),
 * archive endpoint for past dates.
 */
export async function fetchShiftWeatherForDate(
  lat: number,
  lon: number,
  date: string
): Promise<ShiftWeatherMetrics | null> {
  const today = localToday();
  const base =
    date >= today
      ? "https://api.open-meteo.com/v1/forecast"
      : "https://archive-api.open-meteo.com/v1/archive";

  const hourly = await fetchOpenMeteoJson(base, lat, lon, date);
  if (!hourly) return null;
  return computeShiftWeatherMetrics(pointsFromHourly(hourly));
}
