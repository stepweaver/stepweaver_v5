import { readFileSync, writeFileSync } from "node:fs";

const d = JSON.parse(
  readFileSync("scripts/audit-carrier-hydration-results.json", "utf8")
);
const s = d.summary;
const rows = d.rows;

const tableRows = rows.map((r) => [
  r.label,
  r.miles == null ? "—" : String(r.miles),
  r.waterOz == null ? "—" : String(r.waterOz),
  r.storedGoal == null ? "—" : String(r.storedGoal),
  r.deficitStored == null
    ? "—"
    : r.deficitStored > 0
      ? `+${r.deficitStored}`
      : String(r.deficitStored),
  r.pctOfGoal == null ? "—" : `${r.pctOfGoal}%`,
  r.current.heatBand.replace("-", " "),
  `${r.current.routeHours % 1 ? r.current.routeHours.toFixed(1) : r.current.routeHours}h×${r.current.ozPerHour}`,
  String(r.current.routeWaterGoalOz),
  r.current.preShiftWaterOz == null ? "—" : String(r.current.preShiftWaterOz),
  String(r.revised.routeGoal),
  r.hitStored ? "Hit" : "Miss",
]);

const rowTone = rows.map((r) =>
  r.hitStored ? "success" : (r.pctOfGoal ?? 0) >= 80 ? "warning" : "danger"
);

const chartCats = rows.map((r) => r.label);
const waterSeries = rows.map((r) => r.waterOz ?? 0);
const goalSeries = rows.map((r) => r.storedGoal ?? 0);
const revisedSeries = rows.map((r) => r.revised.routeGoal);

const hardMisses = rows
  .filter((r) => r.deficitStored != null && r.deficitStored <= -40)
  .map((r) => [
    r.label,
    String(r.waterOz),
    String(r.storedGoal),
    String(r.deficitStored),
    `${r.peakHi}° peak / ${r.avgHi}° avg`,
    `${r.miles} mi → ${r.current.routeHours}h`,
    r.current.heatBand,
  ]);

const formulaAlts = [
  ["Current (stored goals)", `${s.hitRateStored}%`, "Peak HI + miles/1.25 (4–10h) + pre-shift in goal"],
  ["Recalc with corrected weather", `${s.hitRateRecalc}%`, "Same formula, post-audit temps (often higher)"],
  ["Route-only (drop pre-shift from hit)", `${s.hitRateRouteOnly}%`, "Compare intake to route goal only"],
  ["Use avg HI instead of peak", `${s.hitRateAvgHi}%`, "Still includes pre-shift"],
  ["Route-only + avg HI", `${s.hitRateRouteOnlyAvgHi}%`, "Better, still ~half miss"],
  ["Cap exposure at 8h", `${s.hitRateCapped8h}%`, "Peak HI still drives band"],
  ["Revised: blended heat + mi/1.5 (5–9h), route-only", `${s.hitRateRevisedRoute}%`, "Recommended candidate"],
];

const j = s.jul18;

