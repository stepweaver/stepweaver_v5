import { getBlogEntryBySlug } from "@/lib/blog";
import { isSystemsLogEntry, SYSTEMS_LOG_SERIES_TITLE } from "@/lib/systems-log/selectors";
import { renderPostDynamicImage, alt, contentType, size } from "@/lib/og/post-dynamic-image";

export const runtime = "edge";
export { size, contentType, alt };

export default async function SystemsLogOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getBlogEntryBySlug(slug);
  const title = entry && isSystemsLogEntry(entry) ? entry.title || SYSTEMS_LOG_SERIES_TITLE : SYSTEMS_LOG_SERIES_TITLE;
  return renderPostDynamicImage({ title, eyebrow: "SYSTEMS LOG // ENTRY" });
}

