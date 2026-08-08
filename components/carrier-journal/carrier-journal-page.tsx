import Link from "next/link";
import {
  CARRIER_KPI_EMPTY,
  computeTotalsFromDispatches,
  totalsToKpis,
  isDispatchFeedWorthy,
  toPublicFieldDispatches,
  type CarrierDispatch,
} from "@/lib/data/carrier-journal";
import { CarrierKpiCard } from "./carrier-kpi-card";
import { CarrierDispatchFeed } from "./carrier-dispatch-feed";
import { CarrierFieldCalendar } from "./carrier-field-calendar";
import { CarrierMilestonePanel } from "./carrier-milestone-panel";
import { CarrierProfileCard } from "./carrier-profile-card";
import { FootwearActiveLoadoutCard } from "@/components/footwear/footwear-active-loadout-card";
import type { ShoeDerivedSummary } from "@/lib/footwear/queries";

const TRACKING_ITEMS = [
  { category: "Physical load", detail: "Miles walked, soreness, energy, and mood" },
  { category: "Hydration and fuel", detail: "Water, snacks, hunger and thirst adjustments" },
  { category: "Transformation", detail: "Weekly weight trend: pounds lost, not raw weight" },
  { category: "Environmental load", detail: "Heat index and weather from temp + field notes" },
  { category: "Published narrative", detail: "Day reflections that stay personal and non-operational" },
];

const FIELD_METHOD_CARDS = [
  {
    label: "MOVEMENT LOAD",
    title: "Miles, not steps",
    body: "Miles are the main movement signal because they map cleanly to effort and are easier to compare across days.",
  },
  {
    label: "FUEL + HYDRATION",
    title: "Eat and drink by demand",
    body: "Food and water are adjusted around hunger, thirst, heat, soreness, and end-of-day energy.",
  },
  {
    label: "RECOVERY SIGNALS",
    title: "Soreness, energy, mood",
    body: "Subjective scores help identify whether the body is adapting or just accumulating fatigue.",
  },
  {
    label: "TREND, NOT SCOREBOARD",
    title: "Weight lost, not raw weight",
    body: "Monday weigh-ins feed a cumulative loss number on the public log. The actual weight stays private.",
  },
];

const TRANSFORMATION_ARC = [
  {
    title: "Starting Point",
    body: "Overweight and learning what long walking days actually cost. The first weeks are less about speed and more about showing up, finishing, and not pretending the body is already adapted.",
  },
  {
    title: "Break-In Period",
    body: "Feet, hips, and hydration become the daily report card. Soreness is expected. Pacing beats panic. Heat days expose gaps fast, so water stops are not optional, and recovery starts the moment you get home.",
  },
  {
    title: "Adaptation",
    body: "More miles feel less catastrophic. Recovery gets intentional. Rhythm replaces constant guessing. The body is still changing, but the day stops feeling like a surprise attack every morning.",
  },
  {
    title: "Long Walker Mode",
    body: "A repeatable walking body: systems for shoes, water, pacing, and post-day recovery. Confidence comes from repetition.",
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
    body: "Rushing early costs you late. A steady walk with fewer stops often beats a frantic sprint that leaves you gassed at the end.",
  },
  {
    title: "Recovery is part of the day",
    body: "Stretching, sleep, food, and water after you finish are not extras. They are how you get back out there tomorrow.",
  },
  {
    title: "Weather changes everything",
    body: "Rain, heat, and wind alter grip, gear, and energy. Same distance, different demands — plan for the day you actually have.",
  },
  {
    title: "Load and posture matter",
    body: "How you carry weight and how you stride matter. Small adjustments early prevent the kind of soreness that follows you home for a week.",
  },
];

const WHY_THIS_BELONGS = [
  "Low-friction field data capture: if logging takes more than 90 seconds, it will not get used consistently",
  "Public/private data boundary: KPIs and narrative are shareable; operational details stay private",
  "KPI design around real behavior: these metrics emerged from physically demanding days, not a dashboard template",
  "Narrative reporting from personal data: aggregate numbers are one story; individual entries are another",
  "Mobile-first UX constraint: the logging tool lives on a phone and must work when you are tired",
];

const SECTION_NAV = [
  { id: "aggregate-kpis", label: "AGGREGATE KPIs" },
  { id: "field-calendar", label: "FIELD CALENDAR" },
  { id: "field-qualifications", label: "MILESTONES" },
  { id: "field-method", label: "FIELD METHOD" },
  { id: "field-dispatches", label: "FIELD NOTES" },
] as const;

