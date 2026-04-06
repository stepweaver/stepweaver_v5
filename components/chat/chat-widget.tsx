"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useChat } from "@/hooks/use-chat";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, input, setInput, isLoading, error, send } = useChat();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[100] flex h-12 w-12 items-center justify-center border border-[rgb(var(--neon)/0.4)] bg-[rgb(var(--bg))] text-[rgb(var(--neon))] shadow-lg hover:bg-[rgb(var(--neon)/0.1)] transition-colors font-[var(--font-ocr)] text-xs"
        aria-label={open ? "Close chat" : "Open lambda chat"}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-6 z-[100] w-[min(100vw-2rem,380px)] border border-[rgb(var(--neon)/0.35)] bg-[rgb(var(--bg))] shadow-xl flex flex-col max-h-[min(70vh,480px)]">
          <div className="px-3 py-2 border-b border-[rgb(var(--neon)/0.2)] flex items-center justify-between">
            <span className="font-[var(--font-ocr)] text-xs tracking-wider text-[rgb(var(--neon))]">λ CHAT</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[rgb(var(--muted-color))] hover:text-[rgb(var(--text-color))] p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm font-[var(--font-ibm)]">
            {messages.length === 0 ? (
              <p className="text-[rgb(var(--text-secondary))] text-xs">Ask about projects, stack, or availability.</p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "text-[rgb(var(--text-color))] text-right"
                    : "text-[rgb(var(--neon))] text-left whitespace-pre-wrap"
                }
              >
                {m.content}
              </div>
            ))}
            {isLoading ? <div className="text-[rgb(var(--muted-color))] text-xs">Thinking…</div> : null}
            {error ? <div className="text-[rgb(var(--red))] text-xs">{error}</div> : null}
            <div ref={endRef} />
          </div>
          <form
            className="p-2 border-t border-[rgb(var(--neon)/0.2)] flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message lambda…"
              className="flex-1 bg-transparent border border-[rgb(var(--border)/0.5)] px-2 py-1.5 text-sm text-[rgb(var(--text-color))] outline-none focus:border-[rgb(var(--neon)/0.5)]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3 py-1.5 border border-[rgb(var(--neon)/0.4)] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)] disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
