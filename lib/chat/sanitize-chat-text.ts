/** Strip HTML-ish noise and normalize whitespace for chat message text (server-side). */
export function sanitizeChatText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\s+/g, " ")
    .trim();
}
