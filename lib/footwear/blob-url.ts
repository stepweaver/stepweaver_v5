/**
 * True when `imageUrl` is a Vercel Blob object under this shoe's prefix.
 * Parses host + pathname; query-string decoys do not count.
 */
export function isFootwearBlobUrl(imageUrl: string, slug: string): boolean {
  if (!imageUrl || !slug) return false;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;

  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;

  const host = parsed.hostname.toLowerCase();
  const blobHost =
    host === "blob.vercel-storage.com" || host.endsWith(".blob.vercel-storage.com");
  if (!blobHost) return false;

  const prefix = `/footwear/${slug}/`;
  if (parsed.pathname.includes("..")) return false;
  return parsed.pathname.startsWith(prefix) && parsed.pathname.length > prefix.length;
}
