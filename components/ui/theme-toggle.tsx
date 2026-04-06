"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme, type Theme } from "@/components/theme-provider";
import "./theme-toggle.css";

const THEME_GROUPS: { category: string; themes: { value: Theme; label: string }[] }[] = [
  {
    category: "NATIVE",
    themes: [
      { value: "dark", label: "DARK" },
      { value: "light", label: "LIGHT" },
    ],
  },
  {
    category: "CLASSIC",
    themes: [
      { value: "monochrome", label: "MONO" },
      { value: "monochrome-inverted", label: "INVERT" },
      { value: "vintage", label: "DOS" },
      { value: "apple", label: "APPLE" },
      { value: "c64", label: "C64" },
      { value: "amber", label: "AMBER" },
    ],
  },
  {
    category: "MODERN",
    themes: [
      { value: "dracula", label: "DRACULA" },
      { value: "nord", label: "NORD" },
      { value: "solarized", label: "SOLAR" },
      { value: "cobalt", label: "COBALT" },
    ],
  },
  {
    category: "STYLIZED",
    themes: [{ value: "synthwave", label: "SYNTH" }],
  },
  {
    category: "SPECIAL",
    themes: [{ value: "skynet", label: "SKYNET" }],
  },
];

const ALL_THEME_OPTIONS = THEME_GROUPS.flatMap((g) => g.themes);

export function ThemeToggle() {
  const { theme, changeTheme, toggleTheme, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!mounted) {
    return <div className="h-10 w-10 shrink-0 motion-safe:animate-pulse rounded-full bg-[rgb(var(--border)/0.2)]" aria-hidden />;
  }

  const current = ALL_THEME_OPTIONS.find((t) => t.value === theme);

  const select = (value: Theme) => {
    changeTheme(value);
    setOpen(false);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    } else if (e.key === "Escape") setOpen(false);
  };

  const onOptionKeyDown = (e: React.KeyboardEvent, value: Theme) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(value);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const opts = ref.current?.querySelectorAll<HTMLButtonElement>(".theme-grid-option");
      if (!opts?.length) return;
      const idx = Array.from(opts).indexOf(e.currentTarget as HTMLButtonElement);
      const next =
        e.key === "ArrowDown"
          ? opts[(idx + 1) % opts.length]
          : opts[(idx - 1 + opts.length) % opts.length];
      next?.focus();
    } else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      <div className="theme-dropdown-container" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onTriggerKeyDown}
          className={`theme-dropdown-trigger ${theme}`}
          aria-label="Select theme"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="relative inline-block h-6 w-6 shrink-0">
            <Image
              src="/images/lambda_stepweaver.png"
              alt=""
              fill
              className={`lambda-icon ${theme}`}
              sizes="24px"
            />
          </span>
          <span className="sr-only theme-dropdown-label">{current?.label ?? "Theme"}</span>
          <span className={`theme-dropdown-arrow ${open ? "open" : ""}`} aria-hidden>
            ▼
          </span>
        </button>

        {open && (
          <div className={`theme-grid-menu ${theme}`} role="listbox" aria-label="Themes">
            {THEME_GROUPS.map((group, groupIdx) => (
              <div key={group.category}>
                <div
                  className={`theme-group-header${groupIdx === 0 ? " theme-group-header-first" : ""}`}
                >
                  {group.category}
                </div>
                <div className="theme-group-grid">
                  {group.themes.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => select(opt.value)}
                      onKeyDown={(e) => onOptionKeyDown(e, opt.value)}
                      className={`theme-grid-option ${opt.value} ${theme === opt.value ? "active" : ""}`}
                      role="option"
                      aria-selected={theme === opt.value}
                      tabIndex={0}
                    >
                      <span className="relative inline-block h-3 w-3 shrink-0">
                        <Image
                          src="/images/lambda_stepweaver.png"
                          alt=""
                          fill
                          className={`lambda-icon-grid ${opt.value}`}
                          sizes="12px"
                        />
                      </span>
                      <span className="theme-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => toggleTheme()}
        className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--muted-color))] hover:text-[rgb(var(--neon))] border border-[rgb(var(--border)/0.35)] px-1.5 py-1 transition-colors"
        title="Cycle theme"
        aria-label="Cycle to next theme"
      >
        ↻
      </button>
    </div>
  );
}
