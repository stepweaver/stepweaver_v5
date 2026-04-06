"use client";

import { createPortal } from "react-dom";
import { useVisualViewportRect } from "@/hooks/use-visual-viewport-rect";

export function RollSessionModal({
  isOpen,
  onClose,
  children,
  title = "ROLL OUTPUT // ACTIVE SESSION",
  closeLabel = "ABORT",
  closeVariant = "danger",
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  closeLabel?: string;
  closeVariant?: "danger" | "default";
}) {
  const visualViewportRect = useVisualViewportRect(isOpen);

  if (!isOpen || typeof document === "undefined") return null;

  const closeClasses =
    closeVariant === "danger"
      ? "text-[rgb(var(--danger)/0.9)] hover:text-danger hover:bg-[rgb(var(--danger)/0.1)]"
      : "text-[rgb(var(--neon)/0.8)] hover:text-neon hover:bg-[rgb(var(--neon)/0.1)]";

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close roll session"
        onClick={onClose}
        className="fixed inset-0 z-[190] bg-black/80 backdrop-blur-sm cursor-pointer"
      />

      <div
        className="fixed left-0 right-0 z-[200] m-0 w-full overflow-hidden"
        style={{
          top: visualViewportRect.top,
          height: visualViewportRect.height,
          maxHeight: visualViewportRect.height,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="roll-session-title"
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[rgb(var(--panel)/0.92)] backdrop-blur-sm">
          <div className="relative z-[2] flex shrink-0 items-stretch justify-between gap-3 border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--surface)/0.9)] px-3 py-2.5 sm:px-4">
            <p
              id="roll-session-title"
              className="self-center font-[var(--font-ocr)] text-[11px] uppercase leading-snug tracking-[0.14em] text-[rgb(var(--text-label))] opacity-90 sm:text-xs"
            >
              {title}
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`shrink-0 cursor-pointer rounded-none px-2.5 py-1.5 font-[var(--font-ibm)] text-[11px] uppercase tracking-widest transition-colors ${closeClasses}`}
              aria-label="Close roll session"
            >
              {closeLabel}
            </button>
          </div>
          <div className="relative z-[2] min-h-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
        </div>
      </div>
    </>,
    document.body
  );
}
