import { PINNED_WRITING_SLUGS, PROFESSIONAL_WRITING_TAGS } from "@/lib/data/writing";

export type CodexPost = {
  title: string;
  slug: string;
  date: string;
  updated: string | null;
  description: string;
  hashtags: string[];
};

function safeParseCodexDate(dateStr: string): Date {
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

export function normalizeTag(tag: string): string {
  return String(tag || "")
    .trim()
    .toLowerCase()
    .replace(/^#+/, "");
}

export function normalizePostFromBlogEntry(entry: {
  title?: string;
  slug: string;
  date?: string | null;
  updated?: string | null;
  description?: string;
  hashtags?: string[];
}): CodexPost {
  const hashtags = Array.from(
    new Set((entry.hashtags || []).map(normalizeTag).filter(Boolean))
  );
  return {
    title: entry.title || "Untitled",
    slug: entry.slug,
    date: entry.date || "",
    updated: entry.updated ?? null,
    description: entry.description || "",
    hashtags,
  };
}

export function sortPosts(posts: CodexPost[]): CodexPost[] {
  return [...posts].sort((a, b) => {
    const dateA = a.updated ? safeParseCodexDate(a.updated) : safeParseCodexDate(a.date);
    const dateB = b.updated ? safeParseCodexDate(b.updated) : safeParseCodexDate(b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

export function extractUniqueTags(posts: CodexPost[]): string[] {
  const tags = new Set<string>();
  posts.forEach((p) => (p.hashtags || []).forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function filterPostsByTags(posts: CodexPost[], activeTags: string[]): CodexPost[] {
  if (!activeTags.length) return posts;
  const normalizedActive = activeTags.map(normalizeTag);
  return posts.filter((post) => {
    const postTags = post.hashtags || [];
    return normalizedActive.some((tag) => postTags.includes(tag));
  });
}

export function formatCodexDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const s = String(dateStr).trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `[${m[1]}-${m[2]}-${m[3]}]`;
    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `[${year}-${month}-${day}]`;
  } catch {
    return dateStr;
  }
}

const PROFESSIONAL_TAG_SET = new Set<string>(PROFESSIONAL_WRITING_TAGS);

export function isProfessionalPost(post: CodexPost): boolean {
  if ((PINNED_WRITING_SLUGS as readonly string[]).includes(post.slug)) return true;
  return (post.hashtags || []).some((tag) => PROFESSIONAL_TAG_SET.has(normalizeTag(tag)));
}

export function partitionProfessionalPosts(posts: CodexPost[]): {
  professional: CodexPost[];
  other: CodexPost[];
} {
  const sorted = sortPosts(posts);
  const pinnedOrder = new Map((PINNED_WRITING_SLUGS as readonly string[]).map((slug, i) => [slug, i]));
  const professional = sorted
    .filter(isProfessionalPost)
    .sort((a, b) => (pinnedOrder.get(a.slug) ?? 99) - (pinnedOrder.get(b.slug) ?? 99));
  const other = sorted.filter((p) => !isProfessionalPost(p));
  return { professional, other };
}
