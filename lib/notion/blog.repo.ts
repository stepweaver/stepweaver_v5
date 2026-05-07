import { unstable_cache } from "next/cache";
import type { PageObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotion } from "./client";
import { paginate } from "./paginate";

const NOTION_CACHE_REVALIDATE = 300;

export type BlogEntry = {
  id: string;
  title: string;
  slug: string;
  date: string | null;
  updated: string | null;
  description: string;
  hashtags: string[];
  createdTime: string;
  lastEditedTime: string;
};

function getBlogDbId(): string | null {
  const id = process.env.NOTION_BLOG_DB_ID;
  if (!id) return null;
  const clean = id.replace(/-/g, "");
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

function slugify(title: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

function getPropertyValue(
  property: Record<string, unknown> | undefined,
  type: string
): string | string[] | null {
  if (!property || typeof property !== "object") return null;
  const p = property as Record<string, unknown>;
  switch (type) {
    case "title": {
      const t = p.title as { plain_text?: string }[] | undefined;
      return t?.[0]?.plain_text ?? "";
    }
    case "date": {
      const d = p.date as { start?: string } | undefined;
      return d?.start ?? null;
    }
    case "url":
      return (p.url as string) ?? null;
    case "rich_text": {
      const rt = p.rich_text as { plain_text?: string }[] | undefined;
      return rt?.[0]?.plain_text ?? "";
    }
    case "multi_select": {
      const ms = p.multi_select as { name?: string }[] | undefined;
      return ms?.map((x) => x.name ?? "").filter(Boolean) ?? [];
    }
    default:
      return null;
  }
}

function getPropertyByType(
  properties: Record<string, unknown>,
  type: string
): Record<string, unknown> | null {
  if (!properties || typeof properties !== "object") return null;
  for (const key of Object.keys(properties)) {
    const prop = properties[key] as { type?: string };
    if (prop?.type === type) return properties[key] as Record<string, unknown>;
  }
  return null;
}

function toCalendarDateOnly(value: unknown): string | null {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function formatBlogEntry(page: PageObjectResponse): BlogEntry {
  const p = page.properties as Record<string, unknown>;
  const titleProp = (p.Title || p.Name) as Record<string, unknown> | undefined;
  const title = (getPropertyValue(titleProp, "title") as string) || "";
  const dateProp = getPropertyByType(p, "date") || (p.Date as Record<string, unknown>) || (p.date as Record<string, unknown>);
  const dateValue = dateProp ? (getPropertyValue(dateProp, "date") as string | null) : null;
  const dateOnly = toCalendarDateOnly(dateValue);
  const fallbackDate = toCalendarDateOnly(page.created_time);
  const lastEdited = toCalendarDateOnly(page.last_edited_time);
  const description =
    (getPropertyValue(
      (p.Excerpt || p.Description || p["Excerpt"] || p["Description"]) as Record<string, unknown>,
      "rich_text"
    ) as string) ||
    (getPropertyValue((p.excerpt || p.description) as Record<string, unknown>, "rich_text") as string) ||
    "";
  const tagsRaw = getPropertyValue((p.Tags || p.tags) as Record<string, unknown>, "multi_select");
  const tags = Array.isArray(tagsRaw) ? tagsRaw : [];
  return {
    id: page.id,
    title,
    slug: slugify(title),
    date: dateOnly ?? fallbackDate ?? dateValue,
    updated: lastEdited || dateOnly || fallbackDate || dateValue,
    description: description || "",
    hashtags: tags,
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
  };
}

type QueryOptions = {
  limit?: number;
  cursor?: string;
  pageSize?: number;
};

type QueryPage = PageObjectResponse | PartialPageObjectResponse;

function mapResultsToEntries(results: QueryPage[]): BlogEntry[] {
  return (results ?? [])
    .filter((r): r is PageObjectResponse => Boolean(r && typeof r === "object" && "properties" in r))
    .map(formatBlogEntry);
}

async function getBlogEntriesUncached(options: QueryOptions = {}) {
  const dbId = getBlogDbId();
  if (!dbId) return [];

  try {
    const { limit, cursor, pageSize = 100 } = options;
    const baseQuery = {
      database_id: dbId,
      filter: {
        property: "Status",
        select: { equals: "Published" },
      },
      sorts: [{ timestamp: "last_edited_time" as const, direction: "descending" as const }],
    };

    const notion = getNotion();

    if (cursor) {
      const res = await notion.databases.query({
        ...baseQuery,
        start_cursor: cursor as string,
        page_size: Math.min(pageSize, 100),
      });
      return {
        items: mapResultsToEntries((res.results ?? []) as QueryPage[]),
        hasMore: !!res.has_more,
        nextCursor: res.next_cursor ?? null,
      };
    }

    if (pageSize && pageSize !== 100 && limit == null) {
      const res = await notion.databases.query({
        ...baseQuery,
        page_size: Math.min(pageSize, 100),
      });
      return {
        items: mapResultsToEntries((res.results ?? []) as QueryPage[]),
        hasMore: !!res.has_more,
        nextCursor: res.next_cursor ?? null,
      };
    }

    if (limit && limit <= 100) {
      const res = await notion.databases.query({
        ...baseQuery,
        page_size: Math.min(limit, 100),
      });
      return mapResultsToEntries((res.results ?? []) as QueryPage[]);
    }

    if (limit) {
      const pages = await paginate<QueryPage>(
        (c) =>
          notion.databases.query({
            ...baseQuery,
            ...(c ? { start_cursor: c } : {}),
            page_size: 100,
          }),
        { limit }
      );
      return mapResultsToEntries(pages);
    }

    const pages = await paginate<QueryPage>((c) =>
      notion.databases.query({
        ...baseQuery,
        ...(c ? { start_cursor: c } : {}),
        page_size: 100,
      })
    );
    return mapResultsToEntries(pages);
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("[getBlogEntries]", err);
    return [];
  }
}

export async function getBlogEntries(options: QueryOptions = {}): Promise<
  BlogEntry[] | { items: BlogEntry[]; hasMore: boolean; nextCursor: string | null }
> {
  const { limit, cursor, pageSize = 100 } = options;
  const keyParts = ["notion-blog", String(limit ?? ""), String(cursor ?? ""), String(pageSize)];

  const getCached = unstable_cache(
    async (opts: QueryOptions) => getBlogEntriesUncached(opts),
    keyParts,
    { revalidate: NOTION_CACHE_REVALIDATE, tags: ["notion-blog"] }
  );

  return getCached(options);
}
