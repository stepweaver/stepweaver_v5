import Link from "next/link";
import {
  CARRIER_KPI_EMPTY,
  getCarrierDispatches,
  getCarrierKpis,
  computeTotalsFromDispatches,
  totalsToKpis,
  type CarrierDispatch,
} from "@/lib/data/carrier-journal";
import {
  evaluateCarrierAchievements,
  STATIC_MANUAL_UNLOCK_IDS,
} from "@/lib/data/carrier-achievements";
import { CarrierKpiCard } from "./carrier-kpi-card";
import { CarrierDispatchCard } from "./carrier-dispatch-card";
import { CarrierAchievementsPanel } from "./carrier-achievements-panel";
import { CarrierAchievementSync } from "./carrier-achievement-sync";

const TRACKING_ITEMS = [
  { category: "Physical load", detail: "Miles walked, steps, soreness, recovery signals, body notes" },
  { category: "Transformation", detail: "Phase progression, weight trend (public-safe modes only), capacity building" },
  { category: "Environmental load", detail: "Heat index, rain, snow, storms" },
  { category: "Operational load", detail: "Perceived mail volume, route difficulty, breaks taken" },
  { category: "Safety signals", detail: "Hydration discipline, heat risk, dog encounters" },
  { category: "Public narrative", detail: "Sanitized field reflections only, with no addresses, names, or route data" },
];

const TRANSFORMATION_ARC = [
  {
    title: "Starting Point",
    body: "Overweight, new to the job, and learning what a walking route actually costs. The first weeks are less about speed and more about showing up, finishing, and not pretending the body is already adapted.",
  },
  {
    title: "Break-In Period",
    body: "Feet, hips, and hydration become the daily report card. Soreness is expected. Pacing beats panic. Heat days expose gaps fast, so water stops are not optional, and recovery starts the moment the satchel comes off.",
  },
  {
    title: "Adaptation",
    body: "More miles feel less catastrophic. Recovery gets intentional. Route rhythm replaces constant guessing. The body is still changing, but the job stops feeling like a surprise attack every morning.",
  },
  {
    title: "Mailwalker Mode",
    body: "A repeatable carrier body: systems for shoes, water, pacing, and post-route recovery. Not perfect, just field-tested. Confidence comes from repetition, not from pretending the work is easy.",
  },
];

const LESSONS = [
  {
    title: "Shoes matter",
    body: "Bad footwear shows up as hip pain, shin pain, and bad morale. Rotate pairs when you can. Break them in before a brutal week, not during one.",
  },
  {
    title: "Hydration beats toughness",
    body: "Heat index days punish dehydration before they punish pride. Drink on a schedule, not when you already feel behind.",
  },
  {
    title: "Pace beats panic",
    body: "Rushing early costs you late. A steady walk with fewer stops often beats a frantic sprint that leaves you gassed on the last loop.",
  },
  {
    title: "Recovery is part of the route",
    body: "Stretching, sleep, food, and water after the shift are not extras. They are how you get back out there tomorrow.",
  },
  {
    title: "Weather changes the job",
    body: "Rain, heat, and wind alter grip, gear, and energy. Same route, different demands, so plan for the day you actually have.",
  },
  {
    title: "The satchel teaches posture",
    body: "Bag position and stride matter. Small adjustments early prevent the kind of soreness that follows you home for a week.",
  },
];

const WHY_THIS_BELONGS = [
  "Low-friction field data capture: if logging takes more than 90 seconds, it will not get used consistently",
  "Public/private data boundary: KPIs and narrative are shareable; everything operational stays private",
  "KPI design around real behavior: these metrics emerged from the job, not from a dashboard template",
  "Narrative reporting from operational data: aggregate numbers are one story; individual dispatches are another",
  "Mobile-first UX constraint: the logging tool lives on a phone and must work before your legs give out",
];

type Props = {
  dispatches?: CarrierDispatch[];
  /** Achievement IDs already stored in the Notion Achievement Unlocks DB. */
  notionUnlockedIds?: Set<string>;
};

