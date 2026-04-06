"use client";

import { useEffect, type RefObject } from "react";
import type { Theme } from "@/components/theme-provider";
import {
  COLOR_PALETTES,
  SPRITE_COLORS,
  SPRITE_PALETTE_BY_THEME,
  type SpriteColor,
} from "@/lib/effects/background-constants";

type Pt = { x: number; y: number };

type CircuitNode = {
  x: number;
  y: number;
  edges: number[];
  flash: number;
  flashColor?: SpriteColor;
};

type CircuitEdge = { from: number; to: number; pts: Pt[]; len: number };

type Sprite = {
  eIdx: number;
  t: number;
  speed: number;
  forward: boolean;
  size: number;
  brightness: number;
  trail: Pt[];
  trailMax: number;
  pulse: number;
  color: SpriteColor;
};

function makeTrace(a: Pt, b: Pt): Pt[] {
  const pts: Pt[] = [{ x: a.x, y: a.y }];
  const roll = Math.random();
  if (roll < 0.3) {
    pts.push({ x: b.x, y: a.y });
  } else if (roll < 0.6) {
    pts.push({ x: a.x, y: b.y });
  } else {
    if (Math.random() > 0.5) {
      const midX = a.x + (b.x - a.x) * (0.3 + Math.random() * 0.4);
      pts.push({ x: midX, y: a.y });
      pts.push({ x: midX, y: b.y });
    } else {
      const midY = a.y + (b.y - a.y) * (0.3 + Math.random() * 0.4);
      pts.push({ x: a.x, y: midY });
      pts.push({ x: b.x, y: midY });
    }
  }
  pts.push({ x: b.x, y: b.y });
  return pts;
}

function pathLen(pts: Pt[]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i]!.x - pts[i - 1]!.x;
    const dy = pts[i]!.y - pts[i - 1]!.y;
    l += Math.sqrt(dx * dx + dy * dy);
  }
  return l || 1;
}

function posOnPath(pts: Pt[], len: number, t: number): Pt {
  const target = Math.max(0, Math.min(1, t)) * len;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i]!.x - pts[i - 1]!.x;
    const dy = pts[i]!.y - pts[i - 1]!.y;
    const seg = Math.sqrt(dx * dx + dy * dy);
    if (acc + seg >= target && seg > 0) {
      const f = (target - acc) / seg;
      return { x: pts[i - 1]!.x + dx * f, y: pts[i - 1]!.y + dy * f };
    }
    acc += seg;
  }
  return { x: pts[pts.length - 1]!.x, y: pts[pts.length - 1]!.y };
}

