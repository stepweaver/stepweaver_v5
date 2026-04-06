"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBotProtection } from "@/hooks/use-bot-protection";
import { buildChatRequestPayload } from "@/lib/chat/request-builder";
import type { Citation } from "@/components/chat/source-citations";

const INITIAL_MESSAGE = {
  role: "assistant" as const,
  content:
    "Hello! I'm λlambda, Stephen's AI advocate. I can answer questions about his background, skills, and experience. What would you like to know?",
};

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGES = 5;
const ALLOWED_IMAGE_MIME = /^image\/(png|jpeg|jpg|webp|gif)$/i;

export type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  attachments?: Array<{ dataUrl: string; type: string }>;
};

export function useChat(options?: {
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  isVisible?: boolean;
}) {
  const { inputRef, isVisible = true } = options || {};
  const { getBotFields, honeypotProps } = useBotProtection();
  const [messages, setMessages] = useState<ChatMsg[]>([INITIAL_MESSAGE]);
  const messagesRef = useRef(messages);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Array<{ dataUrl: string; type: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (isVisible) {
      inputRef?.current?.focus();
    }
  }, [isVisible, inputRef]);

  const addAttachment = useCallback((dataUrl: string, mimeType: string) => {
    if (!dataUrl || !mimeType) return;
    if (!ALLOWED_IMAGE_MIME.test(mimeType)) return;
    if (dataUrl.length > MAX_IMAGE_SIZE_BYTES) return;
    setAttachments((prev) => {
      if (prev.length >= MAX_IMAGES) return prev;
      return [...prev, { dataUrl, type: mimeType }];
    });
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const sendMessage = useCallback(
    async (messageText = input, imageAttachments = attachments) => {
      const trimmedMessage = (messageText ?? "").trim();
      const sanitizedAtt = (imageAttachments || [])
        .filter(
          (att) =>
            att?.dataUrl &&
            typeof att.dataUrl === "string" &&
            att.dataUrl.startsWith("data:image/") &&
            att.dataUrl.length <= MAX_IMAGE_SIZE_BYTES &&
            att.type &&
            ALLOWED_IMAGE_MIME.test(att.type)
        )
        .slice(0, MAX_IMAGES);

      const hasContent = trimmedMessage || sanitizedAtt.length > 0;
      if (!hasContent || isLoading) return;

      setError(null);
      setInput("");
      setAttachments([]);

      const userMessage: ChatMsg = {
        role: "user",
        content: trimmedMessage,
        ...(sanitizedAtt.length > 0 ? { attachments: sanitizedAtt } : {}),
      };

      const prev = messagesRef.current;
      const nextMessages = [...prev, userMessage];
      setMessages(nextMessages);
      messagesRef.current = nextMessages;
      setIsLoading(true);

      const seq = ++requestSeqRef.current;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            buildChatRequestPayload({
              channel: "widget",
              messages: nextMessages.map((m) => ({
                role: m.role,
                content: m.content,
                attachments: m.attachments?.map((a) => ({ dataUrl: a.dataUrl })),
              })),
              botFields: getBotFields(),
            })
          ),
          signal: ac.signal,
        });

        const data = (await response.json()) as {
          message?: string;
          error?: string;
          citations?: Citation[];
        };

        if (!response.ok) {
          throw new Error(data.error || "Failed to get response");
        }

        if (seq !== requestSeqRef.current) return;

        setMessages((pm) => [
          ...pm,
          {
            role: "assistant",
            content: data.message || "",
            citations: data.citations || [],
          },
        ]);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (seq !== requestSeqRef.current) return;
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        if (seq === requestSeqRef.current) {
          setIsLoading(false);
          inputRef?.current?.focus();
        }
      }
    },
    [input, isLoading, attachments, getBotFields, inputRef]
  );

  const handleSubmit = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      void sendMessage();
    },
    [sendMessage]
  );

  return {
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
  };
}