function FieldSectionNav() {
  return (
    <nav
      aria-label="Field Journal sections"
      className="carrier-section-nav sticky top-14 z-20 -mx-1 px-1 py-2 border-b border-[rgb(var(--neon)/0.12)] bg-[rgb(var(--bg)/0.92)] backdrop-blur-sm [@media(max-height:32rem)]:static"
    >
      <ul className="flex flex-wrap gap-x-1 gap-y-2 sm:gap-x-2 overflow-x-auto">
        {SECTION_NAV.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="inline-flex min-h-11 items-center px-2.5 py-2 font-[var(--font-ocr)] text-[10px] sm:text-[11px] tracking-widest text-[rgb(var(--text-meta))] border border-transparent hover:border-[rgb(var(--neon)/0.35)] hover:text-[rgb(var(--neon))] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))]"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type Props = {
  dispatches?: CarrierDispatch[];
  footwearActive?: ShoeDerivedSummary | null;
};

export function CarrierJournalPage({
  dispatches: notionDispatches,
  footwearActive = null,
}: Props = {}) {
  // Fail closed: empty Notion must not fall back to demo narratives.
  // Aggregates (including weight-lost) are computed server-side from full records;
  // only the public DTO crosses into client components.
  const serverDispatches = notionDispatches ?? [];
  const totals = computeTotalsFromDispatches(serverDispatches);
  const kpis = totalsToKpis(totals);
  const dispatches = toPublicFieldDispatches(serverDispatches);
  const feedDispatches = dispatches.filter(isDispatchFeedWorthy);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
          <div className="flex-1 min-w-0">
            <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
              FIELD JOURNAL // THE LONG WALK
            </div>
            <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))] mb-4">
              Field Journal
            </h1>
            <p className="text-[rgb(var(--text-secondary))] text-sm sm:text-base max-w-3xl leading-relaxed">
              A personal walking and fitness journal from a high-mileage delivery worker: miles,
              hydration, soreness, weather, weight lost, footwear, and what it takes to adapt to long
              walking days. Written off the clock from Apple Health and private notes.
            </p>
          </div>
          <div className="lg:shrink-0">
            <CarrierProfileCard />
          </div>
        </div>

        <FieldSectionNav />

        <div className="surface-panel p-5 sm:p-6 border-[rgb(var(--border)/0.3)]">
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-2">
            NOTICE // PERSONAL FIELD JOURNAL
          </div>
          <p className="text-xs text-[rgb(var(--text-meta))] leading-relaxed">
            This is a personal journal documenting my walking, health, fitness, equipment, and
            experiences as a high-mileage delivery worker. It is written off the clock and does not
            represent, speak for, or imply the endorsement of any employer.
          </p>
        </div>

        {footwearActive ? (
          <FootwearActiveLoadoutCard summary={footwearActive} />
        ) : (
          <div className="border border-[rgb(var(--neon)/0.2)] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))] mb-1">
                SHOE LEDGER
              </p>
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Independent personal footwear journal: brands, mileage, ratings, and honest
                conclusions.
              </p>
            </div>
            <Link
              href="/field-journal/footwear"
              className="inline-flex shrink-0 border border-[rgb(var(--neon)/0.4)] px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)]"
            >
              OPEN SHOE LEDGER
            </Link>
          </div>
        )}

        <div id="aggregate-kpis" className="scroll-mt-28">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest mb-4">
            AGGREGATE KPIs
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
            {kpis.map((kpi, i) => (
              <CarrierKpiCard key={kpi.label} kpi={kpi} index={i} />
            ))}
          </div>
        </div>

        <div id="field-calendar" className="scroll-mt-28">
          <CarrierFieldCalendar dispatches={dispatches} />
        </div>

        <div id="field-qualifications" className="scroll-mt-28">
          <CarrierMilestonePanel dispatches={dispatches} />
        </div>

        <div id="field-method" className="surface-panel p-6 sm:p-8 scroll-mt-28">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--neon))] mb-2">
            FIELD METHOD
          </div>
          <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-4">
            How I&apos;m Tracking the Transformation
          </h2>
          <div className="space-y-4 text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-6">
            <p>
              Field Journal is a personal fitness record. The method is simple: log the day, watch
              the patterns, and adjust the levers that appear to matter.
            </p>
            <p>
              I track miles, hydration, weather, heat index, soreness, energy, mood, recovery
              notes, and weekly weight trend. The point is to document what long walking days cost,
              what helps, and what doesn&apos;t.
            </p>
            <p>
              I am not weighing myself every day. Weight is a weekly trend marker. The day-to-day
              signals are simpler: how far I walked, how much water I needed, how sore I felt, how
              much energy I had left, and whether recovery helped me show up again.
            </p>
            <p>
              I am also not running a strict diet. I eat when I&apos;m hungry and drink when I&apos;m
              thirsty, then I adjust based on what the miles teach me. As distance increased, the
              food changed naturally: more trail mix, nuts, bananas, Gatorade, water, and a daily
              multivitamin. The goal is not perfection — enough fuel, hydration, and recovery to keep
              adapting.
            </p>
            <p>
              Mountain Dew remains part of the story. I still drink it because I love it, but I keep
              it at home after the day instead of treating it like walking fuel.
            </p>
          </div>

          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-4">
            THE WORKING LOOP
          </div>
          <div className="font-[var(--font-ibm)] text-sm text-[rgb(var(--neon))] mb-6 tracking-wide">
            Observe → Log → Recover → Adjust → Repeat
          </div>

          <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-6">
            If weight drops, soreness changes, endurance improves, heat tolerance improves, or energy
            stabilizes, I pull harder on the levers that seem to be working. If something creates
            problems, I back off. The system is organic, but it is still documented.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
            {FIELD_METHOD_CARDS.map((card) => (
              <div key={card.label} className="bg-[rgb(var(--panel))] p-5">
                <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mb-1">
                  {card.label}
                </div>
                <h3 className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color))] mb-2">
                  {card.title}
                </h3>
                <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="field-dispatches" className="scroll-mt-28">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest mb-4">
            FIELD NOTES
          </div>
          {feedDispatches.length > 0 ? (
            <CarrierDispatchFeed dispatches={feedDispatches} />
          ) : (
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              No published notes yet. New daybook saves stay private drafts until you intentionally
              publish a sanitized public note.
            </p>
          )}
        </div>

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
            Hydration is tracked as a safety and performance signal. I am not trying to win a
            water-drinking contest. I am learning how much fluid long walking days actually demand,
            especially when heat index and distance stack together.
          </p>
          <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-3">
            On hotter days, thirst arrives late. If water intake is falling behind, energy drops,
            soreness climbs, and decision-making gets worse near the end of the day.
          </p>
          <p className="text-xs text-[rgb(var(--warn))] font-[var(--font-ocr)] tracking-wide border border-[rgb(var(--warn)/0.3)] px-3 py-2">
            HEAT-DAY NOTE: If the heat index is climbing and water intake is below goal by midday,
            slow down, drink, and adjust expectations for the rest of the day.
          </p>
        </div>

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

        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest mb-4">
            LESSONS FROM THE MILES
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

        <div className="surface-panel p-6 sm:p-8">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--neon))] mb-2">
            OPERATOR REFLECTION
          </div>
          <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-4">
            Why this belongs on a developer portfolio
          </h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-5 max-w-3xl leading-relaxed">
            This is not just fitness notes. It is a live systems artifact: a data pipeline from
            physical experience to public KPIs, constrained by real-world conditions and a hard
            public/private boundary.
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)] mt-8">
            {[
              {
                signal: "Draft → Publish",
                title: "Intentional release",
                explanation:
                  "Daybook saves default to private draft; only sanitized public notes reach this page",
              },
              {
                signal: "Public / Private",
                title: "Hard data boundary",
                explanation:
                  "Only published entries and aggregate KPIs appear here; private notes never leave the logging tool",
              },
              {
                signal: "Field-first UX",
                title: "Mobile constraint",
                explanation: "The logging tool runs on a phone when you are tired; friction is the enemy",
              },
            ].map((s) => (
              <div key={s.title} className="bg-[rgb(var(--panel))] p-5">
                <div className="text-[rgb(var(--neon))] font-[var(--font-ibm)] text-base mb-1">{s.signal}</div>
                <div className="text-[rgb(var(--text-color))] text-sm mb-1">{s.title}</div>
                <div className="text-[rgb(var(--text-meta))] text-xs">{s.explanation}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel p-6 sm:p-8 text-center">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--text-label))] mb-3">
            CONTINUE EXPLORING
          </div>
          <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-2">
            More systems. More artifacts.
          </h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-6 max-w-xl mx-auto">
            Field Journal is one proof of the approach. The project catalog and codex have the rest.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/work" className="glitch-button">
              View Projects
            </Link>
            <Link href="/writing" className="glitch-button">
              Read the Codex
            </Link>
            <Link href="/contact" className="glitch-button">
              Get in Touch
            </Link>
          </div>
        </div>

        <div className="text-center py-2">
          <Link
            href="/log"
            aria-label="Field daybook"
            className="text-[rgb(var(--text-meta)/0.18)] hover:text-[rgb(var(--text-meta)/0.45)] text-[10px] font-[var(--font-ocr)] tracking-widest transition-colors"
          >
            λ
          </Link>
        </div>
      </div>
    </div>
  );
}
