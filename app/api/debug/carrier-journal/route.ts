// Temporary diagnostic route; remove after confirming Notion integration works.
// Only active in development (returns 404 in production).
import { NextResponse } from "next/server";
import { getNotion } from "@/lib/notion/client";

function getDbId(): string | null {
  const raw = (process.env.NOTION_CARRIER_JOURNAL_DB_ID ?? "")
    .trim()
    .replace(/^[\s'"`]+|[\s'"`]+$/g, "");
  if (!raw) return null;
  const clean = raw.replace(/-/g, "");
  if (clean.length < 32) return null;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const apiKey = (process.env.NOTION_API_KEY ?? "").trim();
  const rawDbId = (process.env.NOTION_CARRIER_JOURNAL_DB_ID ?? "").trim();
  const dbId = getDbId();

  const config = {
    hasApiKey: !!apiKey,
    rawDbId,
    normalizedDbId: dbId,
    dbIdValid: !!dbId,
  };

  if (!apiKey || !dbId) {
    return NextResponse.json({ config, error: "Missing API key or DB ID" }, { status: 200 });
  }

  try {
    // Query with NO filter, which shows all pages including unpublished ones
    const res = await getNotion().databases.query({
      database_id: dbId,
      page_size: 5,
    });

    const pages = res.results.map((page) => {
      if (!("properties" in page)) return { id: page.id, type: "partial" };
      const p = page.properties as Record<string, unknown>;
      // Surface every property name and type so we can verify names match
      const propSummary = Object.fromEntries(
        Object.entries(p).map(([key, val]) => {
          const v = val as Record<string, unknown>;
          return [key, { type: v.type, raw: v }];
        })
      );
      return {
        id: page.id,
        properties: propSummary,
      };
    });

    return NextResponse.json({
      config,
      totalResults: res.results.length,
      hasMore: res.has_more,
      pages,
    });
  } catch (err) {
    return NextResponse.json({
      config,
      error: err instanceof Error ? err.message : String(err),
    }, { status: 200 });
  }
}
