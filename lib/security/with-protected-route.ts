import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || "").split(",").filter(Boolean);

function isLoopbackOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

export function checkOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") || request.headers.get("x-forwarded-host");

  // Local dev: production allowlists in .env would otherwise block browser POSTs from localhost.
  if (process.env.NODE_ENV !== "production" && origin && isLoopbackOrigin(origin)) {
    return null;
  }

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

/** Matches v3 `botProtection` timing: page-age via `_d`, or flow duration from anchor `_t`. */
const MIN_PAGE_AGE_MS = 400;
const MIN_FLOW_DURATION_MS = 500;

export function checkBotProtection(body: Record<string, unknown>): string | null {
  const honeypot = body._hp_website as string | undefined;
  if (honeypot && String(honeypot).trim().length > 0) {
    return "honeypot-filled";
  }

  const submittedAt = Number(body._t);
  const elapsedField = body._d;
  const now = Date.now();

  if (!Number.isFinite(submittedAt) || submittedAt <= 0) {
    return "missing_timestamp";
  }
  if (submittedAt > now + 5000) {
    return "future-timestamp";
  }

  if (elapsedField !== undefined && elapsedField !== null) {
    const elapsedMs = Number(elapsedField);
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
      return "invalid_elapsed";
    }
    if (elapsedMs < MIN_PAGE_AGE_MS) {
      return "too-fast";
    }
    return null;
  }

  const elapsed = now - submittedAt;
  if (elapsed < 0) {
    return "invalid_timestamp";
  }
  if (elapsed < MIN_FLOW_DURATION_MS) {
    return "too-fast";
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