export function CarrierJournalPage({
  dispatches: notionDispatches,
  notionUnlockedIds,
}: Props = {}) {
  const dispatches = notionDispatches ?? getCarrierDispatches();
  const totals = computeTotalsFromDispatches(dispatches);
  const kpis =
    notionDispatches && notionDispatches.length > 0
      ? totalsToKpis(totals, dispatches)
      : getCarrierKpis();

  // Achievements computed fresh from dispatch data + static bootstraps.
  const evaluatedIds = evaluateCarrierAchievements(
    dispatches,
    totals,
    new Set(STATIC_MANUAL_UNLOCK_IDS)
  );

  // Merge computed IDs with any manually-added Notion rows (manual field unlocks).
  const allUnlockedIds = notionUnlockedIds
    ? new Set([...evaluatedIds, ...notionUnlockedIds])
    : evaluatedIds;

  // IDs that are newly computed but not yet in Notion → trigger write-back.
  const newlyUnlockedIds = notionUnlockedIds
    ? [...evaluatedIds].filter((id) => !notionUnlockedIds.has(id))
    : [];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">

        {/* Hero */}
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            CARRIER&apos;S LOG // MAILWALKER
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))] mb-4">
            Carrier&apos;s Log
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm sm:text-base max-w-3xl leading-relaxed">
            A public-safe field log from starting overweight and learning life as a city letter carrier:
            miles, hydration, recovery, phase progression, and the operational lessons hiding inside a walking route.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="surface-panel p-5 sm:p-6 border-[rgb(var(--border)/0.3)]">
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-2">
            NOTICE // UNOFFICIAL PERSONAL LOG
          </div>
          <p className="text-xs text-[rgb(var(--text-meta))] leading-relaxed">
            Carrier&apos;s Log is an unofficial personal field log. It is not affiliated with, endorsed by, or
            representative of the United States Postal Service or any other organization. Entries deliberately omit
            addresses, route numbers, customer names, coworker names, scanner data, and official mail volume figures.
            Weight and body data follow explicit public-sharing modes, and raw numbers are never shown unless configured.
            All observations are personal and public-safe only.
          </p>
        </div>

        {/* KPI Grid */}
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest mb-4">
            AGGREGATE KPIs
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
            {kpis.map((kpi, i) => (
              <CarrierKpiCard key={kpi.label} kpi={kpi} index={i} />
            ))}
          </div>
        </div>

        {/* Transformation Arc */}
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest mb-4">
            TRANSFORMATION ARC
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
            {TRANSFORMATION_ARC.map((panel) => (
              <div key={panel.title} className="bg-[rgb(var(--panel))] p-5 sm:p-6">
                <h3 className="font-[var(--font-ibm)] text-base text-[rgb(var(--text-color))] mb-2">
                  {panel.title}
                </h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{panel.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hydration Discipline */}
        <div className="surface-panel p-6 sm:p-8">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--neon))] mb-4">
            HYDRATION DISCIPLINE
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
            <div>
              <div className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--neon))]">
                {totals.avgWaterOz > 0 ? `${totals.avgWaterOz} oz` : CARRIER_KPI_EMPTY}
              </div>
              <div className="text-sm text-[rgb(var(--text-color))] mt-1">Average water per logged day</div>
            </div>
            <div>
              <div className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--neon))]">
                {totals.hydrationGoalHitRate > 0 ? `${totals.hydrationGoalHitRate}%` : CARRIER_KPI_EMPTY}
              </div>
              <div className="text-sm text-[rgb(var(--text-color))] mt-1">Hydration goal hit rate</div>
            </div>
          </div>
          <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-3">
            Hydration is tracked as a safety and performance signal, not a wellness trophy. On heat-index days,
            falling behind on water shows up as energy crashes, soreness spikes, and bad decision-making late in the route.
          </p>
          <p className="text-xs text-[rgb(var(--warn))] font-[var(--font-ocr)] tracking-wide border border-[rgb(var(--warn)/0.3)] px-3 py-2">
            HEAT-DAY NOTE: If the heat index is climbing and water intake is below goal by mid-route, treat it as a
            operational risk, so slow down, drink, and adjust expectations for the rest of the shift.
          </p>
        </div>

        {/* What I'm Tracking */}
        <div className="surface-panel p-6 sm:p-8">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--neon))] mb-4">
            WHAT I AM TRACKING
          </div>
          <div className="space-y-3">
            {TRACKING_ITEMS.map((item) => (
              <div key={item.category} className="flex gap-3 text-sm">
                <span className="text-[rgb(var(--neon))] shrink-0 mt-0.5">▸</span>
                <div>
                  <span className="text-[rgb(var(--text-color))] font-[var(--font-ibm)]">
                    {item.category}
                  </span>
                  <span className="text-[rgb(var(--text-secondary))]">: {item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lessons for Future Carriers */}
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest mb-4">
            LESSONS FOR FUTURE CARRIERS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
            {LESSONS.map((lesson) => (
              <div key={lesson.title} className="bg-[rgb(var(--panel))] p-5">
                <h3 className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color))] mb-2">
                  {lesson.title}
                </h3>
                <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">{lesson.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatches */}
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest mb-4">
            FIELD DISPATCHES
          </div>
          <div className="space-y-px">
            {dispatches.map((d) => (
              <CarrierDispatchCard key={d.id} dispatch={d} />
            ))}
          </div>
        </div>

        {/* Field Achievements */}
        <div className="surface-panel p-6 sm:p-8">
          <CarrierAchievementsPanel unlockedIds={allUnlockedIds} />
        </div>

        {/* Write newly-computed achievements back to Notion (client, fire-and-forget) */}
        <CarrierAchievementSync newlyUnlockedIds={newlyUnlockedIds} />

        {/* Why This Belongs Here */}
        <div className="surface-panel p-6 sm:p-8">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--neon))] mb-2">
            OPERATOR REFLECTION
          </div>
          <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-4">
            Why this belongs on a developer portfolio
          </h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-5 max-w-3xl leading-relaxed">
            This is not just route notes. It is a live business-systems artifact: a data pipeline from physical experience
            to public KPIs, constrained by real-world conditions and a strict public/private boundary.
          </p>
          <div className="space-y-3">
            {WHY_THIS_BELONGS.map((item, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-[rgb(var(--neon))] font-[var(--font-ocr)] text-[10px] shrink-0 mt-1 tracking-widest">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[rgb(var(--text-secondary))]">{item}</span>
              </div>
            ))}
          </div>

          {/* Evidence strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)] mt-8">
            {[
              { signal: "Static → Notion", title: "Evolving data source", explanation: "Phase 1 is static; Phase 2 wires to a private Notion database with a public filter" },
              { signal: "Public / Private", title: "Hard data boundary", explanation: "Only public-safe entries and aggregate KPIs ever appear here" },
              { signal: "Field-first UX", title: "Mobile constraint", explanation: "The logging tool runs on a phone mid-route; friction is the enemy" },
            ].map((s) => (
              <div key={s.title} className="bg-[rgb(var(--panel))] p-5">
                <div className="text-[rgb(var(--neon))] font-[var(--font-ibm)] text-base mb-1">{s.signal}</div>
                <div className="text-[rgb(var(--text-color))] text-sm mb-1">{s.title}</div>
                <div className="text-[rgb(var(--text-meta))] text-xs">{s.explanation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="surface-panel p-6 sm:p-8 text-center">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--text-label))] mb-3">
            CONTINUE EXPLORING
          </div>
          <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-2">
            More systems. More artifacts.
          </h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-6 max-w-xl mx-auto">
            Carrier&apos;s Log is one proof of the approach. The project catalog and codex have the rest.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/projects" className="glitch-button glitch-button--primary">
              View Projects
            </Link>
            <Link href="/codex" className="glitch-button">
              Read the Codex
            </Link>
            <Link href="/contact" className="glitch-button">
              Get in Touch
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
