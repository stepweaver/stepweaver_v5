import type { CarrierDispatch, MailLoadTier } from "@/lib/data/carrier-journal";
import { splitPublicNoteParagraphs } from "@/lib/data/carrier-note-formatting";
import { deriveWeatherSignals } from "@/lib/carrier-journal/weather-signals";
import { formatPublicMailLoadLine } from "@/lib/carrier-journal/mail-load";
import { formatPrivateDpsLine, formatPublicDpsLoadLine } from "@/lib/dps";

const MAIL_LOAD_LABEL: Record<MailLoadTier, string> = {
  light: "LIGHT",
  medium: "MEDIUM",
  heavy: "HEAVY",
};

const MAIL_LOAD_COLOR: Record<MailLoadTier, string> = {
  light: "rgb(var(--green))",
  medium: "rgb(var(--text-secondary))",
  heavy: "rgb(var(--warn))",
};

const WEATHER_FLAG_LABEL: Record<"heat" | "rain" | "storm" | "snow", string> = {
  heat: "HEAT",
  rain: "RAIN",
  storm: "STORM",
  snow: "SNOW",
};

type Props = {
  dispatch: CarrierDispatch;
  /** Show private DPS line with count and ratio. Default false for public feed. */
  showPrivateDps?: boolean;
};

export function CarrierDispatchCard({ dispatch: d, showPrivateDps = false }: Props) {
  const weather = deriveWeatherSignals(d);
  const weatherFlags = (["heat", "rain", "storm", "snow"] as const).filter((key) => weather[key]);

  const chips: { label: string; color?: string }[] = [];
  if (d.waterOz !== undefined) {
    const goal = d.hydrationGoalOz;
    chips.push({
      label: goal ? `${d.waterOz}/${goal} OZ` : `${d.waterOz} OZ`,
      color: goal && d.waterOz >= goal ? "rgb(var(--green))" : "rgb(var(--neon))",
    });
  }

  const privateDpsLine = showPrivateDps
    ? formatPrivateDpsLine({
        dpsCount: d.dpsCount,
        dpsRatio: d.dpsRatio,
      })
    : null;
  const publicDpsLine = formatPublicDpsLoadLine(d.dpsRatio);
  const publicMailLine = formatPublicMailLoadLine({
    tier: d.mailLoadTier,
    compositeRatio: d.mailLoadCompositeRatio,
  });
  const publicLoadLine = publicMailLine ?? publicDpsLine;

  return (
    <div id={d.id} className="surface-panel p-5 sm:p-6 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-1">
            {d.date}
          </div>
          <h3 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] leading-snug">
            {d.title}
          </h3>
        </div>
        {d.mailLoadTier && (
          <div
            className="font-[var(--font-ocr)] text-xs tracking-widest px-2 py-1 border shrink-0"
            style={{
              color: MAIL_LOAD_COLOR[d.mailLoadTier],
              borderColor: MAIL_LOAD_COLOR[d.mailLoadTier],
            }}
          >
            {MAIL_LOAD_LABEL[d.mailLoadTier]}
          </div>
        )}
      </div>

      {d.publicNote.trim() && (
        <div className="border-l-2 border-[rgb(var(--neon)/0.4)] pl-3 space-y-3">
          {splitPublicNoteParagraphs(d.publicNote).map((paragraph, index) => (
            <p
              key={index}
              className="text-sm text-[rgb(var(--text-color))] leading-relaxed whitespace-pre-line"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {(privateDpsLine || (!showPrivateDps && publicLoadLine)) && (
        <div className="text-xs text-[rgb(var(--text-secondary))] space-y-1">
          {privateDpsLine && (
            <div className="font-[var(--font-ibm)] text-sm text-[rgb(var(--neon))]">
              {privateDpsLine}
            </div>
          )}
          {!showPrivateDps && publicLoadLine && (
            <div className="font-[var(--font-ocr)] tracking-wide text-[rgb(var(--text-meta))]">
              {publicLoadLine}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[rgb(var(--border)/0.12)]">
        {[
          { label: "MILES", value: `${d.milesWalked}` },
          { label: "SORENESS", value: `${d.soreness}/10` },
          { label: "ENERGY", value: `${d.energy}/10` },
          { label: "MOOD", value: `${d.mood}/10` },
        ].map((m) => (
          <div key={m.label} className="bg-[rgb(var(--panel))] px-3 py-2 text-center">
            <div className="font-[var(--font-ibm)] text-sm text-[rgb(var(--neon))]">{m.value}</div>
            <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mt-0.5">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--text-secondary))]">
        {d.temperatureF !== undefined && (
          <span className="font-[var(--font-ocr)] tracking-wide text-[rgb(var(--text-meta))]">
            {d.temperatureF}°F
            {d.heatIndexF ? ` (feels ${d.heatIndexF}°F)` : ""}
          </span>
        )}
        {weatherFlags.map((key) => (
          <span
            key={key}
            className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--warn))] border border-[rgb(var(--warn)/0.4)] px-1.5 py-0.5"
          >
            {WEATHER_FLAG_LABEL[key]}
          </span>
        ))}
        {chips.map((chip) => (
          <span
            key={chip.label}
            className="font-[var(--font-ocr)] text-[9px] tracking-widest border px-1.5 py-0.5"
            style={{
              color: chip.color ?? "rgb(var(--text-secondary))",
              borderColor: chip.color ?? "rgb(var(--border)/0.4)",
            }}
          >
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}
