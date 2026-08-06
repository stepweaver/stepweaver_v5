import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export const CARRIER_SESSION_COOKIE = "carrier_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  exp: number;
  nonce: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function constantTimeStringEqual(left: string, right: string): boolean {
  const a = digest(left);
  const b = digest(right);
  return timingSafeEqual(a, b);
}

function signingSecret(): string {
  return (
    process.env.CARRIER_SESSION_SIGNING_SECRET?.trim() ||
    process.env.CARRIER_JOURNAL_LOG_SECRET?.trim() ||
    ""
  );
}

function sign(encodedPayload: string): string {
  const secret = signingSecret();
  if (!secret) {
    throw new Error("Missing CARRIER_SESSION_SIGNING_SECRET");
  }
  return createHmac("sha256", secret).update(encodedPayload, "utf8").digest("base64url");
}

/** Timing-safe passphrase check against CARRIER_JOURNAL_LOG_SECRET. */
export function verifyCarrierPassphrase(candidate: string): boolean {
  const expected = (process.env.CARRIER_JOURNAL_LOG_SECRET ?? "").trim();
  if (!expected || !candidate) return false;
  return constantTimeStringEqual(candidate, expected);
}

export function issueCarrierSession(now = Date.now()): string {
  const payload: SessionPayload = {
    exp: Math.floor(now / 1_000) + SESSION_LIFETIME_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  };

  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyCarrierSession(
  token: string | undefined | null,
  now = Date.now(),
): boolean {
  if (!token || !signingSecret()) return false;

  const [encoded, suppliedSignature, extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra) return false;

  let expectedSignature: string;
  try {
    expectedSignature = sign(encoded);
  } catch {
    return false;
  }

  if (!constantTimeStringEqual(suppliedSignature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;

    return (
      Number.isInteger(payload.exp) &&
      typeof payload.nonce === "string" &&
      payload.nonce.length >= 16 &&
      payload.exp > Math.floor(now / 1_000)
    );
  } catch {
    return false;
  }
}

export const carrierSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_LIFETIME_SECONDS,
};

/** Read and verify the carrier session cookie from a NextRequest. */
export function isCarrierSessionRequest(request: NextRequest): boolean {
  const token = request.cookies.get(CARRIER_SESSION_COOKIE)?.value;
  return verifyCarrierSession(token);
}

/** Server Components / route handlers using next/headers cookies(). */
export async function isCarrierSessionAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyCarrierSession(jar.get(CARRIER_SESSION_COOKIE)?.value);
}

export function applyNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Same-origin navigations and some same-site fetches may omit Origin.
    // For cookie-authenticated APIs we still require Origin in production POSTs.
    return process.env.NODE_ENV !== "production";
  }
  try {
    return origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

/** @deprecated Prefer verifyCarrierPassphrase; kept for gradual migration. */
export function verifyCarrierLogSecret(secret: string): boolean {
  return verifyCarrierPassphrase(secret);
}

export function getCarrierSessionSigningConfigured(): boolean {
  return Boolean(signingSecret());
}

export function requireCarrierSessionEnv(): void {
  requiredEnv("CARRIER_JOURNAL_LOG_SECRET");
}
