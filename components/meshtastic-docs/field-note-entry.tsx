"use client";

import type { NotionBlock } from "@/lib/notion-blocks";
import { NotionBlockBody } from "@/components/codex/notion-block-body";

function getBlockText(block: NotionBlock): string {
  if (!block?.type) return "";
  const b = block as Record<string, { rich_text?: { plain_text?: string }[] }>;
  const rt =
    b.paragraph?.rich_text ??
    b.heading_1?.rich_text ??
    b.heading_2?.rich_text ??
    b.heading_3?.rich_text ??
    b.quote?.rich_text ??
    b.callout?.rich_text ??
    b.bulleted_list_item?.rich_text ??
    b.numbered_list_item?.rich_text ??
    b.code?.rich_text ??
    [];
  return rt.map((t) => t.plain_text ?? "").join("").trim();
}

function filterBlankBlocks(blocks: NotionBlock[]): NotionBlock[] {
  if (!blocks?.length) return blocks;
  return blocks.filter((block) => {
    if (
      block.type === "paragraph" ||
      block.type === "quote" ||
      block.type === "callout"
    ) {
      return getBlockText(block).length > 0;
    }
    return true;
  });
}

export type FieldNoteEntryModel = {
  id: string;
  title: string;
  summary?: string;
  bullets?: string[];
};

export function FieldNoteEntry({
  note,
  blocks,
}: {
  note: FieldNoteEntryModel;
  blocks: NotionBlock[] | undefined;
}) {
  const filtered = filterBlankBlocks(blocks ?? []);

  return (
    <div id={`note-${note.id}`} className="field-note-log-entry">
      {filtered.length > 0 ? (
        <div className="text-sm font-mono leading-snug text-[rgb(var(--text-color)/0.95)]">
          <NotionBlockBody blocks={filtered} />
        </div>
      ) : note.summary ? (
        <div className="space-y-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
          <p>{note.summary}</p>
          {note.bullets?.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {note.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="font-mono text-sm italic text-[rgb(var(--text-secondary))]">No log entry for this date.</p>
      )}
    </div>
  );
}
