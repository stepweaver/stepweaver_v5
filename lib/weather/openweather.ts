/** Server-only OpenWeather key. NEXT_PUBLIC_ is a fallback so existing deploys keep working. */
export function getOpenWeatherApiKey(): string {
  return (
    process.env.OPENWEATHER_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.trim() ||
    ""
  );
}

export function isValidLatLon(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}
