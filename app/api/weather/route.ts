import { NextRequest, NextResponse } from "next/server";
import {
  fetchShiftWeatherForDate,
  heatIndexF,
  localToday,
} from "@/lib/carrier-journal/shift-weather";

/** Same env name as v3 (`components/Terminal/data/weather.js`). */
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.trim();
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

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

async function fetchForecast(
  lat: number,
  lon: number
): Promise<{ date: string; condition: string; high: number; low: number }[]> {
  if (!API_KEY) return [];
  const forecastRes = await fetch(
    `${FORECAST_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
  );
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

async function currentWeatherBundle(
  lat: number,
  lon: number,
  label: string,
  includeForecast: boolean
) {
  if (!API_KEY) {
    throw new Error("Weather API not configured");
  }
  const weatherRes = await fetch(
    `${WEATHER_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
  );
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

function isValidDateParam(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeForecast = searchParams.get("forecast") === "true";
  const includePeak = searchParams.get("peak") === "true";
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");
  const dateParam = searchParams.get("date");
  const peakDate = isValidDateParam(dateParam) ? dateParam : localToday();

  // Peak-only path can run on Open-Meteo without an OpenWeather key.
  if (includePeak && latStr !== null && lonStr !== null && !includeForecast) {
    const lat = Number(latStr);
    const lon = Number(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }
    try {
      const peak = await fetchShiftWeatherForDate(lat, lon, peakDate);
      if (!peak) {
        return NextResponse.json(
          { error: "No shift weather for date", date: peakDate },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          date: peakDate,
          peakTempF: peak.peakTempF,
          peakHeatIndexF: peak.peakHeatIndexF,
          avgHeatIndexF: peak.avgHeatIndexF,
          precipIn: peak.precipIn,
          rainyHours: peak.rainyHours,
          peakFromForecast: peakDate >= localToday(),
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    } catch {
      return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
    }
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "Weather API not configured" }, { status: 503 });
  }

  if (latStr !== null && lonStr !== null) {
    const lat = Number(latStr);
    const lon = Number(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }
    try {
      const body = await currentWeatherBundle(lat, lon, "", includeForecast);
      if (includePeak) {
        const peak = await fetchShiftWeatherForDate(lat, lon, peakDate);
        const peakTempF = peak?.peakTempF ?? (body as { tempF?: number }).tempF;
        const peakHeatIndexF =
          peak?.peakHeatIndexF ??
          ((body as { tempF?: number }).tempF !== undefined
            ? heatIndexF(
                (body as { tempF: number }).tempF,
                (body as { humidity: number }).humidity
              )
            : null);
        return NextResponse.json(
          {
            ...body,
            date: peakDate,
            peakTempF,
            peakHeatIndexF,
            avgHeatIndexF: peak?.avgHeatIndexF ?? null,
            precipIn: peak?.precipIn ?? null,
            rainyHours: peak?.rainyHours ?? null,
            peakFromForecast: peak !== null,
          },
          {
            headers: {
              "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
          }
        );
      }
      return NextResponse.json(body, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
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
    const geoRes = await fetch(
      `${GEO_URL}?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
    );
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
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
