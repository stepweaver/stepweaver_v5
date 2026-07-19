/**
 * Ensure Notion weather properties exist, then backfill all Carrier Journal
 * entries to 9 AM–7 PM peak temp / peak HI / avg HI / precip.
 *
 * Usage: node --env-file=.env.local scripts/backfill-carrier-weather.mjs
 * Dry run:  node --env-file=.env.local scripts/backfill-carrier-weather.mjs --dry-run
 */
import { Client } from "@notionhq/client";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const LAT = 41.6764;
const LON = -86.252;
const TZ = "America/Indiana/Indianapolis";
const SHIFT_START = 9;
const SHIFT_END = 19;
const DRY_RUN = process.argv.includes("--dry-run");

const PROPS = {
  avgHi: "Average Heat Index F",
  precip: "Precipitation In",
};

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

function titleText(prop) {
  return (prop?.title ?? []).map((f) => f.plain_text ?? "").join("");
}

async function ensureProperties(notion, dbId) {
  const db = await notion.databases.retrieve({ database_id: dbId });
  const existing = db.properties ?? {};
  const updates = {};
  if (!existing[PROPS.avgHi]) {
    updates[PROPS.avgHi] = { number: { format: "number" } };
  }
  if (!existing[PROPS.precip]) {
    updates[PROPS.precip] = { number: { format: "number" } };
  }
  if (Object.keys(updates).length === 0) {
    console.error("Notion properties already present.");
    return;
  }
  if (DRY_RUN) {
    console.error("[dry-run] would create properties:", Object.keys(updates));
    return;
  }
  await notion.databases.update({ database_id: dbId, properties: updates });
  console.error("Created Notion properties:", Object.keys(updates).join(", "));
}

async function fetchAllEntries(notion, dbId) {
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
        avgHeatIndexF: num(p[PROPS.avgHi]),
        precipitationIn: num(p[PROPS.precip]),
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
    "temperature_2m,relative_humidity_2m,precipitation"
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("precipitation_unit", "inch");
  url.searchParams.set("timezone", TZ);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}: ${await res.text()}`);
  return res.json();
}

function metricsByDate(archive) {
  const map = new Map();
  const times = archive.hourly?.time ?? [];
  const temps = archive.hourly?.temperature_2m ?? [];
  const hums =
    archive.hourly?.relative_humidity_2m ??
    archive.hourly?.relativehumidity_2m ??
    [];
  const precips = archive.hourly?.precipitation ?? [];

  const byDate = new Map();
  for (let i = 0; i < times.length; i++) {
    const [date, timePart] = times[i].split("T");
    const hour = parseInt(timePart?.slice(0, 2) ?? "-1", 10);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push({
      hour,
      temp: temps[i],
      humidity: hums[i],
      precip: precips[i] ?? 0,
    });
  }

  for (const [date, hours] of byDate) {
    const inWindow = hours.filter(
      (h) => h.hour >= SHIFT_START && h.hour <= SHIFT_END && typeof h.temp === "number"
    );
    if (!inWindow.length) continue;

    let peakTemp = null;
    let peakHi = null;
    let hiSum = 0;
    let hiCount = 0;
    let precipIn = 0;

    for (const h of inWindow) {
      precipIn += h.precip ?? 0;
      if (peakTemp === null || h.temp > peakTemp) peakTemp = h.temp;
      if (typeof h.humidity === "number") {
        const hi = heatIndex(h.temp, h.humidity);
        hiSum += hi;
        hiCount += 1;
        if (peakHi === null || hi > peakHi) peakHi = hi;
      } else {
        const hi = Math.round(h.temp);
        hiSum += hi;
        hiCount += 1;
        if (peakHi === null || hi > peakHi) peakHi = hi;
      }
    }

    map.set(date, {
      peakTempF: Math.round(peakTemp),
      peakHeatIndexF: peakHi,
      avgHeatIndexF: Math.round(hiSum / hiCount),
      precipIn: Math.round(precipIn * 100) / 100,
    });
  }
  return map;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const apiKey = (process.env.NOTION_API_KEY ?? "").trim();
  const dbId = getDbId();
  if (!apiKey || !dbId) {
    console.error("Missing NOTION_API_KEY or NOTION_CARRIER_JOURNAL_DB_ID");
    process.exit(1);
  }

  const notion = new Client({ auth: apiKey });
  console.error(DRY_RUN ? "DRY RUN — no writes" : "LIVE backfill");

  await ensureProperties(notion, dbId);

  const entries = await fetchAllEntries(notion, dbId);
  if (!entries.length) {
    console.error("No entries");
    process.exit(1);
  }

  const startDate = entries[0].date;
  const endDate = entries[entries.length - 1].date;
  console.error(`Entries: ${entries.length} (${startDate} → ${endDate})`);

  const archive = await fetchArchive(startDate, endDate);
  const metrics = metricsByDate(archive);

  const results = [];
  let updated = 0;
  let skipped = 0;
  let missingArchive = 0;

  for (const e of entries) {
    const m = metrics.get(e.date);
    if (!m) {
      missingArchive += 1;
      results.push({ date: e.date, status: "missing_archive" });
      continue;
    }

    const next = {
      temperatureF: m.peakTempF,
      heatIndexF: m.peakHeatIndexF,
      avgHeatIndexF: m.avgHeatIndexF,
      precipitationIn: m.precipIn,
    };

    const unchanged =
      e.temperatureF === next.temperatureF &&
      e.heatIndexF === next.heatIndexF &&
      e.avgHeatIndexF === next.avgHeatIndexF &&
      e.precipitationIn === next.precipitationIn;

    results.push({
      date: e.date,
      before: {
        temperatureF: e.temperatureF,
        heatIndexF: e.heatIndexF,
        avgHeatIndexF: e.avgHeatIndexF,
        precipitationIn: e.precipitationIn,
      },
      after: next,
      status: unchanged ? "unchanged" : "updated",
    });

    if (unchanged) {
      skipped += 1;
      continue;
    }

    if (DRY_RUN) {
      updated += 1;
      continue;
    }

    await notion.pages.update({
      page_id: e.pageId,
      properties: {
        "Temperature F": { number: next.temperatureF },
        "Heat Index F": { number: next.heatIndexF },
        [PROPS.avgHi]: { number: next.avgHeatIndexF },
        [PROPS.precip]: { number: next.precipitationIn },
      },
    });
    updated += 1;
    // Soft rate limit for Notion
    await sleep(350);
  }

  const outPath = resolve("scripts/backfill-carrier-weather-results.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        generatedAt: new Date().toISOString(),
        updated,
        skipped,
        missingArchive,
        results,
      },
      null,
      2
    )
  );

  console.error(
    JSON.stringify({ dryRun: DRY_RUN, updated, skipped, missingArchive, outPath }, null, 2)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
