import Link from "next/link";
import type { CodexPost } from "@/lib/codex/selectors";
import { formatCodexDate } from "@/lib/codex/selectors";

export function WritingStrip({ posts }: { posts: CodexPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-14 py-10">
      <p className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.28em] text-[rgb(var(--text-label))] mb-2">
        Writing
      </p>
      <h2 className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] mb-6">
        Systems, requirements, and architecture.
      </h2>
      <div className="space-y-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/writing/${post.slug}`}
            className="block bg-[rgb(var(--panel))] p-5 hover:bg-[rgb(var(--neon)/0.04)] transition-colors"
          >
            <p className="font-[var(--font-ocr)] text-[10px] tracking-wider text-[rgb(var(--text-meta))] mb-1">
              {formatCodexDate(post.updated || post.date)}
            </p>
            <h3 className="font-[var(--font-ibm)] text-[rgb(var(--text-color))]">{post.title}</h3>
            {post.description ? (
              <p className="text-[rgb(var(--text-secondary))] text-sm mt-1 line-clamp-2">{post.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
      <p className="mt-4">
        <Link href="/writing" className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))]">
          All writing →
        </Link>
      </p>
    </section>
  );
}
