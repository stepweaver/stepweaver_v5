import { NextResponse } from "next/server";
import { verifyCarrierLogSecret } from "@/lib/notion/carrier-journal.repo";
import { isFootwearDbConfigured } from "@/lib/db";

export function footwearUnauthorized() {
  return NextResponse.json(
    {
      error: "403 // YOU SHALL NOT PASS",
      message: "No token. No entry. No footwear diagnostics.",
    },
    { status: 401 }
  );
}

export function footwearUnavailable() {
  return NextResponse.json(
    { error: "Footwear Lab database is not configured" },
    { status: 503 }
  );
}

export function footwearBadRequest(error: string, details?: unknown) {
  return NextResponse.json({ error, details }, { status: 400 });
}

export function assertFootwearReady(logSecret: string): NextResponse | null {
  if (!isFootwearDbConfigured()) return footwearUnavailable();
  if (!verifyCarrierLogSecret(logSecret)) return footwearUnauthorized();
  return null;
}

export async function readJsonBody(
  request: Request
): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  try {
    const body = await request.json();
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}
