import type { LineVariant } from "@/components/terminal/types";

export type WeatherApiSuccess = {
  location: string;
  condition: string;
  tempF: number;
  tempC: number;
  humidity: number;
  wind: number;
  forecast?: { date: string; condition: string; high: number; low: number }[];
};

export function formatWeatherApiLines(data: WeatherApiSuccess): { content: string; variant: LineVariant }[] {
  const lines: { content: string; variant: LineVariant }[] = [
    { content: "Weather: " + data.location, variant: "success" },
    {
      content: "  " + data.condition + ", " + data.tempF + "F (" + data.tempC + "C)",
      variant: "lambda",
    },
    { content: "  Humidity: " + data.humidity + "% | Wind: " + data.wind + " mph", variant: "dimmed" },
  ];
  if (data.forecast?.length) {
    lines.push({ content: "", variant: "default" });
    lines.push({ content: "5-Day Forecast:", variant: "success" });
    for (const day of data.forecast) {
      lines.push({
        content: "  " + day.date + ": " + day.condition + ", " + day.high + "F / " + day.low + "F",
        variant: "dimmed",
      });
    }
  }
  return lines;
}
