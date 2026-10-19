// Field Journal Notion DB (NOTION_CARRIER_JOURNAL_DB_ID).
// Public reads only return pages with Publish Public = true; Private Note is never read.
// formatPage may still hydrate private daybook fields for server-side aggregates;
// toPublicFieldDispatch must run before any payload reaches a client component.
import { revalidateTag, unstable_cache } from "next/cache";
import type { PageObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotion } from "./client";
import { paginate } from "./paginate";
import { publicCarrierDispatchId } from "./public-dispatch-id";
import {
  classifyDpsForEntry,
} from "@/lib/dps";
import {
  enrichDispatchesFields,
  type CarrierDispatch,
} from "@/lib/data/carrier-journal";
import type { CarrierDaybookInput, CarrierLogDpsInput } from "@/lib/validation/carrier-log.schema";
import {
  buildCarrierDaybookProperties,
  daybookDpsPerMile,
  mailDayContextToNotion,
} from "@/lib/carrier-journal/daybook-write";
import {
  classifyMailLoadForEntry,
  type MailLoadClassification,
} from "@/lib/carrier-journal/mail-load";

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
type RichTextFragment = { plain_text?: string };

function str(prop: Props | undefined, key: "title" | "rich_text"): string {
  if (!prop) return "";
  const arr = prop[key] as RichTextFragment[] | undefined;
  return arr?.map((fragment) => fragment.plain_text ?? "").join("") ?? "";
}

function num(prop: Props | undefined): number | undefined {
  if (!prop) return undefined;
  const v = prop.number;
  return typeof v === "number" ? v : undefined;
}