const canvas = `import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  LineChart,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
} from "cursor/canvas";

const HIT_RATE = ${s.hitRateStored};
const AVG_WATER = ${s.avgWater};
const AVG_GOAL = ${s.avgGoal};
const AVG_DEFICIT = ${s.avgDeficit};
const P90 = ${s.p90Water};
const MAX_WATER = ${s.maxWater};
const N = ${s.withHydration};

const CHART_CATS = ${JSON.stringify(chartCats)};
const WATER = ${JSON.stringify(waterSeries)};
const GOALS = ${JSON.stringify(goalSeries)};
const REVISED = ${JSON.stringify(revisedSeries)};

const TABLE_ROWS = ${JSON.stringify(tableRows)};
const ROW_TONE = ${JSON.stringify(rowTone)};
const HARD_MISSES = ${JSON.stringify(hardMisses)};
const ALTS = ${JSON.stringify(formulaAlts)};

const JUL18 = ${JSON.stringify({
  water: j.waterOz,
  goal: j.storedGoal,
  miles: j.miles,
  peakHi: j.peakHi,
  avgHi: j.avgHi,
  hours: j.current.routeHours,
  ozPerHour: j.current.ozPerHour,
  route: j.current.routeWaterGoalOz,
  pre: j.current.preShiftWaterOz,
  total: j.current.totalSuggestedOz,
  band: j.current.heatBand,
  revisedRoute: j.revised.routeGoal,
})};

const JUL17 = ${JSON.stringify((() => {
  const r = rows.find((x) => x.date === "2026-07-17");
  return {
    water: r.waterOz,
    goal: r.storedGoal,
    miles: r.miles,
    peakHi: r.peakHi,
    avgHi: r.avgHi,
    hours: r.current.routeHours,
    ozPerHour: r.current.ozPerHour,
    route: r.current.routeWaterGoalOz,
    pre: r.current.preShiftWaterOz,
    total: r.current.totalSuggestedOz,
    revisedRoute: r.revised.routeGoal,
  };
})())};

export default function CarrierHydrationAudit() {
  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Carrier Journal hydration audit</H1>
        <Text tone="secondary">
          All {N} entries with water + goal. The formula is working as coded — the
          coded target is systematically above what you actually drink, especially
          on long / hot days.
        </Text>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value={HIT_RATE + "%"} label="Goal hit rate" tone="danger" />
        <Stat value={String(AVG_WATER)} label="Avg intake (oz)" />
        <Stat value={String(AVG_GOAL)} label="Avg goal (oz)" tone="warning" />
        <Stat value={String(AVG_DEFICIT)} label="Avg deficit (oz)" tone="danger" />
      </Grid>

      <Grid columns={3} gap={12}>
        <Stat value={String(P90)} label="90th percentile intake" />
        <Stat value={String(MAX_WATER)} label="Max logged intake (Jul 17)" />
        <Stat value="~28 oz" label="Avg goal above intake" tone="warning" />
      </Grid>

      <Callout tone="warning" title="About the 216 oz day">
        Journal shows 216 oz on Jul 17 (goal 264), not Jul 18. Jul 18 logged 185 oz
        against the same 264 oz goal. Either day illustrates the same problem: the
        model asked for more than a full CamelBak-and-then-some day of drinking.
      </Callout>

      <H2>How the goal is built today</H2>
      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Formula stack</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small">1. Effective heat = max(peak temp, peak HI) (+10 if Direct Sun)</Text>
              <Text size="small">2. Heat band → oz/hour (12 / 16 / 24 / 32 / 40)</Text>
              <Text size="small">3. Route hours = miles ÷ 1.25, clamped 4–10</Text>
              <Text size="small">4. Route goal = hours × oz/hour, rounded to 8 oz</Text>
              <Text size="small">5. Pre-shift = ~6 ml/kg from Monday weight, rounded to 8 oz</Text>
              <Text size="small" weight="semibold">6. Saved goal = route + pre-shift</Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Jul 18 breakdown (why 264)</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small">{JUL18.miles} mi ÷ 1.25 → {JUL18.hours} h (hit the 10 h ceiling)</Text>
              <Text size="small">Peak HI {JUL18.peakHi}° → extreme-caution → {JUL18.ozPerHour} oz/h</Text>
              <Text size="small">Route: {JUL18.hours} × {JUL18.ozPerHour} = {JUL18.route} oz</Text>
              <Text size="small">Pre-shift at 297 lb: +{JUL18.pre} oz</Text>
              <Text size="small" weight="semibold">Total goal: {JUL18.total} oz · drank {JUL18.water} · missed by {JUL18.total - JUL18.water}</Text>
              <Text size="small" tone="secondary">
                Avg HI that day was only {JUL18.avgHi}° (caution / 16 oz/h). Using the spike for the whole shift is the biggest amplifier.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>Intake vs stored goal vs revised route goal</H2>
      <Text tone="secondary" size="small">
        Source: Notion Carrier Journal · May 22 – Jul 18, 2026 · goals as saved at log time
      </Text>
      <LineChart
        categories={CHART_CATS}
        series={[
          {{ name: "Water intake (oz)", data: WATER, tone: "info" }},
          {{ name: "Stored goal (oz)", data: GOALS, tone: "danger" }},
          {{ name: "Revised route-only goal (oz)", data: REVISED, tone: "success" }},
        ]}
        height={280}
        beginAtZero={false}
      />

      <H2>Full day audit</H2>
      <Table
        headers={[
          "Date",
          "Miles",
          "Drank",
          "Goal",
          "Δ",
          "%",
          "Band",
          "Hours×oz",
          "Route",
          "Pre",
          "Revised",
          "Hit?",
        ]}
        rows={TABLE_ROWS}
        columnAlign={[
          "left",
          "right",
          "right",
          "right",
          "right",
          "right",
          "left",
          "left",
          "right",
          "right",
          "right",
          "left",
        ]}
        rowTone={ROW_TONE}
        striped
        stickyHeader
      />

      <H2>Largest misses (≥40 oz short)</H2>
      <Table
        headers={["Date", "Drank", "Goal", "Δ", "Peak/Avg HI", "Miles→hours", "Band"]}
        rows={HARD_MISSES}
        columnAlign={["left", "right", "right", "right", "left", "left", "left"]}
        striped
      />

      <Divider />

      <H2>What is inflating the goal</H2>
      <Stack gap={8}>
        <Row gap={8} wrap>
          <Pill tone="danger">1. Peak HI for whole shift</Pill>
          <Text size="small">
            Jul 18 peak 92° vs avg 82° drops the band from extreme-caution (24 oz/h) to caution (16 oz/h) — 80 oz less on a 10 h model.
          </Text>
        </Row>
        <Row gap={8} wrap>
          <Pill tone="danger">2. Hours = miles / 1.25, max 10</Pill>
          <Text size="small">
            12.5–13 mi routes always bill 10 hours of continuous heat drinking. Real street time has shade, A/C relays, and cooler morning hours.
          </Text>
        </Row>
        <Row gap={8} wrap>
          <Pill tone="warning">3. Pre-shift baked into the hit target</Pill>
          <Text size="small">
            Goal includes ~24 oz before you leave. If Water Oz is mostly on-route drinking, you start ~24 oz behind every day.
          </Text>
        </Row>
        <Row gap={8} wrap>
          <Pill tone="warning">4. OSHA upper rates applied all day</Pill>
          <Text size="small">
            24–32 oz/h is guidance for hot outdoor labor peaks — not necessarily every hour of a 10-hour carrier day.
          </Text>
        </Row>
      </Stack>

      <H2>Hit-rate under alternative models</H2>
      <Table
        headers={["Model", "Hit rate", "Notes"]}
        rows={ALTS}
        columnAlign={["left", "right", "left"]}
        striped
      />

      <H2>Recommended fix</H2>
      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Change the math</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small" weight="semibold">Heat input: 70% avg HI + 30% peak HI</Text>
              <Text size="small" tone="secondary">
                Rewards sustained load without treating a one-hour spike as a 10-hour rate.
              </Text>
              <Text size="small" weight="semibold">Hours: miles ÷ 1.5, clamp 5–9</Text>
              <Text size="small" tone="secondary">
                Closer to a real city route day than /1.25 with a 10 h ceiling.
              </Text>
              <Text size="small" weight="semibold">Score route water only</Text>
              <Text size="small" tone="secondary">
                Keep pre-shift as advice; do not add it into Hydration Goal Oz for hit/miss.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>What that does to recent hard days</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small">Jul 17: drank {JUL17.water} · old goal {JUL17.goal} · revised route {JUL17.revisedRoute} → hit</Text>
              <Text size="small">Jul 18: drank {JUL18.water} · old goal {JUL18.goal} · revised route {JUL18.revisedRoute} → hit</Text>
              <Text size="small" tone="secondary">
                Historical hit rate rises from {HIT_RATE}% to {s.hitRateRevisedRoute}% under the revised route-only model — ambitious but achievable, not demoralizing.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Callout tone="info" title="Next step when you approve">
        Retune lib/hydration.ts, save route goal (not route+pre) as Hydration Goal Oz,
        optionally backfill goals from corrected weather + revised formula, and keep
        pre-shift as a separate UI hint.
      </Callout>
    </Stack>
  );
}
`;

writeFileSync(
  "C:/Users/stephen/.cursor/projects/c-Users-stephen-source-stepweaver-v5/canvases/carrier-hydration-audit.canvas.tsx",
  canvas
);
console.log("wrote canvas");
