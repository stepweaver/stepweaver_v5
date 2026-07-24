import { readFileSync, writeFileSync } from "node:fs";

const p = JSON.parse(readFileSync("scripts/audit-canvas-embed.json", "utf8"));
const esc = (s) => JSON.stringify(s);

const largeMismatches = p.incorrectDetail.filter((r) => {
  const hiPart = r.delta.split("HI ")[1] ?? "0";
  const tPart = (r.delta.split("T ")[1] ?? "0").split(",")[0];
  return Math.abs(parseFloat(hiPart)) >= 4 || Math.abs(parseFloat(tPart)) >= 4;
}).slice(0, 12);

const canvas = `import {
  BarChart,
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

const OK = ${p.ok};
const CLOSE = ${p.close};
const INCORRECT = ${p.incorrect};
const MISSING = ${p.missing};
const ENTRY_COUNT = ${p.entryCount};
const AVG_ABS_TEMP = ${p.avgAbsTemp};
const AVG_ABS_HI = ${p.avgAbsHi};
const RAINY_COUNT = ${p.rainyCount};
const HEAT_90 = ${p.heat90};
const HEAT_100 = ${p.heat100};

const CHART_CATS = ${esc(p.chartCats)};
const JOURNAL_HI = ${esc(p.journalHiSeries)};
const PEAK_HI = ${esc(p.peakHiSeries)};
const PRECIP = ${esc(p.precipSeries)};

const TABLE_ROWS = ${esc(p.tableRows)};
const ROW_TONE = ${esc(p.rowTone)};

const LARGE_MISMATCHES = ${esc(largeMismatches)};
const RAINY = ${esc(p.rainy)};
const TRIPLE = ${esc(p.triple)};
const YESTERDAY = ${esc(p.yesterday)};

export default function CarrierWeatherAudit() {
  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Carrier Journal weather audit</H1>
        <Text tone="secondary">
          All 34 Notion entries (May 22 – Jul 18, 2026) vs Open-Meteo archive for
          South Bend / ZIP 46614. Peak metrics use the recommended working window
          9 AM–7 PM local. Tolerance: ±2°F = OK.
        </Text>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value={String(ENTRY_COUNT)} label="Entries audited" />
        <Stat value={String(OK)} label="Within ±2°F" tone="success" />
        <Stat value={String(INCORRECT)} label="Need correction" tone="danger" />
        <Stat value={AVG_ABS_TEMP + "° / " + AVG_ABS_HI + "°"} label="Avg |Δ| temp / HI" />
      </Grid>

      <Grid columns={4} gap={12}>
        <Stat value={String(CLOSE)} label="Borderline (±1–2°F)" tone="warning" />
        <Stat value={String(MISSING)} label="Missing heat index" tone="warning" />
        <Stat value={String(RAINY_COUNT)} label='Rainy shifts (≥0.05")' tone="info" />
        <Stat value={HEAT_100 + " / " + HEAT_90} label="≥100° / ≥90° HI days" />
      </Grid>

      <Callout tone="warning" title="Why some days look wrong">
        Logged values come from mixed eras: Open-Meteo shift peak (current app,
        8 AM–4 PM), OpenWeather current/feels-like fallbacks, and earlier manual
        or forecast highs. Heat index on a few hot days (Jun 10, Jul 2, Jul 17–18)
        runs 5–7°F above archive Rothfusz - consistent with “feels like” or
        sun-adjusted numbers rather than shade heat index.
      </Callout>

      <H2>Journal HI vs archive peak HI (9–7)</H2>
      <Text tone="secondary" size="small">
        Source: Open-Meteo Historical Archive · ZIP 46614 · hours 09:00–19:00 America/Indiana/Indianapolis
      </Text>
      <LineChart
        categories={CHART_CATS}
        series={[
          { name: "Journal heat index (°F)", data: JOURNAL_HI, tone: "warning" },
          { name: "Archive peak HI 9–7 (°F)", data: PEAK_HI, tone: "info" },
        ]}
        height={260}
        beginAtZero={false}
      />

      <H2>Shift precipitation (inches, 9–7)</H2>
      <Text tone="secondary" size="small">
        {"Yesterday (Jul 18): " + YESTERDAY.precip + '" across ' + YESTERDAY.rainyHours + " hours - not stored on the journal entry today."}
      </Text>
      <BarChart
        categories={CHART_CATS}
        series={[{ name: "Precip during shift (in)", data: PRECIP, tone: "info" }]}
        height={200}
      />

      <H2>Full entry audit</H2>
      <Text tone="secondary" size="small">
        Columns: Journal temp / HI · Archive peak temp / peak HI / avg HI (9–7) · Δ vs archive · shift precip · verdict
      </Text>
      <Table
        headers={[
          "Date",
          "J Temp",
          "J HI",
          "Peak T",
          "Peak HI",
          "Avg HI",
          "Δ Temp",
          "Δ HI",
          "Precip",
          "Notes",
        ]}
        rows={TABLE_ROWS}
        columnAlign={[
          "left",
          "right",
          "right",
          "right",
          "right",
          "right",
          "right",
          "right",
          "right",
          "left",
        ]}
        rowTone={ROW_TONE}
        striped
        stickyHeader
      />

      <H2>Triple-digit heat days (archive peak HI ≥ 100)</H2>
      <Text tone="secondary">
        Only three shifts cleared 100°F peak heat index in the 9–7 window. Average
        shift HI on those days was still mid-to-high 90s - which is why a single
        peak can feel similar to a “regular” hot day if most of the route was cooler.
      </Text>
      <Table
        headers={["Date", "Journal T / HI", "Archive peak T / HI", "Avg HI 9–7"]}
        rows={TRIPLE.map((t) => [t.date, t.journal, t.peak, String(t.avgHi)])}
        columnAlign={["left", "right", "right", "right"]}
        striped
      />

      <H2>Rainy shifts (≥ 0.05")</H2>
      <Table
        headers={["Date", "Precip", "Wet hours", "Archive peak HI", "Journal HI"]}
        rows={RAINY.map((r) => [
          r.date,
          r.precip + '"',
          String(r.hours),
          String(r.peakHi),
          r.journalHi == null ? "-" : String(r.journalHi),
        ])}
        columnAlign={["left", "right", "right", "right", "right"]}
        striped
      />

      <Divider />

      <H2>Recommended recording standard</H2>
      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Primary metrics (keep + correct)</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text weight="semibold">Peak air temp during 9 AM–7 PM</Text>
              <Text tone="secondary" size="small">
                What you were actually exposed to on the street - not calendar-day high.
              </Text>
              <Text weight="semibold">Peak heat index during 9 AM–7 PM</Text>
              <Text tone="secondary" size="small">
                Best single stress number for a carrier. Shade/light-wind assumption;
                direct sun can add ~15°F felt load (NWS).
              </Text>
              <Text weight="semibold">Average heat index during 9 AM–7 PM</Text>
              <Text tone="secondary" size="small">
                Explains why 100° peaks sometimes feel like “just another heat day” -
                duration matters as much as the spike.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Add next</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text weight="semibold">Shift precipitation (inches) + rain flag</Text>
              <Text tone="secondary" size="small">
                Yesterday’s wet route is invisible in structured data - only notes catch it today.
              </Text>
              <Text weight="semibold">Optional later: max WBGT</Text>
              <Text tone="secondary" size="small">
                Better physiological load, but needs black-globe / specialized sources.
                Defer until heat analysis is stable on HI + precip.
              </Text>
              <Text weight="semibold">Widen shift window in /api/weather</Text>
              <Text tone="secondary" size="small">
                App currently peaks 8 AM–4 PM. Move to 9–7 to match real route hours.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>Correction plan</H2>
      <Stack gap={8}>
        <Row gap={8} wrap>
          <Pill tone="danger">1. Backfill Notion</Pill>
          <Text size="small">
            {"Set Temperature F / Heat Index F from archive peak (9–7) for all " + ENTRY_COUNT + " dates; fill missing HIs."}
          </Text>
        </Row>
        <Row gap={8} wrap>
          <Pill tone="info">2. Add precip fields</Pill>
          <Text size="small">
            Notion: Precipitation In + Rain Day (or derive rain from precip ≥ 0.05").
          </Text>
        </Row>
        <Row gap={8} wrap>
          <Pill tone="info">3. Store avg HI</Pill>
          <Text size="small">
            New property Average Heat Index F - backfill from archive, log going forward.
          </Text>
        </Row>
        <Row gap={8} wrap>
          <Pill tone="success">4. Lock the pipeline</Pill>
          <Text size="small">
            Update weather route window to 9–7; stop OpenWeather current-temp fallback for daybook peaks.
          </Text>
        </Row>
      </Stack>

      <Callout tone="info" title="Data source note">
        Archive values are Open-Meteo historical reanalysis at your route coordinates -
        the same family of data the daybook already uses for same-day peaks. This is
        more consistent than mixing forecast highs and instantaneous feels-like, even
        though it is not a raw KSBN ASOS station dump.
      </Callout>

      <H3>Largest mismatches (correction candidates)</H3>
      <Table
        headers={["Date", "Journal T/HI", "Archive peak T/HI", "Delta", "Precip"]}
        rows={LARGE_MISMATCHES.map((r) => [
          r.date,
          r.journal,
          r.archive,
          r.delta,
          r.precip >= 0.05 ? r.precip + '"' : "-",
        ])}
        columnAlign={["left", "right", "right", "left", "right"]}
        striped
      />
    </Stack>
  );
}
`;

const out =
  "C:/Users/stephen/.cursor/projects/c-Users-stephen-source-stepweaver-v5/canvases/carrier-weather-audit.canvas.tsx";
writeFileSync(out, canvas);
console.log("wrote", out, canvas.length, "chars");
