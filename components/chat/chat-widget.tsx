"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Minimize2, Maximize2, Expand, Shrink } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useVisualViewportRect } from "@/hooks/use-visual-viewport-rect";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { ChatMessageBubble, ChatLoadingIndicator } from "@/components/chat/chat-message";
import { GlitchLambda } from "@/components/ui/glitch-lambda";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    input,
    setInput,
    attachments,
    addAttachment,
    removeAttachment,
    isLoading,
    error,
    handleSubmit,
    honeypotProps,
  } = useChat({ inputRef, isVisible: isOpen && !isMinimized });

  const { scrollerRef, endRef, isAtBottom, scrollToBottom, stickToBottom, scrollIfSticky } =
    useAutoScroll({ bottomThreshold: 120 });

  const visualViewportRect = useVisualViewportRect(isOpen && isFullscreen);

  useLayoutEffect(() => {
    if (isOpen && !isMinimized) {
      scrollIfSticky(!isLoading);
    }
  }, [messages, isLoading, isOpen, isMinimized, scrollIfSticky]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        stickToBottom();
        handleSubmit(e);
      }
    },
    [handleSubmit, stickToBottom]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file || file.size > 4 * 1024 * 1024) continue;
          const reader = new FileReader();
          reader.onload = () => {
            const r = reader.result;
            if (typeof r === "string") addAttachment(r, file.type);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    },
    [addAttachment]
  );

  const prevMessageCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessageCount.current && isMinimized) {
      setHasNewMessage(true);
    }
    prevMessageCount.current = messages.length;
  }, [messages.length, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) setHasNewMessage(false);
  }, [isOpen, isMinimized]);

  const toggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setIsFullscreen(true);
    } else {
      setIsOpen(false);
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFullscreen]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stickToBottom();
    handleSubmit(e);
  };

  const vvStyle =
    isFullscreen && isOpen
      ? {
          top: visualViewportRect.top,
          height: visualViewportRect.height,
          maxHeight: visualViewportRect.height,
        }
      : undefined;

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close chat"
          onClick={toggleOpen}
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-md cursor-pointer"
        />
      ) : null}

      {isOpen ? (
        <div
          className={`fixed ${
            isFullscreen
              ? "left-0 right-0 m-0 z-[200]"
              : `transition-all duration-300 z-[100] ${
                  isMinimized
                    ? "bottom-20 right-4 sm:right-6 w-72 h-14"
                    : "bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[min(28rem,90vw)] md:w-[min(32rem,90vw)] h-[500px] max-h-[70vh]"
                }`
          }`}
          style={vvStyle}
        >
          <div
            className="hud-panel h-full flex flex-col relative overflow-hidden border-[rgb(var(--neon)/0.25)]"
            style={{
              background: "rgb(var(--panel))",
              backdropFilter: "none",
              boxShadow:
                "0 0 24px rgb(var(--neon) / 0.25), 0 4px 30px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[rgb(var(--neon)/0.2)]"
              style={{ background: "rgb(var(--panel))" }}
            >
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="font-[var(--font-ibm)] text-base sm:text-lg font-semibold text-neon whitespace-nowrap flex items-center gap-1">
                  <GlitchLambda className="text-neon" size="small" />
                  lambda
                </span>
                <span className="font-mono text-[10px] text-[rgb(var(--neon)/0.5)] ml-1 shrink-0 hidden sm:inline">
                  CHAT-00
                </span>
                {hasNewMessage && isMinimized ? (
                  <span className="w-2 h-2 rounded-full bg-[rgb(var(--neon))] animate-pulse shrink-0" />
                ) : null}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isMinimized && !isAtBottom ? (
                  <button
                    type="button"
                    onClick={() => {
                      stickToBottom();
                      scrollToBottom("smooth");
                    }}
                    className="text-xs text-[rgb(var(--neon)/0.8)] hover:text-neon underline cursor-pointer"
                  >
                    Jump to latest
                  </button>
                ) : null}
                {!isMinimized ? (
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1 text-[rgb(var(--muted-color))] hover:text-neon transition-colors cursor-pointer"
                    aria-label={isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
                  >
                    {isFullscreen ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    if (isFullscreen) setIsFullscreen(false);
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1 text-[rgb(var(--muted-color))] hover:text-neon transition-colors cursor-pointer"
                  aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleOpen}
                  className="p-1 text-[rgb(var(--muted-color))] hover:text-neon transition-colors cursor-pointer"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized ? (
              <>
                <div
                  ref={scrollerRef}
                  className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
                  style={{
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain",
                    paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
                    scrollPaddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
                  }}
                >
                  {messages.map((message, index) => (
                    <ChatMessageBubble key={index} message={message} variant="compact" />
                  ))}
                  {isLoading ? <ChatLoadingIndicator variant="compact" /> : null}
                  {error ? (
                    <div className="p-2.5 bg-[rgb(var(--danger)/0.1)] border border-[rgb(var(--danger)/0.3)] rounded-lg">
                      <p className="text-danger font-[var(--font-ocr)] text-sm">{error}</p>
                    </div>
                  ) : null}
                  <div ref={endRef} style={{ height: 1 }} />
                </div>

                <form onSubmit={onFormSubmit} className="p-3 border-t border-[rgb(var(--neon)/0.2)] relative">
                  <div
                    aria-hidden="true"
                    className="absolute -left-[9999px] opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
                  >
                    <input {...honeypotProps} />
                  </div>
                  {attachments.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {attachments.map((att, i) => (
                        <div key={i} className="relative group inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={att.dataUrl}
                            alt="Pasted"
                            className="w-14 h-14 object-cover rounded border border-[rgb(var(--neon)/0.3)]"
                          />
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[rgb(var(--danger))] text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                      placeholder="Ask me anything… (Shift+Enter for new line, paste images)"
                      rows={3}
                      className="flex-1 min-w-0 bg-[rgb(var(--panel)/0.4)] border border-[rgb(var(--neon)/0.25)] text-[rgb(var(--text-color))] font-[var(--font-ocr)] text-base sm:text-sm min-h-[5rem] max-h-40 p-2.5 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--neon)/0.4)] focus:border-[rgb(var(--neon)/0.5)] placeholder:text-[rgb(var(--muted-color)/0.6)] resize-y overflow-y-auto"
                      disabled={isLoading}
                      style={{ resize: "vertical" }}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || (!input.trim() && attachments.length === 0)}
                      className="px-3 py-2 bg-[rgb(var(--neon)/0.1)] border border-[rgb(var(--neon))] text-neon rounded hover:bg-[rgb(var(--neon)/0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[rgb(var(--muted-color)/0.85)] font-[var(--font-ocr)] mt-2 text-center">
                    Conversations are processed by Groq API and not stored.{" "}
                    <Link
                      href="/privacy"
                      className="text-neon hover:text-accent underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isFullscreen ? (
        <button
          type="button"
          onClick={toggleOpen}
          className={`fixed bottom-4 right-4 sm:right-6 z-[100] flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-2 transition-all duration-300 cursor-pointer shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.08)] ${
            isOpen
              ? "border-[rgb(var(--neon)/0.5)] text-neon hover:bg-[rgb(var(--neon)/0.1)]"
              : "border-[rgb(var(--neon))] text-neon hover:bg-[rgb(var(--neon)/0.25)] hover:shadow-[0_0_20px_rgb(var(--neon)/0.35),inset_0_0_0_1px_rgb(var(--neon)/0.12)]"
          }`}
          style={{ background: "rgb(var(--panel))" }}
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6" strokeWidth={2} />
              {hasNewMessage ? (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-sm border border-[rgb(var(--panel))] bg-[rgb(var(--neon))] motion-safe:animate-pulse" />
              ) : null}
            </>
          )}
        </button>
      ) : null}
    </>
  );
}
