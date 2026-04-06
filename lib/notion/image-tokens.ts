import { createHmac, timingSafeEqual } from "crypto";

function normalizeNotionId(id: string | null | undefined): string | null {
  if (!id || typeof id !== "string") return null;
  const clean = id.replace(/-/g, "");
  if (!/^[0-9a-f]{32}$/i.test(clean)) return null;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

function getSecret(): string {
  return process.env.NOTION_IMAGE_TOKEN_SECRET?.trim() || "";
}

export function mintNotionImageRefreshToken(blockId: string): string | null {
  const secret = getSecret();
  const normalized = normalizeNotionId(blockId);
  if (!secret || !normalized) return null;

  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const payloadObj = { bid: normalized, exp };
  const payload = Buffer.from(JSON.stringify(payloadObj), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyNotionImageRefreshToken(token: string): string | null {
  const secret = getSecret();
  if (!secret || !token || typeof token !== "string") return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payload || !sig) return null;

  const expectedSig = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let parsed: { bid?: string; exp?: number };
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (!parsed?.bid || typeof parsed.exp !== "number") return null;
  if (Math.floor(Date.now() / 1000) > parsed.exp) return null;

  return normalizeNotionId(parsed.bid);
}
