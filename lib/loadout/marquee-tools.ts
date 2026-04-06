import type { IconType } from "react-icons";
import { SiGithub, SiNextdotjs, SiReact, SiSupabase, SiTailwindcss, SiVercel } from "react-icons/si";
import { Cpu, type LucideIcon } from "lucide-react";

/** Icons for hero ticker; aligns with core loadout (kept short for readability). */
export type MarqueeToolIcon = IconType | LucideIcon;

export type MarqueeTool = { id: string; label: string; Icon: MarqueeToolIcon };

export const LOADOUT_MARQUEE_TOOLS: MarqueeTool[] = [
  { id: "next", label: "Next.js", Icon: SiNextdotjs },
  { id: "react", label: "React", Icon: SiReact },
  { id: "tailwind", label: "Tailwind", Icon: SiTailwindcss },
  { id: "supabase", label: "Supabase", Icon: SiSupabase },
  { id: "vercel", label: "Vercel", Icon: SiVercel },
  { id: "github", label: "GitHub", Icon: SiGithub },
  { id: "llm", label: "LLM / agents", Icon: Cpu },
];
