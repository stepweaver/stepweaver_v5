/**
 * Public record id.
 * Notion page ids created close together can share a timestamp prefix, so the
 * public id uses the random tail and never exposes the full page id.
 */
export function publicCarrierDispatchId(pageId: string): string {
  const hex = pageId.replace(/-/g, "").toLowerCase();
  return `cj-${hex.slice(-12) || "unknown"}`;
}