function bool(prop: Props | undefined): boolean | undefined {
  if (!prop) return undefined;
  const v = (prop as { checkbox?: unknown }).checkbox;
  return typeof v === "boolean" ? v : undefined;
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

function mailDayContextFromProp(prop: Props | undefined): string[] {
  const value = sel(prop);
  return value ? [value] : [];
}

function formatPage(page: PageObjectResponse): CarrierDispatch | null {
  const p = page.properties as Record<string, unknown>;

  const date = dateStr(p.Date as Props);
  if (!date) return null;
  const title = str(p.Title as Props, "title") || date;

  const milesWalked = num(p["Miles Walked"] as Props);
  const soreness = num(p["Soreness (1-10)"] as Props) ?? num(p.Soreness as Props);
  const energy = num(p["Energy (1-10)"] as Props) ?? num(p.Energy as Props);
  const mood = num(p["Mood (1-10)"] as Props) ?? num(p.Mood as Props);
  const temperatureF = num(p["Temperature F"] as Props);
  const heatIndexF = num(p["Heat Index F"] as Props);
  const avgHeatIndexF = num(p["Average Heat Index F"] as Props);
  const precipitationIn = num(p["Precipitation In"] as Props);
  const rain = bool(p.Rain as Props);
  const steppedInDogPoop = bool(p["Stepped In Dog Poop"] as Props);
  const publicNote = str(p["Public Note"] as Props, "rich_text");

  const waterOz = num(p["Water Oz"] as Props);
  const hydrationGoalOz = num(p["Hydration Goal Oz"] as Props);
  const weightLbs = num(p["Weight Lbs"] as Props);
  const movingMinutes = num(p["Moving Minutes"] as Props);
  const loadKg = num(p["Load Kg"] as Props);
  const gradePercent = num(p["Grade Percent"] as Props);
  const terrainFactor = num(p["Terrain Factor"] as Props);
  const dpsCount = num(p["DPS Count"] as Props);
  const dpsRatio = num(p["DPS Ratio"] as Props);
  const parcels = num(p.Parcels as Props);
  const mailDayContext = mailDayContextFromProp(p["Mail Day Context"] as Props);

  return {
    id: publicCarrierDispatchId(page.id),
    date,
    title,
    ...(milesWalked !== undefined && { milesWalked }),
    ...(soreness !== undefined && { soreness }),
    ...(energy !== undefined && { energy }),
    ...(mood !== undefined && { mood }),
    ...(temperatureF !== undefined && { temperatureF }),
    ...(heatIndexF !== undefined && { heatIndexF }),
    ...(avgHeatIndexF !== undefined && { avgHeatIndexF }),
    ...(precipitationIn !== undefined && { precipitationIn }),
    ...(rain !== undefined && { rain }),
    ...(steppedInDogPoop !== undefined && { steppedInDogPoop }),
    publicNote,
    ...(waterOz !== undefined && { waterOz }),
    ...(hydrationGoalOz !== undefined && { hydrationGoalOz }),
    ...(weightLbs !== undefined && { weightLbs }),
    ...(movingMinutes !== undefined && { movingMinutes }),
    ...(loadKg !== undefined && { loadKg }),
    ...(gradePercent !== undefined && { gradePercent }),
    ...(terrainFactor !== undefined && { terrainFactor }),
    ...(dpsCount !== undefined && { dpsCount }),
    ...(dpsRatio !== undefined && { dpsRatio }),
    ...(parcels !== undefined && { parcels }),
    ...(mailDayContext.length > 0 && { mailDayContext }),
  };
}

type QueryPage = PageObjectResponse | PartialPageObjectResponse;

async function queryDatabasePages(
  filter?: Parameters<ReturnType<typeof getNotion>["databases"]["query"]>[0]["filter"]
): Promise<PageObjectResponse[]> {
  const dbId = getDbId();
  if (!dbId || !(process.env.NOTION_API_KEY ?? "").trim()) return [];

  const pages = await paginate<QueryPage>((cursor) =>
    getNotion().databases.query({
      database_id: dbId,
      ...(filter ? { filter } : {}),
      sorts: [{ property: "Date", direction: "descending" }],
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    })
  );

  return (pages as PageObjectResponse[]).filter(
    (page) => page && typeof page === "object" && "properties" in page
  );
}

async function fetchDispatchesUncached(publicOnly = true): Promise<CarrierDispatch[]> {
  try {
    const filter = publicOnly
      ? {
          property: "Publish Public",
          checkbox: { equals: true },
        }
      : undefined;

    return (await queryDatabasePages(filter))
      .map(formatPage)
      .filter((d): d is CarrierDispatch => d !== null);
  } catch (err) {
    logError(publicOnly ? "fetchDispatches" : "fetchAllDispatches", err);
    return [];
  }
}

export async function fetchCarrierDispatches(): Promise<CarrierDispatch[]> {
  if (!isConfigured()) return [];
  return unstable_cache(
    async () => fetchDispatchesUncached(true),
    ["notion-carrier-journal-dispatches"],
    { revalidate: CACHE_REVALIDATE, tags: ["notion-carrier-journal"] }
  )();
}

export async function fetchAllCarrierDispatches(): Promise<CarrierDispatch[]> {
  if (!isConfigured()) return [];
  return fetchDispatchesUncached(false);
}

export type CarrierJournalLogStatus = {
  notionConfigured: boolean;
  logSecretConfigured: boolean;
};

export function getCarrierJournalLogStatus(): CarrierJournalLogStatus {
  return {
    notionConfigured: isConfigured(),
    logSecretConfigured: !!(process.env.CARRIER_JOURNAL_LOG_SECRET ?? "").trim(),
  };
}

export function isCarrierJournalLogEnabled(): boolean {
  const status = getCarrierJournalLogStatus();
  return status.notionConfigured && status.logSecretConfigured;
}

/** @deprecated Prefer session cookie auth via lib/carrier-journal/auth. */
export { verifyCarrierPassphrase as verifyCarrierLogSecret } from "@/lib/carrier-journal/auth";

async function findPageIdByDate(date: string): Promise<string | null> {
  const pages = await queryDatabasePages({
    property: "Date",
    date: { equals: date },
  });
  return pages[0]?.id ?? null;
}

function buildDpsNotionProperties(input: {
  dpsCount?: number;
  dpsRatio?: number | null;
  mailDayContext?: string[];
}): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  if (input.dpsCount !== undefined) {
    properties["DPS Count"] = { number: input.dpsCount };
    properties["DPS Ratio"] =
      input.dpsRatio != null ? { number: input.dpsRatio } : { number: null };
  } else {
    properties["DPS Count"] = { number: null };
    properties["DPS Ratio"] = { number: null };
  }

  if (input.mailDayContext !== undefined) {
    const mailDayContextProp = mailDayContextToNotion(input.mailDayContext);
    if (mailDayContextProp) Object.assign(properties, mailDayContextProp);
  }

  return properties;
}

