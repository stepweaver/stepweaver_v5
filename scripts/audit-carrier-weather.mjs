/**
 * One-off audit: compare Carrier Journal Notion temps vs Open-Meteo archive
 * for ZIP 46614 (South Bend). Does not write to Notion.
 *
 * Usage: node --env-file=.env.local scripts/audit-carrier-weather.mjs
 */
import { Client } from "@notionhq/client";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const LAT = 41.6764;
const LON = -86.252;
const TZ = "America/Indiana/Indianapolis";
const CURRENT_SHIFT = { start: 8, end: 16 }; // what the app logs today
const RECOMMENDED_SHIFT = { start: 9, end: 19 }; // 9 AM–7 PM

function heatIndex(tempF, humidity) {
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

function getDbId() {
  const raw = (process.env.NOTION_CARRIER_JOURNAL_DB_ID ?? "")
    .trim()
    .replace(/^[\s'"`]+|[\s'"`]+$/g, "");
  if (!raw) return null;
  const clean = raw.replace(/-/g, "");
  if (clean.length < 32) return null;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

function num(prop) {
  return typeof prop?.number === "number" ? prop.number : null;
}

function dateStr(prop) {
  return (prop?.date?.start ?? "").slice(0, 10) || null;
}

function richText(prop) {
  return (prop?.rich_text ?? []).map((f) => f.plain_text ?? "").join("");
}

function titleText(prop) {
  return (prop?.title ?? []).map((f) => f.plain_text ?? "").join("");
}

async function fetchAllNotionEntries(notion, dbId) {
  const entries = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: dbId,
      sorts: [{ property: "Date", direction: "ascending" }],
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    for (const page of res.results) {
      if (!("properties" in page)) continue;
      const p = page.properties;
      const date = dateStr(p.Date);
      if (!date) continue;
      entries.push({
        pageId: page.id,
        date,
        title: titleText(p.Title) || date,
        temperatureF: num(p["Temperature F"]),
        heatIndexF: num(p["Heat Index F"]),
        publicNote: richText(p["Public Note"]),
        publishPublic: Boolean(p["Publish Public"]?.checkbox),
      });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return entries;
}

async function fetchArchive(startDate, endDate) {
  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.searchParams.set("latitude", String(LAT));
  url.searchParams.set("longitude", String(LON));
  url.searchParams.set(
    "hourly",
    "temperature_2m,relative_humidity_2m,precipitation,weather_code"
  );
  url.searchParams.set("daily", "precipitation_sum,temperature_2m_max,apparent_temperature_max");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("precipitation_unit", "inch");
  url.searchParams.set("timezone", TZ);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo archive ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

function metricsForWindow(hourlyByDate, date, window) {
  const hours = hourlyByDate.get(date) ?? [];
  const inWindow = hours.filter((h) => h.hour >= window.start && h.hour <= window.end);
  if (!inWindow.length) return null;

  let peakTemp = null;
  let peakTempHumidity = null;
  let peakHi = null;
  let peakHiTemp = null;
  let peakHiHumidity = null;
  let peakHiHour = null;
  let peakTempHour = null;
  let precipIn = 0;
  let hiSum = 0;
  let hiCount = 0;
  const weatherCodes = [];

  for (const h of inWindow) {
    precipIn += h.precip ?? 0;
    if (typeof h.weatherCode === "number") weatherCodes.push(h.weatherCode);
    if (typeof h.temp === "number" && (peakTemp === null || h.temp > peakTemp)) {
      peakTemp = h.temp;
      peakTempHumidity = h.humidity;
      peakTempHour = h.hour;
    }
    if (typeof h.temp === "number" && typeof h.humidity === "number") {
      const hi = heatIndex(h.temp, h.humidity);
      hiSum += hi;
      hiCount += 1;
      if (peakHi === null || hi > peakHi) {
        peakHi = hi;
        peakHiTemp = h.temp;
        peakHiHumidity = h.humidity;
        peakHiHour = h.hour;
      }
    }
  }

  return {
    peakTempF: peakTemp !== null ? Math.round(peakTemp) : null,
    peakTempHour,
    peakHeatIndexF: peakHi,
    peakHeatIndexHour: peakHiHour,
    avgHeatIndexF: hiCount ? Math.round(hiSum / hiCount) : null,
    precipIn: Math.round(precipIn * 100) / 100,
    rainyHours: inWindow.filter((h) => (h.precip ?? 0) >= 0.01).length,
    weatherCodes,
  };
}

function classifyDiff(journal, archive, tolerance = 2) {
  if (journal == null && archive == null) return "missing_both";
  if (journal == null) return "missing_journal";
  if (archive == null) return "missing_archive";
  const d = journal - archive;
  if (Math.abs(d) <= tolerance) return "ok";
  if (d > 0) return "journal_high";
  return "journal_low";
}

function weatherCodeLabel(codes) {
  if (!codes?.length) return null;
  // WMO: 51-67 rain/drizzle, 80-82 showers, 95-99 thunder, 71-77 snow
  const hasThunder = codes.some((c) => c >= 95);
  const hasSnow = codes.some((c) => (c >= 71 && c <= 77) || c === 85 || c === 86);
  const hasRain = codes.some(
    (c) =>
      (c >= 51 && c <= 67) ||
      (c >= 80 && c <= 82) ||
      c === 61 ||
      c === 63 ||
      c === 65
  );
  if (hasThunder) return "storm";
  if (hasSnow) return "snow";
  if (hasRain) return "rain";
  return null;
}

function noteForRow(row) {
  const parts = [];
  if (row.tempStatus === "missing_journal") parts.push("No journal temp");
  if (row.hiStatus === "missing_journal") parts.push("No journal HI");
  if (row.tempStatus === "ok" && row.hiStatus === "ok") parts.push("OK");
  if (row.tempStatus === "journal_high" || row.hiStatus === "journal_high") {
    parts.push("Journal warmer than archive");
  }
  if (row.tempStatus === "journal_low" || row.hiStatus === "journal_low") {
    parts.push("Journal cooler than archive");
  }
  // Heuristic: matches current-conditions-ish if close to end-of-day but not peak
  if (
    row.journalTemp != null &&
    row.rec?.peakTempF != null &&
    Math.abs(row.journalTemp - row.rec.peakTempF) > 4 &&
    row.cur?.peakTempF != null &&
    Math.abs(row.journalTemp - row.cur.peakTempF) <= 2
  ) {
    parts.push("Matches 8–4 peak, not 9–7");
  }
  if (row.dailyMaxF != null && row.journalTemp != null) {
    if (Math.abs(row.journalTemp - row.dailyMaxF) <= 1 && Math.abs(row.journalTemp - (row.rec?.peakTempF ?? 999)) > 2) {
      parts.push("Likely calendar-day high");
    }
  }
  if ((row.rec?.precipIn ?? 0) >= 0.05 || row.precipLabel) {
    parts.push(`Precip ${row.rec?.precipIn ?? 0}" (${row.precipLabel ?? "wet"})`);
  }
  return parts.join("; ") || "—";
}

function buildHourlyByDate(data) {
  const map = new Map();
  const times = data.hourly?.time ?? [];
  const temps = data.hourly?.temperature_2m ?? [];
  const hums =
    data.hourly?.relative_humidity_2m ?? data.hourly?.relativehumidity_2m ?? [];
  const precips = data.hourly?.precipitation ?? [];
  const codes = data.hourly?.weather_code ?? [];

  for (let i = 0; i < times.length; i++) {
    const [date, timePart] = times[i].split("T");
    const hour = parseInt(timePart?.slice(0, 2) ?? "-1", 10);
    if (!map.has(date)) map.set(date, []);
    map.get(date).push({
      hour,
      temp: temps[i],
      humidity: hums[i],
      precip: precips[i],
      weatherCode: codes[i],
    });
  }
  return map;
}

function buildDailyByDate(data) {
  const map = new Map();
  const dates = data.daily?.time ?? [];
  const maxTemps = data.daily?.temperature_2m_max ?? [];
  const precipSums = data.daily?.precipitation_sum ?? [];
  const appMax = data.daily?.apparent_temperature_max ?? [];
  for (let i = 0; i < dates.length; i++) {
    map.set(dates[i], {
      dailyMaxF: maxTemps[i] != null ? Math.round(maxTemps[i]) : null,
      precipSumIn: precipSums[i] != null ? Math.round(precipSums[i] * 100) / 100 : null,
      apparentMaxF: appMax[i] != null ? Math.round(appMax[i]) : null,
    });
  }
  return map;
}

async function main() {
  const apiKey = (process.env.NOTION_API_KEY ?? "").trim();
  const dbId = getDbId();
  if (!apiKey || !dbId) {
    console.error("Missing NOTION_API_KEY or NOTION_CARRIER_JOURNAL_DB_ID");
    process.exit(1);
  }

  const notion = new Client({ auth: apiKey });
  console.error("Fetching Notion entries…");
  const entries = await fetchAllNotionEntries(notion, dbId);
  if (!entries.length) {
    console.error("No journal entries found");
    process.exit(1);
  }

  const startDate = entries[0].date;
  const endDate = entries[entries.length - 1].date;
  console.error(`Fetched ${entries.length} entries (${startDate} → ${endDate})`);
  console.error("Fetching Open-Meteo archive…");

  const archive = await fetchArchive(startDate, endDate);
  const hourlyByDate = buildHourlyByDate(archive);
  const dailyByDate = buildDailyByDate(archive);

  const rows = entries.map((e) => {
    const cur = metricsForWindow(hourlyByDate, e.date, CURRENT_SHIFT);
    const rec = metricsForWindow(hourlyByDate, e.date, RECOMMENDED_SHIFT);
    const daily = dailyByDate.get(e.date) ?? {};
    const precipLabel = weatherCodeLabel(rec?.weatherCodes);

    const tempDiffRec =
      e.temperatureF != null && rec?.peakTempF != null
        ? e.temperatureF - rec.peakTempF
        : null;
    const hiDiffRec =
      e.heatIndexF != null && rec?.peakHeatIndexF != null
        ? e.heatIndexF - rec.peakHeatIndexF
        : null;
    const tempDiffCur =
      e.temperatureF != null && cur?.peakTempF != null
        ? e.temperatureF - cur.peakTempF
        : null;
    const hiDiffCur =
      e.heatIndexF != null && cur?.peakHeatIndexF != null
        ? e.heatIndexF - cur.peakHeatIndexF
        : null;

    const tempStatus = classifyDiff(e.temperatureF, rec?.peakTempF);
    const hiStatus = classifyDiff(e.heatIndexF, rec?.peakHeatIndexF);
    const tempStatusCur = classifyDiff(e.temperatureF, cur?.peakTempF);
    const hiStatusCur = classifyDiff(e.heatIndexF, cur?.peakHeatIndexF);

    const row = {
      date: e.date,
      title: e.title,
      journalTemp: e.temperatureF,
      journalHi: e.heatIndexF,
      publicNote: e.publicNote,
      publishPublic: e.publishPublic,
      pageId: e.pageId,
      cur,
      rec,
      dailyMaxF: daily.dailyMaxF ?? null,
      apparentMaxF: daily.apparentMaxF ?? null,
      dailyPrecipIn: daily.precipSumIn ?? null,
      precipLabel,
      tempDiffRec,
      hiDiffRec,
      tempDiffCur,
      hiDiffCur,
      tempStatus,
      hiStatus,
      tempStatusCur,
      hiStatusCur,
    };
    row.notes = noteForRow(row);
    return row;
  });

  const summary = {
    entryCount: rows.length,
    dateRange: { start: startDate, end: endDate },
    location: { lat: LAT, lon: LON, label: "South Bend IN / ZIP 46614" },
    windows: { currentApp: CURRENT_SHIFT, recommended: RECOMMENDED_SHIFT },
    withTemp: rows.filter((r) => r.journalTemp != null).length,
    withHi: rows.filter((r) => r.journalHi != null).length,
    missingTemp: rows.filter((r) => r.journalTemp == null).length,
    missingHi: rows.filter((r) => r.journalHi == null).length,
    okVsRecommended: rows.filter(
      (r) => r.tempStatus === "ok" && (r.journalHi == null || r.hiStatus === "ok")
    ).length,
    okVsCurrentApp: rows.filter(
      (r) =>
        r.tempStatusCur === "ok" && (r.journalHi == null || r.hiStatusCur === "ok")
    ).length,
    mismatchVsRecommended: rows.filter(
      (r) =>
        r.tempStatus === "journal_high" ||
        r.tempStatus === "journal_low" ||
        r.hiStatus === "journal_high" ||
        r.hiStatus === "journal_low"
    ).length,
    rainyShiftDays: rows.filter((r) => (r.rec?.precipIn ?? 0) >= 0.05).length,
    heat90DaysRec: rows.filter(
      (r) => Math.max(r.rec?.peakTempF ?? 0, r.rec?.peakHeatIndexF ?? 0) >= 90
    ).length,
    heat100DaysRec: rows.filter(
      (r) => Math.max(r.rec?.peakTempF ?? 0, r.rec?.peakHeatIndexF ?? 0) >= 100
    ).length,
    avgAbsTempDiffRec: (() => {
      const diffs = rows
        .map((r) => r.tempDiffRec)
        .filter((d) => d != null)
        .map(Math.abs);
      return diffs.length
        ? Math.round((diffs.reduce((a, b) => a + b, 0) / diffs.length) * 10) / 10
        : null;
    })(),
    avgAbsHiDiffRec: (() => {
      const diffs = rows
        .map((r) => r.hiDiffRec)
        .filter((d) => d != null)
        .map(Math.abs);
      return diffs.length
        ? Math.round((diffs.reduce((a, b) => a + b, 0) / diffs.length) * 10) / 10
        : null;
    })(),
  };

  const out = { generatedAt: new Date().toISOString(), summary, rows };
  const outPath = resolve("scripts/audit-carrier-weather-results.json");
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.error(`Wrote ${outPath}`);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
