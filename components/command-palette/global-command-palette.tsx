"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Terminal,
  FileText,
  Zap,
  BookOpen,
  Mail,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import { getAllProjects } from "@/lib/data/projects";

type CmdItem = {
  id: string;
  label: string;
  href: string;
  icon: typeof ChevronRight;
  meta?: string;
};

const STATIC_GROUPS: { group: string; items: CmdItem[] }[] = [
  {
    group: "Navigate",
    items: [
      { id: "home", label: "Home", href: "/", icon: ChevronRight },
      { id: "services", label: "Services", href: "/services", icon: Zap },
      { id: "services-lead", label: "Services / Lead Systems", href: "/services/lead-systems", icon: Zap },
      { id: "services-automation", label: "Services / Automation", href: "/services/automation", icon: Zap },
      { id: "services-web", label: "Services / Web Platforms", href: "/services/web-platforms", icon: Zap },
      { id: "capabilities", label: "Capabilities", href: "/capabilities", icon: ChevronRight },
      { id: "start-here", label: "Start Here", href: "/start-here", icon: ChevronRight },
      { id: "brief", label: "Brief", href: "/brief", icon: FileText },
      { id: "projects", label: "All Projects", href: "/projects", icon: FolderOpen },
      { id: "resume", label: "Resume", href: "/resume", icon: FileText },
      { id: "codex", label: "Codex", href: "/codex", icon: BookOpen },
      { id: "meshtastic", label: "Meshtastic", href: "/meshtastic", icon: BookOpen },
      { id: "contact", label: "Contact", href: "/contact", icon: Mail },
      { id: "terminal", label: "Terminal", href: "/terminal", icon: Terminal },
      { id: "dice", label: "Dice Roller", href: "/dice-roller", icon: Terminal },
    ],
  },
];