/** Circuit paths + moving packets (ported from v3 BackgroundCanvas). */
export function useCircuitRainLayer(
  rainCanvasRef: RefObject<HTMLCanvasElement | null>,
  theme: Theme,
  prefersReducedMotion: boolean
): void {
  useEffect(() => {
    const rainCanvas = rainCanvasRef.current;
    if (!rainCanvas || typeof window === "undefined") return;

    const ctx = rainCanvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const isLightMode = theme === "light" || theme === "monochrome-inverted";
    const gDim = isLightMode ? 0.3 : 1.0;
    const spritePalette = SPRITE_PALETTE_BY_THEME[theme] || SPRITE_COLORS;

    let nodes: CircuitNode[] = [];
    let edges: CircuitEdge[] = [];
    let sprites: Sprite[] = [];

    function newSprite(): Sprite {
      const eIdx = Math.floor(Math.random() * edges.length);
      const fwd = Math.random() > 0.5;
      const color = spritePalette[Math.floor(Math.random() * spritePalette.length)]!;
      return {
        eIdx,
        t: fwd ? 0 : 1,
        speed: 0.0015 + Math.random() * 0.005,
        forward: fwd,
        size: 1.4 + Math.random() * 1.6,
        brightness: 0.65 + Math.random() * 0.35,
        trail: [],
        trailMax: 8 + Math.floor(Math.random() * 10),
        pulse: Math.random() * Math.PI * 2,
        color,
      };
    }

    function buildCircuit() {
      nodes = [];
      edges = [];
      sprites = [];

      const isMobileCircuit = W < 768;
      const cell = isMobileCircuit ? 100 + Math.floor(Math.random() * 30) : 70 + Math.floor(Math.random() * 20);
      const cols = Math.ceil(W / cell) + 2;
      const rows = Math.ceil(H / cell) + 2;

      const fillRate = isMobileCircuit ? 0.55 : 0.7;
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          if (Math.random() > fillRate) continue;
          nodes.push({
            x: c * cell + (Math.random() - 0.5) * cell * 0.55,
            y: r * cell + (Math.random() - 0.5) * cell * 0.55,
            edges: [],
            flash: 0,
          });
        }
      }

      const maxDist = cell * 2.2;
      const edgeSet = new Set<string>();

      for (let i = 0; i < nodes.length; i++) {
        const cands: { j: number; d: number }[] = [];
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j]!.x - nodes[i]!.x;
          const dy = nodes[j]!.y - nodes[i]!.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist && d > 25) cands.push({ j, d });
        }
        cands.sort((a, b) => a.d - b.d);

        let added = 0;
        for (const { j } of cands) {
          if (added >= (isMobileCircuit ? 3 : 5)) break;
          const key = `${i}-${j}`;
          if (edgeSet.has(key)) continue;
          const maxConn = isMobileCircuit ? 4 : 6;
          if (nodes[i]!.edges.length >= maxConn || nodes[j]!.edges.length >= maxConn) continue;
          edgeSet.add(key);

          const pts = makeTrace(nodes[i]!, nodes[j]!);
          const len = pathLen(pts);
          const eIdx = edges.length;
          edges.push({ from: i, to: j, pts, len });
          nodes[i]!.edges.push(eIdx);
          nodes[j]!.edges.push(eIdx);
          added++;
        }
      }

      if (edges.length === 0) return;
      const spriteRatio = isMobileCircuit ? 0.35 : 0.5;
      const count = Math.max(8, Math.min(isMobileCircuit ? 30 : 80, Math.floor(edges.length * spriteRatio)));
      for (let i = 0; i < count; i++) sprites.push(newSprite());
    }

    const setSize = () => {
      W = rainCanvas.width = window.innerWidth;
      H = rainCanvas.height = window.innerHeight;
      buildCircuit();
    };
    setSize();
    window.addEventListener("resize", setSize);

    let animationId = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const circuitRgb = COLOR_PALETTES[theme]?.[0] || COLOR_PALETTES.dark![0]!;
      const [cr, cg, cb] = circuitRgb;

      ctx.lineCap = "square";
      ctx.lineJoin = "miter";
      for (const e of edges) {
        ctx.beginPath();
        ctx.moveTo(e.pts[0]!.x, e.pts[0]!.y);
        for (let i = 1; i < e.pts.length; i++) ctx.lineTo(e.pts[i]!.x, e.pts[i]!.y);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.09 * gDim})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      for (const n of nodes) {
        if (n.edges.length === 0) continue;

        let flashA = 0;
        if (n.flash > 0) {
          flashA = n.flash / 25;
          n.flash--;
        }

        const s = 1.5;
        const baseA = 0.1 + flashA * 0.4;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${baseA * gDim})`;
        ctx.fillRect(n.x - s, n.y - s, s * 2, s * 2);

        if (flashA > 0.05) {
          const fc = n.flashColor ?? { r: cr, g: cg, b: cb, hr: cr, hg: cg, hb: cb };
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(${fc.r},${fc.g},${fc.b},${flashA * 0.45 * gDim})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 4 + flashA * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${fc.r},${fc.g},${fc.b},${flashA * 0.2 * gDim})`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      for (const sp of sprites) {
        if (!sp) continue;
        const edge = edges[sp.eIdx];
        if (!edge) continue;

        sp.t += sp.forward ? sp.speed : -sp.speed;
        sp.pulse += 0.07;

        const pos = posOnPath(edge.pts, edge.len, sp.t);

        sp.trail.push({ x: pos.x, y: pos.y });
        if (sp.trail.length > sp.trailMax) sp.trail.shift();

        if (sp.t >= 1 || sp.t <= 0) {
          const nodeIdx = sp.t >= 1 ? edge.to : edge.from;
          const node = nodes[nodeIdx];
          if (node && node.edges.length > 0) {
            node.flash = 25;
            node.flashColor = sp.color;

            const others = node.edges.filter((e) => e !== sp.eIdx);
            const nextEIdx =
              others.length > 0
                ? others[Math.floor(Math.random() * others.length)]!
                : node.edges[Math.floor(Math.random() * node.edges.length)]!;
            const next = edges[nextEIdx];
            if (next) {
              sp.eIdx = nextEIdx;
              if (next.from === nodeIdx) {
                sp.forward = true;
                sp.t = 0;
              } else {
                sp.forward = false;
                sp.t = 1;
              }
            }
          }
          sp.trail = [];
        }

        const sc = sp.color;
        for (let i = 0; i < sp.trail.length; i++) {
          const fade = (i + 1) / sp.trail.length;
          ctx.beginPath();
          ctx.arc(sp.trail[i]!.x, sp.trail[i]!.y, sp.size * fade * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${sc.r},${sc.g},${sc.b},${fade * 0.5 * sp.brightness * gDim})`;
          ctx.fill();
        }

        const pulseSz = 1 + Math.sin(sp.pulse) * 0.12;
        const sz = sp.size * pulseSz;

        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${sc.r},${sc.g},${sc.b},${0.5 * sp.brightness * gDim})`;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sc.hr},${sc.hg},${sc.hb},${0.95 * sp.brightness * gDim})`;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, sz * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sc.r},${sc.g},${sc.b},${0.08 * sp.brightness * gDim})`;
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", setSize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rainCanvasRef.current read once on run; ref identity must not retrigger
  }, [theme, prefersReducedMotion]);
}

