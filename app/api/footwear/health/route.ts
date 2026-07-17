import { NextResponse } from "next/server";
import { isFootwearDbConfigured, getDb } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Lightweight readiness check for Neon Footwear Lab DB. */
export async function GET() {
  if (!isFootwearDbConfigured()) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured" },
      { status: 503 }
    );
  }

  try {
    const db = getDb();
    await db.execute(sql`select 1 as ok`);
    return NextResponse.json({ ok: true, service: "footwear-lab-db" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database check failed";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
