"use client";

import { useState, useCallback, useRef } from "react";
import { buildChatRequestPayload } from "@/lib/chat/request-builder";
import { useBotProtection } from "@/hooks/use-bot-protection";
import { parseChatLinksWithGlitch } from "@/components/chat/parse-chat-links";
import { SourceCitations, type Citation } from "@/components/chat/source-citations";

type Msg = {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

type Props = {
  slug: string;
  title: string;
  summary: string;
};

export function ProjectCaseChat({ slug, title, summary }: Props) {
  const { getBotFields, honeypotProps } = useBotProtection();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    let thread: Msg[] = [];
    setMessages((m) => {
      thread = [...m, { role: "user", content: text }];
      return thread;
    });
    setInput("");
    setLoading(true);
    setError(null);

    const seq = ++seqRef.current;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildChatRequestPayload({
            channel: "widget",
            messages: thread.map((x) => ({ role: x.role, content: x.content })),
            botFields: getBotFields(),
            projectCaseStudy: { slug, title, summary },
          })
        ),
        signal: ac.signal,
      });
      const data = (await res.json()) as { message?: string; error?: string; citations?: Citation[] };
      if (!res.ok) throw new Error(data.error || "Chat failed");
      if (seq !== seqRef.current) return;
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.message || "", citations: data.citations || [] },
      ]);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      if (seq !== seqRef.current) return;
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      if (seq === seqRef.current) setLoading(false);
    }
  }, [input, loading, slug, title, summary, getBotFields]);

  return (
    <div className="surface-panel p-4 border border-[rgb(var(--border)/0.25)] relative">
      <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 h-0 w-0 overflow-hidden pointer-events-none">
        <input {...honeypotProps} />
      </div>
      <div className="text-label mb-2">ASK.LAMBDA</div>
      <p className="text-xs text-[rgb(var(--text-meta))] mb-3 font-[var(--font-ibm)]">
        Questions about this case study. Replies use the dossier summary plus site context.
      </p>
      <div className="space-y-2 max-h-48 overflow-y-auto mb-3 text-sm font-[var(--font-ibm)]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "text-[rgb(var(--text-secondary))]"
                : "text-[rgb(var(--neon))] whitespace-pre-wrap"
            }
          >
            {m.role === "user" ? "> " : "λ "}
            {m.role === "assistant" ? (
              <>
                <span className="inline">{parseChatLinksWithGlitch(m.content)}</span>
                {m.citations && m.citations.length > 0 ? (
                  <SourceCitations citations={m.citations} />
                ) : null}
              </>
            ) : (
              m.content
            )}
          </div>
        ))}
        {error && <div className="text-[rgb(var(--red))] text-xs">{error}</div>}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void send())}
          placeholder="Ask about this project…"
          className="flex-1 bg-[rgb(var(--bg))] border border-[rgb(var(--border)/0.35)] px-2 py-1.5 text-xs text-[rgb(var(--text-color))] outline-none focus:border-[rgb(var(--neon)/0.5)]"
          disabled={loading}
          aria-label="Message to Lambda about this project"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading || !input.trim()}
          className="font-[var(--font-ocr)] text-xs uppercase tracking-wider px-3 py-1.5 border border-[rgb(var(--neon)/0.45)] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.08)] disabled:opacity-40 transition-colors"
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
