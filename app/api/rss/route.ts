import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

const FEED_SOURCES: Record<string, string> = {
  syntaxfm: "https://feed.syntax.fm/rss",
};

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("source") || "";
  const feedUrl = FEED_SOURCES[source];
  if (!feedUrl) {
    return NextResponse.json({ error: "Unknown feed source" }, { status: 400 });
  }
  try {
    const res = await fetch(feedUrl, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Feed fetch failed");
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });
    const parsed = parser.parse(xml);
    const items = parsed.rss?.channel?.item || [];
    const normalized = (Array.isArray(items) ? items : [items]).slice(0, 20).map((item: Record<string, unknown>) => ({
      title: item.title || "",
      link: item.link || "",
      date: item.pubDate || item["dc:date"] || "",
      description: item.description || "",
    }));
    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
