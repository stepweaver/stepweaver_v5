import { NextResponse, type NextRequest } from "next/server";

function randomNonceBase64(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function middleware(request: NextRequest) {
  try {
    const nonce = randomNonceBase64();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    const isProd = process.env.NODE_ENV === "production";
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://assets.calendly.com https://calendly.com https://va.vercel-scripts.com${isProd ? "" : " 'unsafe-eval'"}`,
      "style-src 'self' 'unsafe-inline' https://assets.calendly.com https://calendly.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https:",
      "connect-src 'self' https://calendly.com https://api.calendly.com https://api.openweathermap.org https://va.vercel-scripts.com https://script.google.com https://www.notion.so https://api.notion.so",
      "frame-src 'self' https://calendly.com https://script.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://calendly.com",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    // HSTS on localhost can confuse browsers during local dev; only send in production.
    if (isProd) {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }

    return response;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[middleware] failed (dev fallback: no CSP nonce)", err);
      return NextResponse.next();
    }
    throw err;
  }
}

export const config = {
  matcher: [
    // Skip all Next internals (static, HMR, image opt, etc.); middleware must not touch these.
    "/((?!_next/|api/|images/|fonts/|icon-|manifest\\.(?:webmanifest|js)|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|otf|mp4|webm)).*)",
  ],
};
