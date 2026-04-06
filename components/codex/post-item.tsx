"use client";

import { useState } from "react";
import Link from "next/link";
import type { CodexPost } from "@/lib/codex/selectors";

type Props = {
  post: CodexPost;
  index: number;
  formatDate: (_d: string) => string;
  onHashtagClick?: (_tag: string) => void;
};

export function PostItem({ post, index, formatDate, onHashtagClick }: Props) {
  const [hovered, setHovered] = useState(false);

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    onHashtagClick?.(tag);
  };

  return (
    <article className="group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link href={`/codex/${post.slug}`} className="block py-6 sm:py-8">
        <div className="flex flex-nowrap items-center justify-between overflow-x-auto mb-3">
          <span className="font-mono text-[10px] tracking-[0.25em] text-[rgb(var(--neon)/0.4)] uppercase whitespace-nowrap shrink-0">
            CODEX-{String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-[var(--font-ibm)] text-xs text-[rgb(var(--text-secondary))] tracking-wide whitespace-nowrap shrink-0">
            {post.updated && post.updated !== post.date
              ? `Updated: ${formatDate(post.updated)}`
              : formatDate(post.date)}
          </span>
        </div>

        <h3
          className={`font-[var(--font-ibm)] text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide text-[rgb(var(--text-color))] leading-tight mb-3 transition-all duration-200 ${
            hovered ? "text-[rgb(var(--neon))]" : ""
          }`}
        >
          {post.title}
        </h3>

        {post.description && (
          <p className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-4 max-w-2xl">
            {post.description}
          </p>
        )}

        {post.hashtags?.length ? (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                role="button"
                tabIndex={0}
                className="px-3 py-1 text-xs font-[var(--font-ibm)] tracking-[0.06em] border border-[rgb(var(--neon)/0.3)] text-[rgb(var(--text-secondary))] rounded-sm transition-all duration-200 cursor-pointer hover:border-[rgb(var(--neon)/0.7)] hover:text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)]"
                onClick={(e) => handleTagClick(e, tag)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onHashtagClick?.(tag);
                  }
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </Link>

      <div className="h-px bg-[rgb(var(--neon)/0.1)]" />
    </article>
  );
}
