import { NextRequest, NextResponse } from "next/server";
import { isAllowedRequestOrigin } from "@/lib/request-origin";
import { jsonSecurityHeaders } from "@/lib/json-security-headers";
import { rateLimit } from "@/lib/security/rate-limit";
import { getPageBlocks } from "@/lib/notion-blocks";

function isValidNotionId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  const cleanId = id.replace(/-/g, "");
  return /^[0-9a-f]{32}$/i.test(cleanId);
}

function normalizeNotionId(id: string): string | null {
  const clean = id.replace(/-/g, "");
  if (clean.length !== 32) return null;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

function normalizeIdKey(id: string): string {
  return id.replace(/-/g, "").toLowerCase();
}

function getAllowedPageIdSet(): Set<string> {
  const raw = (process.env.NOTION_BLOCKS_ALLOWED_PAGE_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set(raw.map(normalizeIdKey));
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedRequestOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: jsonSecurityHeaders() });
    }

    const ip = clientIp(request);
    const rl = await rateLimit(`notion-blocks:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: jsonSecurityHeaders() }
      );
    }

    const allowed = getAllowedPageIdSet();
    if (allowed.size === 0) {
      return NextResponse.json({ error: "Not available" }, { status: 403, headers: jsonSecurityHeaders() });
    }

    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400, headers: jsonSecurityHeaders() });
    }

    let body: { pageId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: jsonSecurityHeaders() });
    }

    const { pageId } = body;

    if (!pageId || !process.env.NOTION_API_KEY) {
      return NextResponse.json(
        { error: "Missing page ID or API key" },
        { status: 400, headers: jsonSecurityHeaders() }
      );
    }

    if (!isValidNotionId(pageId)) {
      return NextResponse.json({ error: "Invalid page ID format" }, { status: 400, headers: jsonSecurityHeaders() });
    }

    const normalizedId = normalizeNotionId(pageId);
    if (!normalizedId || !allowed.has(normalizeIdKey(normalizedId))) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: jsonSecurityHeaders() });
    }

    const blocks = await getPageBlocks(normalizedId, 5);

    return NextResponse.json(blocks, {
      headers: {
        ...jsonSecurityHeaders(),
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: unknown) {
    const err = error as { name?: string; code?: string; status?: number; message?: string };
    const isDevelopment = process.env.NODE_ENV === "development";

    if (err.name === "APIResponseError" || err.code === "object_not_found") {
      return NextResponse.json({ error: "Notion page not found" }, { status: 404, headers: jsonSecurityHeaders() });
    }

    if (err.name === "ClientError" || err.status === 401) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401, headers: jsonSecurityHeaders() });
    }

    return NextResponse.json(
      { error: isDevelopment ? err.message : "Failed to fetch blocks" },
      { status: typeof err.status === "number" ? err.status : 500, headers: jsonSecurityHeaders() }
    );
  }
}
