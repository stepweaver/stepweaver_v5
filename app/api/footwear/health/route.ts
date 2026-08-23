import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";
import { assertFootwearReady } from "@/lib/footwear/api";

export const dynamic = "force-dynamic";

/** Session-gated readiness check for Neon Footwear Lab DB. */
export async function GET(request: NextRequest) {
  const gate = assertFootwearReady(request);
  if (gate) return gate;

  try {
    const db = getDb();
    await db.execute(sql`select 1 as ok`);
    return NextResponse.json({ ok: true, service: "footwear-lab-db" });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Database check failed" },
      { status: 503 }
    );
  }
}
