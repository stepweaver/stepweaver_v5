import { sanitizeChatText } from "@/lib/chat/sanitize-chat-text";
import { PROMPT_INJECTION_PATTERN } from "@/lib/chat/citations";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 12;
const MAX_IMAGES_PER_MESSAGE = 5;
const GROQ_VISION_MAX_URL = 6 * 1024 * 1024;

export type NormalizedChatMessage =
  | { role: "user" | "assistant"; content: string }
  | { role: "user" | "assistant"; content: Array<{ type: string; text?: string; image_url?: { url: string } }> };

type IncomingMessage = {
  role: string;
  content?: unknown;
  attachments?: Array<{ dataUrl?: string }>;
};

function isContentPartArray(
  v: unknown
): v is Array<{ type?: string; text?: string; image_url?: { url?: string } }> {
  return Array.isArray(v);
}

export function normalizeIncomingMessages(messages: IncomingMessage[]): NormalizedChatMessage[] {
  const allowedRoles = new Set(["user", "assistant"]);

  const sanitized = (messages || [])
    .filter(
      (m) =>
        m &&
        allowedRoles.has(m.role) &&
        (typeof m.content === "string" ||
          isContentPartArray(m.content) ||
          (m.role === "user" && Array.isArray(m.attachments) && m.attachments.length > 0))
    )
    .map((m) => {
      const textContent =
        typeof m.content === "string" ? sanitizeChatText(m.content).slice(0, MAX_MESSAGE_LENGTH) : "";
      const hasText = textContent.trim().length > 0;
      const attachments = Array.isArray(m.attachments) ? m.attachments.slice(0, MAX_IMAGES_PER_MESSAGE) : [];
      const hasImages = attachments.length > 0;

      if (!hasText && !hasImages) return null;
      if (m.role === "assistant" && PROMPT_INJECTION_PATTERN.test(textContent)) return null;

      if (hasImages && m.role === "user") {
        const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
        const textForVision = hasText ? textContent : "What do you see in this image?";
        content.push({ type: "text", text: textForVision });
        for (const att of attachments) {
          const url = att?.dataUrl;
          if (typeof url === "string" && url.startsWith("data:image/") && url.length < GROQ_VISION_MAX_URL) {
            content.push({ type: "image_url", image_url: { url } });
          }
        }
        if (content.length > 0) {
          return { role: m.role as "user", content };
        }
      }

      if (isContentPartArray(m.content) && m.role === "user") {
        const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
        for (const part of m.content) {
          if (part?.type === "text" && typeof part.text === "string") {
            const t = sanitizeChatText(part.text).slice(0, MAX_MESSAGE_LENGTH);
            if (t) parts.push({ type: "text", text: t });
          }
          const imageUrl = part?.image_url?.url;
          if (part?.type === "image_url" && typeof imageUrl === "string" && imageUrl.startsWith("data:image/")) {
            if (imageUrl.length < GROQ_VISION_MAX_URL) {
              parts.push({ type: "image_url", image_url: { url: imageUrl } });
            }
          }
        }
        if (parts.length > 0) {
          return { role: "user", content: parts };
        }
      }

      return hasText ? { role: m.role as "user" | "assistant", content: textContent } : null;
    })
    .filter((m): m is NormalizedChatMessage => m != null)
    .slice(-MAX_MESSAGES)
    .filter((m) =>
      Array.isArray(m.content) ? m.content.length > 0 : (m.content as string).length > 0
    );

  return sanitized;
}
