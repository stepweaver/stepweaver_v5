import {
  isSystemsLogEntry,
  normalizeSystemsLogPost,
  sortSystemsLogPosts,
  SYSTEMS_LOG_TAG,
} from "@/lib/systems-log/selectors";
import type { BlogEntry } from "@/lib/blog";

function entry(partial: Partial<BlogEntry>): BlogEntry {
  return {
    id: partial.id ?? "id",
    title: partial.title ?? "Title",
    slug: partial.slug ?? "title",
    date: partial.date ?? "2026-01-01",
    updated: partial.updated ?? null,
    description: partial.description ?? "",
    hashtags: partial.hashtags ?? [],
    createdTime: partial.createdTime ?? "2026-01-01T00:00:00.000Z",
    lastEditedTime: partial.lastEditedTime ?? "2026-01-01T00:00:00.000Z",
  };
}

describe("systems-log selectors", () => {
  test("isSystemsLogEntry matches tags case-insensitively", () => {
    expect(isSystemsLogEntry(entry({ hashtags: [SYSTEMS_LOG_TAG] }))).toBe(true);
    expect(isSystemsLogEntry(entry({ hashtags: ["Systems-Log"] }))).toBe(true);
    expect(isSystemsLogEntry(entry({ hashtags: ["systems log"] }))).toBe(false);
    expect(isSystemsLogEntry(entry({ hashtags: ["kaizen"] }))).toBe(false);
  });

  test("normalizeSystemsLogPost normalizes and dedupes tags", () => {
    const n = normalizeSystemsLogPost(entry({ hashtags: ["Systems-Log", "systems-log", "#Kaizen", "kaizen"] }));
    expect(n.hashtags).toEqual(["systems-log", "kaizen"]);
  });

  test("sortSystemsLogPosts prefers updated over date", () => {
    const a = normalizeSystemsLogPost(entry({ id: "a", slug: "a", date: "2026-01-01", updated: null }));
    const b = normalizeSystemsLogPost(entry({ id: "b", slug: "b", date: "2026-01-02", updated: null }));
    const c = normalizeSystemsLogPost(entry({ id: "c", slug: "c", date: "2026-01-01", updated: "2026-02-01" }));
    const sorted = sortSystemsLogPosts([a, b, c]);
    expect(sorted.map((p) => p.id)).toEqual(["c", "b", "a"]);
  });
});

