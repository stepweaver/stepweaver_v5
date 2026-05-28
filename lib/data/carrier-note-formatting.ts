/**
 * Splits a Notion-sourced public note into paragraphs, preserving
 * blank-line breaks while keeping single line breaks within a paragraph.
 */
export function splitPublicNoteParagraphs(text: string): string[] {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
