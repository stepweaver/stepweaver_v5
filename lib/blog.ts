import { getBlogEntries, type BlogEntry } from "./notion/blog.repo";

export type { BlogEntry };

async function getAllBlogEntries(): Promise<BlogEntry[]> {
  const entries = await getBlogEntries();
  return Array.isArray(entries) ? entries : [];
}

export async function getInitialBlogEntries(limit = 100): Promise<BlogEntry[]> {
  const result = await getBlogEntries({ pageSize: limit });
  if (result && typeof result === "object" && "items" in result) {
    return result.items;
  }
  return Array.isArray(result) ? result : [];
}

export async function getBlogEntryBySlug(slug: string): Promise<BlogEntry | null> {
  const entries = await getBlogEntries();
  const list = Array.isArray(entries) ? entries : entries?.items ?? [];
  return list.find((e) => e.slug === slug) ?? null;
}
