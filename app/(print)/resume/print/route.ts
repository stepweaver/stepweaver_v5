import { buildResumeHtml } from "@/lib/data/resume-html";

export function GET() {
  return new Response(buildResumeHtml(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
