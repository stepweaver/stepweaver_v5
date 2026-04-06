"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { useSafeScroll } from "@/hooks/use-safe-scroll";
import { getDocumentScrollProgressY } from "@/lib/document-scroll-progress";
import { COLOR_PALETTES, GLOW_FILTERS } from "@/lib/effects/background-constants";
import { useCircuitRainLayer } from "@/components/effects/background-circuit";

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useRef(0);
  const originalImageDataRef = useRef<ImageData | null>(null);
  const isMobileRef = useRef(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false
  );
  const { theme, mounted } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const neonColors = useMemo(() => COLOR_PALETTES[theme] || COLOR_PALETTES.dark, [theme]);
  const neonColorsRef = useRef(neonColors);
  neonColorsRef.current = neonColors;

  const rafIdRef = useRef<number | null>(null);
  const lastColorKeyRef = useRef<string | null>(null);

  const updateCanvasColors = useCallback(() => {
    const canvas = canvasRef.current;
    const imgData = originalImageDataRef.current;
    if (!canvas || !imgData) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const colors = neonColorsRef.current;
    const progress = scrollProgressRef.current;

    const colorProgress = progress * (colors.length - 1);
    const colorIndex = Math.floor(colorProgress);
    const nextColorIndex = Math.min(colorIndex + 1, colors.length - 1);
    const blend = colorProgress - colorIndex;

    const cur = colors[colorIndex]!;
    const nxt = colors[nextColorIndex]!;
    const r = Math.round(cur[0]! * (1 - blend) + nxt[0]! * blend);
    const g = Math.round(cur[1]! * (1 - blend) + nxt[1]! * blend);
    const b = Math.round(cur[2]! * (1 - blend) + nxt[2]! * blend);

    const colorKey = `${r},${g},${b}`;
    if (lastColorKeyRef.current === colorKey) return;
    lastColorKeyRef.current = colorKey;

    const imageData = new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3]! > 0) {
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  const updateTransform = useCallback(() => {
    if (!canvasRef.current) return;
    const mobile = isMobileRef.current;
    const sp = scrollProgressRef.current;
    const scale = mobile ? 0.9 - sp * 0.4 : 1.4 - sp * 0.8;
    /* Mobile: unchanged (lambda biased left). Desktop: mirror of former tx so lambda sits on the right. */
    const tx = mobile ? -30 - sp * 20 : 15 + sp * 25;
    const ty = mobile ? "2%" : "5%";
    canvasRef.current.style.transform = `scale(${scale}) translateX(${tx}%) translateY(${ty})`;
  }, []);

  const handleScroll = useCallback(
    (scrollData: { scrollProgressY: number }) => {
      scrollProgressRef.current = scrollData.scrollProgressY;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          updateCanvasColors();
          updateTransform();
        });
      }
    },
    [updateCanvasColors, updateTransform]
  );

  useSafeScroll({ onScroll: handleScroll, throttleMs: 16 });

  const applyScrollDerivedCanvas = useCallback(() => {
    if (typeof window === "undefined") return;
    scrollProgressRef.current = getDocumentScrollProgressY();
    lastColorKeyRef.current = null;
    updateCanvasColors();
    updateTransform();
  }, [updateCanvasColors, updateTransform]);

  useLayoutEffect(() => {
    let alive = true;
    const sync = () => {
      if (alive) applyScrollDerivedCanvas();
    };
    sync();
    let raf2Id: number | null = null;
    const raf1Id = requestAnimationFrame(() => {
      sync();
      raf2Id = requestAnimationFrame(sync);
    });
    const t = window.setTimeout(sync, 120);
    return () => {
      alive = false;
      cancelAnimationFrame(raf1Id);
      if (raf2Id != null) cancelAnimationFrame(raf2Id);
      window.clearTimeout(t);
    };
  }, [pathname, applyScrollDerivedCanvas]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      isMobileRef.current = window.innerWidth < 768;
      scrollProgressRef.current = getDocumentScrollProgressY();
      lastColorKeyRef.current = null;
      updateCanvasColors();
      updateTransform();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize, { passive: true });
      handleResize();
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [updateCanvasColors, updateTransform]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalImageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHasError(false);
        updateCanvasColors();
        updateTransform();
        setTimeout(() => setIsLoaded(true), 100);
      } catch {
        setHasError(true);
      }
    };

    let webpFailed = false;
    img.onerror = () => {
      if (!webpFailed) {
        webpFailed = true;
        img.src = "/images/lambda_stepweaver.png";
      } else {
        setHasError(true);
      }
    };
    img.src = "/images/lambda_stepweaver.webp";
  }, [mounted, updateCanvasColors, updateTransform]);

  useLayoutEffect(() => {
    lastColorKeyRef.current = null;
    updateCanvasColors();
  }, [neonColors, updateCanvasColors]);

  useCircuitRainLayer(rainCanvasRef, theme, prefersReducedMotion);

  if (hasError) {
    return null;
  }

  const isLightish = theme === "light" || theme === "monochrome-inverted";
  const isSkynet = theme === "skynet";
  const glowFilter = GLOW_FILTERS[theme] || GLOW_FILTERS.dark;
  const rainOpacity = isLightish ? 0.2 : isSkynet ? 0.48 : 0.4;
  const lambdaOpacity = isLightish ? 0.2 : isSkynet ? 0.34 : 0.3;

  return (
    <>
      <div className="fixed inset-0 z-[9] pointer-events-none" aria-hidden>
        <canvas ref={rainCanvasRef} className="h-full w-full" style={{ opacity: rainOpacity }} />
      </div>
      <div className="fixed inset-0 z-10 flex items-center justify-start md:justify-end pointer-events-none">
        <canvas
          ref={canvasRef}
          width={1024}
          height={1536}
          className={`origin-center transition-opacity duration-700 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            filter: glowFilter,
            opacity: lambdaOpacity,
          }}
          aria-hidden
        />
      </div>
    </>
  );
}