function matchesQuery(text: string, query: string) {
  if (!query) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

function isEnterKey(e: React.KeyboardEvent) {
  return e.key === "Enter" || e.key === "NumpadEnter" || e.code === "Enter";
}

export function GlobalCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedIndexRef = useRef(0);
  const router = useRouter();

  selectedIndexRef.current = selectedIndex;

  const projectCommands = useMemo(
    () =>
      getAllProjects()
        .filter((p) => p.title && p.description)
        .map((p) => ({
          id: `project-${p.slug}`,
          label: p.title,
          href: `/projects/${p.slug}`,
          icon: FolderOpen,
          meta: p.tags[0] || "",
        })),
    []
  );

  const allGroups = useMemo(
    () => [...STATIC_GROUPS, { group: "Projects", items: projectCommands }],
    [projectCommands]
  );

  const filteredGroups = useMemo(
    () =>
      allGroups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => matchesQuery(item.label, query) || matchesQuery(item.meta || "", query)
          ),
        }))
        .filter((group) => group.items.length > 0),
    [allGroups, query]
  );

  const { flatItems, rows } = useMemo(() => {
    const flat: CmdItem[] = [];
    const out: (
      | { kind: "header"; key: string; label: string }
      | { kind: "item"; key: string; item: CmdItem; index: number }
    )[] = [];
    for (const group of filteredGroups) {
      out.push({ kind: "header", key: `hdr-${group.group}`, label: group.group });
      for (const item of group.items) {
        const index = flat.length;
        flat.push(item);
        out.push({ kind: "item", key: item.id, item, index });
      }
    }
    return { flatItems: flat, rows: out };
  }, [filteredGroups]);

  const openPalette = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  const executeItem = useCallback(
    (item: CmdItem | undefined) => {
      if (!item) return;
      closePalette();
      if (item.href.startsWith("http")) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(item.href);
      }
    },
    [closePalette, router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        e.stopPropagation();
        if (isOpen) closePalette();
        else openPalette();
        return;
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closePalette();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [isOpen, openPalette, closePalette]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (flatItems.length === 0) return;
    setSelectedIndex((i) => Math.min(Math.max(0, i), flatItems.length - 1));
  }, [flatItems.length]);

  useLayoutEffect(() => {
    if (!isOpen || flatItems.length === 0) return;
    const el = listRef.current?.querySelector(`[data-palette-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [isOpen, selectedIndex, flatItems.length, query]);

  const handlePaletteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (isEnterKey(e)) {
        e.preventDefault();
        const item = flatItems[selectedIndexRef.current];
        executeItem(item);
      }
    },
    [flatItems, executeItem]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === inputRef.current) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "NumpadEnter" || e.code === "Enter") {
        e.preventDefault();
        const item = flatItems[selectedIndexRef.current];
        executeItem(item);
      }
    };
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [isOpen, flatItems, executeItem]);

  const modKey = typeof navigator !== "undefined" && /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
    ? "⌘"
    : "Ctrl";

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={openPalette}
        className="fixed bottom-20 right-4 sm:right-6 z-[90] flex items-center gap-2 border border-[rgb(var(--neon)/0.2)] px-3 py-1.5 font-[var(--font-ocr)] text-xs uppercase tracking-[0.15em] text-[rgb(var(--neon)/0.5)] transition-all hover:border-[rgb(var(--neon)/0.45)] hover:text-[rgb(var(--neon)/0.8)]"
        style={{ background: "rgb(var(--panel) / 0.85)" }}
        aria-label={`Open command palette (${modKey}+K)`}
      >
        <Search className="h-3 w-3 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{modKey}K</span>
        <span className="sm:hidden">Go</span>
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-sm"
        onClick={closePalette}
        aria-hidden
      />

      <div
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        className="fixed left-1/2 top-[15vh] z-[190] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--bg))] shadow-[0_0_40px_rgb(var(--neon)/0.15),0_4px_40px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center gap-3 border-b border-[rgb(var(--neon)/0.2)] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[rgb(var(--neon)/0.5)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handlePaletteKeyDown}
            placeholder="Jump to page, project, or service..."
            className="flex-1 bg-transparent font-[var(--font-ocr)] text-sm text-[rgb(var(--text-color))] placeholder:text-[rgb(var(--muted-color)/0.5)] focus:outline-none"
            aria-label="Search commands"
            aria-activedescendant={flatItems.length > 0 ? `palette-option-${selectedIndex}` : undefined}
            autoComplete="off"
          />
          <span className="shrink-0 font-[var(--font-ocr)] text-[10px] uppercase tracking-[0.15em] text-[rgb(var(--neon)/0.3)]">
            Esc
          </span>
        </div>

        <div
          ref={listRef}
          id="palette-results"
          role="listbox"
          aria-label="Commands"
          className="max-h-[60vh] overflow-y-auto overscroll-contain py-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filteredGroups.length === 0 ? (
            <div className="px-4 py-6 text-center font-[var(--font-ocr)] text-sm text-[rgb(var(--muted-color)/0.6)]">
              No results for &quot;{query}&quot;
            </div>
          ) : null}

          {rows.map((row) => {
            if (row.kind === "header") {
              return (
                <div
                  key={row.key}
                  role="presentation"
                  className="sticky top-0 z-[1] border-b border-[rgb(var(--neon)/0.1)] bg-[rgb(var(--bg))] px-4 py-1.5 font-[var(--font-ocr)] text-[9px] uppercase tracking-[0.25em] text-[rgb(var(--neon)/0.3)]"
                >
                  {row.label}
                </div>
              );
            }

            const { item, index } = row;
            const Icon = item.icon || ChevronRight;
            const isSelected = index === selectedIndex;

            const selectedRowStyle = isSelected
              ? {
                  backgroundColor: "rgb(var(--neon) / 0.42)",
                  borderLeftColor: "rgb(var(--neon))",
                  borderLeftWidth: "4px",
                  borderLeftStyle: "solid" as const,
                  color: "rgb(var(--neon))",
                  boxShadow:
                    "inset 0 0 0 1px rgb(var(--neon) / 0.65), 0 0 32px rgb(var(--neon) / 0.35)",
                }
              : undefined;

            return (
              <button
                key={row.key}
                type="button"
                id={`palette-option-${index}`}
                role="option"
                aria-selected={isSelected}
                data-palette-index={index}
                data-selected={isSelected ? "true" : undefined}
                onClick={() => executeItem(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={selectedRowStyle}
                className={`flex w-full items-center gap-3 border-l-4 px-4 py-2.5 text-left transition-[background-color,box-shadow,color,border-color] duration-150 ${
                  isSelected
                    ? "font-medium"
                    : "border-transparent text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--panel)/0.55)]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "" : "text-[rgb(var(--neon)/0.45)]"}`} />
                <span
                  className={`flex-1 font-[var(--font-ibm)] text-sm ${
                    isSelected ? "font-semibold tracking-wide" : ""
                  }`}
                >
                  {item.label}
                </span>
                {item.meta ? (
                  <span
                    className={`shrink-0 font-[var(--font-ocr)] text-[10px] ${
                      isSelected ? "" : "text-[rgb(var(--muted-color)/0.45)]"
                    }`}
                    style={isSelected ? { color: "rgb(var(--neon) / 0.88)" } : undefined}
                  >
                    {item.meta}
                  </span>
                ) : null}
                {isSelected ? (
                  <ArrowRight
                    className="h-3 w-3 shrink-0 opacity-95"
                    style={{ color: "rgb(var(--neon))" }}
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[rgb(var(--neon)/0.15)] px-4 py-2">
          <span className="font-[var(--font-ocr)] text-[9px] uppercase tracking-[0.2em] text-[rgb(var(--muted-color)/0.5)]">
            ↑↓ select
          </span>
          <span className="font-[var(--font-ocr)] text-[9px] uppercase tracking-[0.2em] text-[rgb(var(--muted-color)/0.5)]">
            ↵ open
          </span>
          <span className="font-[var(--font-ocr)] text-[9px] uppercase tracking-[0.2em] text-[rgb(var(--muted-color)/0.5)]">
            Esc close
          </span>
        </div>
      </div>
    </>
  );
}
