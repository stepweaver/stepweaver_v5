import { getInitialBlogEntries } from "@/lib/blog";
import { normalizePostFromBlogEntry, sortPosts } from "@/lib/codex/selectors";
import { jsonSecurityHeaders } from "@/lib/json-security-headers";

export async function GET() {
  const posts = [];

  if (process.env.NOTION_BLOG_DB_ID && process.env.NOTION_API_KEY) {
    try {
      const blogEntries = await getInitialBlogEntries(200);
      for (const entry of blogEntries) {
        posts.push(normalizePostFromBlogEntry(entry));
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("[codex] Notion blog:", err);
    }
  }

  const sorted = sortPosts(posts);

  return Response.json(sorted, { headers: jsonSecurityHeaders() });
}
