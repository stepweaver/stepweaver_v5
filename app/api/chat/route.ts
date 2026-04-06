import { NextRequest, NextResponse } from "next/server";
import { chatBodySchema } from "@/lib/validation/chat.schema";
import { withProtectedRoute } from "@/lib/security/with-protected-route";
import { rateLimit } from "@/lib/security/rate-limit";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const FALLBACK_MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 20_000;
const MAX_MESSAGES = 12;

function buildSystemPrompt(channel?: string): string {
  let prompt = "You are lambda, a technical operator assistant for stepweaver.dev. ";
  prompt += "Be concise, technical, and direct. ";
  if (channel === "terminal") {
    prompt += "Respond in plain text only, 2-5 sentences. Be punchy.";
  } else {
    prompt += "You may use markdown links. Keep responses to 2-4 sentences.";
  }
  return prompt;
}

function normalizeMessages(messages: Array<{ role: string; content: unknown }>) {
  const filtered = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-MAX_MESSAGES);
  return filtered.map((m) => ({
    role: m.role,
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
  }));
}

async function callGroq(messages: Array<{ role: string; content: string }>, hasImages: boolean) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: hasImages ? VISION_MODEL : DEFAULT_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 600,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error("Groq API failed");
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "No response generated.";
  } catch {
    clearTimeout(timeout);
    throw new Error("Groq failed");
  }
}

async function callOpenAI(messages: Array<{ role: string; content: string }>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: FALLBACK_MODEL,
        input: messages.map((m) => ({ role: m.role, content: m.content })),
        max_output_tokens: 600,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error("OpenAI API failed");
    const data = await res.json();
    return data.output_text || "No response generated.";
  } catch {
    clearTimeout(timeout);
    throw new Error("OpenAI failed");
  }
}

export async function POST(request: NextRequest) {
  return withProtectedRoute(request, async (_req, body) => {
    const channel = body.channel as string | undefined;

    const rlKey = "chat:" + (request.headers.get("x-forwarded-for") || "unknown");
    const rl = rateLimit(rlKey, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
      );
    }

    const parsed = chatBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const messages = normalizeMessages(parsed.data.messages);
    const systemPrompt = buildSystemPrompt(channel);
    const hasImages = parsed.data.messages.some(
      (m) => Array.isArray(m.content) && m.content.some((c: Record<string, unknown>) => c.type === "image_url")
    );

    let response: string;
    try {
      if (GROQ_API_KEY) {
        response = await callGroq([{ role: "system", content: systemPrompt }, ...messages], hasImages);
      } else if (OPENAI_API_KEY) {
        response = await callOpenAI([{ role: "system", content: systemPrompt }, ...messages]);
      } else {
        return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
      }
    } catch {
      try {
        if (GROQ_API_KEY && OPENAI_API_KEY) {
          response = await callOpenAI([{ role: "system", content: systemPrompt }, ...messages]);
        } else {
          return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
        }
      } catch {
        return NextResponse.json({ error: "All AI providers failed" }, { status: 503 });
      }
    }

    const truncated = response.length > 6000 ? response.slice(0, 6000) + "..." : response;

    return NextResponse.json({
      message: truncated,
      role: "assistant",
      citations: [],
    }, {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  }, chatBodySchema);
}
