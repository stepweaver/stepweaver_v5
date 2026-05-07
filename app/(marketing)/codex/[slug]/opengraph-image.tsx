import { getBlogEntryBySlug } from "@/lib/blog";
import { renderPostDynamicImage, alt, contentType, size } from "@/lib/og/post-dynamic-image";

export const runtime = "edge";
export { size, contentType, alt };

export default async function CodexOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getBlogEntryBySlug(slug);
  const title = entry?.title || "Codex";
  return renderPostDynamicImage({ title, eyebrow: "CODEX // ENTRY" });
}

