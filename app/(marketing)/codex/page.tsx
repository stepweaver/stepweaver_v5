import { getInitialBlogEntries } from "@/lib/blog";
import { CodexPageClient } from "@/components/codex/codex-page-client";
import { normalizePostFromBlogEntry, sortPosts, type CodexPost } from "@/lib/codex/selectors";

export const metadata = {
  title: "Codex",
  description: "Developer notes, projects, and community thoughts: digital codex.",
};

export default async function CodexPage() {
  let initialPosts: CodexPost[] = [];
  if (process.env.NOTION_BLOG_DB_ID && process.env.NOTION_API_KEY) {
    try {
      const entries = await getInitialBlogEntries(200);
      initialPosts = sortPosts(entries.map(normalizePostFromBlogEntry));
    } catch {
      initialPosts = [];
    }
  }

  return <CodexPageClient initialPosts={initialPosts} />;
}
