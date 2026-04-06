const FALLBACK_IMAGE_PATH = "/images/lambda_preview.png";

const KNOWN_WEBP_PNG_SIBLINGS = new Set([
  "/images/screely-dice.png",
  "/images/screely-lambda.png",
  "/images/screely-profilcard.png",
  "/images/screely-resist.png",
  "/images/screely-stache.png",
]);

/** Resolve project imageUrl for OG/twitter generation (mirrors v3 opengraph-image logic). */
export function chooseProjectSharePath(url?: string): string {
  if (!url) return FALLBACK_IMAGE_PATH;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.toLowerCase().endsWith(".webp")) {
    const pngSibling = url.replace(/\.webp$/i, ".png");
    if (KNOWN_WEBP_PNG_SIBLINGS.has(pngSibling)) return pngSibling;
    return FALLBACK_IMAGE_PATH;
  }
  return url;
}
