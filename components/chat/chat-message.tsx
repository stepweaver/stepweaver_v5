"use client";

import Image from "next/image";
import { User, Loader2 } from "lucide-react";
import { parseChatLinks } from "@/components/chat/parse-chat-links";
import { GlitchLambda } from "@/components/ui/glitch-lambda";
import { SourceCitations } from "@/components/chat/source-citations";
import type { ChatMsg } from "@/hooks/use-chat";

export function ChatMessageBubble({
  message,
  variant = "default",
}: {
  message: ChatMsg;
  variant?: "compact" | "default";
}) {
  const isUser = message.role === "user";
  const isCompact = variant === "compact";

  const avatarSize = isCompact ? "w-7 h-7" : "w-9 h-9";
  const imgSize = isCompact ? 14 : 18;
  const iconSize = isCompact ? "w-3.5 h-3.5" : "w-4 h-4";
  const gap = isCompact ? "gap-2" : "gap-3";
  const padding = isCompact ? "p-2.5" : "p-3";
  const fontSize = isCompact ? "text-sm" : "text-base";

  return (
    <div className={`flex ${gap} items-start min-w-0 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 ${avatarSize} rounded flex items-center justify-center overflow-hidden ${
          isUser ? "bg-[rgb(var(--accent)/0.2)] text-accent" : "bg-[rgb(var(--neon)/0.2)] text-neon"
        }`}
      >
        {isUser ? (
          <User className={iconSize} />
        ) : (
          <Image
            src="/images/lambda_stepweaver.png"
            alt=""
            width={imgSize}
            height={imgSize}
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
            aria-hidden
          />
        )}
      </div>

      <div
        className={`min-w-0 max-w-[min(100%,80%)] ${padding} rounded font-[var(--font-ocr)] ${fontSize} leading-relaxed border text-left ${
          isUser
            ? "bg-[rgb(var(--cyan)/0.1)] border-[rgb(var(--cyan)/0.3)] text-[rgb(var(--text-color))]"
            : "bg-[rgb(var(--window)/0.5)] border-[rgb(var(--border)/0.35)] text-[rgb(var(--text-color))]"
        }`}
      >
        {message.attachments && message.attachments.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {message.attachments.map((att, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- user data URLs
              <img
                key={i}
                src={att.dataUrl}
                alt="Attached"
                className="max-w-full max-h-24 object-contain rounded border border-[rgb(var(--border)/0.5)]"
              />
            ))}
          </div>
        ) : null}
        {message.content ? (
          <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {parseChatLinks(message.content, {
              renderAgentName: (key) => <GlitchLambda key={key} size="small" className="inline" />,
            })}
          </div>
        ) : null}
        {!isUser && message.citations && message.citations.length > 0 ? (
          <SourceCitations citations={message.citations} />
        ) : null}
      </div>
    </div>
  );
}

export function ChatLoadingIndicator({ variant = "default" }: { variant?: "compact" | "default" }) {
  const isCompact = variant === "compact";
  const avatarSize = isCompact ? "w-7 h-7" : "w-9 h-9";
  const imgSize = isCompact ? 14 : 18;
  const padding = isCompact ? "p-2.5" : "p-3";
  const iconSize = isCompact ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className={`flex items-start min-w-0 ${isCompact ? "gap-2" : "gap-3"}`}>
      <div
        className={`flex-shrink-0 ${avatarSize} rounded flex items-center justify-center bg-[rgb(var(--neon)/0.2)] overflow-hidden`}
      >
        <Image
          src="/images/lambda_stepweaver.png"
          alt=""
          width={imgSize}
          height={imgSize}
          className="object-contain"
          style={{ width: "auto", height: "auto" }}
          aria-hidden
        />
      </div>
      <div
        className={`bg-[rgb(var(--panel)/0.5)] border border-[rgb(var(--neon)/0.2)] ${padding} rounded-lg`}
      >
        <Loader2 className={`${iconSize} text-neon animate-spin`} />
      </div>
    </div>
  );
}
