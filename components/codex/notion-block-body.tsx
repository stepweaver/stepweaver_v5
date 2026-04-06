import Link from "next/link";
import { getHeadingsFromBlocks } from "@/lib/meshtastic-docs-headings";
import { mintNotionImageRefreshToken } from "@/lib/notion/image-tokens";
import type { NotionBlock } from "@/lib/notion-blocks";
import { NotionImage } from "./notion-image";

type RichTextPart = {
  plain_text?: string;
  annotations?: { bold?: boolean; italic?: boolean; code?: boolean };
  href?: string;
};

function RichTextSegment({ part }: { part: RichTextPart }) {
  let content: React.ReactNode = part.plain_text ?? "";
  const ann = part.annotations ?? {};
  if (part.href) {
    content = (
      <Link
        href={part.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors underline hover:no-underline"
      >
        {content}
      </Link>
    );
  }
  if (ann.code) {
    content = (
      <code className="bg-[rgb(var(--neon)/0.1)] px-1.5 py-0.5 rounded-sm text-sm text-[rgb(var(--neon)/0.9)] font-mono">
        {content}
      </code>
    );
  }
  if (ann.italic) content = <em>{content}</em>;
  if (ann.bold) content = <strong className="text-[rgb(var(--text-color))] font-semibold">{content}</strong>;
  return <span>{content}</span>;
}

function RichText({ richText }: { richText: RichTextPart[] | undefined }) {
  if (!richText?.length) return null;
  return richText.map((part, i) => <RichTextSegment key={i} part={part} />);
}

function groupBlocks(blocks: NotionBlock[]) {
  const groups: ({
    type: "bulleted_list";
    items: NotionBlock[];
  } | { type: "numbered_list"; items: NotionBlock[] } | { type: "single"; block: NotionBlock })[] = [];
  for (const block of blocks) {
    const last = groups[groups.length - 1];
    if (block.type === "bulleted_list_item") {
      if (last?.type === "bulleted_list") {
        last.items.push(block);
      } else {
        groups.push({ type: "bulleted_list", items: [block] });
      }
    } else if (block.type === "numbered_list_item") {
      if (last?.type === "numbered_list") {
        last.items.push(block);
      } else {
        groups.push({ type: "numbered_list", items: [block] });
      }
    } else {
      groups.push({ type: "single", block });
    }
  }
  return groups;
}

export function NotionBlockBody({ blocks }: { blocks: NotionBlock[] | null | undefined }) {
  if (!blocks?.length) return null;
  const headings = getHeadingsFromBlocks(blocks);
  let headingIndex = 0;
  const groups = groupBlocks(blocks);

  function renderSingleBlock(block: NotionBlock, key: number) {
    if (!block?.type) return null;

    if (block.type === "table" && block.table) {
      const rows = Array.isArray(block.children) ? (block.children as NotionBlock[]) : [];
      if (!rows.length) {
        return (
          <div
            key={key}
            className="opacity-70 text-sm rounded-sm p-2 my-2 font-[var(--font-ocr)] bg-[rgb(var(--border)/0.15)]"
          >
            <span className="mr-1">Table:</span>
            <span className="text-[rgb(var(--text-secondary))]">No rows found.</span>
          </div>
        );
      }

      const table = block.table as { has_column_header?: boolean; has_row_header?: boolean };
      const hasColumnHeader = !!table.has_column_header;
      const hasRowHeader = !!table.has_row_header;
      const firstRowCells =
        ((rows[0] as { table_row?: { cells?: RichTextPart[][] } }).table_row?.cells as RichTextPart[][]) || [];
      const columnCount = firstRowCells.length;

      if (columnCount === 2) {
        const bodyRows = hasColumnHeader ? rows.slice(1) : rows;
        return (
          <div key={key} className="my-4 grid gap-3 md:grid-cols-2">
            {bodyRows.map((row, rowIndex) => {
              const cells = (row as { table_row?: { cells?: RichTextPart[][] } }).table_row?.cells || [];
              const [labelCell = [], valueCell = []] = cells;
              return (
                <div
                  key={(row as { id?: string }).id || rowIndex}
                  className="border border-[rgb(var(--neon)/0.25)] rounded-sm bg-[rgb(var(--border)/0.2)] px-3 py-2"
                >
                  <div className="text-[0.65rem] font-[var(--font-ocr)] tracking-[0.18em] text-[rgb(var(--neon)/0.7)] uppercase mb-0.5">
                    <RichText richText={labelCell} />
                  </div>
                  <div className="text-xs sm:text-sm text-[rgb(var(--text-color)/0.9)] font-[var(--font-ibm)] leading-snug">
                    <RichText richText={valueCell} />
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      return (
        <div key={key} className="my-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm text-[rgb(var(--text-color)/0.9)] font-[var(--font-ibm)]">
            <tbody>
              {rows.map((row, rowIndex) => {
                const cells = (row as { table_row?: { cells?: RichTextPart[][] } }).table_row?.cells || [];
                const isHeaderRow = hasColumnHeader && rowIndex === 0;
                const RowCellTag = isHeaderRow ? "th" : "td";

                return (
                  <tr
                    key={(row as { id?: string }).id || rowIndex}
                    className="border-b border-[rgb(var(--neon)/0.1)] last:border-b-0"
                  >
                    {cells.map((cell, cellIndex) => {
                      const isRowHeader = hasRowHeader && cellIndex === 0;
                      const CellTag = isRowHeader ? "th" : RowCellTag;
                      return (
                        <CellTag
                          key={cellIndex}
                          className={`px-3 py-2 align-top text-left border-r border-[rgb(var(--neon)/0.1)] last:border-r-0 ${
                            isHeaderRow || isRowHeader
                              ? "font-semibold text-[rgb(var(--text-color))]"
                              : "text-[rgb(var(--text-color)/0.9)]"
                          }`}
                        >
                          <RichText richText={cell} />
                        </CellTag>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (block.type === "paragraph" && block.paragraph && typeof block.paragraph === "object") {
      const textParts = (block.paragraph as { rich_text?: RichTextPart[] }).rich_text;
      if (!textParts?.length) return <div key={key} className="h-4" aria-hidden />;
      return (
        <p key={key} className="text-[rgb(var(--text-color))] leading-relaxed text-base sm:text-lg font-[var(--font-ibm)]">
          <RichText richText={textParts} />
        </p>
      );
    }

    if (block.type === "heading_1" && block.heading_1 && typeof block.heading_1 === "object") {
      const text = ((block.heading_1 as { rich_text?: RichTextPart[] }).rich_text ?? [])
        .map((t) => t.plain_text)
        .join("");
      const id = headings[headingIndex]?.id;
      if (headingIndex < headings.length) headingIndex += 1;
      return (
        <h2
          key={key}
          id={id}
          className="text-2xl sm:text-3xl font-bold text-[rgb(var(--text-color))] mt-8 mb-4 scroll-mt-24"
        >
          {text}
        </h2>
      );
    }
    if (block.type === "heading_2" && block.heading_2 && typeof block.heading_2 === "object") {
      const text = ((block.heading_2 as { rich_text?: RichTextPart[] }).rich_text ?? [])
        .map((t) => t.plain_text)
        .join("");
      const id = headings[headingIndex]?.id;
      if (headingIndex < headings.length) headingIndex += 1;
      return (
        <h3
          key={key}
          id={id}
          className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-color))] mt-6 mb-3 scroll-mt-24"
        >
          {text}
        </h3>
      );
    }
    if (block.type === "heading_3" && block.heading_3 && typeof block.heading_3 === "object") {
      const text = ((block.heading_3 as { rich_text?: RichTextPart[] }).rich_text ?? [])
        .map((t) => t.plain_text)
        .join("");
      const id = headings[headingIndex]?.id;
      if (headingIndex < headings.length) headingIndex += 1;
      return (
        <h4
          key={key}
          id={id}
          className="text-lg sm:text-xl font-bold text-[rgb(var(--text-color))] mt-4 mb-2 scroll-mt-24"
        >
          {text}
        </h4>
      );
    }

    if (block.type === "quote" && block.quote && typeof block.quote === "object") {
      const rt = (block.quote as { rich_text?: RichTextPart[] }).rich_text;
      return (
        <blockquote
          key={key}
          className="border-l-2 border-[rgb(var(--neon)/0.4)] pl-4 py-2 my-4 italic text-[rgb(var(--text-color)/0.9)] font-[var(--font-ibm)] bg-[rgb(var(--neon)/0.03)]"
        >
          <RichText richText={rt} />
        </blockquote>
      );
    }

    if (block.type === "code" && block.code && typeof block.code === "object") {
      const text = ((block.code as { rich_text?: RichTextPart[] }).rich_text ?? [])
        .map((t) => t.plain_text)
        .join("");
      return (
        <pre
          key={key}
          className="bg-[rgb(var(--border)/0.4)] p-4 rounded-sm border border-[rgb(var(--neon)/0.2)] overflow-x-auto my-4"
        >
          <code className="text-sm text-[rgb(var(--neon)/0.9)] font-mono">{text}</code>
        </pre>
      );
    }

    if (block.type === "divider") {
      return <hr key={key} className="border-[rgb(var(--neon)/0.15)] my-8" />;
    }

    if (block.type === "callout" && block.callout && typeof block.callout === "object") {
      const co = block.callout as { rich_text?: RichTextPart[]; icon?: { emoji?: string } };
      const icon = co.icon?.emoji ?? "\u2139\uFE0F";
      return (
        <div key={key} className="rounded-sm p-4 my-4 flex gap-3 bg-[rgb(var(--border)/0.25)]">
          <span className="shrink-0" aria-hidden>
            {icon}
          </span>
          <div className="text-[rgb(var(--text-color))] leading-relaxed min-w-0 font-[var(--font-ibm)]">
            <RichText richText={co.rich_text} />
          </div>
        </div>
      );
    }

    if (block.type === "image" && block.image && typeof block.image === "object") {
      const img = block.image as {
        type?: string;
        external?: { url?: string };
        file?: { url?: string };
        caption?: RichTextPart[];
      };
      const url =
        img.type === "external"
          ? img.external?.url
          : img.type === "file"
            ? img.file?.url
            : null;
      const caption = img.caption?.length ? img.caption.map((t) => t.plain_text).join("") : "";
      if (!url) return null;
      return (
        <NotionImage
          key={key}
          src={url}
          imageRefreshToken={block.id ? mintNotionImageRefreshToken(block.id) : null}
          alt={caption || "Notion image"}
          caption={caption}
        />
      );
    }

    return (
      <div
        key={key}
        className="opacity-70 text-sm rounded-sm p-2 my-2 font-[var(--font-ocr)] bg-[rgb(var(--border)/0.15)]"
      >
        Unsupported block: <code className="text-[rgb(var(--neon)/0.8)]">{block.type}</code>
      </div>
    );
  }

  return (
    <article className="prose prose-invert max-w-none">
      <div className="space-y-4">
        {groups.map((group, gi) => {
          if (group.type === "bulleted_list") {
            return (
              <ul key={gi} className="list-disc ml-6 my-2 space-y-1 marker:text-[rgb(var(--neon)/0.5)]">
                {group.items.map((b, li) => (
                  <li key={li} className="text-[rgb(var(--text-color))] leading-relaxed font-[var(--font-ibm)]">
                    <RichText
                      richText={(b as { bulleted_list_item?: { rich_text?: RichTextPart[] } }).bulleted_list_item?.rich_text}
                    />
                  </li>
                ))}
              </ul>
            );
          }
          if (group.type === "numbered_list") {
            return (
              <ol key={gi} className="list-decimal ml-6 my-2 space-y-1 marker:text-[rgb(var(--neon)/0.5)]">
                {group.items.map((b, li) => (
                  <li key={li} className="text-[rgb(var(--text-color))] leading-relaxed font-[var(--font-ibm)]">
                    <RichText
                      richText={(b as { numbered_list_item?: { rich_text?: RichTextPart[] } }).numbered_list_item?.rich_text}
                    />
                  </li>
                ))}
              </ol>
            );
          }
          return renderSingleBlock(group.block, gi);
        })}
      </div>
    </article>
  );
}
