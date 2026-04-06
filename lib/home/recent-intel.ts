import { getInitialBlogEntries } from "@/lib/blog";
import { getAllProjects } from "@/lib/data/projects";
import type { Project } from "@/lib/data/projects.schema";
import { normalizePostFromBlogEntry, sortPosts, formatCodexDate, type CodexPost } from "@/lib/codex/selectors";

export type HomeIntelPayload = {
  post: CodexPost;
  relatedProject: {
    slug: string;
    title: string;
    summary: string;
    highlights: string[];
    status: Project["status"];
  } | null;
};

function findRelatedProject(post: CodexPost, projects: Project[]): Project | undefined {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  for (const tag of post.hashtags) {
    const t = tag.trim().toLowerCase();
    if (bySlug.has(t)) return bySlug.get(t);
  }
  if (bySlug.has(post.slug)) return bySlug.get(post.slug);
  return undefined;
}

function projectToIntelSummary(p: Project) {
  const highlights = (
    p.cardDelivered?.slice(0, 3) ??
    (Array.isArray(p.delivered) ? p.delivered.slice(0, 3) : []) ??
    []
  ).filter(Boolean) as string[];
  return {
    slug: p.slug,
    title: p.title,
    summary: p.cardDescription || p.description.slice(0, 280),
    highlights,
    status: p.status,
  };
}

/** Latest codex post plus optional linked project for the home hero intel panel. */
export async function getHomeRecentIntel(): Promise<HomeIntelPayload | null> {
  if (!process.env.NOTION_BLOG_DB_ID || !process.env.NOTION_API_KEY) return null;
  try {
    const entries = await getInitialBlogEntries(80);
    const sorted = sortPosts(entries.map(normalizePostFromBlogEntry));
    const first = sorted[0];
    if (!first) return null;
    const projects = getAllProjects();
    const related = findRelatedProject(first, projects);
    return {
      post: first,
      relatedProject: related ? projectToIntelSummary(related) : null,
    };
  } catch {
    return null;
  }
}
