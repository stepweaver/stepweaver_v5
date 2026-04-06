import type { NotionBlock } from "@/lib/notion-blocks";

function getBlockText(block: NotionBlock): string {
  if (!block) return "";

  const b = block as Record<string, { rich_text?: { plain_text?: string }[] } | undefined>;
  if (block.type === "paragraph" && b.paragraph?.rich_text) {
    return b.paragraph.rich_text.map((t) => t.plain_text).join("").trim();
  }
  if (block.type === "heading_1" && b.heading_1?.rich_text) {
    return b.heading_1.rich_text.map((t) => t.plain_text).join("").trim();
  }
  if (block.type === "heading_2" && b.heading_2?.rich_text) {
    return b.heading_2.rich_text.map((t) => t.plain_text).join("").trim();
  }
  if (block.type === "heading_3" && b.heading_3?.rich_text) {
    return b.heading_3.rich_text.map((t) => t.plain_text).join("").trim();
  }
  return "";
}

/** Remove duplicate title lines Notion sometimes mirrors in the body (v3 parity). */
export function filterTitleBlocks(blocks: NotionBlock[] | undefined, title: string): NotionBlock[] {
  if (!blocks?.length || !title) return blocks ?? [];

  const normalizedTitle = title.trim();
  const titleWithoutBrackets = normalizedTitle.replace(/[\[\]]/g, "").trim();

  return blocks.filter((block) => {
    const text = getBlockText(block);
    const normalizedText = text.trim();

    if (normalizedText === normalizedTitle) return false;
    if (normalizedText === `[${titleWithoutBrackets}]` || normalizedText === titleWithoutBrackets) return false;
    if (
      normalizedText.startsWith(normalizedTitle + " ") ||
      normalizedText.startsWith(normalizedTitle + "\n") ||
      normalizedText.startsWith(`[${titleWithoutBrackets}] `)
    ) {
      return false;
    }

    if (block.type === "heading_1" || block.type === "heading_2" || block.type === "heading_3") {
      if (
        normalizedText === normalizedTitle ||
        normalizedText === `[${titleWithoutBrackets}]` ||
        normalizedText === titleWithoutBrackets
      ) {
        return false;
      }
    }

    return true;
  });
}
