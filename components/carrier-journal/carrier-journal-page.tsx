import Link from "next/link";
import {
  getCarrierDispatches,
  getCarrierKpis,
  computeTotalsFromDispatches,
  totalsToKpis,
  type CarrierDispatch,
} from "@/lib/data/carrier-journal";
import { CarrierKpiCard } from "./carrier-kpi-card";
import { CarrierDispatchCard } from "./carrier-dispatch-card";

const TRACKING_ITEMS = [
  { category: "Physical load", detail: "Miles walked, steps, soreness, recovery signals" },
  { category: "Environmental load", detail: "Heat index, rain, snow, storms" },
  { category: "Operational load", detail: "Perceived mail volume, route difficulty, breaks taken" },
  { category: "Safety signals", detail: "Hydration discipline, heat risk, dog encounters" },
  { category: "Public narrative", detail: "Sanitized field reflections only — no addresses, names, or route data" },
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
};

export function CarrierJournalPage({ dispatches: notionDispatches }: Props = {}) {
  const dispatches = notionDispatches ?? getCarrierDispatches();
  // Recompute KPIs from whatever dispatch set we're using
  const kpis =
    notionDispatches && notionDispatches.length > 0
      ? totalsToKpis(computeTotalsFromDispatches(notionDispatches))
      : getCarrierKpis();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">

        {/* Hero */}
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            FIELD LOG // MAILWALKER
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))] mb-4">
            Carrier Journal
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm sm:text-base max-w-3xl leading-relaxed">
            A public-safe field journal from life as a city mail carrier: miles, steps, weather, soreness, morale,
            workload, and the operational lessons hiding inside a walking route.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="surface-panel p-5 sm:p-6 border-[rgb(var(--border)/0.3)]">
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-2">
            NOTICE // UNOFFICIAL PERSONAL JOURNAL
          </div>
          <p className="text-xs text-[rgb(var(--text-meta))] leading-relaxed">
            Carrier Journal is an unofficial personal field log. It is not affiliated with, endorsed by, or
            representative of the United States Postal Service or any other organization. Entries deliberately omit
            addresses, route numbers, customer names, coworker names, scanner data, and official mail volume figures.
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
                  <span className="text-[rgb(var(--text-secondary))]"> — {item.detail}</span>
                </div>
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

        {/* Why This Belongs Here */}
        <div className="surface-panel p-6 sm:p-8">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--neon))] mb-2">
            OPERATOR REFLECTION
          </div>
          <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-4">
            Why this belongs on a developer portfolio
          </h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-5 max-w-3xl leading-relaxed">
            This is not just a journal. It is a live business-systems artifact: a data pipeline from physical experience
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
            Carrier Journal is one proof of the approach. The project catalog and codex have the rest.
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
