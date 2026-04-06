import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { isAllowedRequestOrigin } from "@/lib/request-origin";
import { jsonSecurityHeaders } from "@/lib/json-security-headers";
import { verifyNotionImageRefreshToken } from "@/lib/notion/image-tokens";
import { rateLimit } from "@/lib/security/rate-limit";

function normalizeNotionId(id: string): string {
  const clean = id.replace(/-/g, "");
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function json(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...jsonSecurityHeaders(), ...init.headers },
  });
}

export async function GET(request: NextRequest) {
  if (!isAllowedRequestOrigin(request)) {
    return json({ error: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const ip = clientIp(request);
  const rl = await rateLimit(`notion-image:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return json(
      { error: "Too many image requests. Please try again shortly." },
      { status: 429, headers: { "Cache-Control": "no-store" } }
    );
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return json({ error: "Bad request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const blockId = verifyNotionImageRefreshToken(token);
  if (!blockId) {
    return json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  if (!process.env.NOTION_API_KEY) {
    return json({ error: "Internal server error" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const block = await notion.blocks.retrieve({ block_id: normalizeNotionId(blockId) });
    if (!("type" in block) || block.type !== "image" || !("image" in block)) {
      return json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    const img = block.image;
    const url =
      img.type === "external"
        ? img.external?.url
        : img.type === "file"
          ? img.file?.url
          : null;

    if (!url) {
      return json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    return json(
      { url },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    const status = Number(e?.status);
    const responseStatus = status >= 400 && status < 500 ? 404 : 503;
    return json(
      { error: responseStatus === 404 ? "Not found" : "Service unavailable" },
      { status: responseStatus, headers: { "Cache-Control": "no-store" } }
    );
  }
}
