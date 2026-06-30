// Carrier's Log DB (NOTION_CARRIER_JOURNAL_DB_ID).
// Public reads only return pages with Publish Public = true; Private Note is never read.
import { revalidateTag, unstable_cache } from "next/cache";
import type { PageObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotion } from "./client";
import { paginate } from "./paginate";
import {
  classifyDpsForEntry,
} from "@/lib/dps";
import {
  enrichDispatchDpsFields,
  type CarrierDispatch,
  type CarrierPhase,
  type MailLoad,
  type RoutePreference,
  type WeightPublicMode,
} from "@/lib/data/carrier-journal";
import type { CarrierDaybookInput, CarrierLogDpsInput } from "@/lib/validation/carrier-log.schema";
import { calculateDpsRatio } from "@/lib/carrier-journal/helpers";
import { computeFuelScore } from "@/lib/carrier-journal/fuel";

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

function parseWeightPublicMode(raw: string): WeightPublicMode | undefined {
  const normalized = raw.toLowerCase().trim();
  if (normalized === "hidden") return "hidden";
  if (normalized === "change-only" || normalized === "change only") return "change-only";
  if (
    normalized === "current-and-change" ||
    normalized === "current and change"
  ) {
    return "current-and-change";
  }
  return undefined;
}

function parsePhase(raw: string): CarrierPhase | undefined {
  const normalized = raw.toLowerCase().trim();
  if (normalized === "break-in" || normalized === "break in") return "break-in";
  if (normalized === "adapting") return "adapting";
  if (normalized === "building") return "building";
  if (normalized === "regular") return "regular";
  return undefined;
}

function parseRoutePreference(raw: string): RoutePreference | undefined {
  const normalized = raw.toLowerCase().trim();
  if (normalized === "prefer") return "prefer";
  if (normalized === "like") return "like";
  if (normalized === "dislike") return "dislike";
  return undefined;
}

function mailDayContextFromProp(prop: Props | undefined): string[] {
  const value = sel(prop);
  return value ? [value] : [];
}

function mailDayContextToNotion(tags: string[] | undefined): Record<string, unknown> | null {
  if (tags === undefined) return null;
  const first = tags.find(Boolean);
  return {
    "Mail Day Context": first ? { select: { name: first } } : { select: null },
  };
}

