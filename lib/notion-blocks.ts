import { getNotion } from "./notion/client";
import { paginate } from "./notion/paginate";

export type NotionBlock = Record<string, unknown> & { type?: string; id?: string; has_children?: boolean };

export async function getPageBlocks(pageId: string, maxPages = 5): Promise<NotionBlock[]> {
  if (!pageId) return [];
  try {
    const notion = getNotion();
    const blocks = (await paginate<NotionBlock>(
      (cursor: string | undefined) =>
        notion.blocks.children.list({
          block_id: pageId,
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
      { limit: maxPages * 100 }
    )) as NotionBlock[];

    const tableBlocks = blocks.filter((block) => block.type === "table" && block.has_children);

    if (!tableBlocks.length) return blocks;

    const tablesWithRows = await Promise.all(
      tableBlocks.map(async (table) => {
        const tableId = table.id;
        if (!tableId) return { id: "", rows: [] as NotionBlock[] };
        try {
          const rows = (await paginate<NotionBlock>((cursor: string | undefined) =>
            notion.blocks.children.list({
              block_id: tableId,
              page_size: 100,
              ...(cursor ? { start_cursor: cursor } : {}),
            })
          )) as NotionBlock[];
          return { id: tableId, rows };
        } catch {
          return { id: tableId, rows: [] };
        }
      })
    );

    const tableRowMap = new Map(tablesWithRows.map((t) => [t.id, t.rows]));

    return blocks.map((block) =>
      block.type === "table"
        ? {
            ...block,
            children: tableRowMap.get(block.id ?? "") ?? [],
          }
        : block
    );
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("[getPageBlocks]", err);
    return [];
  }
}
