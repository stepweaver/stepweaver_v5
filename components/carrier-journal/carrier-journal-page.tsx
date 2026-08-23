import Link from "next/link";
import {
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
import { SystemsCheck } from "./systems-check";
import { WalkingProtocol } from "./walking-protocol";
import { FootwearActiveLoadoutCard } from "@/components/footwear/footwear-active-loadout-card";
import type { ShoeDerivedSummary } from "@/lib/footwear/queries";

const SECTION_NAV = [
  { id: "body-telemetry", label: "TELEMETRY" },
  { id: "distance-qualification", label: "DISTANCE" },
  { id: "active-loadout", label: "LOADOUT" },
  { id: "field-log", label: "FIELD LOG" },
  { id: "systems-check", label: "SYSTEMS" },
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
            <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))] mb-3">
              A Human Performance Log
            </h1>
            <p className="text-[rgb(var(--text-secondary))] text-sm sm:text-base max-w-3xl leading-relaxed">
              Miles, environmental load, hydration, recovery, body mechanics, equipment wear,
              and the accumulated effects of putting a human frame through high-mileage walking
              days.
            </p>
          </div>
          <div className="lg:shrink-0">
            <CarrierProfileCard />
          </div>
        </div>

        <FieldSectionNav />

        <div id="body-telemetry" className="scroll-mt-28 space-y-4">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
            BODY TELEMETRY // CURRENT RECORD
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
            {kpis.map((kpi, i) => (
              <CarrierKpiCard key={kpi.systemLabel} kpi={kpi} index={i} />
            ))}
          </div>
        </div>

        <div id="operational-log" className="scroll-mt-28">
          <CarrierFieldCalendar dispatches={dispatches} />
        </div>

        <div id="distance-qualification" className="scroll-mt-28">
          <CarrierMilestonePanel dispatches={dispatches} />
        </div>

        <div id="active-loadout" className="scroll-mt-28">
          {footwearActive ? (
            <FootwearActiveLoadoutCard summary={footwearActive} />
          ) : (
            <div className="border border-[rgb(var(--neon)/0.2)] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))] mb-1">
                  EQUIPMENT ROSTER // FOOTWEAR
                </p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Walking platforms under field testing. Brands, odometers, serviceability, and
                  field notes.
                </p>
              </div>
              <Link
                href="/field-journal/footwear"
                className="inline-flex shrink-0 border border-[rgb(var(--neon)/0.4)] px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)]"
              >
                OPEN EQUIPMENT ROSTER
              </Link>
            </div>
          )}
        </div>

        <div id="field-log" className="scroll-mt-28">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest mb-4">
            FIELD LOG // RECENT TRANSMISSIONS
          </div>
          {feedDispatches.length > 0 ? (
            <CarrierDispatchFeed dispatches={feedDispatches} />
          ) : (
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              No published notes yet. Logged carrier days publish to Field Journal automatically.
            </p>
          )}
        </div>

        <SystemsCheck />

        <WalkingProtocol />

        {footwearActive ? (
          <div className="border border-[rgb(var(--neon)/0.2)] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))] mb-1">
                EQUIPMENT ROSTER
              </p>
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Full footwear ledger: retired units, inspection path, and field notes.
              </p>
            </div>
            <Link
              href="/field-journal/footwear"
              className="inline-flex shrink-0 border border-[rgb(var(--neon)/0.4)] px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)]"
            >
              ENTER ROSTER
            </Link>
          </div>
        ) : null}

        <div className="surface-panel p-6 sm:p-8 text-center">
          <div className="font-[var(--font-ocr)] text-xs tracking-widest text-[rgb(var(--text-label))] mb-3">
            CONTINUE EXPLORING
          </div>
          <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-2">
            More systems. More artifacts.
          </h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-6 max-w-xl mx-auto">
            Field Journal is one live system on the board. The catalog and codex have the rest.
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
