import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import {
  enrichDispatchesFields,
  isDispatchFeedWorthy,
  type MailLoadTier,
} from "@/lib/data/carrier-journal";
import { deriveWeatherSignals } from "@/lib/carrier-journal/weather-signals";

export type HomeCarrierPreviewPayload = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  mailLoadTier?: MailLoadTier;
  weatherFlags: Array<"heat" | "rain" | "storm" | "snow">;
};

const EXCERPT_MAX = 220;

function excerptPublicNote(note: string): string {
  const compact = note.replace(/\s+/g, " ").trim();
  if (compact.length <= EXCERPT_MAX) return compact;
  const sliced = compact.slice(0, EXCERPT_MAX);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`;
}

/** Latest public feed-worthy Field Journal note for the homepage activity card. */
export async function getHomeCarrierPreview(): Promise<HomeCarrierPreviewPayload | null> {
  try {
    const raw = await fetchCarrierDispatches();
    if (raw.length === 0) return null;

    const enriched = enrichDispatchesFields(raw);
    const feed = enriched
      .filter(isDispatchFeedWorthy)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const latest = feed[0];
    if (!latest) return null;

    const weather = deriveWeatherSignals(latest);
    const weatherFlags = (["heat", "rain", "storm", "snow"] as const).filter(
      (key) => weather[key],
    );

    return {
      id: latest.id,
      date: latest.date,
      title: latest.title,
      excerpt: excerptPublicNote(latest.publicNote),
      mailLoadTier: latest.mailLoadTier,
      weatherFlags,
    };
  } catch {
    return null;
  }
}
