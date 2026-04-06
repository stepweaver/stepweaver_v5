import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || "").split(",").filter(Boolean);

export function checkOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") || request.headers.get("x-forwarded-host");
  if (!origin) {
    if (process.env.NODE_ENV !== "production") return null;
    return "missing-origin";
  }
  if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
    return "disallowed-origin";
  }
  if (host && ALLOWED_HOSTS.length > 0) {
    const originHost = new URL(origin).host.replace(/^www\./, "");
    const normalizedHost = host.replace(/^www\./, "");
    if (!ALLOWED_HOSTS.includes(originHost) && originHost !== normalizedHost) {
      return "disallowed-origin";
    }
  }
  return null;
}

export function checkBotProtection(body: Record<string, unknown>): string | null {
  const honeypot = body._hp_website as string | undefined;
  if (honeypot && honeypot.length > 0) {
    return "honeypot-filled";
  }
  const timestamp = body._t as number | undefined;
  if (timestamp) {
    const now = Date.now();
    if (timestamp > now + 5000) return "future-timestamp";
    if (now - timestamp < 500) return "too-fast";
  }
  return null;
}

export async function withProtectedRoute(
  request: NextRequest,
  handler: (_request: NextRequest, _body: Record<string, unknown>) => Promise<NextResponse>,
  schema?: ZodSchema
): Promise<NextResponse> {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const originError = checkOrigin(request);
  if (originError) {
    return NextResponse.json({ error: "Origin check failed" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const botError = checkBotProtection(body);
  if (botError) {
    return NextResponse.json({ error: "Bot protection triggered" }, { status: 403 });
  }

  if (schema) {
    const stripped = { ...body };
    delete stripped._hp_website;
    delete stripped._t;
    delete stripped._d;
    const result = schema.safeParse(stripped);
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
    }
  }

  return handler(request, body);
}
