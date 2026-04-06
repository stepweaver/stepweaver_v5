export type ChatChannel = "widget" | "terminal";

export type ChatRequestMessage = {
  role: string;
  content?: string;
  attachments?: Array<{ dataUrl?: string }>;
};

export type BotFields = { _hp_website?: string; _t?: number; _d?: number };

/**
 * Single JSON shape for POST /api/chat (widget + terminal).
 */
export function buildChatRequestPayload(opts: {
  channel: ChatChannel;
  messages: ChatRequestMessage[];
  botFields: BotFields;
  projectCaseStudy?: { slug: string; title: string; summary: string };
}): Record<string, unknown> {
  const ch = opts.channel === "terminal" ? "terminal" : "widget";
  const payload: Record<string, unknown> = {
    channel: ch,
    messages: (opts.messages || []).map((m) => ({
      role: m.role,
      ...(typeof m.content === "string" ? { content: m.content } : {}),
      ...(Array.isArray(m.attachments) && m.attachments.length > 0 ? { attachments: m.attachments } : {}),
    })),
    ...opts.botFields,
  };
  if (opts.projectCaseStudy) {
    payload.projectCaseStudy = opts.projectCaseStudy;
  }
  return payload;
}
