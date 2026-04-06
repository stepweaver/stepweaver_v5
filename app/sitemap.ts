import type { MetadataRoute } from "next";
import { getInitialBlogEntries } from "@/lib/blog";
import { getProjectSlugs } from "@/lib/data/projects";

const STATIC_ROUTES = [
  "/",
  "/brief",
  "/capabilities",
  "/contact",
  "/codex",
  "/for-agents",
  "/meshtastic",
  "/meshtastic/field-notes",
  "/projects",
  "/resume",
  "/services",
  "/services/automation",
  "/services/lead-systems",
  "/services/web-platforms",
  "/start-here",
  "/terminal",
  "/dice-roller",
  "/yankee-samurai",
  "/book-shower",
  "/privacy",
  "/theme-audit",
];

const MESHTASTIC_STATIC_SLUGS = ["about", "overview", "getting-started", "hardware"];

function staticPriority(route: string): number {
  if (route === "/") return 1;
  if (route.startsWith("/services")) return 0.8;
  if (route === "/projects" || route === "/codex" || route === "/resume") return 0.85;
  return 0.6;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL || "https://stepweaver.dev";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: staticPriority(route),
  }));

  for (const slug of getProjectSlugs()) {
    entries.push({
      url: `${baseUrl}/projects/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  for (const slug of MESHTASTIC_STATIC_SLUGS) {
    entries.push({
      url: `${baseUrl}/meshtastic/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  if (process.env.NOTION_BLOG_DB_ID && process.env.NOTION_API_KEY) {
    try {
      const blogEntries = await getInitialBlogEntries(500);
      for (const entry of blogEntries) {
        if (!entry.slug) continue;
        entries.push({
          url: `${baseUrl}/codex/${entry.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    } catch {
      // sitemap still valid without codex posts
    }
  }

  return entries;
}
