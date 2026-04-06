/**
 * OpenAI-compatible chat.completions assistant shape (Groq uses the same format).
 * Some providers return `message.content` as a string; others use content parts arrays.
 */
export function extractAssistantTextFromChatCompletion(data: Record<string, unknown>): string {
  const choices = data?.choices;
  if (!Array.isArray(choices) || choices.length === 0) return "";

  const first = choices[0] as { message?: { content?: unknown; refusal?: unknown } } | undefined;
  const msg = first?.message;
  if (!msg) return "";

  if (typeof msg.refusal === "string" && msg.refusal.trim()) {
    return msg.refusal.trim();
  }

  const content = msg.content;
  if (content == null || content === "") return "";
  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const part of content) {
      if (typeof part === "string") {
        if (part) parts.push(part);
        continue;
      }
      if (part && typeof part === "object") {
        const p = part as { type?: string; text?: string };
        if (typeof p.text === "string" && p.text) {
          parts.push(p.text);
        }
      }
    }
    return parts.join("\n").trim();
  }

  return "";
}

export function upstreamErrorMessage(data: Record<string, unknown>): string | null {
  const err = data?.error as { message?: string } | undefined;
  return typeof err?.message === "string" && err.message ? err.message : null;
}
