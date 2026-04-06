import type { MetadataRoute } from "next";

const STATIC_ROUTES = [
  "/",
  "/brief",
  "/capabilities",
  "/contact",
  "/for-agents",
  "/meshtastic",
  "/projects",
  "/resume",
  "/services",
  "/services/automation",
  "/services/lead-systems",
  "/services/web-platforms",
  "/start-here",
  "/terminal",
  "/dice-roller",
  "/privacy",
  "/theme-audit",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || "https://stepweaver.dev";
  return STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly" as const,
    priority: route === "/" ? 1 : route.startsWith("/services") ? 0.8 : 0.6,
  }));
}
