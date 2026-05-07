import Link from "next/link";
import { getInitialBlogEntries } from "@/lib/blog";
import {
  isSystemsLogEntry,
  normalizeSystemsLogPost,
  sortSystemsLogPosts,
  SYSTEMS_LOG_SERIES_TITLE,
  type SystemsLogPost,
} from "@/lib/systems-log/selectors";
import { formatCodexDate, normalizeTag } from "@/lib/codex/selectors";

export const metadata = {
  title: SYSTEMS_LOG_SERIES_TITLE,
  description:
    "A working log on professional positioning, business-systems development, AI-assisted workflows, and turning reflection into visible proof.",
};

const PLANNED_SERIES: { title: string; expectedSlug: string }[] = [
  { title: "How I Found My Professional Positioning", expectedSlug: "how-i-found-my-professional-positioning" },
  {
    title: "Why I’m Not Positioning Myself as a Generic Software Engineer",
    expectedSlug: "why-im-not-positioning-myself-as-a-generic-software-engineer",
  },
  { title: "The Business-Systems Developer Path", expectedSlug: "the-business-systems-developer-path" },
  { title: "My Weekly Proof Artifact Rule", expectedSlug: "my-weekly-proof-artifact-rule" },
  { title: "From Business Analyst to Systems Builder", expectedSlug: "from-business-analyst-to-systems-builder" },
  { title: "What I’m Building With λstepweaver", expectedSlug: "what-im-building-with-lambda-stepweaver" },
  {
    title: "How I Use AI as a Development and Thinking Partner",
    expectedSlug: "how-i-use-ai-as-a-development-and-thinking-partner",
  },
];

function findPublishedMatch(posts: SystemsLogPost[], expectedSlug: string, title: string): SystemsLogPost | null {
  const bySlug = posts.find((p) => p.slug === expectedSlug);
  if (bySlug) return bySlug;
  const titleKey = title.trim().toLowerCase();
  return posts.find((p) => (p.title || "").trim().toLowerCase() === titleKey) ?? null;
}

