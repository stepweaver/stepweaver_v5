"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PostItem } from "./post-item";
import {
  sortPosts,
  extractUniqueTags,
  filterPostsByTags,
  formatCodexDate,
  normalizeTag,
  type CodexPost,
} from "@/lib/codex/selectors";

function CodexContent({ initialPosts = [] }: { initialPosts?: CodexPost[] }) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<CodexPost[]>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [activeHashtags, setActiveHashtags] = useState<string[]>([]);

  useEffect(() => {
    const hashtagParam = searchParams.get("hashtag");
    if (hashtagParam) setActiveHashtags([normalizeTag(hashtagParam)]);
  }, [searchParams]);

  useEffect(() => {
    if (initialPosts.length > 0) {
      setPosts(initialPosts);
      setLoading(false);
      return;
    }
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/codex");
        if (!res.ok) throw new Error("Failed to fetch content");
        const data = (await res.json()) as CodexPost[];
        setPosts(Array.isArray(data) ? data : []);
      } catch {
        setPosts([]);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [initialPosts]);

  const allPosts = useMemo(() => sortPosts(posts), [posts]);
  const filteredHashtags = useMemo(() => extractUniqueTags(allPosts), [allPosts]);
  const filteredPosts = useMemo(
    () => filterPostsByTags(allPosts, activeHashtags),
    [allPosts, activeHashtags]
  );

  const handleHashtagClick = (tag: string) => {
    const n = normalizeTag(tag);
    setActiveHashtags((prev) => (prev.includes(n) ? prev.filter((t) => t !== n) : [...prev, n]));
  };

  const tagButtonClass = (isActive: boolean) =>
    `px-3 py-1 text-xs font-[var(--font-ocr)] tracking-wider uppercase border rounded-sm transition-all duration-200 cursor-pointer ${
      isActive
        ? "border-[rgb(var(--neon))] text-[rgb(var(--neon))] bg-[rgb(var(--neon)/0.25)]"
        : "border-[rgb(var(--neon)/0.25)] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--neon)/0.5)] hover:text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.05)]"
    }`;

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 space-y-4 md:space-y-5">
            <div className="space-y-3">
              <p className="text-xs tracking-[0.3em] text-[rgb(var(--neon)/0.6)] font-[var(--font-ocr)] uppercase">
                Codex
              </p>
              <h1 className="font-[var(--font-ibm)] text-4xl sm:text-5xl md:text-6xl font-bold text-[rgb(var(--text-color))] leading-tight">
                Digital codex.
              </h1>
              <p className="font-[var(--font-ibm)] text-base sm:text-lg text-[rgb(var(--text-secondary))] leading-relaxed max-w-3xl">
                Developer notes, projects, and community thoughts.
              </p>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-[rgb(var(--neon)/0.4)] via-[rgb(var(--neon)/0.1)] to-transparent" />
          </div>

          {loading ? (
            <div className="min-h-64" />
          ) : error ? (
            <div className="border border-[rgb(var(--neon)/0.3)] rounded-sm bg-[rgb(var(--border)/0.3)] text-[rgb(var(--neon))] p-4 my-4">
              {error}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 max-w-4xl">
                <div className="mb-8 lg:hidden">
                  {filteredHashtags.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] tracking-[0.25em] text-[rgb(var(--neon)/0.5)] font-[var(--font-ocr)] uppercase mb-3">
                        FILTER BY TAG
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {filteredHashtags.map((tag) => {
                          const count = allPosts.filter((p) => p.hashtags?.includes(tag)).length;
                          const isActive = activeHashtags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleHashtagClick(tag)}
                              className={tagButtonClass(isActive)}
                            >
                              #{tag}{" "}
                              <span className="text-[rgb(var(--text-meta))] ml-1">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                      {activeHashtags.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveHashtags([])}
                          className="mt-3 text-[10px] tracking-[0.15em] text-[rgb(var(--neon)/0.5)] hover:text-[rgb(var(--neon))] font-[var(--font-ocr)] cursor-pointer transition-colors uppercase"
                        >
                          [ CLEAR FILTERS ]
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] tracking-[0.25em] text-[rgb(var(--neon)/0.5)] font-[var(--font-ocr)] uppercase mb-3">
                    PROJECTS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/meshtastic"
                      className="px-3 py-1 text-xs font-[var(--font-ocr)] tracking-wider uppercase border border-[rgb(var(--neon)/0.25)] text-[rgb(var(--text-secondary))] rounded-sm hover:border-[rgb(var(--neon)/0.5)] hover:text-[rgb(var(--neon))] transition-all"
                    >
                      Meshtastic
                    </Link>
                    <Link
                      href="/terminal"
                      className="px-3 py-1 text-xs font-[var(--font-ocr)] tracking-wider uppercase border border-[rgb(var(--neon)/0.25)] text-[rgb(var(--text-secondary))] rounded-sm hover:border-[rgb(var(--neon)/0.5)] hover:text-[rgb(var(--neon))] transition-all"
                    >
                      Terminal
                    </Link>
                    <Link
                      href="/dice-roller"
                      className="px-3 py-1 text-xs font-[var(--font-ocr)] tracking-wider uppercase border border-[rgb(var(--neon)/0.25)] text-[rgb(var(--text-secondary))] rounded-sm hover:border-[rgb(var(--neon)/0.5)] hover:text-[rgb(var(--neon))] transition-all"
                    >
                      Dice Roller
                    </Link>
                  </div>
                  <div className="h-px bg-[rgb(var(--neon)/0.1)] mt-6" />
                </div>

                <div>
                  {filteredPosts.map((post, index) => (
                    <PostItem
                      key={`${post.slug}-${index}`}
                      post={post}
                      index={index}
                      formatDate={formatCodexDate}
                      onHashtagClick={handleHashtagClick}
                    />
                  ))}
                  {filteredPosts.length === 0 && (
                    <div className="text-center py-16 border border-[rgb(var(--neon)/0.1)] bg-[rgb(var(--border)/0.2)]">
                      <p className="font-[var(--font-ocr)] text-[rgb(var(--text-secondary))] text-sm tracking-wide uppercase mb-3">
                        No entries match current filters
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveHashtags([])}
                        className="font-[var(--font-ocr)] text-xs tracking-[0.15em] text-[rgb(var(--neon)/0.6)] hover:text-[rgb(var(--neon))] transition-colors cursor-pointer uppercase"
                      >
                        [ CLEAR FILTERS ]
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-72 flex-shrink-0 hidden lg:block">
                <div className="sticky top-28 space-y-8">
                  {filteredHashtags.length > 0 && (
                    <div>
                      <p className="text-[10px] tracking-[0.25em] text-[rgb(var(--neon)/0.5)] font-[var(--font-ocr)] uppercase mb-4">
                        FILTER BY TAG
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {filteredHashtags.map((tag) => {
                          const count = allPosts.filter((p) => p.hashtags?.includes(tag)).length;
                          const isActive = activeHashtags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleHashtagClick(tag)}
                              className={tagButtonClass(isActive)}
                            >
                              #{tag}{" "}
                              <span className="text-[rgb(var(--text-meta))] ml-1">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                      {activeHashtags.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveHashtags([])}
                          className="mt-4 text-[10px] tracking-[0.15em] text-[rgb(var(--neon)/0.5)] hover:text-[rgb(var(--neon))] font-[var(--font-ocr)] cursor-pointer transition-colors uppercase"
                        >
                          [ CLEAR FILTERS ]
                        </button>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] tracking-[0.25em] text-[rgb(var(--neon)/0.5)] font-[var(--font-ocr)] uppercase mb-4">
                      PROJECTS
                    </p>
                    <div className="space-y-1">
                      <Link
                        href="/meshtastic"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--neon))] transition-colors font-[var(--font-ocr)] tracking-wide group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--neon)/0.3)] group-hover:bg-[rgb(var(--neon))] transition-colors shrink-0" />
                        Meshtastic
                      </Link>
                      <Link
                        href="/terminal"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--neon))] transition-colors font-[var(--font-ocr)] tracking-wide group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--neon)/0.3)] group-hover:bg-[rgb(var(--neon))] transition-colors shrink-0" />
                        Terminal
                      </Link>
                      <Link
                        href="/dice-roller"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--neon))] transition-colors font-[var(--font-ocr)] tracking-wide group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--neon)/0.3)] group-hover:bg-[rgb(var(--neon))] transition-colors shrink-0" />
                        Dice Roller
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CodexPageClient({ initialPosts = [] }: { initialPosts?: CodexPost[] }) {
  return (
    <Suspense fallback={null}>
      <CodexContent initialPosts={initialPosts} />
    </Suspense>
  );
}
