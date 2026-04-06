"use client";

import type { ReactNode } from "react";
import { safeHref } from "@/lib/safe-href";
import { GlitchLambda } from "@/components/ui/glitch-lambda";

function parseSegmentForLinks(segment: string, keyPrefix = ""): ReactNode[] {
  if (!segment) return [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(segment)) !== null) {
    if (match.index > lastIndex) {
      parts.push(segment.substring(lastIndex, match.index));
    }
    const linkText = match[1]!;
    const linkUrl = match[2]!;
    const resolved = safeHref(linkUrl);
    if (resolved.ok) {
      const { href, isExternal } = resolved;
      const isPdf = /\.pdf$/i.test((href.split("?")[0] || ""));
      parts.push(
        <a
          key={`${keyPrefix}link-${match.index}`}
          href={href}
          {...(isExternal
            ? {
                target: "_blank",
                rel: "noopener noreferrer nofollow",
              }
            : {})}
          className="text-[rgb(var(--green))] hover:text-[rgb(var(--cyan))] underline underline-offset-2 break-words"
          download={
            isPdf && !isExternal ? linkText.replace(/\s+/g, "_") + ".pdf" : undefined
          }
        >
          {linkText}
        </a>
      );
    } else {
      parts.push(`[${linkText}](${linkUrl})`);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < segment.length) {
    parts.push(segment.substring(lastIndex));
  }

  return parts.length ? parts : [segment];
}

export function parseChatLinks(
  text: string,
  options?: { renderAgentName?: (_key: string) => ReactNode }
): ReactNode[] {
  if (!text || typeof text !== "string") {
    return [text];
  }

  const renderAgentName = options?.renderAgentName;

  if (renderAgentName && text.includes("λlambda")) {
    const segments = text.split("λlambda");
    const result: ReactNode[] = [];
    for (let i = 0; i < segments.length; i++) {
      result.push(...parseSegmentForLinks(segments[i]!, `seg-${i}-`));
      if (i < segments.length - 1) {
        result.push(renderAgentName(`agent-${i}`), "lambda");
      }
    }
    return result;
  }

  const parts = parseSegmentForLinks(text, "");
  return parts.length ? parts : [text];
}

export function parseChatLinksWithGlitch(text: string): ReactNode[] {
  return parseChatLinks(text, {
    renderAgentName: (k) => <GlitchLambda key={k} size="small" className="inline" />,
  });
}