function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  const filtered = tags
    .map(normalizeTag)
    .filter(Boolean)
    .filter((t) => t !== "systems-log");
  if (!filtered.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {filtered.map((tag) => (
        <Link
          key={tag}
          href={`/codex?hashtag=${encodeURIComponent(tag)}`}
          className="px-2.5 py-1 text-[10px] font-[var(--font-ocr)] tracking-[0.15em] uppercase border border-[rgb(var(--neon)/0.25)] text-[rgb(var(--text-secondary))] rounded-sm hover:border-[rgb(var(--neon)/0.6)] hover:text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.08)] transition-all"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}

export default async function SystemsLogPage() {
  let posts: SystemsLogPost[] = [];

  if (process.env.NOTION_BLOG_DB_ID && process.env.NOTION_API_KEY) {
    try {
      const entries = await getInitialBlogEntries(200);
      posts = sortSystemsLogPosts(entries.filter(isSystemsLogEntry).map(normalizeSystemsLogPost));
    } catch {
      posts = [];
    }
  }

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 pt-14 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 space-y-5">
            <div className="space-y-3">
              <p className="text-xs tracking-[0.3em] text-[rgb(var(--neon)/0.6)] font-[var(--font-ocr)] uppercase">
                SYSTEMS LOG
              </p>
              <h1 className="font-[var(--font-ibm)] text-4xl sm:text-5xl md:text-6xl font-bold text-[rgb(var(--text-color))] leading-tight">
                Kaizen, proof, and practical systems.
              </h1>
              <p className="font-[var(--font-ibm)] text-base sm:text-lg text-[rgb(var(--text-secondary))] leading-relaxed max-w-3xl">
                A working log on professional positioning, business-systems development, AI-assisted workflows, and
                turning reflection into visible proof.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-[rgb(var(--neon)/0.25)] rounded-sm bg-[rgb(var(--border)/0.18)] p-5">
                <p className="text-[10px] tracking-[0.22em] text-[rgb(var(--neon)/0.7)] font-[var(--font-ocr)] uppercase mb-2">
                  Core thesis
                </p>
                <p className="font-[var(--font-ibm)] text-[rgb(var(--text-color))] leading-relaxed">
                  I build practical business systems that turn messy operations into clearer decisions and smoother
                  customer flows.
                </p>
              </div>
              <div className="border border-[rgb(var(--neon)/0.1)] rounded-sm bg-[rgb(var(--panel)/0.18)] p-5">
                <p className="font-[var(--font-ibm)] text-sm sm:text-base text-[rgb(var(--text-secondary))] leading-relaxed">
                  This series grew out of a structured Kaizen review of my background, projects, strengths, gaps, and
                  proof artifacts. The goal is not self-branding for its own sake. The goal is to make the pattern of my
                  work visible before it gets reduced to a resume checkbox.
                </p>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-[rgb(var(--neon)/0.4)] via-[rgb(var(--neon)/0.1)] to-transparent" />
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px] items-start">
            <div className="min-w-0">
              <div className="mb-8 border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--border)/0.2)] rounded-sm p-5">
                <p className="text-[10px] tracking-[0.25em] text-[rgb(var(--neon)/0.55)] font-[var(--font-ocr)] uppercase mb-4">
                  Series index (planned)
                </p>
                <ul className="space-y-2">
                  {PLANNED_SERIES.map((item) => {
                    const match = findPublishedMatch(posts, item.expectedSlug, item.title);
                    return (
                      <li key={item.expectedSlug} className="flex items-start gap-3">
                        <span
                          className={`mt-1 h-2 w-2 rounded-full ${
                            match ? "bg-[rgb(var(--neon))]" : "bg-[rgb(var(--neon)/0.25)]"
                          }`}
                          aria-hidden
                        />
                        <div className="min-w-0">
                          {match ? (
                            <Link
                              href={`/systems-log/${match.slug}`}
                              className="font-[var(--font-ibm)] text-[rgb(var(--text-color))] hover:text-[rgb(var(--neon))] transition-colors"
                            >
                              {item.title}
                            </Link>
                          ) : (
                            <div className="font-[var(--font-ibm)] text-[rgb(var(--text-secondary))]">
                              {item.title}{" "}
                              <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.18em] uppercase text-[rgb(var(--text-meta))]">
                                [planned]
                              </span>
                            </div>
                          )}
                          <div className="font-mono text-[10px] text-[rgb(var(--text-meta))] mt-1">
                            /systems-log/{item.expectedSlug}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] tracking-[0.25em] text-[rgb(var(--neon)/0.55)] font-[var(--font-ocr)] uppercase">
                  Entries
                </p>

                {posts.length === 0 ? (
                  <div className="border border-[rgb(var(--neon)/0.12)] bg-[rgb(var(--panel)/0.15)] rounded-sm p-5">
                    <p className="font-[var(--font-ibm)] text-[rgb(var(--text-secondary))] leading-relaxed">
                      No Systems Log entries are published yet. Drafts are being processed from the Kaizen project.
                      Published entries will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/systems-log/${post.slug}`}
                        className="block border border-[rgb(var(--neon)/0.12)] bg-[rgb(var(--panel)/0.12)] hover:bg-[rgb(var(--panel)/0.22)] rounded-sm p-5 transition-colors"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                          <h2 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] leading-snug">
                            {post.title}
                          </h2>
                          <div className="font-[var(--font-ocr)] text-xs text-[rgb(var(--text-meta))]">
                            {post.updated && post.updated !== post.date
                              ? `Updated: ${formatCodexDate(post.updated)}`
                              : formatCodexDate(post.date || "")}
                          </div>
                        </div>
                        {post.description ? (
                          <p className="mt-3 font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))] leading-relaxed max-w-3xl">
                            {post.description}
                          </p>
                        ) : null}
                        <TagRow tags={post.hashtags} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28 border border-[rgb(var(--neon)/0.12)] bg-[rgb(var(--panel)/0.12)] rounded-sm p-5">
                <p className="text-[10px] tracking-[0.25em] text-[rgb(var(--neon)/0.55)] font-[var(--font-ocr)] uppercase mb-3">
                  Positioning
                </p>
                <p className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                  I build practical business systems that turn messy operations into clearer decisions and smoother
                  customer flows.
                </p>
                <div className="h-px bg-[rgb(var(--neon)/0.1)] my-4" />
                <div className="space-y-2 text-xs font-[var(--font-ocr)] tracking-[0.14em] uppercase text-[rgb(var(--text-meta))]">
                  <div>Business-systems developer</div>
                  <div>Technical generalist</div>
                  <div>Systems builder</div>
                  <div>Proof artifacts</div>
                  <div>AI-assisted workflow</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

