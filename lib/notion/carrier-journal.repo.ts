// Carrier Journal DB (NOTION_CARRIER_JOURNAL_DB_ID).
// Only pages with Publish Public = true are ever returned — Private Note is never read.
import { unstable_cache } from "next/cache";
import type { PageObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotion } from "./client";
import { paginate } from "./paginate";
import type { CarrierDispatch, MailLoad } from "@/lib/data/carrier-journal";

const CACHE_REVALIDATE = 300; // 5 minutes

function getDbId(): string | null {
  const raw = (process.env.NOTION_CARRIER_JOURNAL_DB_ID ?? "")
    .trim()
    .replace(/^[\s'"`]+|[\s'"`]+$/g, "");
  if (!raw) return null;
  const clean = raw.replace(/-/g, "");
  if (clean.length < 32) return null;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

function isConfigured(): boolean {
  return !!(getDbId() && (process.env.NOTION_API_KEY ?? "").trim());
}

function logError(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[carrier-journal] ${context}:`, message);
}

type Props = Record<string, unknown>;

function str(prop: Props | undefined, key: "title" | "rich_text"): string {
  if (!prop) return "";
  const arr = prop[key] as { plain_text?: string }[] | undefined;
  return arr?.[0]?.plain_text ?? "";
}

function num(prop: Props | undefined): number | undefined {
  if (!prop) return undefined;
  const v = prop.number;
  return typeof v === "number" ? v : undefined;
}

function check(prop: Props | undefined): boolean {
  if (!prop) return false;
  return prop.checkbox === true;
}

function sel(prop: Props | undefined): string {
  if (!prop) return "";
  return (prop.select as { name?: string } | null)?.name ?? "";
}

function dateStr(prop: Props | undefined): string {
  if (!prop) return "";
  const start = (prop.date as { start?: string } | null)?.start ?? "";
  return start.slice(0, 10);
}

function formatPage(page: PageObjectResponse): CarrierDispatch | null {
  const p = page.properties as Record<string, unknown>;

  const title = str(p.Title as Props, "title");
  const date = dateStr(p.Date as Props);
  if (!title || !date) return null;

  const milesWalked = num(p["Miles Walked"] as Props) ?? 0;
  const steps = num(p.Steps as Props) ?? 0;
  const soreness = num(p["Soreness (1-10)"] as Props) ?? num(p.Soreness as Props) ?? 5;
  const energy = num(p["Energy (1-10)"] as Props) ?? num(p.Energy as Props) ?? 5;
  const mood = num(p["Mood (1-10)"] as Props) ?? num(p.Mood as Props) ?? 5;
  const weather = str(p.Weather as Props, "rich_text") || "Unknown";
  const temperatureF = num(p["Temperature F"] as Props);
  const heatIndexF = num(p["Heat Index F"] as Props);
  const rawLoad = sel(p["Mail Load"] as Props).toLowerCase();
  const mailLoad: MailLoad =
    rawLoad === "light" || rawLoad === "normal" || rawLoad === "heavy" || rawLoad === "brutal"
      ? (rawLoad as MailLoad)
      : "normal";
  const heatDay = check(p["Heat Day"] as Props);
  const rain = check(p.Rain as Props);
  const storm = check(p.Storm as Props);
  const snow = check(p.Snow as Props);
  const dogEncounter = check(p["Dog Encounter"] as Props);
  const publicNote = str(p["Public Note"] as Props, "rich_text");

  return {
    id: `cj-${page.id.replace(/-/g, "").slice(0, 8)}`,
    date,
    title,
    milesWalked,
    steps,
    soreness,
    energy,
    mood,
    weather,
    ...(temperatureF !== undefined && { temperatureF }),
    ...(heatIndexF !== undefined && { heatIndexF }),
    mailLoad,
    ...(heatDay && { heatDay }),
    ...(rain && { rain }),
    ...(storm && { storm }),
    ...(snow && { snow }),
    ...(dogEncounter && { dogEncounter }),
    publicNote,
  };
}

type QueryPage = PageObjectResponse | PartialPageObjectResponse;

async function fetchDispatchesUncached(): Promise<CarrierDispatch[]> {
  const dbId = getDbId();
  if (!dbId || !(process.env.NOTION_API_KEY ?? "").trim()) return [];

  try {
    const pages = await paginate<QueryPage>((cursor) =>
      getNotion().databases.query({
        database_id: dbId,
        filter: {
          property: "Publish Public",
          checkbox: { equals: true },
        },
        sorts: [{ property: "Date", direction: "descending" }],
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      })
    );

    return (pages as PageObjectResponse[])
      .filter((page) => page && typeof page === "object" && "properties" in page)
      .map(formatPage)
      .filter((d): d is CarrierDispatch => d !== null);
  } catch (err) {
    logError("fetchDispatches", err);
    return [];
  }
}

export async function fetchCarrierDispatches(): Promise<CarrierDispatch[]> {
  if (!isConfigured()) return [];
  return unstable_cache(
    async () => fetchDispatchesUncached(),
    ["notion-carrier-journal-dispatches"],
    { revalidate: CACHE_REVALIDATE, tags: ["notion-carrier-journal"] }
  )();
}

export function isCarrierJournalConfigured(): boolean {
  return isConfigured();
}
