import { NextRequest, NextResponse } from "next/server";
import { isAllowedRequestOrigin } from "@/lib/request-origin";
import { jsonSecurityHeaders } from "@/lib/json-security-headers";
import { rateLimit } from "@/lib/security/rate-limit";

const DEFAULT_SCRIPT =
  "https://script.google.com/macros/s/AKfycbyjvVhJ9UzjPHErwZ7tju4rSzBj7zeegW6HAnBdGNAafiUuWPFKDUysD3jnUFBtMZdQ3A/exec";

function scriptUrl(): string {
  return (process.env.BOOK_SHOWER_SCRIPT_URL || DEFAULT_SCRIPT).trim();
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: jsonSecurityHeaders() });
}

export async function GET(request: NextRequest) {
  try {
    if (!isAllowedRequestOrigin(request)) {
      return json({ error: "Forbidden" }, 403);
    }

    const ip = clientIp(request);
    const rl = await rateLimit(`book-shower-get:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return json({ error: "Too many requests. Please try again shortly." }, 429);
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const base = scriptUrl();
    const url = queryString ? `${base}?${queryString}` : base;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BookShower/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from script: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    let data: unknown;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    return NextResponse.json(data, { headers: jsonSecurityHeaders() });
  } catch (error) {
    console.error("Error fetching book shower data:", error);
    return json({ error: "Failed to fetch book shower data" }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedRequestOrigin(request)) {
      return json({ error: "Forbidden" }, 403);
    }

    const ip = clientIp(request);
    const rl = await rateLimit(`book-shower-post:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return json({ error: "Too many requests. Please try again shortly." }, 429);
    }

    const body = await request.json().catch(() => ({}));

    const response = await fetch(scriptUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; BookShower/1.0)",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from script: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    let data: unknown;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    return NextResponse.json(data, { headers: jsonSecurityHeaders() });
  } catch (error) {
    console.error("Error posting book shower data:", error);
    return json({ error: "Failed to fetch book shower data" }, 500);
  }
}
