"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import { DEFAULT_GLYPHS } from "@/hooks/use-matrix-sync";

function parseCssRgbTriplet(raw: string): [number, number, number] {
  const p = raw
    .trim()
    .split(/\s+/)
    .map((x) => parseInt(x, 10));
  if (p.length >= 3 && p.every((n) => Number.isFinite(n))) {
    return [p[0]!, p[1]!, p[2]!];
  }
  return [0, 255, 65];
}

type Column = {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
};

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, mounted } = useTheme();

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationId: number;
    let columns: Column[] = [];
    let particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];

    const readNeon = (): [number, number, number] => {
      if (typeof window === "undefined") return [0, 255, 65];
      return parseCssRgbTriplet(getComputedStyle(document.documentElement).getPropertyValue("--neon"));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const colW = w < 768 ? 14 : 18;
      const n = Math.ceil(w / colW) + 2;
      columns = Array.from({ length: n }, (_, i) => ({
        x: i * colW + (Math.random() - 0.5) * 4,
        y: Math.random() * h,
        speed: 1.2 + Math.random() * 2.8,
        length: 8 + Math.floor(Math.random() * 14),
        chars: [],
      }));
      for (const c of columns) {
        c.chars = Array.from({ length: c.length }, () => DEFAULT_GLYPHS[Math.floor(Math.random() * DEFAULT_GLYPHS.length)]!);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let img: HTMLImageElement | null = null;
    let imgReady = false;
    const tryLoadWatermark = () => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => {
        img = el;
        imgReady = true;
      };
      el.onerror = () => {
        el.src = "/images/lambda_stepweaver.png";
      };
      el.src = "/images/lambda_stepweaver.webp";
    };
    tryLoadWatermark();

    const tick = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const [r, g, b] = readNeon();
      const isLight = theme === "light" || theme === "monochrome-inverted" || theme === "apple";
      const baseAlpha = isLight ? 0.22 : 0.14;
      const rainAlpha = isLight ? 0.2 : 0.12;

      ctx.clearRect(0, 0, w, h);

      if (imgReady && img && img.complete && img.naturalWidth > 0) {
        const maxW = Math.min(w * 0.55, 520);
        const scale = maxW / img.naturalWidth;
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        const dx = w - dw - w * 0.04;
        const dy = h * 0.12;
        ctx.save();
        ctx.globalAlpha = isLight ? 0.07 : 0.11;
        ctx.filter = `drop-shadow(0 0 24px rgba(${r},${g},${b},0.35))`;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      }

      if (reduced) {
        ctx.fillStyle = `rgba(${r},${g},${b},${isLight ? 0.04 : 0.06})`;
        for (let i = 0; i < 40; i++) {
          ctx.fillRect((i / 40) * w, (i % 5) * (h / 5), 1, h * 0.15);
        }
        animationId = requestAnimationFrame(tick);
        return;
      }

      ctx.font = `${w < 768 ? 11 : 13}px ui-monospace, "Cascadia Code", monospace`;
      ctx.textAlign = "center";

      for (const col of columns) {
        col.y += col.speed;
        if (col.y > h + col.length * 14) {
          col.y = -col.length * 14 * Math.random();
          col.speed = 1.2 + Math.random() * 2.8;
          for (let i = 0; i < col.chars.length; i++) {
            col.chars[i] = DEFAULT_GLYPHS[Math.floor(Math.random() * DEFAULT_GLYPHS.length)]!;
          }
        }
        for (let i = 0; i < col.chars.length; i++) {
          const alpha = rainAlpha * (1 - i / (col.chars.length + 2));
          ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0.04, alpha)})`;
          ctx.fillText(col.chars[i]!, col.x, col.y - i * 14);
        }
      }

      if (particles.length < 70) {
        particles.push({
          x: Math.random() * w,
          y: h + 8,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(Math.random() * 2 + 0.6),
          life: 1,
        });
      }
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.0025;
        ctx.fillStyle = `rgba(${r},${g},${b},${p.life * baseAlpha})`;
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
      }

      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [theme, mounted]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 motion-reduce:opacity-40"
      aria-hidden="true"
    />
  );
}
