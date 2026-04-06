import type { NormalizedChatMessage } from "@/lib/chat/normalize-messages";

type OpenAIInputPart =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string };

type OpenAIInputItem = { role: string; content: OpenAIInputPart[] };

export type ApiChatMessage =
  | NormalizedChatMessage
  | { role: "system"; content: string };

export function toOpenAIResponsesInput(messages: ApiChatMessage[]): OpenAIInputItem[] | null {
  const input: OpenAIInputItem[] = [];

  for (const m of messages) {
    if (m.role !== "system" && m.role !== "user" && m.role !== "assistant") return null;

    if (typeof m.content === "string") {
      input.push({
        role: m.role,
        content: [{ type: "input_text", text: m.content }],
      });
      continue;
    }

    if (Array.isArray(m.content)) {
      const content: OpenAIInputPart[] = [];
      for (const part of m.content) {
        if (part?.type === "text" && typeof part.text === "string") {
          content.push({ type: "input_text", text: part.text });
          continue;
        }

        const imageUrl = part?.image_url?.url;
        if (part?.type === "image_url" && typeof imageUrl === "string") {
          content.push({ type: "input_image", image_url: imageUrl });
          continue;
        }

        return null;
      }

      if (content.length === 0) return null;
      input.push({ role: m.role, content });
      continue;
    }

    return null;
  }

  return input;
}

export function extractAssistantTextFromResponses(data: Record<string, unknown>): string {
  const output = data?.output;
  if (!Array.isArray(output)) return "";

  let text = "";
  for (const item of output) {
    const content = (item as { content?: unknown })?.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      const block = c as { type?: string; text?: string };
      if (block?.type === "output_text" && typeof block.text === "string") {
        text += (text ? "\n" : "") + block.text;
      }
    }
  }
  return text.trim();
}
