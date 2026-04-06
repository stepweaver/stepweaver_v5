"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  Terminal,
  FileText,
  Zap,
  BookOpen,
  Mail,
  FolderOpen,
} from "lucide-react";
import { getAllProjects } from "@/lib/data/projects";

const STATIC = [
  { id: "home", label: "Home", href: "/", icon: ChevronRight },
  { id: "brief", label: "Brief", href: "/brief", icon: FileText },
  { id: "capabilities", label: "Capabilities", href: "/capabilities", icon: ChevronRight },
  { id: "services", label: "Services", href: "/services", icon: Zap },
  { id: "services-lead", label: "Services / Lead Systems", href: "/services/lead-systems", icon: Zap },
  { id: "services-automation", label: "Services / Automation", href: "/services/automation", icon: Zap },
  { id: "services-web", label: "Services / Web Platforms", href: "/services/web-platforms", icon: Zap },
  { id: "projects", label: "Projects", href: "/projects", icon: FolderOpen },
  { id: "codex", label: "Codex", href: "/codex", icon: BookOpen },
  { id: "meshtastic", label: "Meshtastic", href: "/meshtastic", icon: BookOpen },
  { id: "terminal", label: "Terminal", href: "/terminal", icon: Terminal },
  { id: "dice", label: "Dice Roller", href: "/dice-roller", icon: Terminal },
  { id: "contact", label: "Contact", href: "/contact", icon: Mail },
  { id: "resume", label: "Resume", href: "/resume", icon: FileText },
];

function matches(q: string, text: string) {
  if (!q) return true;
  return text.toLowerCase().includes(q.toLowerCase());
}

export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const items = useMemo(() => {
    const projects = getAllProjects().map((p) => ({
      id: "p-" + p.slug,
      label: p.title,
      href: "/projects/" + p.slug,
      icon: FolderOpen,
      meta: p.tags[0] || "",
    }));
    const all = [...STATIC.map((s) => ({ ...s, meta: "" })), ...projects];
    return all.filter((i) => matches(query, i.label) || matches(query, i.meta));
  }, [query]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-lg border border-[rgb(var(--neon)/0.35)] bg-[rgb(var(--bg))] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgb(var(--neon)/0.2)]">
          <Search className="w-4 h-4 text-[rgb(var(--neon)/0.6)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, Math.max(0, items.length - 1)));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter" && items[index]) {
                e.preventDefault();
                go(items[index].href);
              }
            }}
            placeholder="Jump to…"
            className="flex-1 bg-transparent outline-none text-sm text-[rgb(var(--text-color))] font-[var(--font-ibm)]"
          />
          <span className="text-[10px] text-[rgb(var(--muted-color))] font-[var(--font-ocr)] hidden sm:inline">
            ESC
          </span>
        </div>
        <ul className="max-h-72 overflow-y-auto py-1">
          {items.length === 0 ? (
            <li className="px-3 py-2 text-xs text-[rgb(var(--muted-color))]">No matches</li>
          ) : (
            items.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => go(item.href)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-[var(--font-ibm)] ${
                      i === index ? "bg-[rgb(var(--neon)/0.12)] text-[rgb(var(--neon))]" : "text-[rgb(var(--text-color))]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 opacity-70" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <div className="px-3 py-1.5 border-t border-[rgb(var(--neon)/0.15)] text-[10px] text-[rgb(var(--muted-color))] font-[var(--font-ocr)]">
          Ctrl/⌘K to toggle · ↑↓ navigate · Enter open
        </div>
      </div>
    </div>
  );
}
