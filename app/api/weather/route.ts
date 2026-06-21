import { NextRequest, NextResponse } from "next/server";

/** Same env name as v3 (`components/Terminal/data/weather.js`). */
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.trim();
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// South Bend / Indianapolis Eastern time - covers ZIP 46614 year-round
const CARRIER_TZ = "America/Indiana/Indianapolis";
// Carrier shift window (local hour, inclusive)
const SHIFT_START_HOUR = 8;
const SHIFT_END_HOUR = 16;

type WeatherOption = { lat: number; lon: number; label: string };

type WeatherJson =
  | {
      needSelection: true;
      options: WeatherOption[];
    }
  | {
      location: string;
      condition: string;
      tempF: number;
      tempC: number;
      humidity: number;
      wind: number;
      forecast?: { date: string; condition: string; high: number; low: number }[];
    };

/** Rothfusz heat index equation (returns tempF unchanged below 80°F). */
function heatIndex(tempF: number, humidity: number): number {
  if (tempF < 80) return tempF;
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

/** Returns the local date string (YYYY-MM-DD) and hour (0-23) for a Unix timestamp in the carrier timezone. */
function localDateHour(unixSec: number): { date: string; hour: number } {
  const d = new Date(unixSec * 1000);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CARRIER_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = parseInt(get("hour"), 10);
  return { date, hour };
}

/** Today's date string in the carrier timezone. */
function localToday(): string {
  return localDateHour(Math.floor(Date.now() / 1000)).date;
}

/**
 * Fetches today's hourly temperature and humidity from Open-Meteo (free, no API key,
 * includes actual measured data for past hours today), then finds the peak temperature
 * within the carrier shift window (SHIFT_START_HOUR–SHIFT_END_HOUR local time).
 *
 * Unlike the OpenWeatherMap forecast, this works whether the shift is in progress,
 * already finished, or hasn't started yet.
 */
async function fetchShiftPeak(
  lat: number,
  lon: number
): Promise<{ peakTempF: number; peakHeatIndexF: number } | null> {
  const today = localToday();

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("hourly", "temperature_2m,relativehumidity_2m");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", CARRIER_TZ);
  url.searchParams.set("start_date", today);
  url.searchParams.set("end_date", today);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = (await res.json()) as {
    hourly?: {
      time?: string[];
      temperature_2m?: number[];
      relative_humidity_2m?: number[];   // current Open-Meteo name
      relativehumidity_2m?: number[];    // legacy name (kept for compatibility)
    };
  };

  const times = data.hourly?.time ?? [];
  const temps = data.hourly?.temperature_2m ?? [];
  // Accept both the current and legacy variable names
  const humidities =
    data.hourly?.relative_humidity_2m ?? data.hourly?.relativehumidity_2m ?? [];

  let peakTemp: number | null = null;
  let peakHumidity: number | null = null;

  for (let i = 0; i < times.length; i++) {
    // time format from Open-Meteo: "2026-06-21T08:00"
    const hour = parseInt(times[i]?.split("T")[1]?.slice(0, 2) ?? "-1", 10);
    if (hour < SHIFT_START_HOUR || hour > SHIFT_END_HOUR) continue;
    const temp = temps[i];
    if (typeof temp === "number" && (peakTemp === null || temp > peakTemp)) {
      peakTemp = temp;
      peakHumidity = humidities[i] ?? null;
    }
  }

  if (peakTemp === null) return null;

  return {
    peakTempF: Math.round(peakTemp),
    peakHeatIndexF: peakHumidity !== null ? heatIndex(peakTemp, peakHumidity) : Math.round(peakTemp),
  };
}

async function fetchForecast(
  lat: number,
  lon: number
): Promise<{ date: string; condition: string; high: number; low: number }[]> {
  if (!API_KEY) return [];
  const forecastRes = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`);
  const forecastData = await forecastRes.json();
  const daily: { date: string; condition: string; high: number; low: number }[] = [];
  const seen = new Set<string>();
  for (const item of forecastData.list ?? []) {
    const date = (item.dt_txt as string | undefined)?.split(" ")[0];
    if (date && !seen.has(date) && daily.length < 5) {
      seen.add(date);
      daily.push({
        date,
        condition: item.weather?.[0]?.description || "Unknown",
        high: Math.round(item.main?.temp_max ?? 0),
        low: Math.round(item.main?.temp_min ?? 0),
      });
    }
  }
  return daily;
}

async function currentWeatherBundle(lat: number, lon: number, label: string, includeForecast: boolean) {
  const weatherRes = await fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`);
  const weather = await weatherRes.json();
  const locLabel =
    label.trim() ||
    `${weather.name ?? ""}${weather.sys?.country ? ", " + weather.sys.country : ""}`.trim() ||
    `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  const result: WeatherJson = {
    location: locLabel,
    condition: weather.weather?.[0]?.description || "Unknown",
    tempF: Math.round(weather.main?.temp ?? 0),
    tempC: Math.round((((weather.main?.temp ?? 0) - 32) * 5) / 9),
    humidity: weather.main?.humidity ?? 0,
    wind: Math.round(weather.wind?.speed ?? 0),
  };
  if (includeForecast) {
    result.forecast = await fetchForecast(lat, lon);
  }
  return result;
}

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Weather API not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const includeForecast = searchParams.get("forecast") === "true";
  const includePeak = searchParams.get("peak") === "true";
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");

  if (latStr !== null && lonStr !== null) {
    const lat = Number(latStr);
    const lon = Number(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }
    try {
      const body = await currentWeatherBundle(lat, lon, "", includeForecast);
      if (includePeak) {
        const peak = await fetchShiftPeak(lat, lon);
        // Attach peak fields; fall back to current temp if window has no data yet
        const peakTempF = peak?.peakTempF ?? (body as { tempF?: number }).tempF;
        // Parentheses are required: ?? binds tighter than ternary, so without them
        // the ternary condition would be (peak?.peakHeatIndexF ?? body.tempF !== undefined)
        // which is always truthy - always calling heatIndex on current conditions.
        const peakHeatIndexF =
          peak?.peakHeatIndexF ??
          ((body as { tempF?: number }).tempF !== undefined
            ? heatIndex(
                (body as { tempF: number }).tempF,
                (body as { humidity: number }).humidity
              )
            : null);
        return NextResponse.json(
          { ...body, peakTempF, peakHeatIndexF, peakFromForecast: peak !== null },
          { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
        );
      }
      return NextResponse.json(body, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
      });
    } catch {
      return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
    }
  }

  const query = searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ error: "Missing q or lat/lon" }, { status: 400 });
  }

  try {
    const geoRes = await fetch(`${GEO_URL}?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`);
    const geoData = (await geoRes.json()) as Array<{
      lat: number;
      lon: number;
      name: string;
      state?: string;
      country: string;
    }>;

    if (!geoData.length) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    if (geoData.length > 1) {
      const options: WeatherOption[] = geoData.map((city) => ({
        lat: city.lat,
        lon: city.lon,
        label: `${city.name}, ${city.state || ""} ${city.country}`.trim(),
      }));
      const body: WeatherJson = { needSelection: true, options };
      return NextResponse.json(body);
    }

    const city = geoData[0]!;
    const label = `${city.name}, ${city.country}`;
    const body = await currentWeatherBundle(city.lat, city.lon, label, includeForecast);

    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
