import Link from "next/link";
import {
  CARRIER_KPI_EMPTY,
  enrichDispatchesFields,
  getCarrierDispatches,
  getCarrierKpis,
  computeTotalsFromDispatches,
  totalsToKpis,
  isDispatchFeedWorthy,
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
  { category: "Hydration and fuel", detail: "Water, Gatorade, route snacks, hunger and thirst adjustments" },
  { category: "Transformation", detail: "Weekly weight trend: pounds lost, not raw weight" },
  { category: "Environmental load", detail: "Heat index and weather derived from temp + field notes" },
  { category: "Operational load", detail: "Mail load tier from DPS + parcels vs your baseline" },
  { category: "Published narrative", detail: "Route-day reflections and field notes" },
];

const FIELD_METHOD_CARDS = [
  {
    label: "MOVEMENT LOAD",
    title: "Miles, not steps",
    body: "Miles are the main movement signal because they map cleanly to route effort and are easier to compare across days.",
  },
  {
    label: "FUEL + HYDRATION",
    title: "Eat and drink by field demand",
    body: "Food and water are adjusted around hunger, thirst, heat, soreness, and end-of-shift energy.",
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
    body: "A repeatable carrier body: systems for shoes, water, pacing, and post-route recovery. Field-tested. Confidence comes from repetition.",
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
  footwearActive?: ShoeDerivedSummary | null;
};

export function CarrierJournalPage({
  dispatches: notionDispatches,
  footwearActive = null,
}: Props = {}) {
  // All published rows feed aggregates (KPIs, calendar, milestones).
  // Only rows with authored content appear in the feed.
  const dispatches = enrichDispatchesFields(notionDispatches ?? getCarrierDispatches());
  const feedDispatches = dispatches.filter(isDispatchFeedWorthy);
  const totals = computeTotalsFromDispatches(dispatches);
  const kpis =
    notionDispatches && notionDispatches.length > 0
      ? totalsToKpis(totals)
      : getCarrierKpis();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">

        {/* Hero */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
          <div className="flex-1 min-w-0">
            <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
              CARRIER&apos;S LOG // MAILWALKER
            </div>
            <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))] mb-4">
              Carrier&apos;s Log
            </h1>
            <p className="text-[rgb(var(--text-secondary))] text-sm sm:text-base max-w-3xl leading-relaxed">
              A personal field log from starting overweight and learning life as a city letter carrier:
              miles, hydration, soreness, weight lost, and the operational lessons hiding inside a walking route.
            </p>
          </div>
          <div className="lg:shrink-0">
            <CarrierProfileCard />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="surface-panel p-5 sm:p-6 border-[rgb(var(--border)/0.3)]">
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-2">
            NOTICE // UNOFFICIAL PERSONAL LOG
          </div>
          <p className="text-xs text-[rgb(var(--text-meta))] leading-relaxed">
            Carrier&apos;s Log is an unofficial personal field log. Not affiliated with, endorsed by, or representative
            of the United States Postal Service or any other organization. This log does not include addresses, customer
            names, coworker names, route numbers, scanner data, or internal USPS operational details.
          </p>
        </div>

        {footwearActive ? (
          <FootwearActiveLoadoutCard summary={footwearActive} />
        ) : (
          <div className="border border-[rgb(var(--neon)/0.2)] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))] mb-1">
                FOOTWEAR LAB
              </p>
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Equipment roster for route footwear: mileage, checkpoints, condition.
              </p>
            </div>
            <Link
              href="/carrier-journal/footwear"
              className="inline-flex shrink-0 border border-[rgb(var(--neon)/0.4)] px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)]"
            >
              ENTER FOOTWEAR LAB
            </Link>
          </div>
        )}

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

        {/* Field Calendar: logged days derived from dispatch data, no schedule claims */}
        <CarrierFieldCalendar dispatches={dispatches} />

        {/* Field Badges: cumulative milestones computed from dispatch data */}
        <CarrierMilestonePanel dispatches={dispatches} />

        {/* Field Method */}
        <div className="surface-panel p-6 sm:p-8">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--neon))] mb-2">
            FIELD METHOD
          </div>
          <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-4">
            How I&apos;m Tracking the Transformation
          </h2>
          <div className="space-y-4 text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-6">
            <p>
              Carrier&apos;s Log is a personal field record.
              The method is simple: log the work, watch the patterns, and adjust the levers that appear to matter.
            </p>
            <p>
              I am tracking miles, hydration, weather, heat index, mail-load, soreness, energy, mood, recovery
              notes, and weekly weight trend. The point is to document what the work costs, what helps, and what
              doesn&apos;t.
            </p>
            <p>
              I am not weighing myself every day. Weight is a weekly trend marker. The
              day-to-day signals are simpler: how far I walked, how much water I needed, how sore I felt, how much
              energy I had left, and whether recovery helped me show up again.
            </p>
            <p>
              I am also not running a strict diet. I am letting the work create the signal. I eat when I&apos;m hungry
              and drink when I&apos;m thirsty, then I adjust based on what the route teaches me. As the miles increased,
              the food changed naturally: more trail mix, nuts, bananas, Gatorade, water, and a daily multivitamin.
              The goal is not perfection. The goal is enough fuel, enough hydration, and enough recovery to keep adapting.
            </p>
            <p>
              Mountain Dew remains part of the story. I still drink it, because I love it, but I keep it at home after
              shift instead of treating it like route fuel.
            </p>
          </div>

          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-4">
            THE WORKING LOOP
          </div>
          <div className="font-[var(--font-ibm)] text-sm text-[rgb(var(--neon))] mb-6 tracking-wide">
            Observe → Log → Recover → Adjust → Repeat
          </div>

          <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-6">
            If weight drops, soreness changes, endurance improves, heat tolerance improves, or energy stabilizes, I will
            pull harder on the levers that seem to be working. If something creates problems, I will back off. The system
            is organic, but it is still documented.
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

        {/* Field Dispatches: only entries with authored content */}
        {feedDispatches.length > 0 && (
          <div>
            <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest mb-4">
              FIELD DISPATCHES
            </div>
            <CarrierDispatchFeed dispatches={feedDispatches} />
          </div>
        )}

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
            Hydration is tracked as a safety and performance signal. I am not trying to win a
            water-drinking contest. I am learning how much fluid the work actually demands, especially when heat index,
            mail load, and walking distance stack together.
          </p>
          <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-3">
            On hotter days, thirst arrives late. If water intake is falling behind, energy drops, soreness climbs, and
            decision-making gets worse near the end of the route. That makes hydration an operational risk.
          </p>
          <p className="text-xs text-[rgb(var(--warn))] font-[var(--font-ocr)] tracking-wide border border-[rgb(var(--warn)/0.3)] px-3 py-2">
            HEAT-DAY NOTE: If the heat index is climbing and water intake is below goal by mid-route, treat it as an
            operational risk. Slow down, drink, and adjust expectations for the rest of the shift.
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

        {/* Mail Sort Academy Promo */}
        <div className="relative border border-[rgb(var(--neon)/0.35)] bg-[rgb(var(--panel))] overflow-hidden">
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 border-b border-l border-[rgb(var(--neon)/0.25)]" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <div className="font-[var(--font-ocr)] text-[10px] tracking-[0.3em] text-[rgb(var(--neon))] mb-2">
                    TRAINING MODULE // ACTIVE
                  </div>
                  <h2 className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--neon))] mb-2">
                    Mail Sort Academy
                  </h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed max-w-lg">
                    An unofficial study game built from inside the job. Practice mail classification, UBBM
                    decisions, carrier endorsements, and accountable handling. The real decisions you face
                    every dispatch, turned into a scored drill.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    { tag: "MODE-01", label: "Class Sort", note: "Rookie friendly" },
                    { tag: "MODE-02", label: "UBBM or Not", note: "Regular carrier" },
                    { tag: "MODE-03", label: "Endorsement Drill", note: "Regular carrier" },
                    { tag: "MODE-04", label: "Accountable Chain", note: "Inspection level" },
                    { tag: "MODE-05", label: "Route Case Simulation", note: "Mixed difficulty" },
                  ].map((m) => (
                    <div key={m.tag} className="flex items-baseline gap-2">
                      <span className="font-[var(--font-ocr)] text-[9px] text-[rgb(var(--neon)/0.4)] shrink-0">
                        {m.tag}
                      </span>
                      <span className="text-xs text-[rgb(var(--text-color))]">{m.label}</span>
                      <span className="text-[10px] text-[rgb(var(--text-meta))] ml-auto hidden sm:block">
                        {m.note}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    href="/mail-sort-academy"
                    className="glitch-button glitch-button--primary inline-flex items-center gap-2"
                  >
                    Launch Training
                    <span className="font-[var(--font-ocr)] text-[10px] tracking-widest opacity-70">▶</span>
                  </Link>
                </div>
              </div>

              {/* Right badge column */}
              <div className="sm:shrink-0 flex sm:flex-col gap-3 sm:gap-2 flex-wrap">
                {[
                  { value: "5", label: "TRAINING MODES" },
                  { value: "7", label: "STUDY RULES" },
                  { value: "∞", label: "SCORED DRILLS" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="border border-[rgb(var(--neon)/0.2)] px-4 py-3 text-center min-w-[90px]"
                  >
                    <div className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--neon))]">
                      {stat.value}
                    </div>
                    <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))] mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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
              { signal: "Public / Private", title: "Hard data boundary", explanation: "Only published entries and aggregate KPIs appear here; private notes never leave the logging tool" },
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
            <Link href="/mail-sort-academy" className="glitch-button glitch-button--primary">
              Mail Sort Academy
            </Link>
            <Link href="/projects" className="glitch-button">
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

        {/* private access - not the security mechanism */}
        <div className="text-center py-2">
          <Link
            href="/log"
            aria-label="Carrier daybook"
            className="text-[rgb(var(--text-meta)/0.18)] hover:text-[rgb(var(--text-meta)/0.45)] text-[10px] font-[var(--font-ocr)] tracking-widest transition-colors"
          >
            λ
          </Link>
        </div>

      </div>
    </div>
  );
}
