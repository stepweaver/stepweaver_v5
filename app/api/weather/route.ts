import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY;
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Weather API not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "New York";
  const includeForecast = searchParams.get("forecast") === "true";

  try {
    const geoRes = await fetch(`${GEO_URL}?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`);
    const geoData = await geoRes.json();
    if (!geoData.length) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    const { lat, lon, name, country } = geoData[0];

    const weatherRes = await fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`);
    const weather = await weatherRes.json();

    const result: Record<string, unknown> = {
      location: `${name}, ${country}`,
      condition: weather.weather?.[0]?.description || "Unknown",
      tempF: Math.round(weather.main?.temp ?? 0),
      tempC: Math.round(((weather.main?.temp ?? 0) - 32) * 5 / 9),
      humidity: weather.main?.humidity ?? 0,
      wind: Math.round(weather.wind?.speed ?? 0),
    };

    if (includeForecast) {
      const forecastRes = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`);
      const forecastData = await forecastRes.json();
      const daily: Record<string, unknown>[] = [];
      const seen = new Set<string>();
      for (const item of forecastData.list ?? []) {
        const date = item.dt_txt?.split(" ")[0];
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
      result.forecast = daily;
    }

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
