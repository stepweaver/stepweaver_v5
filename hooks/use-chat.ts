"use client";

import { useState, useCallback } from "react";

export type ChatMsg = { role: "user" | "assistant"; content: string };

export function useChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const nextUser: ChatMsg = { role: "user", content: text };
    let thread: ChatMsg[] = [];
    setMessages((m) => {
      thread = [...m, nextUser];
      return thread;
    });
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: thread,
          channel: "widget",
          _hp_website: "",
          _t: Date.now(),
          _d: 800,
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Chat failed");
      }
      setMessages((m) => [...m, { role: "assistant", content: data.message || "" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return { messages, input, setInput, isLoading, error, send };
}
