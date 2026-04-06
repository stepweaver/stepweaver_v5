"use client";

import { GlitchLambda } from "@/components/ui/glitch-lambda";
import { useMatrixSync, type MatrixPhase } from "@/hooks/use-matrix-sync";

const OUTPUT_COLOR: Record<MatrixPhase, string> = {
  init: "text-[rgb(var(--neon))]",
  scan: "text-[rgb(var(--neon))]",
  trace: "text-[rgb(var(--accent))]",
  lock: "text-[rgb(var(--accent))]",
  fail: "text-[rgb(var(--warn))]",
  lost: "text-[rgb(var(--danger))]",
  unplugged: "text-[rgb(var(--danger))]",
  idle: "text-[rgb(var(--neon))]",
};

const CELL_STYLE: Record<MatrixPhase, string> = {
  init: "border-[rgb(var(--neon)/0.25)] text-[rgb(var(--neon)/0.85)]",
  scan: "border-[rgb(var(--neon)/0.25)] text-[rgb(var(--neon)/0.85)]",
  trace: "border-[rgb(var(--accent)/0.2)] text-[rgb(var(--accent)/0.9)]",
  lock: "border-[rgb(var(--accent)/0.3)] text-[rgb(var(--accent))]",
  fail: "border-[rgb(var(--warn)/0.2)] text-[rgb(var(--warn))]",
  lost: "border-[rgb(var(--danger)/0.15)] text-[rgb(var(--danger)/0.5)]",
  unplugged: "border-[rgb(var(--muted-color)/0.15)] text-[rgb(var(--muted-color)/0.35)]",
  idle: "border-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon)/0.35)]",
};

export function MatrixSync() {
  const { attempt, terminalOutput, matrixCells, showPrompt, isMounted, phase } = useMatrixSync();

  const isErr = phase === "fail" || phase === "lost" || phase === "unplugged";
  const outColor = OUTPUT_COLOR[phase] ?? OUTPUT_COLOR.idle;
  const cellClass = CELL_STYLE[phase] ?? CELL_STYLE.idle;

  return (
    <div
      className={[
        "relative overflow-hidden border bg-[rgb(var(--panel)/0.5)] px-3 py-2",
        isErr ? "border-[rgb(var(--danger)/0.25)]" : "border-[rgb(var(--neon)/0.25)]",
      ].join(" ")}
      aria-live="polite"
    >
      <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-[rgb(var(--neon)/0.6)]" />
      <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t border-[rgb(var(--neon)/0.3)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[rgb(var(--neon)/0.3)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[rgb(var(--neon)/0.6)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_10px] opacity-10" />

      <div className="relative pb-2 font-[var(--font-ocr)] text-[10px] uppercase tracking-[0.24em]">
        <span className="text-[rgb(var(--neon)/0.7)]">MATRIX LINK</span>
        <span className="px-2 text-[rgb(var(--neon)/0.35)]">{"//"}</span>
        <span className="text-[rgb(var(--neon)/0.7)]">STATUS</span>
        <span className="px-2 text-[rgb(var(--neon)/0.35)]">{"//"}</span>
        <span className="text-[rgb(var(--danger))] motion-safe:animate-pulse">UNPLUGGED</span>
      </div>

      <div className={["relative flex min-h-6 items-center gap-2 overflow-hidden py-1 font-mono text-xs", outColor].join(" ")}>
        <GlitchLambda className={`shrink-0 text-xs ${outColor}`} size="small" />

        {terminalOutput && (
          <span
            className={[
              "min-w-0 truncate font-[var(--font-ocr)] uppercase tracking-[0.08em]",
              phase === "unplugged" ? "motion-safe:animate-pulse" : "",
            ].join(" ")}
          >
            {terminalOutput}
          </span>
        )}

        {showPrompt && <span className="motion-safe:animate-pulse">_</span>}
      </div>

      <div className="relative grid grid-cols-6 gap-[2px] pt-2">
        {matrixCells.map((cell, index) => (
          <div
            key={`${cell}-${index}-${isMounted}`}
            className={[
              "flex h-6 items-center justify-center border bg-[rgb(var(--panel)/0.35)] font-mono text-[11px] font-bold transition-colors duration-200",
              cellClass,
            ].join(" ")}
          >
            {cell}
          </div>
        ))}
      </div>

      <div className="relative pt-2 text-right font-[var(--font-ocr)] text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--neon)/0.4)]">
        LINK ATTEMPT {"//"} {attempt.toString().padStart(2, "0")}
      </div>
    </div>
  );
}
