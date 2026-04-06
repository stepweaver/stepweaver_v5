"use client";

import { useCallback, useRef, useState } from "react";

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, summary, [role="button"], [data-no-swipe="true"]';

export function useSwipeNavigation(opts: {
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
  threshold?: number;
  intentRatio?: number;
  transitionMs?: number;
}) {
  const {
    onPrev,
    onNext,
    disabled = false,
    threshold = 56,
    intentRatio = 1.25,
    transitionMs = 180,
  } = opts;

  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);
  const startedOnInteractiveRef = useRef(false);
  const lockRef = useRef(false);

  const [dragOffset, setDragOffset] = useState(0);

  const reset = useCallback(() => {
    pointerIdRef.current = null;
    startXRef.current = 0;
    startYRef.current = 0;
    draggingRef.current = false;
    startedOnInteractiveRef.current = false;
    setDragOffset(0);
  }, []);

  const lockTemporarily = useCallback(() => {
    lockRef.current = true;
    const timer = setTimeout(() => {
      lockRef.current = false;
    }, transitionMs);
    return () => clearTimeout(timer);
  }, [transitionMs]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || lockRef.current) return;
      if (e.pointerType !== "touch" && e.pointerType !== "pen") return;

      const target = e.target;
      startedOnInteractiveRef.current =
        target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));

      if (startedOnInteractiveRef.current) return;

      pointerIdRef.current = e.pointerId;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      draggingRef.current = true;

      if (typeof e.currentTarget.setPointerCapture === "function") {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    },
    [disabled]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      if (pointerIdRef.current !== e.pointerId) return;
      if (startedOnInteractiveRef.current) return;

      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;

      const horizontalIntent = Math.abs(deltaX) > Math.abs(deltaY) * intentRatio;

      if (horizontalIntent) {
        const clamped = Math.max(-24, Math.min(24, deltaX * 0.18));
        setDragOffset(clamped);
      } else {
        setDragOffset(0);
      }
    },
    [intentRatio]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      if (pointerIdRef.current !== e.pointerId) return;

      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;

      const horizontalIntent = Math.abs(deltaX) > Math.abs(deltaY) * intentRatio;
      const passedThreshold = Math.abs(deltaX) >= threshold;

      if (
        !disabled &&
        !lockRef.current &&
        !startedOnInteractiveRef.current &&
        horizontalIntent &&
        passedThreshold
      ) {
        lockTemporarily();
        if (deltaX > 0) onPrev();
        else onNext();
      }

      reset();
    },
    [disabled, intentRatio, lockTemporarily, onNext, onPrev, reset, threshold]
  );

  const onPointerCancel = useCallback(() => {
    reset();
  }, [reset]);

  return {
    swipeBindings: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
    dragOffset,
  };
}
