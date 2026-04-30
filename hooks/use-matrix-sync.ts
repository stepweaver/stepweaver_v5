"use client";

import { useCallback, useEffect, useState } from "react";

const DEFAULT_GLYPHS = [
  "ﾊ", "ﾐ", "ﾋ", "ｰ", "ｳ", "ｼ", "ﾅ", "ﾓ", "ﾆ", "ｻ",
  "ﾜ", "ﾂ", "ｵ", "ﾘ", "ｱ", "ﾎ", "ﾃ", "ﾏ", "ｹ", "ﾒ",
  "ｴ", "ｶ", "ｷ", "ﾑ", "ﾕ", "ﾗ", "ｾ", "ﾈ", "ｽ", "ﾀ",
];

const randomHex = (len = 4) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");

export type MatrixPhase =
  | "idle"
  | "init"
  | "scan"
  | "trace"
  | "lock"
  | "fail"
  | "lost"
  | "unplugged";

export function useMatrixSync({
  glyphs = DEFAULT_GLYPHS,
  cellCount = 6,
}: { glyphs?: string[]; cellCount?: number } = {}) {
  const safeGlyphs = glyphs.length ? glyphs : DEFAULT_GLYPHS;

  const createCells = useCallback(
    () =>
      Array.from({ length: cellCount }, () =>
        [
          safeGlyphs[Math.floor(Math.random() * safeGlyphs.length)]!,
          safeGlyphs[Math.floor(Math.random() * safeGlyphs.length)]!,
        ].join("")
      ),
    [safeGlyphs, cellCount]
  );

  const createDimCells = useCallback(
    () => Array.from({ length: cellCount }, () => "··"),
    [cellCount]
  );

  const [attempt, setAttempt] = useState(1);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [matrixCells, setMatrixCells] = useState(() => Array.from({ length: cellCount }, () => "  "));
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [phase, setPhase] = useState<MatrixPhase>("idle");

  useEffect(() => {
    setIsMounted(true);
    setMatrixCells(createCells());
  }, [createCells]);

  useEffect(() => {
    if (!isMounted) return;

    let step = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const matrixIntervalRef = { current: null as ReturnType<typeof setInterval> | null };
    let currentAttempt = 1;

    const delay = (base: number, variance: number) => base + Math.random() * variance;

    const clearMatrixInterval = () => {
      if (matrixIntervalRef.current) {
        clearInterval(matrixIntervalRef.current);
        matrixIntervalRef.current = null;
      }
    };

    const scramble = (cycles: number, interval: number, onDone: () => void) => {
      let count = 0;
      clearMatrixInterval();
      matrixIntervalRef.current = setInterval(() => {
        setMatrixCells(createCells());
        count++;
        if (count >= cycles) {
          clearMatrixInterval();
          onDone();
        }
      }, interval);
    };

    const run = () => {
      step++;

      if (step === 1) {
        setPhase("init");
        setTerminalOutput("INIT UPLINK");
        setAttempt(currentAttempt);
        setShowPrompt(false);
        timeoutId = setTimeout(run, delay(900, 300));
      } else if (step === 2) {
        setPhase("scan");
        setTerminalOutput("SCANNING CONSTRUCT");
        scramble(8, 150, () => {
          timeoutId = setTimeout(run, delay(400, 200));
        });
      } else if (step === 3) {
        setPhase("trace");
        setTerminalOutput(`TRACE 0x${randomHex(6)}`);
        scramble(5, 120, () => {
          timeoutId = setTimeout(run, delay(600, 200));
        });
      } else if (step === 4) {
        setPhase("lock");
        setTerminalOutput("SIGNAL LOCK");
        timeoutId = setTimeout(run, delay(500, 200));
      } else if (step === 5) {
        setPhase("fail");
        setTerminalOutput("HANDSHAKE FAIL");
        scramble(12, 100, () => {
          timeoutId = setTimeout(run, delay(500, 200));
        });
      } else if (step === 6) {
        setPhase("lost");
        setTerminalOutput("CARRIER LOST");
        setMatrixCells(createDimCells());
        timeoutId = setTimeout(run, delay(1000, 400));
      } else if (step === 7) {
        setPhase("unplugged");
        setTerminalOutput("USR UNPLUGGED");
        timeoutId = setTimeout(run, delay(1500, 500));
      } else if (step === 8) {
        setPhase("idle");
        setTerminalOutput("");
        setShowPrompt(true);
        timeoutId = setTimeout(run, delay(2000, 800));
      } else {
        setShowPrompt(false);
        setTerminalOutput("");
        setMatrixCells(createCells());
        currentAttempt = currentAttempt >= 97 ? 1 : currentAttempt + 1;
        step = 0;
        timeoutId = setTimeout(run, delay(400, 200));
      }
    };

    run();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearMatrixInterval();
    };
  }, [isMounted, createCells, createDimCells]);

  return { attempt, terminalOutput, matrixCells, showPrompt, isMounted, phase };
}
