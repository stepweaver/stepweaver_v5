// Meshtastic Docs DB (NOTION_MESHTASTIC_DOCS_DB_ID) — schema matches v3 Notion database.
import { unstable_cache } from "next/cache";
import type { PageObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotion } from "./client";
import { paginate } from "./paginate";

const NOTION_CACHE_REVALIDATE = 300;

export type MeshtasticPublishedDoc = {
  id: string;
  title: string;
  slug: string;
  section: string;
  order: number;
  status: string;
  summary?: string;
  coverImage?: string;
  lastEditedTime?: string;
  createdTime?: string;
};

/**
 * Normalize Notion database ID (trim, strip wrapping quotes, re-hyphenate UUID).
 * Copy/paste from the dashboard often includes trailing newlines — those broke production
 * while dev `.env.local` stayed clean.
 */
function getMeshtasticDbId(): string | null {
  const raw = (process.env.NOTION_MESHTASTIC_DOCS_DB_ID ?? "")
    .trim()
    .replace(/^[\s'"`]+|[\s'"`]+$/g, "");
  if (!raw) return null;
  const clean = raw.replace(/-/g, "");
  if (clean.length < 32) return null;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

/** Why Meshtastic cannot talk to Notion (safe to show in UI — no secrets). */
export type MeshtasticNotionConfigIssue =
  | "ok"
  | "missing_database_id"
  | "invalid_database_id"
  | "missing_api_key";

export function getMeshtasticNotionConfigIssue(): MeshtasticNotionConfigIssue {
  const raw = (process.env.NOTION_MESHTASTIC_DOCS_DB_ID ?? "").trim();
  if (!raw) return "missing_database_id";
  if (!getMeshtasticDbId()) return "invalid_database_id";
  if (!(process.env.NOTION_API_KEY ?? "").trim()) return "missing_api_key";
  return "ok";
}

function isMeshtasticNotionConfigured(): boolean {
  return getMeshtasticNotionConfigIssue() === "ok";
}

function logMeshtasticNotionError(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[meshtastic] ${context}:`, message);
}

function getPropertyValue(property: Record<string, unknown> | undefined, type: string): string | null {
  if (!property || typeof property !== "object") return null;
  const p = property as Record<string, unknown>;
  switch (type) {
    case "title":
      return (p.title as { plain_text?: string }[] | undefined)?.[0]?.plain_text ?? "";
    case "rich_text":
      return (p.rich_text as { plain_text?: string }[] | undefined)?.[0]?.plain_text ?? "";
    case "number":
      return typeof p.number === "number" ? String(p.number) : null;
    case "select":
      return (p.select as { name?: string } | null | undefined)?.name ?? "";
    default:
      return null;
  }
}

function extractCoverUrl(page: PageObjectResponse): string | undefined {
  const cover = page.cover;
  if (!cover) return undefined;
  if (cover.type === "external") return cover.external?.url || undefined;
  if (cover.type === "file") return cover.file?.url || undefined;
  return undefined;
}

function formatDocPage(page: PageObjectResponse): MeshtasticPublishedDoc {
  const p = page.properties as Record<string, unknown>;
  const title = getPropertyValue(p.Title as Record<string, unknown>, "title") || "Untitled";
  const slug =
    getPropertyValue(p.Slug as Record<string, unknown>, "rich_text") || page.id.replace(/-/g, "");
  const section = getPropertyValue(p.Section as Record<string, unknown>, "select") || "Uncategorized";
  const orderRaw = (p.Order as { number?: number } | undefined)?.number;
  const order = typeof orderRaw === "number" ? orderRaw : 0;
  const status = getPropertyValue(p.Status as Record<string, unknown>, "select") || "Draft";
  const summary = getPropertyValue(p.Summary as Record<string, unknown>, "rich_text") || undefined;
  return {
    id: page.id,
    title,
    slug,
    section,
    order,
    status,
    summary,
    coverImage: extractCoverUrl(page),
    lastEditedTime: page.last_edited_time,
    createdTime: page.created_time,
  };
}

type QueryPage = PageObjectResponse | PartialPageObjectResponse;

async function listPublishedDocsUncached(): Promise<MeshtasticPublishedDoc[]> {
  const dbId = getMeshtasticDbId();
  if (!dbId || !(process.env.NOTION_API_KEY ?? "").trim()) return [];

  try {
    const pages = await paginate<QueryPage>((cursor) =>
      getNotion().databases.query({
        database_id: dbId,
        filter: {
          and: [
            { property: "Status", select: { equals: "Published" } },
            { property: "Slug", rich_text: { does_not_equal: "field-notes" } },
          ],
        },
        sorts: [
          { property: "Section", direction: "ascending" },
          { property: "Order", direction: "ascending" },
          { timestamp: "last_edited_time", direction: "descending" },
        ],
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      })
    );
    return (pages as PageObjectResponse[])
      .filter((page) => page && typeof page === "object" && "properties" in page)
      .map(formatDocPage);
  } catch (err) {
    logMeshtasticNotionError("listPublishedDocs", err);
    return [];
  }
}

export async function listPublishedDocs(): Promise<MeshtasticPublishedDoc[]> {
  if (!isMeshtasticNotionConfigured()) return [];
  return unstable_cache(
    async () => listPublishedDocsUncached(),
    ["notion-meshtastic-docs"],
    { revalidate: NOTION_CACHE_REVALIDATE, tags: ["notion-meshtastic-docs"] }
  )();
}

async function getDocBySlugUncached(slug: string): Promise<MeshtasticPublishedDoc | null> {
  const dbId = getMeshtasticDbId();
  if (!dbId || !slug || !(process.env.NOTION_API_KEY ?? "").trim()) return null;

  try {
    const res = await getNotion().databases.query({
      database_id: dbId,
      filter: {
        and: [
          { property: "Status", select: { equals: "Published" } },
          { property: "Slug", rich_text: { equals: slug } },
        ],
      },
      page_size: 1,
    });
    const page = res.results?.[0];
    if (!page || !("properties" in page)) return null;
    return formatDocPage(page as PageObjectResponse);
  } catch (err) {
    logMeshtasticNotionError("getDocBySlug", err);
    return null;
  }
}

/**
 * Per-slug cache key is required (v3 parity). A static key like `["notion-meshtastic-doc"]` alone can
 * collapse every chapter into one cached payload in App Router, so clicking sidebar links does not
 * change the article body.
 */
export async function getDocBySlug(slug: string): Promise<MeshtasticPublishedDoc | null> {
  if (!slug || !isMeshtasticNotionConfigured()) return null;
  return unstable_cache(
    async (s: string) => getDocBySlugUncached(s),
    ["notion-meshtastic-doc", slug],
    { revalidate: NOTION_CACHE_REVALIDATE, tags: ["notion-meshtastic-docs"] }
  )(slug);
}

/** Stable section order for sidebar display (v3 parity). */
export const SECTION_ORDER = ["About", "Overview", "Getting Started", "Hardware", "Field Notes"];

export type GroupedMeshtasticSection = { section: string; pages: MeshtasticPublishedDoc[] };

export function groupDocsBySection(docs: MeshtasticPublishedDoc[]): GroupedMeshtasticSection[] {
  const map = new Map<string, MeshtasticPublishedDoc[]>();
  for (const d of docs) {
    const arr = map.get(d.section) ?? [];
    arr.push(d);
    map.set(d.section, arr);
  }
  const result: GroupedMeshtasticSection[] = [];
  const processed = new Set<string>();
  for (const section of SECTION_ORDER) {
    const arr = map.get(section);
    if (!arr?.length) continue;
    arr.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    result.push({ section, pages: arr });
    processed.add(section);
  }
  for (const [section, arr] of map.entries()) {
    if (processed.has(section)) continue;
    arr.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    result.push({ section, pages: arr });
  }
  return result;
}

export function getFlatDocList(grouped: GroupedMeshtasticSection[]): MeshtasticPublishedDoc[] {
  if (!grouped?.length) return [];
  return grouped.flatMap(({ pages }) => pages);
}

async function listFieldNotesUncached(): Promise<MeshtasticPublishedDoc[]> {
  const dbId = getMeshtasticDbId();
  if (!dbId || !(process.env.NOTION_API_KEY ?? "").trim()) return [];

  try {
    const pages = await paginate<QueryPage>((cursor) =>
      getNotion().databases.query({
        database_id: dbId,
        filter: {
          and: [
            { property: "Status", select: { equals: "Published" } },
            { property: "Slug", rich_text: { equals: "field-notes" } },
          ],
        },
        sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      })
    );
    return (pages as PageObjectResponse[])
      .filter((page) => page && typeof page === "object" && "properties" in page)
      .map(formatDocPage);
  } catch (err) {
    logMeshtasticNotionError("listFieldNotes", err);
    return [];
  }
}

export async function listFieldNotes(): Promise<MeshtasticPublishedDoc[]> {
  if (!isMeshtasticNotionConfigured()) return [];
  return unstable_cache(
    async () => listFieldNotesUncached(),
    ["notion-meshtastic-field-notes"],
    { revalidate: NOTION_CACHE_REVALIDATE, tags: ["notion-meshtastic-docs"] }
  )();
}
