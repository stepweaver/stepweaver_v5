"use client";

import { useState, useMemo } from "react";
import type { CarrierDispatch } from "@/lib/data/carrier-journal";
import {
  buildCalendarGrid,
  getCalendarIntensity,
  formatCalendarDate,
  formatCalendarWeekday,
  type DaySummary,
} from "@/lib/data/carrier-calendar";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

// Intensity fill classes: index 0–4
const INTENSITY_STYLE: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-[rgb(var(--window)/0.4)] border border-[rgb(var(--border)/0.15)]",
  1: "bg-[rgb(var(--neon)/0.18)]",
  2: "bg-[rgb(var(--neon)/0.38)]",
  3: "bg-[rgb(var(--neon)/0.62)]",
  4: "bg-[rgb(var(--neon)/0.88)] shadow-[0_0_4px_rgb(var(--neon)/0.4)]",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function WeatherPips({ day }: { day: DaySummary }) {
  const pips: { color: string; title: string }[] = [];

  if (day.storm) pips.push({ color: "rgb(var(--purple))", title: "Storm" });
  else if (day.rain) pips.push({ color: "rgb(var(--cyan))", title: "Rain" });
  if (day.snow) pips.push({ color: "rgb(200,230,255)", title: "Snow" });
  if (day.heat90) pips.push({ color: "rgb(var(--danger))", title: "Heat 90°F+" });
  else if (day.heat80) pips.push({ color: "rgb(var(--warn))", title: "Heat 80°F+" });
  if (day.belowZero) pips.push({ color: "rgb(180,220,255)", title: "Below 0°F" });
  else if (day.freezing) pips.push({ color: "rgb(var(--blue))", title: "Freezing" });
  if (day.dogEncounter) pips.push({ color: "rgb(var(--yellow))", title: "Dog encounter" });

  if (pips.length === 0) return null;

  return (
    <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-px pointer-events-none">
      {pips.slice(0, 3).map((p) => (
        <span
          key={p.title}
          title={p.title}
          className="block w-[3px] h-[3px] rounded-full shrink-0"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

function DayCell({
  day,
  isSelected,
  isFuture,
  onClick,
}: {
  day: DaySummary;
  isSelected: boolean;
  isFuture: boolean;
  onClick: (_day: DaySummary) => void;
}) {
  const intensity = getCalendarIntensity(day);
  const base = INTENSITY_STYLE[intensity];

  return (
    <button
      type="button"
      onClick={() => onClick(day)}
      aria-label={`${formatCalendarDate(day.date)}${day.hasDispatch ? `, ${day.totalMiles} mi` : ", no log"}`}
      aria-pressed={isSelected}
      className={[
        "relative w-[14px] h-[14px] sm:w-[15px] sm:h-[15px] flex-shrink-0",
        base,
        isFuture && !day.hasDispatch ? "opacity-20" : "",
        isSelected ? "ring-1 ring-[rgb(var(--neon))] ring-offset-1 ring-offset-[rgb(var(--bg))]" : "",
        day.hasDispatch ? "cursor-pointer hover:ring-1 hover:ring-[rgb(var(--neon)/0.5)]" : "cursor-default",
        "transition-[box-shadow]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <WeatherPips day={day} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Month label row above the week columns
// ---------------------------------------------------------------------------

function MonthLabels({ weeks }: { weeks: DaySummary[][] }) {
  // Find which column is the first of each new month
  const labels: { colIndex: number; label: string }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, ci) => {
    const firstOfWeekMonth = new Date(week[0].date + "T00:00:00").getMonth();
    if (firstOfWeekMonth !== lastMonth) {
      labels.push({ colIndex: ci, label: MONTH_NAMES[firstOfWeekMonth] });
      lastMonth = firstOfWeekMonth;
    }
  });

  return (
    <div className="relative h-4 flex items-end mb-1">
      {labels.map(({ colIndex, label }) => (
        <span
          key={`${label}-${colIndex}`}
          className="absolute font-[var(--font-ocr)] text-[9px] tracking-wider text-[rgb(var(--text-meta))]"
          style={{ left: `${colIndex * 17}px` }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Selected day detail panel
// ---------------------------------------------------------------------------

function SelectedDayPanel({ day, onClose }: { day: DaySummary; onClose: () => void }) {
  const conditionChips: { label: string; color: string }[] = [];
  if (day.storm) conditionChips.push({ label: "STORM", color: "rgb(var(--purple))" });
  else if (day.rain) conditionChips.push({ label: "RAIN", color: "rgb(var(--cyan))" });
  if (day.snow) conditionChips.push({ label: "SNOW", color: "rgb(200,230,255)" });
  if (day.heat90) conditionChips.push({ label: "HEAT 90°+", color: "rgb(var(--danger))" });
  else if (day.heat80) conditionChips.push({ label: "HEAT 80°+", color: "rgb(var(--warn))" });
  if (day.freezing) conditionChips.push({ label: "FREEZING", color: "rgb(var(--cyan))" });
  if (day.belowZero) conditionChips.push({ label: "BELOW 0°", color: "rgb(180,220,255)" });
  if (day.dogEncounter) conditionChips.push({ label: "DOG", color: "rgb(var(--yellow))" });
  if (day.heavyLoad) conditionChips.push({ label: "HEAVY LOAD", color: "rgb(var(--warn))" });
  if (day.hydrationGoalMet) conditionChips.push({ label: "HYDRATION ✓", color: "rgb(var(--neon))" });

  return (
    <div className="mt-4 border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--panel))] p-4 relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] hover:text-[rgb(var(--neon))] transition-colors"
        aria-label="Close day detail"
      >
        ✕
      </button>

      <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-1">
        {`${formatCalendarWeekday(day.date).toUpperCase()} // LOGGED DAY`}
      </div>
      <div className="font-[var(--font-ibm)] text-base text-[rgb(var(--text-color))] mb-3">
        {formatCalendarDate(day.date)}
      </div>

      {day.hasDispatch ? (
        <>
          {/* KPIs */}
          <div className="flex flex-wrap gap-4 mb-3">
            <div>
              <div className="font-[var(--font-ibm)] text-lg text-[rgb(var(--neon))]">
                {day.totalMiles} mi
              </div>
              <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))]">
                MILES
              </div>
            </div>
          </div>

          {/* Conditions */}
          {conditionChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] self-center mr-1">
                CONDITIONS
              </span>
              {conditionChips.map((chip) => (
                <span
                  key={chip.label}
                  className="font-[var(--font-ocr)] text-[9px] tracking-widest border px-1.5 py-0.5"
                  style={{ color: chip.color, borderColor: chip.color }}
                >
                  {chip.label}
                </span>
              ))}
            </div>
          )}

          {/* Note excerpt */}
          {day.noteExcerpt && (
            <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed mb-3 border-l-2 border-[rgb(var(--neon)/0.3)] pl-2">
              {day.noteExcerpt}
              {day.noteExcerpt.length >= 120 && "…"}
            </p>
          )}

          {/* Dispatch links */}
          {day.dispatchIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {day.dispatchIds.map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--neon)/0.7)] border border-[rgb(var(--neon)/0.25)] px-2 py-1 hover:border-[rgb(var(--neon)/0.6)] hover:text-[rgb(var(--neon))] transition-colors"
                >
                  ↓ VIEW DISPATCH
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-[rgb(var(--text-meta))] italic">No logged field day on this date.</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

function CalendarLegend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
      {/* Intensity scale */}
      <div className="flex items-center gap-1">
        <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mr-1">
          MILES
        </span>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <span
            key={level}
            className={`block w-[12px] h-[12px] shrink-0 ${INTENSITY_STYLE[level]}`}
            title={
              level === 0
                ? "No log"
                : level === 1
                  ? "< 7 mi"
                  : level === 2
                    ? "7–9 mi"
                    : level === 3
                      ? "9–11 mi"
                      : "11+ mi"
            }
          />
        ))}
        <span className="font-[var(--font-ocr)] text-[9px] text-[rgb(var(--text-meta))] ml-1">more</span>
      </div>

      {/* Event pips */}
      <div className="flex items-center gap-3">
        {[
          { color: "rgb(var(--cyan))", label: "Rain" },
          { color: "rgb(var(--purple))", label: "Storm" },
          { color: "rgb(200,230,255)", label: "Snow" },
          { color: "rgb(var(--warn))", label: "Heat" },
          { color: "rgb(var(--yellow))", label: "Dog" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span
              className="block w-[5px] h-[5px] rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="font-[var(--font-ocr)] text-[9px] text-[rgb(var(--text-meta))]">
              {label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Props = {
  dispatches: CarrierDispatch[];
};

export function CarrierFieldCalendar({ dispatches }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { weeks } = useMemo(() => buildCalendarGrid(dispatches), [dispatches]);

  const todayKey = useMemo(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const selectedDay = useMemo(() => {
    if (!selectedDate) return null;
    for (const week of weeks) {
      const found = week.find((d) => d.date === selectedDate);
      if (found) return found;
    }
    return null;
  }, [selectedDate, weeks]);

  function handleDayClick(day: DaySummary) {
    setSelectedDate((prev) => (prev === day.date ? null : day.date));
  }

  const totalLogged = dispatches.length;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
          FIELD CALENDAR
        </div>
        {totalLogged > 0 && (
          <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))]">
            {totalLogged} LOGGED DAY{totalLogged !== 1 ? "S" : ""}
          </div>
        )}
      </div>
      <p className="font-[var(--font-ocr)] text-[10px] tracking-wide text-[rgb(var(--text-label))] mb-4">
        Logged field days, miles, weather, and route experience.
      </p>

      <div className="surface-panel p-4 sm:p-5">
        {/* Scrollable heatmap */}
        <div className="overflow-x-auto pb-1">
          <div className="inline-block min-w-max">
            {/* Month row */}
            <MonthLabels weeks={weeks} />

            {/* Grid: DOW labels + week columns */}
            <div className="flex gap-[2px]">
              {/* Day-of-week labels column */}
              <div className="flex flex-col gap-[2px] mr-1">
                {DOW_LABELS.map((label, i) => (
                  <span
                    key={i}
                    className="font-[var(--font-ocr)] text-[9px] text-[rgb(var(--text-meta))] w-[14px] sm:w-[15px] h-[14px] sm:h-[15px] flex items-center justify-center shrink-0"
                  >
                    {/* Only show S, T, S to avoid clutter */}
                    {i === 0 || i === 2 || i === 4 || i === 6 ? label : ""}
                  </span>
                ))}
              </div>

              {/* Week columns */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {week.map((day) => (
                    <DayCell
                      key={day.date}
                      day={day}
                      isSelected={selectedDate === day.date}
                      isFuture={day.date > todayKey}
                      onClick={handleDayClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <CalendarLegend />

        {/* Selected day panel */}
        {selectedDay && (
          <SelectedDayPanel
            day={selectedDay}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    </div>
  );
}