function formatPage(page: PageObjectResponse): CarrierDispatch | null {
  const p = page.properties as Record<string, unknown>;

  const date = dateStr(p.Date as Props);
  if (!date) return null;
  const title = str(p.Title as Props, "title") || date;

  const milesWalked = num(p["Miles Walked"] as Props) ?? 0;
  const steps = num(p.Steps as Props) ?? 0;
  const soreness = num(p["Soreness (1-10)"] as Props) ?? num(p.Soreness as Props) ?? 5;
  const energy = num(p["Energy (1-10)"] as Props) ?? num(p.Energy as Props) ?? 5;
  const mood = num(p["Mood (1-10)"] as Props) ?? num(p.Mood as Props) ?? 5;
  const weather = str(p.Weather as Props, "rich_text") || undefined;
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

  const waterOz = num(p["Water Oz"] as Props);
  const hydrationGoalOz = num(p["Hydration Goal Oz"] as Props);
  const weightLbs = num(p["Weight Lbs"] as Props);
  const weightPublicMode = parseWeightPublicMode(sel(p["Weight Public Mode"] as Props));
  const bodyNote = str(p["Body Note"] as Props, "rich_text");
  const recoveryNote = str(p["Recovery Note"] as Props, "rich_text");
  const phase = parsePhase(sel(p.Phase as Props));
  const rawTags = (p.Tags as Props)?.multi_select as { name?: string }[] | undefined;
  const tags = rawTags?.map((t) => t.name ?? "").filter(Boolean);
  const goodSamaritanAct = check(p["Good Samaritan Act"] as Props);
  const routeCode = str(p.Route as Props, "rich_text") || undefined;
  const routePreference = parseRoutePreference(sel(p["Route Preference"] as Props));
  const dpsCount = num(p["DPS Count"] as Props);
  const dpsRatio = num(p["DPS Ratio"] as Props);
  const mailDayContext = mailDayContextFromProp(p["Mail Day Context"] as Props);

  return {
    id: `cj-${page.id.replace(/-/g, "").slice(0, 8)}`,
    date,
    title,
    milesWalked,
    steps,
    soreness,
    energy,
    mood,
    ...(weather !== undefined && { weather }),
    ...(temperatureF !== undefined && { temperatureF }),
    ...(heatIndexF !== undefined && { heatIndexF }),
    mailLoad,
    ...(heatDay && { heatDay }),
    ...(rain && { rain }),
    ...(storm && { storm }),
    ...(snow && { snow }),
    ...(dogEncounter && { dogEncounter }),
    publicNote,
    ...(waterOz !== undefined && { waterOz }),
    ...(hydrationGoalOz !== undefined && { hydrationGoalOz }),
    ...(weightLbs !== undefined && { weightLbs }),
    ...(weightPublicMode && { weightPublicMode }),
    ...(bodyNote && { bodyNote }),
    ...(recoveryNote && { recoveryNote }),
    ...(phase && { phase }),
    ...(tags && tags.length > 0 && { tags }),
    ...(goodSamaritanAct && { goodSamaritanAct }),
    ...(routeCode && { routeCode }),
    ...(routePreference && { routePreference }),
    ...(dpsCount !== undefined && { dpsCount }),
    ...(dpsRatio !== undefined && { dpsRatio }),
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

export function verifyCarrierLogSecret(secret: string): boolean {
  const expected = (process.env.CARRIER_JOURNAL_LOG_SECRET ?? "").trim();
  return !!expected && secret === expected;
}

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
  return dispatches.map((dispatch) => enrichDispatchDpsFields(dispatches, dispatch));
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

  const dpsPerMile =
    input.dpsCount !== undefined && input.miles !== undefined && input.miles > 0
      ? calculateDpsRatio(input.dpsCount, input.miles)
      : null;

  const properties: Record<string, unknown> = {
    "Publish Public": { checkbox: input.published },
  };

  if (input.miles !== undefined) {
    properties["Miles Walked"] = { number: input.miles };
  }

  if (input.dpsCount !== undefined) {
    properties["DPS Count"] = { number: input.dpsCount };
    properties["DPS Ratio"] = dpsPerMile != null ? { number: dpsPerMile } : { number: null };
  }

  if (input.mailDayContext !== undefined) {
    const mailDayContextProp = mailDayContextToNotion(input.mailDayContext);
    if (mailDayContextProp) Object.assign(properties, mailDayContextProp);
  }

  if (input.temperatureF !== undefined) {
    properties["Temperature F"] = { number: input.temperatureF };
  }

  if (input.heatIndexF !== undefined) {
    properties["Heat Index F"] = { number: input.heatIndexF };
  }

  if (input.waterOz !== undefined) {
    properties["Water Oz"] = { number: input.waterOz };
  }

  if (input.hydrationGoalOz !== undefined) {
    properties["Hydration Goal Oz"] = { number: input.hydrationGoalOz };
  }

  if (input.weightLbs !== undefined) {
    properties["Weight Lbs"] = { number: input.weightLbs };
  }

  if (input.mood !== undefined) {
    properties["Mood (1-10)"] = { number: input.mood };
  }

  if (input.energy !== undefined) {
    properties["Energy (1-10)"] = { number: input.energy };
  }

  if (input.publicNote !== undefined) {
    properties["Public Note"] = {
      rich_text: [{ text: { content: input.publicNote } }],
    };
  }

  // TODO: Add "Parcels" (Number) property to the Notion database, then uncomment:
  if (input.parcels !== undefined) {
    properties["Parcels"] = { number: input.parcels };
  }

  if (input.privateNote !== undefined) {
    properties["Private Note"] = {
      rich_text: [{ text: { content: input.privateNote } }],
    };
  }

  if (input.fuel?.breakfastProtein !== undefined) {
    properties["Breakfast Protein"] = { checkbox: input.fuel.breakfastProtein };
  }
  if (input.fuel?.routeFoodPacked !== undefined) {
    properties["Route Food Packed"] = { checkbox: input.fuel.routeFoodPacked };
  }
  if (input.fuel?.routeFoodEaten !== undefined) {
    const labels = { none: "None", partial: "Partial", all: "All" } as const;
    properties["Route Food Eaten"] = { select: { name: labels[input.fuel.routeFoodEaten] } };
  }
  if (input.fuel?.proteinAnchors !== undefined) {
    properties["Protein Anchors"] = { number: input.fuel.proteinAnchors };
  }
  if (input.fuel?.fruitVegServings !== undefined) {
    properties["Fruit Veg Servings"] = { number: input.fuel.fruitVegServings };
  }
  if (input.fuel?.gatorade !== undefined) {
    properties["Gatorade Count"] = { number: input.fuel.gatorade };
  }
  if (input.fuel?.mountainDewOz !== undefined) {
    properties["Mountain Dew Oz"] = { number: input.fuel.mountainDewOz };
  }
  if (input.fuel?.postShiftMealQuality !== undefined) {
    const labels = { poor: "Poor", okay: "Okay", solid: "Solid" } as const;
    properties["Post Shift Meal Quality"] = {
      select: { name: labels[input.fuel.postShiftMealQuality] },
    };
  }
  if (input.fuel) {
    properties["Fuel Score"] = { number: computeFuelScore(input.fuel).score };
  }

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
