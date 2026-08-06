import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  CARRIER_SESSION_COOKIE,
  applyNoStoreHeaders,
  carrierSessionCookieOptions,
  isSameOriginRequest,
  issueCarrierSession,
  verifyCarrierPassphrase,
} from "@/lib/carrier-journal/auth";
import { rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const loginSchema = z
  .object({
    passphrase: z.string().min(1).max(500),
  })
  .strict();

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isSameOriginRequest(request)) {
    return applyNoStoreHeaders(
      NextResponse.json({ error: "Request rejected." }, { status: 403 }),
    );
  }

  const rl = await rateLimit(`carrier-session:${clientIp(request)}`, 5, 60_000);
  if (!rl.allowed) {
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: "Unable to sign in with those credentials." },
        { status: 429 },
      ),
    );
  }

  let parsed: z.infer<typeof loginSchema>;
  try {
    parsed = loginSchema.parse(await request.json());
  } catch {
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: "Unable to sign in with those credentials." },
        { status: 400 },
      ),
    );
  }

  if (!verifyCarrierPassphrase(parsed.passphrase)) {
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: "Unable to sign in with those credentials." },
        { status: 401 },
      ),
    );
  }

  try {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      CARRIER_SESSION_COOKIE,
      issueCarrierSession(),
      carrierSessionCookieOptions,
    );
    return applyNoStoreHeaders(response);
  } catch {
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: "Session signing is not configured." },
        { status: 503 },
      ),
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!isSameOriginRequest(request)) {
    return applyNoStoreHeaders(
      NextResponse.json({ error: "Request rejected." }, { status: 403 }),
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CARRIER_SESSION_COOKIE, "", {
    ...carrierSessionCookieOptions,
    maxAge: 0,
  });
  return applyNoStoreHeaders(response);
}
