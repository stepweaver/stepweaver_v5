import { NextRequest, NextResponse } from "next/server";
import { chatBodySchema } from "@/lib/validation/chat.schema";
import { withProtectedRoute } from "@/lib/security/with-protected-route";
import { rateLimit } from "@/lib/security/rate-limit";
import { buildSystemPrompt } from "@/lib/chat/system-prompt";
import { normalizeIncomingMessages } from "@/lib/chat/normalize-messages";
import {
  extractCitations,
  redactIfPromptLeak,
} from "@/lib/chat/citations";
import {
  extractAssistantTextFromResponses,
  toOpenAIResponsesInput,
  type ApiChatMessage,
} from "@/lib/chat/openai-responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
const FALLBACK_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const UPSTREAM_TIMEOUT_MS = 20_000;

function jsonHeaders(extra: Record<string, string> = {}) {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    ...extra,
  };
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function callGroq(opts: {
  model: string;
  messages: ApiChatMessage[];
  maxTokens: number;
  temperature: number;
}): Promise<{ res: Response; data: Record<string, unknown> }> {
  const res = await fetchWithTimeout(
    GROQ_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
      }),
    },
    UPSTREAM_TIMEOUT_MS
  );
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  return { res, data };
}

async function callOpenAIResponses(opts: {
  model: string;
  messages: ApiChatMessage[];
  maxTokens: number;
  temperature: number;
}): Promise<{ res: Response | null; data: Record<string, unknown> | null }> {
  const input = toOpenAIResponsesInput(opts.messages);
  if (!input) return { res: null, data: null };

  const res = await fetchWithTimeout(
    OPENAI_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: opts.model,
        input,
        max_output_tokens: opts.maxTokens,
        temperature: opts.temperature,
      }),
    },
    UPSTREAM_TIMEOUT_MS
  );
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  return { res, data };
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Expected application/json" }, { status: 415 });
  }

  return withProtectedRoute(request, async (_req, body) => {
    const rlKey = "chat:" + (request.headers.get("x-forwarded-for") || "unknown");
    const rl = rateLimit(rlKey, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: jsonHeaders({ "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) }),
        }
      );
    }

    const parsed = chatBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400, headers: jsonHeaders() }
      );
    }

    const channel = parsed.data.channel === "terminal" ? "terminal" : "widget";
    const sanitizedMessages = normalizeIncomingMessages(
      parsed.data.messages as Parameters<typeof normalizeIncomingMessages>[0]
    );

    if (sanitizedMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages to process" },
        { status: 400, headers: jsonHeaders() }
      );
    }

    const systemPrompt = buildSystemPrompt(channel, parsed.data.projectCaseStudy);
    const apiMessages: ApiChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...sanitizedMessages,
    ];

    const maxTokens = Number(process.env.AI_MAX_TOKENS || 300);
    const temperature = Number(process.env.AI_TEMPERATURE || 0.7);

    const hasVisionContent = apiMessages.some((m) => Array.isArray(m.content));
    const groqModelToUse = hasVisionContent ? GROQ_VISION_MODEL : DEFAULT_MODEL;

    let provider: string | null = null;
    let assistantText = "";

    if (GROQ_API_KEY) {
      const { res, data } = await callGroq({
        model: groqModelToUse,
        messages: apiMessages,
        maxTokens,
        temperature,
      });

      if (res.ok) {
        const choices = data?.choices as Array<{ message?: { content?: string } }> | undefined;
        assistantText = choices?.[0]?.message?.content?.trim() || "";
        provider = "groq";
      } else if (process.env.NODE_ENV === "development") {
        console.error("Groq error:", res.status, data);
      }
    }

    if (!assistantText && OPENAI_API_KEY) {
      const { res, data } = await callOpenAIResponses({
        model: FALLBACK_MODEL,
        messages: apiMessages,
        maxTokens,
        temperature,
      });

      if (!res) {
        return NextResponse.json(
          { error: "Failed to get response from AI. Please try again." },
          { status: 502, headers: jsonHeaders() }
        );
      }

      if (res.ok && data) {
        assistantText = extractAssistantTextFromResponses(data);
        provider = "openai";
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error("OpenAI error:", res.status, data);
        }
        const errBody = data as { error?: { message?: string }; message?: string };
        const apiMessage = errBody?.error?.message || errBody?.message;
        const userMessage =
          process.env.NODE_ENV === "development" && apiMessage
            ? `AI provider error: ${apiMessage}`
            : "Failed to get response from AI. Please try again.";
        return NextResponse.json({ error: userMessage }, { status: 502, headers: jsonHeaders() });
      }
    }

    if (!assistantText) {
      return NextResponse.json(
        { error: "AI chat is not configured. Please contact Stephen directly." },
        { status: 503, headers: jsonHeaders() }
      );
    }

    assistantText = redactIfPromptLeak(assistantText);
    assistantText = assistantText.slice(0, 6000);

    const { cleanText, citations } = extractCitations(assistantText);

    return NextResponse.json(
      {
        message: cleanText,
        role: "assistant",
        ...(citations.length > 0 ? { citations } : {}),
        ...(process.env.NODE_ENV === "development" && provider ? { provider } : {}),
      },
      { headers: jsonHeaders() }
    );
  }, chatBodySchema);
}
