"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import type { NotionBlock } from "@/lib/notion-blocks";
import { FieldNoteEntry, type FieldNoteEntryModel } from "./field-note-entry";
import { FieldNotesSelector } from "./field-notes-selector";

export type FieldNoteWithBlocks = FieldNoteEntryModel & {
  blocks?: NotionBlock[];
  filteredBlocks?: NotionBlock[];
};

export function FieldNotesDisplay({ notesWithBlocks }: { notesWithBlocks: FieldNoteWithBlocks[] }) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notesWithBlocks.length > 0 ? notesWithBlocks[0].id : null
  );

  const selectedNote = notesWithBlocks.find((n) => n.id === selectedNoteId) ?? notesWithBlocks[0];

  if (!selectedNote) return null;

  const logId =
    selectedNote.title.replace(/[\[\]]/g, "").replace(/-/g, "").substring(0, 8).toUpperCase() || "NOTE";

  return (
    <article className="overflow-hidden rounded-sm border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.2)]">
      <div className="flex items-center justify-between border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.5)] px-5 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-3 w-3 text-[rgb(var(--neon)/0.4)]" aria-hidden />
          <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon)/0.4)] uppercase">
            Field notes
          </span>
        </div>
        <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta))]">LOG-{logId}</span>
      </div>

      <div className="px-5 py-5 sm:px-6 lg:px-8">
        {notesWithBlocks.length > 1 ? (
          <div className="mb-4">
            <FieldNotesSelector
              notes={notesWithBlocks}
              selectedNoteId={selectedNoteId}
              onNoteChange={setSelectedNoteId}
            />
          </div>
        ) : null}

        <div className="log-entry-content min-h-[14rem] overflow-x-auto">
          <FieldNoteEntry
            note={selectedNote}
            blocks={selectedNote.filteredBlocks ?? selectedNote.blocks}
          />
        </div>
      </div>
    </article>
  );
}
