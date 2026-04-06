import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.union([
    z.string().max(2000),
    z.array(z.object({
      type: z.enum(["text", "image_url"]),
      text: z.string().max(2000).optional(),
      image_url: z.object({ url: z.string() }).optional(),
    })).max(10),
  ]),
});

export const chatBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
  channel: z.enum(["widget", "terminal"]).optional(),
  /** When set, Lambda answers in context of this case study (project detail page). */
  projectCaseStudy: z
    .object({
      slug: z.string().max(160),
      title: z.string().max(220),
      summary: z.string().max(8000),
    })
    .optional(),
  _hp_website: z.string().optional(),
  _t: z.number().optional(),
  _d: z.number().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatBody = z.infer<typeof chatBodySchema>;
