"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { TerminalLoader } from "@/components/transition/terminal-loader";
import { useNavigationTransition } from "@/components/transition/navigation-transition-context";
import {
  CONTENT_BODY_MS,
  ESCALATED_BODY_MS,
  isContentRoute,
  REDUCED_MOTION_FADE_MS,
  SLOW_NAV_THRESHOLD_MS,
  STANDARD_HANDOFF_MS,
  FADE_MS,
} from "@/components/transition/transition-config";

function pathKeyToPathname(pathKey: string) {
  if (!pathKey) return "";
  const q = pathKey.indexOf("?");
  return q === -1 ? pathKey : pathKey.slice(0, q);
}

/** Doc ↔ doc within meshtastic or codex: use crossfade instead of terminal-in (avoids timer races + RSC swap glitches). */
function isSiblingContentDocNav(fromPathname: string, toPathname: string): boolean {
  if (!fromPathname || !toPathname || fromPathname === toPathname) return false;
  if (fromPathname.startsWith("/meshtastic/") && toPathname.startsWith("/meshtastic/")) return true;
  if (fromPathname.startsWith("/codex/") && toPathname.startsWith("/codex/")) return true;
  return false;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function PageTransitionInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationKey = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;

  const navCtx = useNavigationTransition();
  const intent = navCtx?.intent ?? null;
  const clearIntent = navCtx?.clearIntent;
  /** Intent must not be a dep of the route-change effect: clearing it re-runs the effect, cleanup cancels crossfade rAFs, then early-return leaves opacity 0 forever. */
  const intentRef = useRef(intent);
  const clearIntentRef = useRef(clearIntent);
  intentRef.current = intent;
  clearIntentRef.current = clearIntent;

  const reducedMotion = usePrefersReducedMotion();
  const fadeMs = reducedMotion ? REDUCED_MOTION_FADE_MS : FADE_MS;
  const handoffMs = reducedMotion ? REDUCED_MOTION_FADE_MS : STANDARD_HANDOFF_MS;

  const prevKeyRef = useRef<string | null>(null);
  const escalatedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phase, setPhase] = useState<"idle" | "terminal-in" | "terminal-out" | "crossfade">("idle");
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLinesMode, setTerminalLinesMode] = useState<"content" | "standard">("standard");
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [fromPath, setFromPath] = useState<string | null>(null);
  const [bodyMs, setBodyMs] = useState(CONTENT_BODY_MS);
  const [contentOpacity, setContentOpacity] = useState(1);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleTerminalOut = useCallback(() => {
    clearTimers();
    setPhase("terminal-out");
    timerRef.current = setTimeout(() => {
      setPhase("idle");
      setShowTerminal(false);
      setTargetPath(null);
      setFromPath(null);
      setContentOpacity(1);
      timerRef.current = null;
    }, fadeMs);
  }, [clearTimers, fadeMs]);

  const scheduleTerminalIn = useCallback(
    (bodyDuration: number, linesMode: "content" | "standard", displayTarget: string, from: string) => {
      clearTimers();
      setShowTerminal(true);
      setTerminalLinesMode(linesMode);
      setTargetPath(displayTarget);
      setFromPath(from);
      setBodyMs(bodyDuration);
      setPhase("terminal-in");
      setContentOpacity(0);
      timerRef.current = setTimeout(() => {
        scheduleTerminalOut();
      }, bodyDuration);
    },
    [clearTimers, scheduleTerminalOut]
  );

  useEffect(() => {
    if (reducedMotion || !intent) return;
    if (intent.pathKey === locationKey) return;

    const t = setTimeout(() => {
      if (intent.pathKey !== locationKey) {
        escalatedRef.current = true;
        const destPathname = pathKeyToPathname(intent.pathKey);
        const linesMode = isContentRoute(destPathname) ? "content" : "standard";
        scheduleTerminalIn(ESCALATED_BODY_MS, linesMode, intent.pathKey, locationKey);
      }
    }, SLOW_NAV_THRESHOLD_MS);

    return () => clearTimeout(t);
  }, [intent, locationKey, reducedMotion, scheduleTerminalIn]);

  useEffect(() => {
    if (prevKeyRef.current === null) {
      prevKeyRef.current = locationKey;
      return;
    }
    if (prevKeyRef.current === locationKey) return;

    const fromKey = prevKeyRef.current;
    prevKeyRef.current = locationKey;

    const intentNow = intentRef.current;
    const clearNow = clearIntentRef.current;
    if (intentNow && intentNow.pathKey === locationKey && clearNow) {
      clearNow();
    }

    const wasEscalated = escalatedRef.current;
    escalatedRef.current = false;

    clearTimers();

    if (reducedMotion) {
      setPhase("idle");
      setShowTerminal(false);
      setContentOpacity(1);
      setTargetPath(null);
      setFromPath(null);
      return;
    }

    const toPathname = pathname;
    const fromPathname = pathKeyToPathname(fromKey);

    if (isContentRoute(toPathname) && !isSiblingContentDocNav(fromPathname, toPathname)) {
      scheduleTerminalIn(CONTENT_BODY_MS, "content", locationKey, fromKey);
      return;
    }

    if (wasEscalated && !isSiblingContentDocNav(fromPathname, toPathname)) {
      scheduleTerminalIn(ESCALATED_BODY_MS, "standard", locationKey, fromKey);
      return;
    }

    setShowTerminal(false);
    setPhase("crossfade");
    setTargetPath(null);
    setFromPath(null);
    setContentOpacity(0);

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setContentOpacity(1);
        timerRef.current = setTimeout(() => {
          setPhase("idle");
          timerRef.current = null;
        }, handoffMs);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [locationKey, pathname, reducedMotion, clearTimers, scheduleTerminalIn, handoffMs]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const loaderPhase = phase === "terminal-out" ? "out" : "in";

  return (
    <>
      <div
        className="ease-out"
        style={{
          transitionProperty: "opacity",
          transitionDuration: `${handoffMs}ms`,
          transitionTimingFunction: "ease-out",
          opacity: phase === "terminal-in" || phase === "terminal-out" ? 0 : contentOpacity,
          pointerEvents:
            phase === "terminal-in" || phase === "terminal-out" || contentOpacity < 0.99 ? "none" : "auto",
        }}
      >
        {children}
      </div>
      {showTerminal ? (
        <TerminalLoader
          targetPath={targetPath}
          fromPath={fromPath}
          duration={bodyMs}
          phase={loaderPhase}
          linesMode={terminalLinesMode}
          fadeMs={fadeMs}
        />
      ) : null}
    </>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={children}>
      <PageTransitionInner>{children}</PageTransitionInner>
    </Suspense>
  );
}
