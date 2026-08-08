import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";
import { splitPublicNoteParagraphs } from "@/lib/data/carrier-note-formatting";
import { deriveWeatherSignals } from "@/lib/carrier-journal/weather-signals";

const WEATHER_FLAG_LABEL: Record<"heat" | "rain" | "storm" | "snow", string> = {
  heat: "HEAT",
  rain: "RAIN",
  storm: "STORM",
  snow: "SNOW",
};

type Props = {
  dispatch: PublicFieldDispatch;
};

export function CarrierDispatchCard({ dispatch: d }: Props) {
  const weather = deriveWeatherSignals(d);
  const weatherFlags = (["heat", "rain", "storm", "snow"] as const).filter((key) => weather[key]);

  const chips: string[] = [
    `${d.milesWalked} MI`,
    `ENERGY ${d.energy}`,
    `LOAD ${d.soreness}`,
    `MORALE ${d.mood}`,
  ];
  if (d.temperatureF !== undefined) chips.push(`${d.temperatureF}°F`);
  if (d.waterOz !== undefined) {
    const goal = d.hydrationGoalOz;
    chips.push(goal ? `${d.waterOz}/${goal} OZ` : `${d.waterOz} OZ`);
  }
  for (const key of weatherFlags) {
    chips.push(WEATHER_FLAG_LABEL[key]);
  }

  return (
    <article id={d.id} className="border-b border-[rgb(var(--border)/0.2)] py-6 sm:py-8 scroll-mt-28 first:pt-0">
      <time
        dateTime={d.date}
        className="font-[var(--font-ocr)] text-[10px] tracking-[0.22em] text-[rgb(var(--neon))]"
      >
        {d.date.replace(/-/g, ".")}
      </time>
      {d.title ? (
        <h3 className="mt-2 font-[var(--font-ibm)] text-lg sm:text-xl text-[rgb(var(--text-color))] leading-snug">
          {d.title}
        </h3>
      ) : null}

      {d.publicNote.trim() && (
        <div className="mt-4 space-y-3 max-w-3xl">
          {splitPublicNoteParagraphs(d.publicNote).map((paragraph, index) => (
            <p
              key={index}
              className="text-sm sm:text-base text-[rgb(var(--text-color))] leading-relaxed whitespace-pre-line"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))] border border-[rgb(var(--border)/0.35)] px-2 py-1"
          >
            {chip}
          </span>
        ))}
      </div>
    </article>
  );
}
