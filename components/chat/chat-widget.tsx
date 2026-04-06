"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MessageCircle, X, Send, User, Paperclip, Loader2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { parseChatLinksWithGlitch } from "@/components/chat/parse-chat-links";
import { SourceCitations } from "@/components/chat/source-citations";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    messages,
    input,
    setInput,
    attachments,
    addAttachment,
    removeAttachment,
    isLoading,
    error,
    sendMessage,
    handleSubmit,
    honeypotProps,
  } = useChat({ inputRef, isVisible: open });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === "string") addAttachment(dataUrl, file.type);
    };
    reader.readAsDataURL(file);
  };

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
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm font-[var(--font-ibm)]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center overflow-hidden ${
                    m.role === "user"
                      ? "bg-[rgb(var(--accent)/0.2)] text-[rgb(var(--accent))]"
                      : "bg-[rgb(var(--neon)/0.2)] text-[rgb(var(--neon))]"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Image
                      src="/images/lambda_stepweaver.png"
                      alt=""
                      width={18}
                      height={18}
                      className="object-contain"
                    />
                  )}
                </div>
                <div
                  className={`max-w-[80%] p-2.5 rounded font-[var(--font-ocr)] text-sm leading-relaxed border ${
                    m.role === "user"
                      ? "bg-[rgb(var(--cyan)/0.1)] border-[rgb(var(--cyan)/0.3)] text-[rgb(var(--text-color))]"
                      : "bg-[rgb(var(--window)/0.5)] border-[rgb(var(--border)/0.35)] text-[rgb(var(--text-color))]"
                  }`}
                >
                  {m.attachments && m.attachments.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {m.attachments.map((att, j) => (
                        // eslint-disable-next-line @next/next/no-img-element -- user data URL previews
                        <img
                          key={j}
                          src={att.dataUrl}
                          alt=""
                          className="max-w-full max-h-24 object-contain rounded border border-[rgb(var(--border)/0.5)]"
                        />
                      ))}
                    </div>
                  ) : null}
                  {m.content ? (
                    <div className="whitespace-pre-wrap break-words">
                      {parseChatLinksWithGlitch(m.content)}
                    </div>
                  ) : null}
                  {m.role === "assistant" && m.citations && m.citations.length > 0 ? (
                    <SourceCitations citations={m.citations} />
                  ) : null}
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="flex gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center bg-[rgb(var(--neon)/0.2)] overflow-hidden">
                  <Image
                    src="/images/lambda_stepweaver.png"
                    alt=""
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                </div>
                <div className="bg-[rgb(var(--panel)/0.5)] border border-[rgb(var(--neon)/0.2)] p-2.5 rounded-lg">
                  <Loader2 className="w-4 h-4 text-[rgb(var(--neon))] animate-spin" />
                </div>
              </div>
            ) : null}
            {error ? <div className="text-[rgb(var(--red))] text-xs">{error}</div> : null}
            <div ref={endRef} />
          </div>
          <form
            className="relative p-2 border-t border-[rgb(var(--neon)/0.2)] flex flex-col gap-2"
            onSubmit={handleSubmit}
          >
            <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 h-0 w-0 overflow-hidden pointer-events-none">
              <input {...honeypotProps} />
            </div>
            {attachments.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {attachments.map((a, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-[10px] text-[rgb(var(--muted-color))] border border-[rgb(var(--border)/0.4)] px-1 rounded"
                  >
                    × img {idx + 1}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" className="hidden" onChange={onFile} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="shrink-0 p-2 border border-[rgb(var(--border)/0.5)] text-[rgb(var(--muted-color))] hover:text-[rgb(var(--neon))]"
                aria-label="Attach image"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Message λlambda…"
                className="flex-1 bg-transparent border border-[rgb(var(--border)/0.5)] px-2 py-1.5 text-sm text-[rgb(var(--text-color))] outline-none focus:border-[rgb(var(--neon)/0.5)]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                className="px-3 py-1.5 border border-[rgb(var(--neon)/0.4)] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)] disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
