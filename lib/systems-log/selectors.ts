import type { BlogEntry } from "@/lib/blog";
import { normalizeTag } from "@/lib/codex/selectors";

export const SYSTEMS_LOG_TAG = "systems-log";
export const SYSTEMS_LOG_SERIES_TITLE = "Systems Log";

function safeParseDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  try {
    const parts = String(dateStr).split("-").map(Number);
    const [year, month, day] = parts;
    if (!year || !month || !day) return new Date(0);
    return new Date(Date.UTC(year, month - 1, day));
  } catch {
    return new Date(0);
  }
}

export type SystemsLogPost = {
  id: string;
  title: string;
  slug: string;
  date: string | null;
  updated: string | null;
  description: string;
  hashtags: string[];
};

export function isSystemsLogEntry(entry: BlogEntry): boolean {
  const tags = Array.isArray(entry?.hashtags) ? entry.hashtags : [];
  const normalized = tags.map(normalizeTag).filter(Boolean);
  return normalized.includes(SYSTEMS_LOG_TAG);
}

export function normalizeSystemsLogPost(entry: BlogEntry): SystemsLogPost {
  const hashtags = Array.from(new Set((entry.hashtags || []).map(normalizeTag).filter(Boolean)));
  return {
    id: entry.id,
    title: entry.title || "Untitled",
    slug: entry.slug,
    date: entry.date ?? null,
    updated: entry.updated ?? null,
    description: entry.description || "",
    hashtags,
  };
}

export function sortSystemsLogPosts(posts: SystemsLogPost[]): SystemsLogPost[] {
  return [...posts].sort((a, b) => {
    const dateA = a.updated ? safeParseDate(a.updated) : safeParseDate(a.date ?? "");
    const dateB = b.updated ? safeParseDate(b.updated) : safeParseDate(b.date ?? "");
    return dateB.getTime() - dateA.getTime();
  });
}