export async function upsertCarrierLogDps(input: CarrierLogDpsInput): Promise<{
  pageId: string;
  classification: ReturnType<typeof classifyDpsForEntry>;
}> {
  const dbId = getDbId();
  if (!dbId) {
    throw new Error("Carrier journal database is not configured");
  }

  const allDispatches = await fetchAllCarrierDispatches();
  const existing = allDispatches.find((dispatch) => dispatch.date === input.date);

  const classification = classifyDpsForEntry(
    allDispatches.map((dispatch) => ({
      date: dispatch.date,
      id: dispatch.id,
      dpsCount: dispatch.dpsCount,
    })),
    {
      date: input.date,
      id: existing?.id,
      dpsCount: input.dpsCount,
    }
  );

  const properties = buildDpsNotionProperties({
    ...(input.dpsCount !== undefined && { dpsCount: input.dpsCount }),
    dpsRatio: classification.ratio,
    ...(input.mailDayContext !== undefined && { mailDayContext: input.mailDayContext }),
  });

  const notion = getNotion();
  const pageId = await findPageIdByDate(input.date);

  if (pageId) {
    await notion.pages.update({
      page_id: pageId,
      properties: properties as never,
    });
    revalidateTag("notion-carrier-journal");
    return { pageId, classification };
  }

  const created = await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Title: {
        title: [{ text: { content: input.date } }],
      },
      Date: {
        date: { start: input.date },
      },
      "Publish Public": {
        checkbox: false,
      },
      ...properties,
    } as never,
  });

  revalidateTag("notion-carrier-journal");
  return { pageId: created.id, classification };
}

export async function previewCarrierLogDps(input: {
  date: string;
  dpsCount?: number;
}): Promise<ReturnType<typeof classifyDpsForEntry>> {
  const allDispatches = await fetchAllCarrierDispatches();
  const existing = allDispatches.find((dispatch) => dispatch.date === input.date);

  return classifyDpsForEntry(
    allDispatches.map((dispatch) => ({
      date: dispatch.date,
      id: dispatch.id,
      dpsCount: dispatch.dpsCount,
    })),
    {
      date: input.date,
      id: existing?.id,
      dpsCount: input.dpsCount,
    }
  );
}

export function enrichFetchedDispatches(dispatches: CarrierDispatch[]): CarrierDispatch[] {
  return enrichDispatchesFields(dispatches);
}

export async function previewCarrierDaybookLoad(input: {
  date: string;
  dpsCount?: number;
  parcels?: number;
}): Promise<MailLoadClassification> {
  const allDispatches = await fetchAllCarrierDispatches();
  const existing = allDispatches.find((dispatch) => dispatch.date === input.date);

  const history = allDispatches.map((dispatch) => ({
    date: dispatch.date,
    id: dispatch.id,
    dpsCount: dispatch.dpsCount,
    parcels: dispatch.parcels,
  }));

  return classifyMailLoadForEntry(history, {
    date: input.date,
    id: existing?.id,
    dpsCount: input.dpsCount,
    parcels: input.parcels,
  });
}

/**
 * Returns the weight from the most recent Notion entry that has Weight Lbs set.
 * Used server-side to seed the Monday weigh-in system.
 * Uncached - only called on the protected /log page which is force-dynamic.
 */
export async function fetchLatestWeightLbs(): Promise<number | null> {
  if (!isConfigured()) return null;
  const dbId = getDbId();
  if (!dbId) return null;

  try {
    const response = await getNotion().databases.query({
      database_id: dbId,
      filter: {
        property: "Weight Lbs",
        number: { is_not_empty: true },
      },
      sorts: [{ property: "Date", direction: "descending" }],
      page_size: 1,
    });

    const page = response.results[0] as PageObjectResponse | undefined;
    if (!page || !("properties" in page)) return null;

    const p = page.properties as Record<string, unknown>;
    return num(p["Weight Lbs"] as Props) ?? null;
  } catch (err) {
    logError("fetchLatestWeightLbs", err);
    return null;
  }
}

export async function upsertCarrierDaybook(input: CarrierDaybookInput): Promise<{
  pageId: string;
  dpsPerMile: number | null;
}> {
  const dbId = getDbId();
  if (!dbId) {
    throw new Error("Carrier journal database is not configured");
  }

  const dpsPerMile = daybookDpsPerMile(input);
  const properties = buildCarrierDaybookProperties(input);

  const notion = getNotion();
  const pageId = await findPageIdByDate(input.date);

  if (pageId) {
    await notion.pages.update({
      page_id: pageId,
      properties: properties as never,
    });
    revalidateTag("notion-carrier-journal");
    return { pageId, dpsPerMile };
  }

  const created = await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Title: { title: [{ text: { content: input.date } }] },
      Date: { date: { start: input.date } },
      ...properties,
    } as never,
  });

  revalidateTag("notion-carrier-journal");
  return { pageId: created.id, dpsPerMile };
}
