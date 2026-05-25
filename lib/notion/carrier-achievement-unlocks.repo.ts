// Achievement Unlocks DB (NOTION_ACHIEVEMENT_UNLOCKS_DB_ID).
// Each page = one unlock: Achievement ID (title), Unlocked At (date),
// Entry ID (rich_text, optional), Manual Note (rich_text, optional).
//
// Automatic achievements write themselves here on first detection.
// Manual achievements are added as rows directly in Notion.

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getNotion } from "./client";
import { paginate } from "./paginate";
import { ACHIEVEMENTS } from "@/lib/data/carrier-achievements";

const CACHE_REVALIDATE = 300; // 5 minutes
const VALID_IDS = new Set(ACHIEVEMENTS.map((a) => a.id));
const CACHE_TAG = "notion-carrier-achievement-unlocks";

function getDbId(): string | null {
  const raw = (process.env.NOTION_ACHIEVEMENT_UNLOCKS_DB_ID ?? "")
    .trim()
    .replace(/^[\s'"`]+|[\s'"`]+$/g, "");
  if (!raw) return null;
  const clean = raw.replace(/-/g, "");
  if (clean.length < 32) return null;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

function isConfigured(): boolean {
  return !!(getDbId() && (process.env.NOTION_API_KEY ?? "").trim());
}

function logError(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[carrier-achievements] ${context}:`, message);
}

type Props = Record<string, unknown>;

function titleStr(prop: Props | undefined): string {
  if (!prop) return "";
  const arr = prop.title as { plain_text?: string }[] | undefined;
  return arr?.[0]?.plain_text?.trim() ?? "";
}

type QueryPage = PageObjectResponse | PartialPageObjectResponse;

async function fetchUnlocksUncached(): Promise<Set<string>> {
  const dbId = getDbId();
  if (!dbId || !(process.env.NOTION_API_KEY ?? "").trim()) return new Set();

  try {
    const pages = await paginate<QueryPage>((cursor) =>
      getNotion().databases.query({
        database_id: dbId,
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      })
    );

    const ids = new Set<string>();
    for (const page of pages as PageObjectResponse[]) {
      if (!page || !("properties" in page)) continue;
      const p = page.properties as Record<string, unknown>;
      const achievementId = titleStr(p["Achievement ID"] as Props);
      if (achievementId && VALID_IDS.has(achievementId)) {
        ids.add(achievementId);
      }
    }
    return ids;
  } catch (err) {
    logError("fetchUnlocks", err);
    return new Set();
  }
}

export async function fetchAchievementUnlocks(): Promise<Set<string>> {
  if (!isConfigured()) return new Set();
  return unstable_cache(
    async () => fetchUnlocksUncached(),
    ["notion-carrier-achievement-unlocks"],
    { revalidate: CACHE_REVALIDATE, tags: [CACHE_TAG] }
  )();
}

export async function writeAchievementUnlock(
  achievementId: string,
  entryId?: string
): Promise<boolean> {
  const dbId = getDbId();
  if (!dbId || !(process.env.NOTION_API_KEY ?? "").trim()) return false;
  if (!VALID_IDS.has(achievementId)) return false;

  try {
    await getNotion().pages.create({
      parent: { database_id: dbId },
      properties: {
        "Achievement ID": {
          title: [{ text: { content: achievementId } }],
        },
        "Unlocked At": {
          date: { start: new Date().toISOString().slice(0, 10) },
        },
        ...(entryId
          ? { "Entry ID": { rich_text: [{ text: { content: entryId } }] } }
          : {}),
      },
    });
    return true;
  } catch (err) {
    logError(`writeUnlock(${achievementId})`, err);
    return false;
  }
}

/** Write multiple unlocks sequentially to respect Notion rate limits. */
export async function writeAchievementUnlocks(
  achievementIds: string[],
  entryId?: string
): Promise<void> {
  for (const id of achievementIds) {
    await writeAchievementUnlock(id, entryId);
  }
  try {
    revalidateTag(CACHE_TAG);
  } catch {
    // Safe to swallow — revalidateTag is only available inside request context.
  }
}

export function isAchievementUnlocksConfigured(): boolean {
  return isConfigured();
}
