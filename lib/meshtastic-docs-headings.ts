export function slugifyHeading(text: string): string {
  if (!text || typeof text !== "string") return "section";
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

export function getHeadingsFromBlocks(blocks: { type?: string; [key: string]: unknown }[]): {
  level: 1 | 2 | 3;
  text: string;
  id: string;
}[] {
  if (!blocks?.length) return [];
  const seen = new Map<string, number>();
  const result: { level: 1 | 2 | 3; text: string; id: string }[] = [];

  for (const block of blocks) {
    let level: 1 | 2 | 3;
    let text: string;
    if (block.type === "heading_1" && block.heading_1 && typeof block.heading_1 === "object") {
      const h = block.heading_1 as { rich_text?: { plain_text?: string }[] };
      level = 1;
      text = (h.rich_text ?? []).map((t) => t.plain_text).join("");
    } else if (block.type === "heading_2" && block.heading_2 && typeof block.heading_2 === "object") {
      const h = block.heading_2 as { rich_text?: { plain_text?: string }[] };
      level = 2;
      text = (h.rich_text ?? []).map((t) => t.plain_text).join("");
    } else if (block.type === "heading_3" && block.heading_3 && typeof block.heading_3 === "object") {
      const h = block.heading_3 as { rich_text?: { plain_text?: string }[] };
      level = 3;
      text = (h.rich_text ?? []).map((t) => t.plain_text).join("");
    } else {
      continue;
    }
    if (!text.trim()) continue;
    let id = slugifyHeading(text);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    result.push({ level, text, id });
  }
  return result;
}
