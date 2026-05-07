import { renderPostDynamicImage, alt, contentType, size } from "@/lib/og/post-dynamic-image";

export const runtime = "edge";
export { size, contentType, alt };

function titleFromSlug(slug: string): string {
  const decoded = (() => {
    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  })();
  const words = decoded
    .split(/[/-]/g)
    .filter(Boolean)
    .slice(0, 14)
    .map((w) => w.replace(/[^a-zA-Z0-9]+/g, ""))
    .filter(Boolean);
  if (words.length === 0) return "Codex";
  const pretty = words.map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(" ");
  return pretty.slice(0, 120);
}

export default async function CodexOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = titleFromSlug(slug);
  return renderPostDynamicImage({ title, eyebrow: "CODEX // ENTRY" });
}

