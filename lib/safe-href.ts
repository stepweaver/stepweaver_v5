/**
 * Allowlist URLs for user/model-rendered links (chat markdown, etc.).
 */
export function safeHref(
  raw: unknown
): { ok: true; href: string; isExternal: boolean } | { ok: false } {
  if (raw == null || typeof raw !== "string") {
    return { ok: false };
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false };
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return { ok: false };
  }

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//")) {
      return { ok: false };
    }
    return { ok: true, href: trimmed, isExternal: false };
  }

  try {
    const url = new URL(trimmed);
    const protocol = url.protocol.toLowerCase();
    if (protocol === "https:" || protocol === "http:") {
      return { ok: true, href: url.toString(), isExternal: true };
    }
    if (protocol === "mailto:" || protocol === "tel:") {
      return { ok: true, href: url.toString(), isExternal: true };
    }
  } catch {
    /* invalid absolute URL */
  }

  return { ok: false };
}
