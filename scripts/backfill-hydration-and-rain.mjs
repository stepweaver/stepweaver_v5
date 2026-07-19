/**
 * Ensure Notion Rain checkbox exists, mark Jul 18 as rained-on,
 * and backfill Hydration Goal Oz with the revised route-only model.
 *
 * Usage: node --env-file=.env.local scripts/backfill-hydration-and-rain.mjs
 * Dry run:  node --env-file=.env.local scripts/backfill-hydration-and-rain.mjs --dry-run
 */
import { Client } from "@notionhq/client";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function roundToNearest8(value) {
  return Math.round(value / 8) * 8;
}
function blendedEffectiveHeatF(peakTempF, peakHeatIndexF, avgHeatIndexF) {
  const peak = Math.max(peakTempF, peakHeatIndexF);
  const avg =
    avgHeatIndexF != null && Number.isFinite(avgHeatIndexF) ? avgHeatIndexF : peak;
  return Math.round(0.7 * avg + 0.3 * peak);
}
function getHeatBand(effectiveHeatF) {
  if (effectiveHeatF >= 125) return "extreme-danger";
  if (effectiveHeatF >= 103) return "danger";
  if (effectiveHeatF >= 90) return "extreme-caution";
  if (effectiveHeatF >= 80) return "caution";
  return "normal";
}
function getOzPerHour(heatBand) {
  switch (heatBand) {
    case "normal":
      return 12;
    case "caution":
      return 16;
    case "extreme-caution":
      return 24;
    case "danger":
      return 32;
    case "extreme-danger":
      return 40;
  }
}
function estimateRouteHours(miles) {
  if (miles && miles > 0) return clamp(miles / 1.5, 5, 9);
  return 7;
}
function routeHydrationGoalOz({ miles, peakTemp, peakHi, avgHi }) {
  const hours = estimateRouteHours(miles);
  const heat = blendedEffectiveHeatF(peakTemp ?? 72, peakHi ?? peakTemp ?? 72, avgHi);
  const band = getHeatBand(heat);
  const ozPerHour = getOzPerHour(band);
  return {
    hours,
    heat,
    band,
    ozPerHour,
    routeGoal: roundToNearest8(hours * ozPerHour),
  };
}

function getDbId() {
  const raw = (process.env.NOTION_CARRIER_JOURNAL_DB_ID ?? "")
    .trim()
    .replace(/^[\s'"`]+|[\s'"`]+$/g, "");
  const clean = raw.replace(/-/g, "");
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}
function num(p) {
  return typeof p?.number === "number" ? p.number : null;
}
function dateStr(p) {
  return (p?.date?.start ?? "").slice(0, 10) || null;
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureRainProperty(notion, dbId) {
  const db = await notion.databases.retrieve({ database_id: dbId });
  if (db.properties?.Rain) {
    console.error("Rain checkbox already present.");
    return;
  }
  if (DRY_RUN) {
    console.error("[dry-run] would create Rain checkbox");
    return;
  }
  await notion.databases.update({
    database_id: dbId,
    properties: { Rain: { checkbox: {} } },
  });
  console.error("Created Notion property: Rain");
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY.trim() });
  const dbId = getDbId();
  console.error(DRY_RUN ? "DRY RUN" : "LIVE backfill");

  await ensureRainProperty(notion, dbId);

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
        miles: num(p["Miles Walked"]),
        waterOz: num(p["Water Oz"]),
        hydrationGoalOz: num(p["Hydration Goal Oz"]),
        temperatureF: num(p["Temperature F"]),
        heatIndexF: num(p["Heat Index F"]),
        avgHeatIndexF: num(p["Average Heat Index F"]),
        rain: typeof p.Rain?.checkbox === "boolean" ? p.Rain.checkbox : null,
      });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  const results = [];
  let goalsUpdated = 0;
  let rainUpdated = 0;

  for (const e of entries) {
    const calc = routeHydrationGoalOz({
      miles: e.miles,
      peakTemp: e.temperatureF,
      peakHi: e.heatIndexF,
      avgHi: e.avgHeatIndexF,
    });

    const props = {};
    let changed = false;

    if (e.hydrationGoalOz !== calc.routeGoal) {
      props["Hydration Goal Oz"] = { number: calc.routeGoal };
      changed = true;
      goalsUpdated += 1;
    }

    // User confirmed Jul 18 was a rain day on route
    if (e.date === "2026-07-18" && e.rain !== true) {
      props.Rain = { checkbox: true };
      changed = true;
      rainUpdated += 1;
    }

    results.push({
      date: e.date,
      beforeGoal: e.hydrationGoalOz,
      afterGoal: calc.routeGoal,
      waterOz: e.waterOz,
      hitAfter:
        e.waterOz != null ? e.waterOz >= calc.routeGoal : null,
      band: calc.band,
      hours: calc.hours,
      rainSet: e.date === "2026-07-18",
    });

    if (!changed || DRY_RUN) continue;

    await notion.pages.update({ page_id: e.pageId, properties: props });
    await sleep(350);
  }

  const withBoth = results.filter((r) => r.waterOz != null);
  const hits = withBoth.filter((r) => r.hitAfter).length;
  const hitRate = withBoth.length
    ? Math.round((hits / withBoth.length) * 1000) / 10
    : 0;

  const outPath = resolve("scripts/backfill-hydration-and-rain-results.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        generatedAt: new Date().toISOString(),
        goalsUpdated,
        rainUpdated,
        hitRateAfter: hitRate,
        results,
      },
      null,
      2
    )
  );
  console.error(
    JSON.stringify(
      { dryRun: DRY_RUN, goalsUpdated, rainUpdated, hitRateAfter: hitRate, outPath },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
