import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  writeAchievementUnlocks,
  isAchievementUnlocksConfigured,
} from "@/lib/notion/carrier-achievement-unlocks.repo";
import { ACHIEVEMENTS } from "@/lib/data/carrier-achievements";

const VALID_IDS = new Set(ACHIEVEMENTS.map((a) => a.id));
const MAX_BATCH = 20;

export async function POST(request: NextRequest) {
  if (!isAchievementUnlocksConfigured()) {
    return NextResponse.json({ ok: true, skipped: "not configured" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray((body as Record<string, unknown>).ids)
  ) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  const { ids, entryId } = body as { ids: unknown[]; entryId?: unknown };

  const validIds = ids
    .filter((id): id is string => typeof id === "string" && VALID_IDS.has(id))
    .slice(0, MAX_BATCH);

  if (validIds.length === 0) {
    return NextResponse.json({ ok: true, written: 0 });
  }

  await writeAchievementUnlocks(
    validIds,
    typeof entryId === "string" ? entryId : undefined
  );

  return NextResponse.json({ ok: true, written: validIds.length });
}
