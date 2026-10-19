"use client";

import { useMemo, useState } from "react";
import { deriveWeatherSignals } from "@/lib/carrier-journal/weather-signals";
import { formatMiles, formatWalkDate } from "@/lib/data/carrier-distance";
import { isWalkingMileage } from "@/lib/data/carrier-measurements";
import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";
import { splitPublicNoteParagraphs } from "@/lib/data/carrier-note-formatting";

const PAGE_SIZE = 8;

type Props = {
  dispatches: PublicFieldDispatch[];
};

function noteworthyWeather(dispatch: PublicFieldDispatch): string | null {
  const signals = deriveWeatherSignals(dispatch);
  const parts: string[] = [];
  if (signals.heat) parts.push("Hot");
  if (signals.rain) parts.push("Rain");
  if (signals.storm) parts.push("Storm");
  if (signals.snow) parts.push("Snow");
  if (
    parts.length === 0 &&
    dispatch.temperatureF !== undefined &&
    (dispatch.temperatureF >= 85 || dispatch.temperatureF <= 40)
  ) {
    parts.push(`${Math.round(dispatch.temperatureF)}°F`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[rgb(var(--border)/0.15)] py-2">
      <dt className="font-[var(--font-ocr)] text-[10px] tracking-[0.16em] text-[rgb(var(--text-meta))] uppercase">
        {label}
      </dt>
      <dd className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color))] text-right">
        {value}
      </dd>
    </div>
  );
}

export function RecentWalks({ dispatches }: Props) {
  const walks = useMemo(
    () =>
      [...dispatches]
        .filter((dispatch) => isWalkingMileage(dispatch.milesWalked))
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [dispatches]
  );
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selectedDate, setSelectedDate] = useState<string | null>(walks[0]?.date ?? null);
  const shown = walks.slice(0, visible);
  const selected = walks.find((walk) => walk.date === selectedDate) ?? walks[0] ?? null;

  return (
    <section id="field-dispatches" aria-labelledby="recent-walks-heading" className="space-y-4">
      <div>
        <h2 id="recent-walks-heading" className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]">
          Recent walks
        </h2>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          Days with miles recorded. Days without an entry are not listed.
        </p>
      </div>

      {walks.length === 0 ? (
        <p className="text-sm text-[rgb(var(--text-secondary))]">No walking days recorded yet.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <ul className="border border-[rgb(var(--border)/0.25)] divide-y divide-[rgb(var(--border)/0.15)]">
            {shown.map((walk, index) => {
              const weather = noteworthyWeather(walk);
              const hasNote = walk.publicNote.trim().length > 0;
              const selectedRow = walk.date === selected?.date;
              return (
                <li id={walk.id} key={`${walk.date}-${index}`}>
                  <button
                    type="button"
                    aria-pressed={selectedRow}
                    onClick={() => setSelectedDate(walk.date)}
                    className={`flex w-full items-baseline justify-between gap-3 px-3 py-3 text-left min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[rgb(var(--neon))] ${
                      selectedRow ? "bg-[rgb(var(--neon)/0.06)]" : "hover:bg-[rgb(var(--panel))]"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color))]">
                        <time dateTime={walk.date}>{formatWalkDate(walk.date)}</time>
                      </span>
                      {weather || hasNote ? (
                        <span className="mt-1 flex flex-wrap gap-x-2 font-[var(--font-ocr)] text-[10px] tracking-wide text-[rgb(var(--text-meta))]">
                          {weather ? <span>{weather}</span> : null}
                          {hasNote ? <span>Note</span> : null}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-[var(--font-ibm)] text-sm tabular-nums text-[rgb(var(--text-color))]">
                      {formatMiles(walk.milesWalked ?? 0)} mi
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected ? <WalkDetail walk={selected} /> : null}

          {visible < walks.length ? (
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
                className="min-h-11 border border-[rgb(var(--border)/0.4)] px-4 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] uppercase text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--neon)/0.5)] hover:text-[rgb(var(--neon))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))]"
              >
                Show older walks
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function WalkDetail({ walk }: { walk: PublicFieldDispatch }) {
  const weatherBits = [
    walk.temperatureF !== undefined ? `${Math.round(walk.temperatureF)}°F` : null,
    walk.heatIndexF !== undefined ? `heat index ${Math.round(walk.heatIndexF)}°F` : null,
    walk.rain ? "rain on the route" : null,
    walk.snow ? "snow" : null,
    walk.storm ? "storm" : null,
  ].filter((bit): bit is string => Boolean(bit));
  const note = walk.publicNote.trim();

  return (
    <article className="border border-[rgb(var(--border)/0.25)] bg-[rgb(var(--panel))] p-4">
      <h3 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))]">
        <time dateTime={walk.date}>{formatWalkDate(walk.date)}</time>
      </h3>
      <dl className="mt-2">
        {walk.milesWalked !== undefined ? (
          <DetailRow label="Miles" value={`${formatMiles(walk.milesWalked)} mi`} />
        ) : null}
        {weatherBits.length > 0 ? <DetailRow label="Weather" value={weatherBits.join(" · ")} /> : null}
        {walk.energy !== undefined ? <DetailRow label="Energy" value={`${walk.energy} / 10`} /> : null}
        {walk.mood !== undefined ? <DetailRow label="Mood" value={`${walk.mood} / 10`} /> : null}
      </dl>
      {note ? (
        <div className="mt-4 space-y-2">
          <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.16em] text-[rgb(var(--text-meta))]">
            NOTE
          </p>
          {splitPublicNoteParagraphs(note).map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-[rgb(var(--text-color))] whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </article>
  );
}
