/**
 * Carrier shift weather: peak air temp, peak/avg heat index, and precip
 * over the working window (default 9 AM–7 PM local).
 *
 * Coverage: ZIP 46613 + 46614 (South Bend route areas). Metrics merge the
 * hotter of the two grid points each hour so exposure reflects both zones.
 */

export const CARRIER_TZ = "America/Indiana/Indianapolis";
/** Inclusive local hours for route exposure (9 AM–7 PM). */
export const SHIFT_START_HOUR = 9;
export const SHIFT_END_HOUR = 19;

/** ZIP 46614 centroid (existing daybook default). */
export const CARRIER_WEATHER_POINTS = [
  { zip: "46614", lat: 41.6764, lon: -86.252 },
  { zip: "46613", lat: 41.6539, lon: -86.264 },
] as const;

/** @deprecated Prefer CARRIER_WEATHER_POINTS - kept for callers expecting a single point. */
export const CARRIER_WEATHER_LAT = CARRIER_WEATHER_POINTS[0].lat;
export const CARRIER_WEATHER_LON = CARRIER_WEATHER_POINTS[0].lon;

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

/** Merge two hourly series: hotter temp (and its humidity) + max precip each hour. */
export function mergeHourlyPoints(
  a: HourlyWeatherPoint[],
  b: HourlyWeatherPoint[]
): HourlyWeatherPoint[] {
  const byHour = new Map<number, HourlyWeatherPoint>();

  const ingest = (points: HourlyWeatherPoint[]) => {
    for (const p of points) {
      const existing = byHour.get(p.hour);
      if (!existing) {
        byHour.set(p.hour, { ...p });
        continue;
      }
      const hotter = p.tempF >= existing.tempF ? p : existing;
      const cooler = p.tempF >= existing.tempF ? existing : p;
      byHour.set(p.hour, {
        hour: p.hour,
        tempF: hotter.tempF,
        humidity: hotter.humidity ?? cooler.humidity,
        precipIn: Math.max(existing.precipIn ?? 0, p.precipIn ?? 0),
      });
    }
  };

  ingest(a);
  ingest(b);
  return [...byHour.values()].sort((x, y) => x.hour - y.hour);
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
 * Fetch shift metrics for a calendar date across carrier ZIPs (46613 + 46614).
 * Uses forecast endpoint for today, archive for past dates.
 * Optional lat/lon override still supported (single-point callers / terminal).
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

  const isCarrierDefault =
    CARRIER_WEATHER_POINTS.some(
      (p) => Math.abs(p.lat - lat) < 0.01 && Math.abs(p.lon - lon) < 0.01
    );

  if (isCarrierDefault) {
    const series = await Promise.all(
      CARRIER_WEATHER_POINTS.map((p) => fetchOpenMeteoJson(base, p.lat, p.lon, date))
    );
    const pointSets = series
      .map(pointsFromHourly)
      .filter((pts) => pts.length > 0);
    if (!pointSets.length) return null;
    const merged = pointSets.reduce((acc, pts) => mergeHourlyPoints(acc, pts));
    return computeShiftWeatherMetrics(merged);
  }

  const hourly = await fetchOpenMeteoJson(base, lat, lon, date);
  if (!hourly) return null;
  return computeShiftWeatherMetrics(pointsFromHourly(hourly));
}
