/**
 * Audit Carrier Journal hydration goals vs intake.
 * Usage: node --env-file=.env.local scripts/audit-carrier-hydration.mjs
 */
import { Client } from "@notionhq/client";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// Load compiled logic by duplicating the pure formula here to avoid TS import friction.
// Keep in sync with lib/hydration.ts for audit purposes.

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function roundToNearest8(value) {
  return Math.round(value / 8) * 8;
}
function estimateRouteHours(milesWalked, routeHours) {
  if (routeHours && routeHours > 0) return clamp(routeHours, 1, 12);
  if (milesWalked && milesWalked > 0) return clamp(milesWalked / 1.25, 4, 10);
  return 8;
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
function getPreShiftWaterOz(weightLbs) {
  if (!weightLbs || weightLbs <= 0) return null;
  const weightKg = weightLbs / 2.20462;
  const ml = weightKg * 6;
  const oz = ml / 29.5735;
  return roundToNearest8(oz);
}

function calc(input) {
  const routeHours = estimateRouteHours(input.milesWalked, input.routeHours);
  const rawEffectiveHeat = Math.max(input.peakTempF, input.peakHeatIndexF);
  const effectiveHeatF = input.directSun ? rawEffectiveHeat + 10 : rawEffectiveHeat;
  const heatBand = getHeatBand(effectiveHeatF);
  const ozPerHour = getOzPerHour(heatBand);
  const routeWaterGoalOz = roundToNearest8(routeHours * ozPerHour);
  const preShiftWaterOz = getPreShiftWaterOz(input.weightLbs);
  const maxSafeRouteWaterOz = routeHours * 48;
  const cappedRouteGoal = Math.min(routeWaterGoalOz, maxSafeRouteWaterOz);
  const totalSuggestedOz = preShiftWaterOz
    ? cappedRouteGoal + preShiftWaterOz
    : cappedRouteGoal;
  return {
    effectiveHeatF,
    routeHours,
    heatBand,
    ozPerHour,
    routeWaterGoalOz: cappedRouteGoal,
    preShiftWaterOz,
    totalSuggestedOz,
    maxSafeRouteWaterOz,
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

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY.trim() });
  const dbId = getDbId();
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
        date,
        miles: num(p["Miles Walked"]),
        waterOz: num(p["Water Oz"]),
        hydrationGoalOz: num(p["Hydration Goal Oz"]),
        weightLbs: num(p["Weight Lbs"]),
        temperatureF: num(p["Temperature F"]),
        heatIndexF: num(p["Heat Index F"]),
        avgHeatIndexF: num(p["Average Heat Index F"]),
      });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  let lastWeight = null;
  for (const e of entries) {
    if (e.weightLbs != null) lastWeight = e.weightLbs;
    e.effectiveWeight = e.weightLbs ?? lastWeight;
  }

  const rows = entries.map((e) => {
    const peakTemp = e.temperatureF ?? 72;
    const peakHi = e.heatIndexF ?? peakTemp;
    const avgHi = e.avgHeatIndexF ?? peakHi;

    const current = calc({
      weightLbs: e.effectiveWeight,
      peakTempF: peakTemp,
      peakHeatIndexF: peakHi,
      milesWalked: e.miles,
      directSun: false,
    });

    // Alternatives
    const routeOnly = current.routeWaterGoalOz;
    const usingAvgHi = calc({
      weightLbs: e.effectiveWeight,
      peakTempF: peakTemp,
      peakHeatIndexF: avgHi,
      milesWalked: e.miles,
      directSun: false,
    });
    const capped8h = calc({
      weightLbs: e.effectiveWeight,
      peakTempF: peakTemp,
      peakHeatIndexF: peakHi,
      milesWalked: e.miles,
      routeHours: Math.min(estimateRouteHours(e.miles), 8),
      directSun: false,
    });
    // Blend: 70% avg HI + 30% peak HI for band selection heat
    const blendedHeat = Math.round(0.7 * avgHi + 0.3 * Math.max(peakTemp, peakHi));
    const blended = calc({
      weightLbs: e.effectiveWeight,
      peakTempF: blendedHeat,
      peakHeatIndexF: blendedHeat,
      milesWalked: e.miles,
      directSun: false,
    });
    // Route-only vs intake (what waterOz likely measures)
    const routeOnlyGoal = routeOnly;
    const personalP90 = null; // filled later

    const storedGoal = e.hydrationGoalOz;
    const water = e.waterOz;
    const hitStored = water != null && storedGoal != null && water >= storedGoal;
    const deficitStored =
      water != null && storedGoal != null ? water - storedGoal : null;
    const hitRecalc =
      water != null && water >= current.totalSuggestedOz;
    const hitRouteOnly = water != null && water >= routeOnlyGoal;
    const hitAvgHi =
      water != null && water >= usingAvgHi.totalSuggestedOz;
    const hitBlended =
      water != null && water >= blended.totalSuggestedOz;
    const hitCapped8 =
      water != null && water >= capped8h.totalSuggestedOz;
    const hitRouteOnlyAvg = water != null && water >= usingAvgHi.routeWaterGoalOz;

    return {
      date: e.date,
      label: new Date(e.date + "T12:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      miles: e.miles,
      waterOz: water,
      storedGoal,
      weight: e.effectiveWeight,
      peakTemp,
      peakHi,
      avgHi,
      current,
      routeOnlyGoal,
      usingAvgHi,
      capped8h,
      blended,
      hitStored,
      deficitStored,
      hitRecalc,
      hitRouteOnly,
      hitAvgHi,
      hitBlended,
      hitCapped8,
      hitRouteOnlyAvg,
      pctOfGoal:
        water != null && storedGoal
          ? Math.round((water / storedGoal) * 1000) / 10
          : null,
    };
  });

  const withBoth = rows.filter((r) => r.waterOz != null && r.storedGoal != null);
  const hitRate = (pred) => {
    const elig = withBoth;
    const hits = elig.filter(pred).length;
    return elig.length
      ? Math.round((hits / elig.length) * 1000) / 10
      : 0;
  };

  const waters = withBoth.map((r) => r.waterOz).sort((a, b) => a - b);
  const p50 = waters[Math.floor(waters.length * 0.5)];
  const p90 = waters[Math.floor(waters.length * 0.9)];
  const maxWater = waters[waters.length - 1];
  const avgWater =
    Math.round(
      (waters.reduce((a, b) => a + b, 0) / waters.length) * 10
    ) / 10;
  const avgGoal =
    Math.round(
      (withBoth.reduce((a, r) => a + r.storedGoal, 0) / withBoth.length) * 10
    ) / 10;
  const avgDeficit =
    Math.round(
      (withBoth.reduce((a, r) => a + (r.deficitStored ?? 0), 0) /
        withBoth.length) *
        10
    ) / 10;

  const bandCounts = {};
  for (const r of rows) {
    bandCounts[r.current.heatBand] = (bandCounts[r.current.heatBand] || 0) + 1;
  }

  const summary = {
    entryCount: rows.length,
    withHydration: withBoth.length,
    hitRateStored: hitRate((r) => r.hitStored),
    hitRateRecalc: hitRate((r) => r.hitRecalc),
    hitRateRouteOnly: hitRate((r) => r.hitRouteOnly),
    hitRateAvgHi: hitRate((r) => r.hitAvgHi),
    hitRateBlended: hitRate((r) => r.hitBlended),
    hitRateCapped8h: hitRate((r) => r.hitCapped8),
    hitRateRouteOnlyAvgHi: hitRate((r) => r.hitRouteOnlyAvg),
    avgWater,
    avgGoal,
    avgDeficit,
    p50Water: p50,
    p90Water: p90,
    maxWater,
    bandCounts,
    jul18: rows.find((r) => r.date === "2026-07-18"),
  };

  // Recommended revised formula candidate:
  // - use blended heat (70% avg HI + 30% peak)
  // - route hours = miles/1.5 clamped 5–9 (more realistic carrier pace)
  // - goal compared = route water only (pre-shift tracked separately, not in hit rate)
  function revisedCalc(e) {
    const peakTemp = e.temperatureF ?? 72;
    const peakHi = e.heatIndexF ?? peakTemp;
    const avgHi = e.avgHeatIndexF ?? peakHi;
    const heat = Math.round(0.7 * avgHi + 0.3 * Math.max(peakTemp, peakHi));
    const hours =
      e.miles && e.miles > 0 ? clamp(e.miles / 1.5, 5, 9) : 8;
    const band = getHeatBand(heat);
    const ozPerHour = getOzPerHour(band);
    const routeGoal = roundToNearest8(hours * ozPerHour);
    const pre = getPreShiftWaterOz(e.effectiveWeight);
    return {
      heat,
      hours,
      band,
      ozPerHour,
      routeGoal,
      pre,
      total: pre ? routeGoal + pre : routeGoal,
    };
  }

  for (const r of rows) {
    const e = entries.find((x) => x.date === r.date);
    r.revised = revisedCalc(e);
    r.hitRevisedRoute =
      r.waterOz != null && r.waterOz >= r.revised.routeGoal;
    r.hitRevisedTotal =
      r.waterOz != null && r.waterOz >= r.revised.total;
  }
  summary.hitRateRevisedRoute = hitRate((r) => r.hitRevisedRoute);
  summary.hitRateRevisedTotal = hitRate((r) => r.hitRevisedTotal);

  const out = { generatedAt: new Date().toISOString(), summary, rows };
  const outPath = resolve("scripts/audit-carrier-hydration-results.json");
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.log("wrote", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
