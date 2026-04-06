"use client";

import type { FieldNoteEntryModel } from "./field-note-entry";

export function FieldNotesSelector({
  notes,
  selectedNoteId,
  onNoteChange,
}: {
  notes: FieldNoteEntryModel[];
  selectedNoteId: string | null;
  onNoteChange: (_noteId: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor="field-notes-selector" className="shrink-0 font-mono text-xs text-[rgb(var(--neon)/0.5)]">
        $
      </label>
      <select
        id="field-notes-selector"
        value={selectedNoteId || ""}
        className="field-notes-select min-w-0 cursor-pointer rounded-sm border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--panel)/0.9)] px-2 py-1.5 font-mono text-xs text-neon transition-colors hover:border-[rgb(var(--neon)/0.5)] focus:border-[rgb(var(--neon)/0.6)] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--neon)/0.3)]"
        onChange={(e) => onNoteChange(e.target.value)}
        aria-label="Select log date"
      >
        {notes.map((note) => (
          <option key={note.id} value={note.id} className="bg-[rgb(var(--bg))] text-[rgb(var(--text-color))]">
            {note.title}
          </option>
        ))}
      </select>
    </div>
  );
}
