"use client";

/**
 * Full-screen terminal overlay. linesMode is driven by PageTransition (editorial vs standard scan).
 * Ported from v3 `components/transition/TerminalLoader.jsx`.
 */

type LineSpec = { cmd: string; status: string };

type Props = {
  targetPath: string | null;
  fromPath: string | null;
  duration: number;
  phase: "in" | "out";
  linesMode: "content" | "standard";
  fadeMs: number;
};

export function TerminalLoader({ targetPath, fromPath, duration, phase, linesMode, fadeMs }: Props) {
  const useLongSequence = linesMode === "content";

  const contentLines: LineSpec[] = [
    { cmd: "init transition.module", status: "[OK]" },
    { cmd: `route.resolve("${targetPath || "/"}")`, status: "[OK]" },
    { cmd: "query content.database", status: "[OK]" },
    { cmd: "decrypt payload.aes256", status: "[OK]" },
    { cmd: "parse render.blocks", status: "[OK]" },
    { cmd: "hydrate view.module", status: "progress" },
  ];

  const standardLines: LineSpec[] = [
    { cmd: `route.resolve("${targetPath || "/"}")`, status: "[OK]" },
    { cmd: "load view.module", status: "[OK]" },
    { cmd: "render", status: "progress" },
  ];

  const lines = useLongSequence ? contentLines : standardLines;
  const lineDelay = 120;
  const progressBarDuration = Math.max(400, duration - lines.length * lineDelay);

  const handoffLabel =
    fromPath && targetPath ? `${fromPath} → ${targetPath}` : targetPath || "Loading";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden font-[var(--font-ocr)] text-xs uppercase tracking-[0.15em] text-[rgb(var(--neon))]"
      style={{
        backgroundColor: "rgb(var(--bg))",
        animation: phase === "out" ? `twPageFadeOut ${fadeMs}ms ease-out forwards` : undefined,
      }}
      role="status"
    >
      <span className="sr-only">Loading page: {handoffLabel}</span>
      <div
        className="relative flex flex-1 flex-col items-center justify-start w-full overflow-hidden px-4 pt-16 sm:px-8 sm:pt-24"
        aria-hidden
      >
        <div className="w-full max-w-2xl">
          <div className="mb-6 tracking-[0.2em] text-[rgb(var(--neon)/0.4)]">λSTEPWEAVER // LOADING MODULE</div>
          {fromPath && targetPath ? (
            <div className="mb-4 truncate text-[0.65rem] normal-case tracking-normal text-[rgb(var(--neon)/0.3)]">
              {`// handoff: ${fromPath} → ${targetPath}`}
            </div>
          ) : null}

          <div className="space-y-2 overflow-hidden">
            {lines.map((line, i) => (
              <TerminalLine
                key={i}
                cmd={line.cmd}
                status={line.status}
                delay={i * lineDelay}
                isProgress={line.status === "progress"}
                progressDuration={progressBarDuration}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalLine({
  cmd,
  status,
  delay,
  isProgress,
  progressDuration,
}: {
  cmd: string;
  status: string;
  delay: number;
  isProgress: boolean;
  progressDuration: number;
}) {
  return (
    <div
      className="animate-tw-hud-line-in flex min-w-0 items-center gap-2 opacity-0 sm:gap-4"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
      }}
    >
      <span className="shrink-0 text-[rgb(var(--neon)/0.6)]">&gt;</span>
      <span className="min-w-0 truncate text-[rgb(var(--neon))]">{cmd}</span>
      {isProgress ? (
        <ProgressBar duration={progressDuration} delay={delay} />
      ) : (
        <span
          className="animate-tw-hud-line-in ml-auto shrink-0 opacity-0 text-[rgb(var(--neon)/0.7)]"
          style={{
            animationDelay: `${delay + 120}ms`,
            animationFillMode: "forwards",
          }}
        >
          {status}
        </span>
      )}
    </div>
  );
}

function ProgressBar({ duration, delay }: { duration: number; delay: number }) {
  const durationSec = Math.max(0.5, duration / 1000);
  return (
    <span
      className="ml-auto block h-3 w-24 shrink-0 overflow-hidden rounded-sm border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--neon)/0.1)]"
      aria-hidden
    >
      <span
        className="terminal-progress-fill-ported block h-full w-full bg-[rgb(var(--neon)/0.8)]"
        style={{
          animationDuration: `${durationSec}s`,
          animationDelay: `${delay + 80}ms`,
        }}
      />
    </span>
  );
}
