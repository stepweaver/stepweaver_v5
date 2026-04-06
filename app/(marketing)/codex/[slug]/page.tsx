import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogEntryBySlug, getInitialBlogEntries } from "@/lib/blog";
import { getPageBlocks, type NotionBlock } from "@/lib/notion-blocks";
import { NotionBlockBody } from "@/components/codex/notion-block-body";
export const revalidate = 60;
export const dynamicParams = true;

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map((part) => part.replace(/[^0-9]/g, ""));
    if (!year || !month || !day) return dateStr;
    const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)));
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `[${y}-${m}-${d}]`;
  } catch {
    return dateStr;
  }
}

export async function generateStaticParams() {
  if (!process.env.NOTION_BLOG_DB_ID) return [];
  try {
    const entries = await getInitialBlogEntries(50);
    return entries.filter((e) => e.slug).map((entry) => ({ slug: entry.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getBlogEntryBySlug(slug);
  if (!entry) return { title: "Not Found", description: "The page you requested was not found" };
  const title = entry.title || "Blog Post";
  const description = entry.description || `${title} · stepweaver.dev`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

export default async function CodexPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let entry;
  let blocks: NotionBlock[] = [];
  try {
    entry = await getBlogEntryBySlug(slug);
    if (!entry) notFound();
    blocks = await getPageBlocks(entry.id);
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error("[codex]", e);
    notFound();
  }

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 pt-14 pb-16">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/codex"
            className="inline-flex items-center gap-2 mb-10 font-[var(--font-ocr)] text-xs tracking-[0.15em] uppercase text-[rgb(var(--neon)/0.6)] hover:text-[rgb(var(--neon))] transition-colors"
          >
            <span className="text-[rgb(var(--neon)/0.4)]">&larr;</span> Back to Codex
          </Link>

          <article>
            <header className="mb-10">
              <div className="flex flex-nowrap items-center justify-between overflow-x-auto mb-4">
                <span className="font-mono text-[10px] tracking-[0.25em] text-[rgb(var(--neon)/0.4)] uppercase whitespace-nowrap shrink-0">
                  CODEX // ENTRY
                </span>
                <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--text-meta))] tracking-wide whitespace-nowrap shrink-0">
                  {entry.updated && entry.updated !== entry.date
                    ? `Updated: ${formatDate(entry.updated)}`
                    : formatDate(entry.date || "")}
                </span>
              </div>

              <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl md:text-5xl font-bold text-[rgb(var(--text-color))] uppercase tracking-wide leading-tight mb-4">
                {entry.title || "Untitled"}
              </h1>

              {entry.description ? (
                <p className="font-[var(--font-ocr)] text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-5 max-w-2xl">
                  {entry.description}
                </p>
              ) : null}

              {entry.hashtags && entry.hashtags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {entry.hashtags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/codex?hashtag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 text-xs font-[var(--font-ocr)] tracking-wider uppercase border border-[rgb(var(--neon)/0.3)] text-[rgb(var(--text-secondary))] rounded-sm hover:border-[rgb(var(--neon)/0.7)] hover:text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)] transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}

              <div className="h-px bg-[rgb(var(--neon)/0.1)]" />
            </header>

            {blocks.length > 0 ? (
              <div className="prose prose-invert prose-lg max-w-none">
                <NotionBlockBody blocks={blocks} />
              </div>
            ) : null}
          </article>
        </div>
      </div>
    </div>
  );
}
